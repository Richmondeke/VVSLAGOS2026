import { eq, and, sql, desc } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { feedPosts, feedEngagements } from "../schema.js";

export type FeedPostRow = typeof feedPosts.$inferSelect;
export type FeedEngagementRow = typeof feedEngagements.$inferSelect;

export function createFeedRepo(db: ScopedClient) {
    return {
        async createPost(data: {
            authorId: string;
            postType: string;
            body: string;
            mediaUrls?: string[];
            linkedListingId?: string;
        }): Promise<FeedPostRow> {
            const rows = await db
                .insert(feedPosts)
                .values({
                    authorId: data.authorId,
                    postType: data.postType,
                    body: data.body,
                    mediaUrls: data.mediaUrls ?? null,
                    linkedListingId: data.linkedListingId ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findPostById(id: string): Promise<FeedPostRow | undefined> {
            const rows = await db.select().from(feedPosts).where(eq(feedPosts.id, id));
            return rows[0];
        },

        async deletePost(id: string, authorId: string): Promise<boolean> {
            const rows = await db
                .update(feedPosts)
                .set({ isVisible: false, updatedAt: sql`NOW()` })
                .where(and(eq(feedPosts.id, id), eq(feedPosts.authorId, authorId)))
                .returning();
            return rows.length > 0;
        },

        async flagPost(id: string): Promise<void> {
            await db
                .update(feedPosts)
                .set({ isVisible: false, updatedAt: sql`NOW()` })
                .where(eq(feedPosts.id, id));
        },

        async getTimeline(
            page = 1,
            pageSize = 20,
        ): Promise<{ items: FeedPostRow[]; total: number; page: number; pageSize: number }> {
            const condition = eq(feedPosts.isVisible, true);

            const [countResult, items] = await Promise.all([
                db.select({ count: sql<number>`count(*)::int` }).from(feedPosts).where(condition),
                db
                    .select()
                    .from(feedPosts)
                    .where(condition)
                    .orderBy(desc(feedPosts.createdAt))
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

        async addEngagement(data: {
            postId: string;
            userId: string;
            type: "like" | "bookmark" | "comment";
            body?: string;
        }): Promise<FeedEngagementRow> {
            // For likes and bookmarks, check-then-insert (one per user per post per type)
            if (data.type !== "comment") {
                const existing = await db
                    .select()
                    .from(feedEngagements)
                    .where(
                        and(
                            eq(feedEngagements.postId, data.postId),
                            eq(feedEngagements.userId, data.userId),
                            eq(feedEngagements.type, data.type),
                        ),
                    );
                if (existing[0]) return existing[0];
            }

            const rows = await db
                .insert(feedEngagements)
                .values({
                    postId: data.postId,
                    userId: data.userId,
                    type: data.type,
                    body: data.body ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getEngagementCounts(postId: string): Promise<{ likes: number; bookmarks: number; comments: number }> {
            const rows = await db
                .select({
                    type: feedEngagements.type,
                    count: sql<number>`count(*)::int`,
                })
                .from(feedEngagements)
                .where(eq(feedEngagements.postId, postId))
                .groupBy(feedEngagements.type);

            const counts = { likes: 0, bookmarks: 0, comments: 0 };
            for (const row of rows) {
                if (row.type === "like") counts.likes = row.count;
                else if (row.type === "bookmark") counts.bookmarks = row.count;
                else if (row.type === "comment") counts.comments = row.count;
            }
            return counts;
        },

        async getPostsByAuthor(authorId: string, page = 1, pageSize = 20): Promise<FeedPostRow[]> {
            return db
                .select()
                .from(feedPosts)
                .where(and(eq(feedPosts.authorId, authorId), eq(feedPosts.isVisible, true)))
                .orderBy(desc(feedPosts.createdAt))
                .limit(pageSize)
                .offset((page - 1) * pageSize);
        },
    };
}
