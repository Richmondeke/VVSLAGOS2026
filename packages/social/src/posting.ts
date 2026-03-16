import type { ScopedClient } from "@vvs/shared";
import { ValidationError, writeToOutbox } from "@vvs/shared";
import type { FeedPost, FeedPostInput } from "@vvs/contracts";
import { createFeedRepo, type FeedPostRow } from "./repositories/feed.js";

const ALLOWED_POST_TYPES = ["project", "service_announcement", "wip", "collaboration_call", "case_study"];

function mapPostRow(row: FeedPostRow, counts?: { likes: number; bookmarks: number; comments: number }): FeedPost {
    return {
        id: row.id,
        userId: row.authorId,
        type: row.postType as FeedPost["type"],
        title: "", // stored in body for now
        content: row.body,
        mediaUrls: row.mediaUrls ?? [],
        engagementMetrics: counts ?? { likes: 0, bookmarks: 0, comments: 0 },
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

/**
 * Create a feed post with content policy validation.
 */
export async function createPost(
    db: ScopedClient,
    userId: string,
    input: FeedPostInput,
): Promise<FeedPost> {
    // Validate post type
    if (!ALLOWED_POST_TYPES.includes(input.type)) {
        throw new ValidationError(`Post type '${input.type}' is not allowed. Allowed: ${ALLOWED_POST_TYPES.join(", ")}`);
    }

    // Content policy: completed_project requires media
    if (input.type === "project" && (!input.mediaUrls || input.mediaUrls.length === 0)) {
        throw new ValidationError("Posts of type 'completed_project' must include at least one media attachment");
    }

    const repo = createFeedRepo(db);
    const post = await repo.createPost({
        authorId: userId,
        postType: input.type,
        body: input.content,
        mediaUrls: input.mediaUrls,
    });

    await writeToOutbox(
        db,
        "social.post.created" as any,
        {
            postId: post.id,
            authorId: userId,
            postType: input.type,
            timestamp: new Date(),
        },
        `post-created-${post.id}`,
    );

    return mapPostRow(post);
}

/**
 * Soft-delete a post (set isVisible = false).
 */
export async function deletePost(
    db: ScopedClient,
    userId: string,
    postId: string,
): Promise<void> {
    const repo = createFeedRepo(db);
    const deleted = await repo.deletePost(postId, userId);
    if (!deleted) {
        throw new ValidationError("Post not found or you are not the author");
    }
}

/**
 * Flag a post for moderation review.
 */
export async function flagPost(
    db: ScopedClient,
    reporterId: string,
    postId: string,
    reason: string,
): Promise<void> {
    await writeToOutbox(
        db,
        "social.post.flagged",
        {
            postId,
            userId: reporterId,
            reason,
            timestamp: new Date(),
        },
        `post-flagged-${postId}-${reporterId}`,
    );
}

export { mapPostRow };
