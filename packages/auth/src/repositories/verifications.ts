import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { verifications } from "../schema.js";

export type NewVerification = {
    userId: string;
    status: "pending" | "provisional" | "verified" | "rejected" | "expired";
    method: "automated" | "manual";
    grantedBy?: string;
    expiresAt?: Date;
};

export type VerificationRow = typeof verifications.$inferSelect;

export function createVerificationsRepo(db: ScopedClient) {
    return {
        async create(data: NewVerification): Promise<VerificationRow> {
            const rows = await db
                .insert(verifications)
                .values({
                    userId: data.userId,
                    status: data.status,
                    method: data.method,
                    grantedBy: data.grantedBy ?? null,
                    expiresAt: data.expiresAt ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findByUserId(userId: string): Promise<VerificationRow[]> {
            return db
                .select()
                .from(verifications)
                .where(eq(verifications.userId, userId));
        },

        async updateStatus(
            id: string,
            status: VerificationRow["status"],
        ): Promise<VerificationRow | undefined> {
            const rows = await db
                .update(verifications)
                .set({ status, updatedAt: sql`NOW()` })
                .where(eq(verifications.id, id))
                .returning();
            return rows[0];
        },

        async findExpiredProvisional(): Promise<VerificationRow[]> {
            return db
                .select()
                .from(verifications)
                .where(
                    and(
                        eq(verifications.status, "provisional"),
                        isNotNull(verifications.expiresAt),
                        lt(verifications.expiresAt, sql`NOW()`),
                    ),
                );
        },
    };
}
