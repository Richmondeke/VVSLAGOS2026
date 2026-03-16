import { eq, or, and, sql, desc } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { conversations, messages } from "../schema.js";

export type ConversationRow = typeof conversations.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;

/**
 * Normalise member pair: smaller UUID first for consistent UNIQUE constraint.
 */
function normalisePair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
}

export function createConversationsRepo(db: ScopedClient) {
    return {
        async getOrCreate(userId1: string, userId2: string): Promise<ConversationRow> {
            const [m1, m2] = normalisePair(userId1, userId2);

            // Try to find existing
            const existing = await db
                .select()
                .from(conversations)
                .where(
                    and(
                        eq(conversations.member1Id, m1),
                        eq(conversations.member2Id, m2),
                    ),
                );

            if (existing[0]) return existing[0];

            // Create new
            const rows = await db
                .insert(conversations)
                .values({ member1Id: m1, member2Id: m2 })
                .onConflictDoNothing()
                .returning();

            // Handle race condition — if another insert won, re-fetch
            if (!rows[0]) {
                const refetch = await db
                    .select()
                    .from(conversations)
                    .where(
                        and(
                            eq(conversations.member1Id, m1),
                            eq(conversations.member2Id, m2),
                        ),
                    );
                return refetch[0]!;
            }

            return rows[0];
        },

        async findById(id: string): Promise<ConversationRow | undefined> {
            const rows = await db.select().from(conversations).where(eq(conversations.id, id));
            return rows[0];
        },

        async getInbox(
            userId: string,
            page = 1,
            pageSize = 20,
        ): Promise<{ items: ConversationRow[]; total: number; page: number; pageSize: number }> {
            const condition = or(
                eq(conversations.member1Id, userId),
                eq(conversations.member2Id, userId),
            );

            const [countResult, items] = await Promise.all([
                db.select({ count: sql<number>`count(*)::int` }).from(conversations).where(condition),
                db
                    .select()
                    .from(conversations)
                    .where(condition)
                    .orderBy(desc(conversations.lastMessageAt))
                    .limit(pageSize)
                    .offset((page - 1) * pageSize),
            ]);

            return {
                items,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        async updateLastMessageAt(id: string): Promise<void> {
            await db
                .update(conversations)
                .set({ lastMessageAt: sql`NOW()` })
                .where(eq(conversations.id, id));
        },

        /**
         * Check if a user is a participant in the conversation.
         */
        isParticipant(conv: ConversationRow, userId: string): boolean {
            return conv.member1Id === userId || conv.member2Id === userId;
        },

        /**
         * Get the other participant in a conversation.
         */
        getOtherParticipant(conv: ConversationRow, userId: string): string {
            return conv.member1Id === userId ? conv.member2Id : conv.member1Id;
        },
    };
}
