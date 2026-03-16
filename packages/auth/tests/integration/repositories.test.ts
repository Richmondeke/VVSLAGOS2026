import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUsersRepo } from "../../src/repositories/users.js";
import { createSessionsRepo } from "../../src/repositories/sessions.js";
import { createTokensRepo } from "../../src/repositories/tokens.js";
import { createInviteCodesRepo } from "../../src/repositories/invite-codes.js";
import { createReferralsRepo } from "../../src/repositories/referrals.js";
import { createVerificationsRepo } from "../../src/repositories/verifications.js";
import { createTiersRepo } from "../../src/repositories/tiers.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sql: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sql = postgres(DB_URL, { max: 1, connection: { search_path: "auth" } });
    db = drizzle(sql);
});

afterAll(async () => {
    await sql.end();
});

// Helper to create a user inside a transaction
async function insertUser(txDb: ScopedClient, overrides: { email?: string } = {}) {
    const repo = createUsersRepo(txDb);
    return repo.create({
        email: overrides.email ?? `test-${Date.now()}-${Math.random()}@test.vvs`,
        passwordHash: "hashed_password_placeholder",
    });
}

describe("UsersRepo", () => {
    it("creates and finds user by id", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            const user = await repo.create({
                email: "find-by-id@test.vvs",
                passwordHash: "hash123",
            });
            expect(user.id).toBeDefined();
            expect(user.email).toBe("find-by-id@test.vvs");
            expect(user.status).toBe("pending_approval");

            const found = await repo.findById(user.id);
            expect(found).toBeDefined();
            expect(found!.email).toBe("find-by-id@test.vvs");
        });
    });

    it("finds user by email", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            await repo.create({ email: "by-email@test.vvs", passwordHash: "hash" });

            const found = await repo.findByEmail("by-email@test.vvs");
            expect(found).toBeDefined();
            expect(found!.email).toBe("by-email@test.vvs");
        });
    });

    it("finds user by phone", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            await repo.create({
                email: "phone-user@test.vvs",
                phone: "+2348001234567",
                passwordHash: "hash",
            });

            const found = await repo.findByPhone("+2348001234567");
            expect(found).toBeDefined();
            expect(found!.phone).toBe("+2348001234567");
        });
    });

    it("updates user status", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            const user = await repo.create({ email: "status@test.vvs", passwordHash: "hash" });
            expect(user.status).toBe("pending_approval");

            const updated = await repo.updateStatus(user.id, "active");
            expect(updated!.status).toBe("active");
        });
    });

    it("updates password", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            const user = await repo.create({ email: "pwd@test.vvs", passwordHash: "old_hash" });

            await repo.updatePassword(user.id, "new_hash");
            const found = await repo.findById(user.id);
            expect(found!.passwordHash).toBe("new_hash");
        });
    });

    it("returns undefined for non-existent user", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createUsersRepo(tx);
            const found = await repo.findById("00000000-0000-0000-0000-000000000000");
            expect(found).toBeUndefined();
        });
    });
});

describe("SessionsRepo", () => {
    it("creates and finds session by id", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createSessionsRepo(tx);
            const session = await repo.create({
                userId: user.id,
                deviceInfo: { browser: "Chrome" },
                expiresAt: new Date(Date.now() + 86400_000),
            });

            expect(session.id).toBeDefined();
            const found = await repo.findById(session.id);
            expect(found).toBeDefined();
            expect(found!.userId).toBe(user.id);
        });
    });

    it("revokes session by id", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createSessionsRepo(tx);
            const session = await repo.create({
                userId: user.id,
                expiresAt: new Date(Date.now() + 86400_000),
            });

            await repo.revokeById(session.id);
            const found = await repo.findById(session.id);
            expect(found!.revokedAt).not.toBeNull();
        });
    });

    it("revokes all sessions for user", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createSessionsRepo(tx);
            await repo.create({ userId: user.id, expiresAt: new Date(Date.now() + 86400_000) });
            await repo.create({ userId: user.id, expiresAt: new Date(Date.now() + 86400_000) });

            await repo.revokeAllForUser(user.id);
            const active = await repo.findActiveByUser(user.id);
            expect(active).toHaveLength(0);
        });
    });

    it("finds active sessions only", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createSessionsRepo(tx);
            await repo.create({ userId: user.id, expiresAt: new Date(Date.now() + 86400_000) });
            const expired = await repo.create({ userId: user.id, expiresAt: new Date(Date.now() - 1000) });
            const revoked = await repo.create({ userId: user.id, expiresAt: new Date(Date.now() + 86400_000) });
            await repo.revokeById(revoked.id);

            const active = await repo.findActiveByUser(user.id);
            expect(active).toHaveLength(1);
        });
    });
});

describe("TokensRepo", () => {
    it("creates and finds token", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTokensRepo(tx);
            const token = await repo.create({
                userId: user.id,
                type: "email_verify",
                token: "verify-token-123",
                expiresAt: new Date(Date.now() + 3600_000),
            });

            expect(token.id).toBeDefined();
            const found = await repo.findByToken("verify-token-123");
            expect(found).toBeDefined();
            expect(found!.userId).toBe(user.id);
        });
    });

    it("marks token as used and excludes from findByToken", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTokensRepo(tx);
            const token = await repo.create({
                userId: user.id,
                type: "password_reset",
                token: "reset-token-456",
                expiresAt: new Date(Date.now() + 3600_000),
            });

            await repo.markUsed(token.id);
            const found = await repo.findByToken("reset-token-456");
            expect(found).toBeUndefined();
        });
    });

    it("deletes expired tokens", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTokensRepo(tx);
            await repo.create({
                userId: user.id,
                type: "refresh",
                token: "expired-token",
                expiresAt: new Date(Date.now() - 1000),
            });

            const deleted = await repo.deleteExpired();
            expect(deleted).toBeGreaterThanOrEqual(1);
        });
    });
});

describe("InviteCodesRepo", () => {
    it("creates and finds invite code", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createInviteCodesRepo(tx);
            const code = await repo.create({
                inviterId: user.id,
                code: "INVITE-ABC",
                maxUses: 3,
            });

            expect(code.usedCount).toBe(0);
            const found = await repo.findByCode("INVITE-ABC");
            expect(found).toBeDefined();
            expect(found!.maxUses).toBe(3);
        });
    });

    it("increments usage count", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createInviteCodesRepo(tx);
            const code = await repo.create({
                inviterId: user.id,
                code: "INVITE-INC",
                maxUses: 5,
            });

            await repo.incrementUsage(code.id);
            const found = await repo.findByCode("INVITE-INC");
            expect(found!.usedCount).toBe(1);
        });
    });

    it("gets codes by inviter", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createInviteCodesRepo(tx);
            await repo.create({ inviterId: user.id, code: "INV-1", maxUses: 1 });
            await repo.create({ inviterId: user.id, code: "INV-2", maxUses: 1 });

            const codes = await repo.getByInviter(user.id);
            expect(codes).toHaveLength(2);
        });
    });
});

describe("ReferralsRepo", () => {
    it("creates and finds referral", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await insertUser(tx, { email: "inviter@test.vvs" });
            const invitee = await insertUser(tx, { email: "invitee@test.vvs" });
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "REF-CODE", maxUses: 1 });

            const repo = createReferralsRepo(tx);
            const referral = await repo.create({
                inviteCodeId: code.id,
                inviterId: inviter.id,
                inviteeId: invitee.id,
            });

            expect(referral.status).toBe("pending");
            const found = await repo.findById(referral.id);
            expect(found).toBeDefined();
        });
    });

    it("finds referral by invitee", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await insertUser(tx, { email: "inv1@test.vvs" });
            const invitee = await insertUser(tx, { email: "inv2@test.vvs" });
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "REF-FIND", maxUses: 1 });

            const repo = createReferralsRepo(tx);
            await repo.create({ inviteCodeId: code.id, inviterId: inviter.id, inviteeId: invitee.id });

            const found = await repo.findByInvitee(invitee.id);
            expect(found).toBeDefined();
            expect(found!.inviterId).toBe(inviter.id);
        });
    });

    it("updates referral status", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await insertUser(tx, { email: "s1@test.vvs" });
            const invitee = await insertUser(tx, { email: "s2@test.vvs" });
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "REF-STAT", maxUses: 1 });

            const repo = createReferralsRepo(tx);
            const referral = await repo.create({
                inviteCodeId: code.id,
                inviterId: inviter.id,
                inviteeId: invitee.id,
            });

            const updated = await repo.updateStatus(referral.id, "approved");
            expect(updated!.status).toBe("approved");
        });
    });

    it("counts banned referrals for inviter", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await insertUser(tx, { email: "bannedcount@test.vvs" });
            const invitee1 = await insertUser(tx, { email: "banned1@test.vvs" });
            const invitee2 = await insertUser(tx, { email: "banned2@test.vvs" });
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "REF-BAN", maxUses: 5 });

            const usersRepo = createUsersRepo(tx);
            await usersRepo.updateStatus(invitee1.id, "banned");

            const repo = createReferralsRepo(tx);
            await repo.create({ inviteCodeId: code.id, inviterId: inviter.id, inviteeId: invitee1.id });
            await repo.create({ inviteCodeId: code.id, inviterId: inviter.id, inviteeId: invitee2.id });

            const count = await repo.countBannedReferrals(inviter.id);
            expect(count).toBe(1);
        });
    });
});

describe("VerificationsRepo", () => {
    it("creates and finds verification by userId", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createVerificationsRepo(tx);
            const v = await repo.create({
                userId: user.id,
                status: "pending",
                method: "automated",
            });

            expect(v.id).toBeDefined();
            const found = await repo.findByUserId(user.id);
            expect(found).toHaveLength(1);
            expect(found[0]!.status).toBe("pending");
        });
    });

    it("updates verification status", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createVerificationsRepo(tx);
            const v = await repo.create({ userId: user.id, status: "pending", method: "manual" });

            const updated = await repo.updateStatus(v.id, "verified");
            expect(updated!.status).toBe("verified");
        });
    });

    it("finds expired provisional verifications", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createVerificationsRepo(tx);
            await repo.create({
                userId: user.id,
                status: "provisional",
                method: "manual",
                expiresAt: new Date(Date.now() - 86400_000),
            });

            const expired = await repo.findExpiredProvisional();
            expect(expired.length).toBeGreaterThanOrEqual(1);
        });
    });
});

describe("TiersRepo", () => {
    it("sets and gets current tier", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTiersRepo(tx);
            await repo.setTier({ userId: user.id, tier: "free", reason: "initial" });

            const current = await repo.getCurrentTier(user.id);
            expect(current).toBeDefined();
            expect(current!.tier).toBe("free");
        });
    });

    it("returns latest tier as current", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTiersRepo(tx);
            const t1 = await repo.setTier({ userId: user.id, tier: "free", reason: "initial" });
            const t2 = await repo.setTier({ userId: user.id, tier: "verified", reason: "KYC passed" });

            // Verify the latest entry (by createdAt desc, id desc) is returned
            const current = await repo.getCurrentTier(user.id);
            expect(current).toBeDefined();
            expect(current!.id).toBe(t2.id);
            expect(current!.tier).toBe("verified");
        });
    });

    it("gets tier history in descending order", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await insertUser(tx);
            const repo = createTiersRepo(tx);
            const t1 = await repo.setTier({ userId: user.id, tier: "free", reason: "initial" });
            const t2 = await repo.setTier({ userId: user.id, tier: "verified", reason: "KYC" });
            const t3 = await repo.setTier({ userId: user.id, tier: "pro", reason: "upgrade" });

            const history = await repo.getHistory(user.id);
            expect(history).toHaveLength(3);
            // Verify order by matching IDs
            expect(history[0]!.id).toBe(t3.id);
            expect(history[1]!.id).toBe(t2.id);
            expect(history[2]!.id).toBe(t1.id);
        });
    });

    it("returns undefined for user with no tier", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createTiersRepo(tx);
            const current = await repo.getCurrentTier("00000000-0000-0000-0000-000000000000");
            expect(current).toBeUndefined();
        });
    });
});
