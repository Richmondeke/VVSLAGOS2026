import { eq, and, sql, desc } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import {
    moderationReports,
    moderationActions,
    banRecords,
    appealRecords,
    adminAuditLog,
} from "../schema.js";

export type ModerationReportRow = typeof moderationReports.$inferSelect;
export type ModerationActionRow = typeof moderationActions.$inferSelect;
export type BanRecordRow = typeof banRecords.$inferSelect;
export type AppealRecordRow = typeof appealRecords.$inferSelect;
export type AdminAuditLogRow = typeof adminAuditLog.$inferSelect;

export function createModerationRepo(db: ScopedClient) {
    return {
        // --- Reports ---

        async createReport(data: {
            reporterId: string;
            targetType: string;
            targetId: string;
            category: string;
            description?: string;
        }): Promise<ModerationReportRow> {
            const rows = await db
                .insert(moderationReports)
                .values({
                    reporterId: data.reporterId,
                    targetType: data.targetType,
                    targetId: data.targetId,
                    category: data.category,
                    description: data.description ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findReportById(id: string): Promise<ModerationReportRow | undefined> {
            const rows = await db.select().from(moderationReports).where(eq(moderationReports.id, id));
            return rows[0];
        },

        async assignReport(id: string, adminId: string): Promise<ModerationReportRow | undefined> {
            const rows = await db
                .update(moderationReports)
                .set({ assignedTo: adminId, status: "under_review", updatedAt: sql`NOW()` })
                .where(eq(moderationReports.id, id))
                .returning();
            return rows[0];
        },

        async resolveReport(id: string, status: "resolved" | "dismissed"): Promise<ModerationReportRow | undefined> {
            const rows = await db
                .update(moderationReports)
                .set({ status, updatedAt: sql`NOW()` })
                .where(eq(moderationReports.id, id))
                .returning();
            return rows[0];
        },

        async getPendingReports(page = 1, pageSize = 20): Promise<ModerationReportRow[]> {
            return db
                .select()
                .from(moderationReports)
                .where(eq(moderationReports.status, "pending"))
                .orderBy(moderationReports.createdAt)
                .limit(pageSize)
                .offset((page - 1) * pageSize);
        },

        // --- Actions ---

        async createAction(data: {
            reportId?: string;
            targetUserId: string;
            actionType: string;
            duration?: number;
            reason: string;
            adminId: string;
        }): Promise<ModerationActionRow> {
            const rows = await db
                .insert(moderationActions)
                .values({
                    reportId: data.reportId ?? null,
                    targetUserId: data.targetUserId,
                    actionType: data.actionType,
                    duration: data.duration ?? null,
                    reason: data.reason,
                    adminId: data.adminId,
                })
                .returning();
            return rows[0]!;
        },

        async findActionById(id: string): Promise<ModerationActionRow | undefined> {
            const rows = await db.select().from(moderationActions).where(eq(moderationActions.id, id));
            return rows[0];
        },

        // --- Ban Records ---

        async createBan(data: {
            userId: string;
            reason: string;
            adminId: string;
        }): Promise<BanRecordRow> {
            const rows = await db
                .insert(banRecords)
                .values({
                    userId: data.userId,
                    reason: data.reason,
                    adminId: data.adminId,
                })
                .returning();
            return rows[0]!;
        },

        async getActiveBan(userId: string): Promise<BanRecordRow | undefined> {
            const rows = await db
                .select()
                .from(banRecords)
                .where(and(eq(banRecords.userId, userId), sql`${banRecords.resolvedAt} IS NULL`))
                .limit(1);
            return rows[0];
        },

        async resolveBan(userId: string): Promise<void> {
            await db
                .update(banRecords)
                .set({ resolvedAt: sql`NOW()` })
                .where(and(eq(banRecords.userId, userId), sql`${banRecords.resolvedAt} IS NULL`));
        },

        // --- Appeals ---

        async createAppeal(data: {
            moderationActionId: string;
            appealerId: string;
            reason: string;
        }): Promise<AppealRecordRow> {
            const rows = await db
                .insert(appealRecords)
                .values({
                    moderationActionId: data.moderationActionId,
                    appealerId: data.appealerId,
                    reason: data.reason,
                })
                .returning();
            return rows[0]!;
        },

        async resolveAppeal(id: string, reviewedBy: string, outcome: string): Promise<AppealRecordRow | undefined> {
            const rows = await db
                .update(appealRecords)
                .set({ reviewedBy, outcome, resolvedAt: sql`NOW()` })
                .where(eq(appealRecords.id, id))
                .returning();
            return rows[0];
        },

        async findAppealById(id: string): Promise<AppealRecordRow | undefined> {
            const rows = await db.select().from(appealRecords).where(eq(appealRecords.id, id));
            return rows[0];
        },

        // --- Audit Log ---

        async logAuditAction(data: {
            adminUserId: string;
            action: string;
            targetType?: string;
            targetId?: string;
            details?: unknown;
            correlationId?: string;
        }): Promise<AdminAuditLogRow> {
            const rows = await db
                .insert(adminAuditLog)
                .values({
                    adminUserId: data.adminUserId,
                    action: data.action,
                    targetType: data.targetType ?? null,
                    targetId: data.targetId ?? null,
                    details: data.details ?? null,
                    correlationId: data.correlationId ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getAuditLog(page = 1, pageSize = 50): Promise<AdminAuditLogRow[]> {
            return db
                .select()
                .from(adminAuditLog)
                .orderBy(desc(adminAuditLog.createdAt))
                .limit(pageSize)
                .offset((page - 1) * pageSize);
        },
    };
}
