import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createModerationRepo } from "../../src/repositories/moderation.js";
import { createAdminRepo } from "../../src/repositories/admin.js";
import { fileReport, assignReport, resolveReport, getPendingReports } from "../../src/moderation/reporting.js";
import { warnUser, suspendUser, banUser, reinstateUser, handleAppeal } from "../../src/moderation/actions.js";
import { requireAdmin, requireRole, getAdminRole } from "../../src/admin/auth.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "platform,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

describe("Moderation Reports", () => {
    it("files a report for a user", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();
            const targetUserId = crypto.randomUUID();

            const report = await fileReport(tx, reporterId, {
                reportedUserId: targetUserId,
                category: "spam",
                description: "Spamming DMs",
            });

            expect(report.id).toBeDefined();
            expect(report.reporterId).toBe(reporterId);
            expect(report.reportedUserId).toBe(targetUserId);
            expect(report.category).toBe("spam");
            expect(report.status).toBe("pending");
        });
    });

    it("files a report for content", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();
            const contentId = crypto.randomUUID();

            const report = await fileReport(tx, reporterId, {
                reportedContentId: contentId,
                category: "inappropriate",
                description: "Offensive post",
            });

            expect(report.reportedContentId).toBe(contentId);
            expect(report.reportedUserId).toBeUndefined();
        });
    });

    it("rejects report with no target", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();

            await expect(
                fileReport(tx, reporterId, {
                    category: "fraud",
                    description: "No target",
                }),
            ).rejects.toThrow("Must provide reportedUserId or reportedContentId");
        });
    });

    it("assigns a report to admin", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();
            const adminId = crypto.randomUUID();
            const targetId = crypto.randomUUID();

            const report = await fileReport(tx, reporterId, {
                reportedUserId: targetId,
                category: "spam",
                description: "test",
            });

            const assigned = await assignReport(tx, report.id, adminId);
            expect(assigned.status).toBe("under_review");
        });
    });

    it("resolves a report", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();
            const adminId = crypto.randomUUID();
            const targetId = crypto.randomUUID();

            const report = await fileReport(tx, reporterId, {
                reportedUserId: targetId,
                category: "spam",
                description: "test",
            });

            const resolved = await resolveReport(tx, report.id, adminId, "warn", "First offense");
            expect(resolved.status).toBe("resolved");
        });
    });

    it("lists pending reports with pagination", async () => {
        await withTestTransaction(db, async (tx) => {
            const reporterId = crypto.randomUUID();

            // Create 3 reports
            for (let i = 0; i < 3; i++) {
                await fileReport(tx, reporterId, {
                    reportedUserId: crypto.randomUUID(),
                    category: "spam",
                    description: `report ${i}`,
                });
            }

            const page1 = await getPendingReports(tx, 1, 2);
            expect(page1.length).toBe(2);

            const page2 = await getPendingReports(tx, 2, 2);
            expect(page2.length).toBe(1);
        });
    });
});

describe("Moderation Actions", () => {
    it("warns a user", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminId = crypto.randomUUID();

            await warnUser(tx, userId, adminId, "Inappropriate language");
            // Verify audit log
            const repo = createModerationRepo(tx);
            const auditLog = await repo.getAuditLog(1, 10);
            const entry = auditLog.find((e) => e.action === "warn_user" && e.targetId === userId);
            expect(entry).toBeDefined();
            expect(entry!.adminUserId).toBe(adminId);
        });
    });

    it("suspends a user with duration", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminId = crypto.randomUUID();

            await suspendUser(tx, userId, adminId, "Repeated violations", 7);
            const repo = createModerationRepo(tx);
            const auditLog = await repo.getAuditLog(1, 10);
            const entry = auditLog.find((e) => e.action === "suspend_user" && e.targetId === userId);
            expect(entry).toBeDefined();
            expect((entry!.details as any).durationDays).toBe(7);
        });
    });

    it("bans and reinstates a user", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminId = crypto.randomUUID();

            await banUser(tx, userId, adminId, "Fraud detected");
            const repo = createModerationRepo(tx);

            // Verify ban exists
            const ban = await repo.getActiveBan(userId);
            expect(ban).toBeDefined();
            expect(ban!.reason).toBe("Fraud detected");

            // Reinstate
            await reinstateUser(tx, userId, adminId, "Appeal granted");
            const activeBan = await repo.getActiveBan(userId);
            expect(activeBan).toBeUndefined();
        });
    });

    it("handles appeal with different reviewer", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const originalAdmin = crypto.randomUUID();
            const reviewerAdmin = crypto.randomUUID();

            // Create a moderation action
            const repo = createModerationRepo(tx);
            const action = await repo.createAction({
                targetUserId: userId,
                actionType: "suspend",
                reason: "Violation",
                adminId: originalAdmin,
            });

            // Create an appeal
            const appeal = await repo.createAppeal({
                moderationActionId: action.id,
                appealerId: userId,
                reason: "I disagree",
            });

            // Resolve with different admin
            await handleAppeal(tx, appeal.id, reviewerAdmin, "overturned", "Appeal valid");

            const resolved = await repo.findAppealById(appeal.id);
            expect(resolved!.outcome).toBe("overturned");
            expect(resolved!.reviewedBy).toBe(reviewerAdmin);
        });
    });

    it("rejects appeal reviewed by same admin who took original action", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminId = crypto.randomUUID();

            const repo = createModerationRepo(tx);
            const action = await repo.createAction({
                targetUserId: userId,
                actionType: "suspend",
                reason: "Violation",
                adminId,
            });

            const appeal = await repo.createAppeal({
                moderationActionId: action.id,
                appealerId: userId,
                reason: "I disagree",
            });

            await expect(
                handleAppeal(tx, appeal.id, adminId, "upheld", "Same admin"),
            ).rejects.toThrow("different admin");
        });
    });
});

describe("Admin Auth (RBAC)", () => {
    it("returns null role for non-admin user", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const role = await getAdminRole(tx, userId);
            expect(role).toBeNull();
        });
    });

    it("requireAdmin throws for non-admin", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await expect(requireAdmin(tx, userId)).rejects.toThrow("Admin access required");
        });
    });

    it("requireAdmin passes for active admin", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminRepo = createAdminRepo(tx);
            await adminRepo.createAdmin({ userId, role: "moderator" });

            const role = await requireAdmin(tx, userId);
            expect(role).toBe("moderator");
        });
    });

    it("requireRole enforces role hierarchy", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminRepo = createAdminRepo(tx);
            await adminRepo.createAdmin({ userId, role: "support" });

            // support < moderator — should fail
            await expect(requireRole(tx, userId, "moderator")).rejects.toThrow("Requires moderator role or higher");
        });
    });

    it("requireRole passes for equal or higher role", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const adminRepo = createAdminRepo(tx);
            await adminRepo.createAdmin({ userId, role: "super_admin" });

            // super_admin >= moderator — should pass
            const role = await requireRole(tx, userId, "moderator");
            expect(role).toBe("super_admin");
        });
    });
});
