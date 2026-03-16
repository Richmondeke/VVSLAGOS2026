import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import type { IIdentityService, MemberTier, VerificationStatus } from "@vvs/contracts";
import { verificationCache } from "./schema.js";

export type VerificationCacheRow = typeof verificationCache.$inferSelect;

export function createVerificationCacheRepo(db: ScopedClient) {
    return {
        async get(userId: string): Promise<VerificationCacheRow | undefined> {
            const rows = await db
                .select()
                .from(verificationCache)
                .where(eq(verificationCache.userId, userId));
            return rows[0];
        },

        async upsert(userId: string, tier: MemberTier, status: VerificationStatus): Promise<VerificationCacheRow> {
            // Try update first
            const updated = await db
                .update(verificationCache)
                .set({
                    tier,
                    verificationStatus: status,
                    lastSyncedAt: sql`NOW()`,
                })
                .where(eq(verificationCache.userId, userId))
                .returning();

            if (updated.length > 0) return updated[0]!;

            // Insert if not exists
            const rows = await db
                .insert(verificationCache)
                .values({
                    userId,
                    tier,
                    verificationStatus: status,
                })
                .returning();
            return rows[0]!;
        },
    };
}

/**
 * Syncs a user's tier and verification status from the live IIdentityService
 * into the local verification cache. This is a DISPLAY OPTIMIZATION only —
 * write-path decisions (listing creation) ALWAYS use the live service call.
 */
export async function syncVerificationCache(
    db: ScopedClient,
    identityService: IIdentityService,
    userId: string,
): Promise<void> {
    const tier = await identityService.getTier(userId);
    const status = await identityService.getStatus(userId);
    const repo = createVerificationCacheRepo(db);
    await repo.upsert(userId, tier, status);
}
