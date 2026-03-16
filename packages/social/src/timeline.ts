import type { ScopedClient } from "@vvs/shared";
import { writeToOutbox } from "@vvs/shared";
import type { FeedPost, Paginated } from "@vvs/contracts";
import { createFeedRepo, type FeedPostRow } from "./repositories/feed.js";
import { createBlocksRepo } from "./repositories/blocks.js";
import { mapPostRow } from "./posting.js";

/**
 * Get the timeline for a user: ranked visible posts, excluding blocked users.
 */
export async function getTimeline(
    db: ScopedClient,
    userId: string,
    page = 1,
    pageSize = 20,
): Promise<Paginated<FeedPost>> {
    const feedRepo = createFeedRepo(db);
    const blocksRepo = createBlocksRepo(db);

    // Get blocked users to filter out
    const blockedIds = await blocksRepo.getBlockedByUser(userId);

    const result = await feedRepo.getTimeline(page, pageSize);

    // Filter out blocked authors and enrich with engagement counts
    const items: FeedPost[] = [];
    for (const post of result.items) {
        if (blockedIds.includes(post.authorId)) continue;

        const counts = await feedRepo.getEngagementCounts(post.id);
        items.push(mapPostRow(post, counts));
    }

    return {
        items,
        total: result.total,
        page,
        pageSize,
    };
}

/**
 * Engage with a post (like, bookmark, comment).
 */
export async function engage(
    db: ScopedClient,
    userId: string,
    postId: string,
    type: "like" | "bookmark" | "comment",
    body?: string,
): Promise<void> {
    const feedRepo = createFeedRepo(db);

    const post = await feedRepo.findPostById(postId);
    if (!post || !post.isVisible) {
        throw new Error("Post not found");
    }

    await feedRepo.addEngagement({
        postId,
        userId,
        type,
        body,
    });

    await writeToOutbox(
        db,
        "social.engagement.received",
        {
            postId,
            postAuthorId: post.authorId,
            engagerId: userId,
            type,
            timestamp: new Date(),
        },
        `engagement-${postId}-${userId}-${type}-${Date.now()}`,
    );
}
