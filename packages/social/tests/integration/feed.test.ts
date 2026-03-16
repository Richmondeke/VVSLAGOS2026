import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createPost, deletePost, flagPost } from "../../src/posting.js";
import { getTimeline, engage } from "../../src/timeline.js";
import { calculateRankScore } from "../../src/ranking.js";
import { createFeedRepo } from "../../src/repositories/feed.js";
import { handlePortfolioPublished, handleListingCreated, handleUserSuspended } from "../../src/consumers.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "social,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

describe("Feed — Posting", () => {
    it("creates a post with valid type", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const post = await createPost(tx, userId, {
                type: "service_announcement",
                title: "New Service",
                content: "Check out my new service!",
            });

            expect(post.id).toBeDefined();
            expect(post.userId).toBe(userId);
            expect(post.type).toBe("service_announcement");
        });
    });

    it("rejects completed_project without media", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            await expect(
                createPost(tx, userId, {
                    type: "project",
                    title: "My Project",
                    content: "Check it out",
                }),
            ).rejects.toThrow("must include at least one media attachment");
        });
    });

    it("allows completed_project with media", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const post = await createPost(tx, userId, {
                type: "project",
                title: "My Project",
                content: "Check it out",
                mediaUrls: ["https://example.com/image.png"],
            });

            expect(post.type).toBe("project");
            expect(post.mediaUrls).toHaveLength(1);
        });
    });

    it("soft-deletes a post", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const post = await createPost(tx, userId, {
                type: "service_announcement",
                title: "Delete Me",
                content: "Going away",
            });

            await deletePost(tx, userId, post.id);

            const repo = createFeedRepo(tx);
            const found = await repo.findPostById(post.id);
            expect(found!.isVisible).toBe(false);
        });
    });

    it("non-author cannot delete post", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const post = await createPost(tx, userId, {
                type: "service_announcement",
                title: "Protected",
                content: "Stay",
            });

            await expect(
                deletePost(tx, crypto.randomUUID(), post.id),
            ).rejects.toThrow("not the author");
        });
    });
});

describe("Feed — Timeline & Engagement", () => {
    it("getTimeline returns visible posts", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await createPost(tx, userId, {
                type: "service_announcement",
                title: "Visible",
                content: "See me",
            });

            const timeline = await getTimeline(tx, crypto.randomUUID());
            expect(timeline.items.length).toBeGreaterThanOrEqual(1);
        });
    });

    it("like engagement is recorded and counted", async () => {
        await withTestTransaction(db, async (tx) => {
            const author = crypto.randomUUID();
            const liker = crypto.randomUUID();
            const post = await createPost(tx, author, {
                type: "service_announcement",
                title: "Like me",
                content: "Please",
            });

            await engage(tx, liker, post.id, "like");

            const repo = createFeedRepo(tx);
            const counts = await repo.getEngagementCounts(post.id);
            expect(counts.likes).toBe(1);
        });
    });

    it("duplicate like is idempotent", async () => {
        await withTestTransaction(db, async (tx) => {
            const author = crypto.randomUUID();
            const liker = crypto.randomUUID();
            const post = await createPost(tx, author, {
                type: "service_announcement",
                title: "Double like",
                content: "Try it",
            });

            await engage(tx, liker, post.id, "like");
            await engage(tx, liker, post.id, "like");

            const repo = createFeedRepo(tx);
            const counts = await repo.getEngagementCounts(post.id);
            expect(counts.likes).toBe(1);
        });
    });

    it("comments are not deduplicated", async () => {
        await withTestTransaction(db, async (tx) => {
            const author = crypto.randomUUID();
            const commenter = crypto.randomUUID();
            const post = await createPost(tx, author, {
                type: "service_announcement",
                title: "Comment here",
                content: "Go ahead",
            });

            await engage(tx, commenter, post.id, "comment", "First comment");
            await engage(tx, commenter, post.id, "comment", "Second comment");

            const repo = createFeedRepo(tx);
            const counts = await repo.getEngagementCounts(post.id);
            expect(counts.comments).toBe(2);
        });
    });
});

describe("Feed — Ranking", () => {
    it("verified author with transactions ranks higher", () => {
        const now = new Date();
        const post = {
            id: "test",
            authorId: "a",
            postType: "service_announcement",
            body: "test",
            mediaUrls: null,
            linkedListingId: null,
            isVisible: true,
            rankScore: "0",
            createdAt: now,
            updatedAt: now,
        };

        const verifiedScore = calculateRankScore(
            post,
            { completedTransactions: 10, isVerified: true },
            { totalLikes: 5, verifiedLikes: 3, totalBookmarks: 2, verifiedBookmarks: 1, comments: 1 },
        );

        const unverifiedScore = calculateRankScore(
            post,
            { completedTransactions: 0, isVerified: false },
            { totalLikes: 5, verifiedLikes: 0, totalBookmarks: 2, verifiedBookmarks: 0, comments: 1 },
        );

        expect(verifiedScore).toBeGreaterThan(unverifiedScore);
    });

    it("newer posts rank higher than older posts (same engagement)", () => {
        const now = new Date();
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const basePost = {
            id: "test",
            authorId: "a",
            postType: "service_announcement",
            body: "test",
            mediaUrls: null,
            linkedListingId: null,
            isVisible: true,
            rankScore: "0",
            updatedAt: now,
        };

        const stats = { completedTransactions: 1, isVerified: true };
        const engagement = { totalLikes: 0, verifiedLikes: 0, totalBookmarks: 0, verifiedBookmarks: 0, comments: 0 };

        const newScore = calculateRankScore({ ...basePost, createdAt: now }, stats, engagement);
        const oldScore = calculateRankScore({ ...basePost, createdAt: threeDaysAgo }, stats, engagement);

        expect(newScore).toBeGreaterThan(oldScore);
    });
});

describe("Feed — Event Consumers", () => {
    it("handlePortfolioPublished creates a completed_project post", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await handlePortfolioPublished(tx, {
                userId,
                itemId: crypto.randomUUID(),
                title: "My Portfolio Piece",
                mediaUrls: ["https://example.com/screenshot.png"],
            });

            const repo = createFeedRepo(tx);
            const posts = await repo.getPostsByAuthor(userId);
            expect(posts).toHaveLength(1);
            expect(posts[0]!.postType).toBe("project");
        });
    });

    it("handleListingCreated creates a service_announcement post", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await handleListingCreated(tx, {
                providerId: userId,
                listingId: crypto.randomUUID(),
                category: "design",
            });

            const repo = createFeedRepo(tx);
            const posts = await repo.getPostsByAuthor(userId);
            expect(posts).toHaveLength(1);
            expect(posts[0]!.postType).toBe("service_announcement");
        });
    });

    it("handleUserSuspended hides all user posts", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await createPost(tx, userId, { type: "service_announcement", title: "A", content: "post1" });
            await createPost(tx, userId, { type: "service_announcement", title: "B", content: "post2" });

            await handleUserSuspended(tx, { userId });

            const repo = createFeedRepo(tx);
            const posts = await repo.getPostsByAuthor(userId);
            expect(posts).toHaveLength(0); // all hidden
        });
    });
});
