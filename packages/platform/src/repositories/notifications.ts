import { eq, and, sql, gte } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import {
    notificationPreferences,
    notificationLog,
    notificationTemplates,
    notificationRoutes,
} from "../schema.js";

export type NotificationPreferencesRow = typeof notificationPreferences.$inferSelect;
export type NotificationLogRow = typeof notificationLog.$inferSelect;
export type NotificationTemplateRow = typeof notificationTemplates.$inferSelect;
export type NotificationRouteRow = typeof notificationRoutes.$inferSelect;

export function createNotificationsRepo(db: ScopedClient) {
    return {
        // --- Preferences ---

        async getPreferences(userId: string): Promise<NotificationPreferencesRow | undefined> {
            const rows = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
            return rows[0];
        },

        async upsertPreferences(userId: string, prefs: Record<string, unknown>): Promise<NotificationPreferencesRow> {
            const rows = await db
                .insert(notificationPreferences)
                .values({ userId, preferences: prefs })
                .onConflictDoUpdate({
                    target: notificationPreferences.userId,
                    set: { preferences: prefs, updatedAt: sql`NOW()` },
                })
                .returning();
            return rows[0]!;
        },

        // --- Log ---

        async logNotification(data: {
            userId: string;
            eventType: string;
            channel: string;
            status: string;
            reference?: string;
        }): Promise<NotificationLogRow> {
            const rows = await db
                .insert(notificationLog)
                .values({
                    userId: data.userId,
                    eventType: data.eventType,
                    channel: data.channel,
                    status: data.status,
                    reference: data.reference ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getRecentNotificationCount(userId: string, eventType: string, windowSeconds: number): Promise<number> {
            const since = new Date(Date.now() - windowSeconds * 1000);
            const rows = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(notificationLog)
                .where(
                    and(
                        eq(notificationLog.userId, userId),
                        eq(notificationLog.eventType, eventType),
                        eq(notificationLog.status, "sent"),
                        gte(notificationLog.createdAt, since),
                    ),
                );
            return rows[0]?.count ?? 0;
        },

        async getLastNotificationTime(userId: string, eventType: string): Promise<Date | null> {
            const rows = await db
                .select({ createdAt: notificationLog.createdAt })
                .from(notificationLog)
                .where(
                    and(
                        eq(notificationLog.userId, userId),
                        eq(notificationLog.eventType, eventType),
                        eq(notificationLog.status, "sent"),
                    ),
                )
                .orderBy(sql`${notificationLog.createdAt} DESC`)
                .limit(1);
            return rows[0]?.createdAt ?? null;
        },

        async getLogForUser(userId: string, page = 1, pageSize = 50): Promise<NotificationLogRow[]> {
            return db
                .select()
                .from(notificationLog)
                .where(eq(notificationLog.userId, userId))
                .orderBy(sql`${notificationLog.createdAt} DESC`)
                .limit(pageSize)
                .offset((page - 1) * pageSize);
        },

        // --- Templates ---

        async getTemplate(id: string): Promise<NotificationTemplateRow | undefined> {
            const rows = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
            return rows[0];
        },

        async upsertTemplate(data: {
            id: string;
            subject?: string;
            body: string;
            channelType: string;
            version?: number;
        }): Promise<NotificationTemplateRow> {
            const rows = await db
                .insert(notificationTemplates)
                .values({
                    id: data.id,
                    subject: data.subject ?? null,
                    body: data.body,
                    channelType: data.channelType,
                    version: data.version ?? 1,
                })
                .onConflictDoUpdate({
                    target: notificationTemplates.id,
                    set: {
                        subject: data.subject ?? null,
                        body: data.body,
                        channelType: data.channelType,
                        version: data.version ?? 1,
                    },
                })
                .returning();
            return rows[0]!;
        },

        // --- Routes ---

        async getRoutesForEvent(eventType: string): Promise<NotificationRouteRow[]> {
            return db
                .select()
                .from(notificationRoutes)
                .where(and(eq(notificationRoutes.eventType, eventType), eq(notificationRoutes.enabled, true)));
        },

        async createRoute(data: {
            eventType: string;
            templateId: string;
            recipientField: string;
            channels: string[];
            maxPerUser?: number;
            maxPerUserWindow?: number;
            cooldownSeconds?: number;
        }): Promise<NotificationRouteRow> {
            const rows = await db
                .insert(notificationRoutes)
                .values({
                    eventType: data.eventType,
                    templateId: data.templateId,
                    recipientField: data.recipientField,
                    channels: data.channels,
                    maxPerUser: data.maxPerUser ?? null,
                    maxPerUserWindow: data.maxPerUserWindow ?? null,
                    cooldownSeconds: data.cooldownSeconds ?? null,
                })
                .returning();
            return rows[0]!;
        },
    };
}
