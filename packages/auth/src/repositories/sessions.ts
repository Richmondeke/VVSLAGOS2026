import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { sessions } from "../schema.js";

export type NewSession = {
    userId: string;
    deviceInfo?: unknown;
    expiresAt: Date;
};

export type SessionRow = typeof sessions.$inferSelect;

export function createSessionsRepo(db: ScopedClient) {
    return {
        async create(data: NewSession): Promise<SessionRow> {
            const rows = await db
                .insert(sessions)
                .values({
                    userId: data.userId,
                    deviceInfo: data.deviceInfo ?? null,
                    expiresAt: data.expiresAt,
                })
                .returning();
            return rows[0]!;
        },

        async findById(id: string): Promise<SessionRow | undefined> {
            const rows = await db.select().from(sessions).where(eq(sessions.id, id));
            return rows[0];
        },

        async revokeById(id: string): Promise<void> {
            await db
                .update(sessions)
                .set({ revokedAt: sql`NOW()` })
                .where(eq(sessions.id, id));
        },

        async revokeAllForUser(userId: string): Promise<void> {
            await db
                .update(sessions)
                .set({ revokedAt: sql`NOW()` })
                .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
        },

        async findActiveByUser(userId: string): Promise<SessionRow[]> {
            return db
                .select()
                .from(sessions)
                .where(
                    and(
                        eq(sessions.userId, userId),
                        isNull(sessions.revokedAt),
                        gt(sessions.expiresAt, sql`NOW()`),
                    ),
                );
        },
    };
}
