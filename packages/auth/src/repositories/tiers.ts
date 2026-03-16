import { desc, eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { memberTiers } from "../schema.js";

export type NewTierEntry = {
    userId: string;
    tier: "free" | "verified" | "pro";
    changedBy?: string;
    reason?: string;
};

export type TierRow = typeof memberTiers.$inferSelect;

export function createTiersRepo(db: ScopedClient) {
    return {
        async getCurrentTier(userId: string): Promise<TierRow | undefined> {
            const rows = await db
                .select()
                .from(memberTiers)
                .where(eq(memberTiers.userId, userId))
                .orderBy(desc(memberTiers.seq))
                .limit(1);
            return rows[0];
        },

        async setTier(data: NewTierEntry): Promise<TierRow> {
            const rows = await db
                .insert(memberTiers)
                .values({
                    userId: data.userId,
                    tier: data.tier,
                    changedBy: data.changedBy ?? null,
                    reason: data.reason ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getHistory(userId: string): Promise<TierRow[]> {
            return db
                .select()
                .from(memberTiers)
                .where(eq(memberTiers.userId, userId))
                .orderBy(desc(memberTiers.seq));
        },
    };
}
