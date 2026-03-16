import type { ScopedClient } from "@vvs/shared";
import { createFeedRepo } from "./repositories/feed.js";

/**
 * Handle portfolio.published event → auto-create completed_project feed post.
 */
export async function handlePortfolioPublished(
    db: ScopedClient,
    payload: { userId: string; itemId: string; title: string; mediaUrls?: string[] },
): Promise<void> {
    const repo = createFeedRepo(db);
    await repo.createPost({
        authorId: payload.userId,
        postType: "project",
        body: `New portfolio item: ${payload.title}`,
        mediaUrls: payload.mediaUrls,
    });
}

/**
 * Handle marketplace.listing.created → optionally create service_announcement.
 */
export async function handleListingCreated(
    db: ScopedClient,
    payload: { providerId: string; listingId: string; category?: string },
): Promise<void> {
    const repo = createFeedRepo(db);
    await repo.createPost({
        authorId: payload.providerId,
        postType: "service_announcement",
        body: `New service listing available`,
        linkedListingId: payload.listingId,
    });
}

/**
 * Handle platform.user.suspended → hide all user's posts.
 */
export async function handleUserSuspended(
    db: ScopedClient,
    payload: { userId: string },
): Promise<void> {
    const repo = createFeedRepo(db);
    const posts = await repo.getPostsByAuthor(payload.userId, 1, 1000);
    for (const post of posts) {
        await repo.deletePost(post.id, post.authorId);
    }
}
