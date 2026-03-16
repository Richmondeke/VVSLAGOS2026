import { eq, or, and, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { blocks } from "../schema.js";

export type BlockRow = typeof blocks.$inferSelect;

export function createBlocksRepo(db: ScopedClient) {
    return {
        async block(blockerId: string, blockedId: string): Promise<BlockRow> {
            const rows = await db
                .insert(blocks)
                .values({ blockerId, blockedId })
                .onConflictDoNothing()
                .returning();

            if (!rows[0]) {
                const existing = await db
                    .select()
                    .from(blocks)
                    .where(
                        and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)),
                    );
                return existing[0]!;
            }

            return rows[0];
        },

        async unblock(blockerId: string, blockedId: string): Promise<boolean> {
            const rows = await db
                .delete(blocks)
                .where(
                    and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId)),
                )
                .returning();
            return rows.length > 0;
        },

        /**
         * Bidirectional check: returns true if either user has blocked the other.
         */
        async isBlocked(userA: string, userB: string): Promise<boolean> {
            const rows = await db
                .select({ id: blocks.id })
                .from(blocks)
                .where(
                    or(
                        and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)),
                        and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA)),
                    ),
                )
                .limit(1);
            return rows.length > 0;
        },

        async getBlockedByUser(userId: string): Promise<string[]> {
            const rows = await db
                .select({ blockedId: blocks.blockedId })
                .from(blocks)
                .where(eq(blocks.blockerId, userId));
            return rows.map((r) => r.blockedId);
        },
    };
}
