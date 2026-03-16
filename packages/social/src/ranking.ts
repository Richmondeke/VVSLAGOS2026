import type { FeedPostRow } from "./repositories/feed.js";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Calculate rank score for a feed post.
 *
 * Factors:
 * - Recency: exponential decay with ~3 day half-life
 * - Verified engagement: likes/bookmarks from verified+ members weighted higher
 * - Author transaction history: more completed transactions = higher score
 */
export function calculateRankScore(
    post: FeedPostRow,
    authorStats: {
        completedTransactions: number;
        isVerified: boolean;
    },
    engagementStats: {
        totalLikes: number;
        verifiedLikes: number;
        totalBookmarks: number;
        verifiedBookmarks: number;
        comments: number;
    },
): number {
    // 1. Recency decay (half-life ~3 days)
    const ageMs = Date.now() - post.createdAt.getTime();
    const recencyScore = Math.pow(0.5, ageMs / THREE_DAYS_MS);

    // 2. Engagement score (verified interactions weighted 3x)
    const freeLikes = engagementStats.totalLikes - engagementStats.verifiedLikes;
    const freeBookmarks = engagementStats.totalBookmarks - engagementStats.verifiedBookmarks;
    const engagementScore =
        freeLikes * 1 +
        engagementStats.verifiedLikes * 3 +
        freeBookmarks * 1.5 +
        engagementStats.verifiedBookmarks * 4.5 +
        engagementStats.comments * 2;

    // 3. Author transaction signal (log scale to avoid runaway)
    const txScore = Math.log2(1 + authorStats.completedTransactions);

    // 4. Verified author boost
    const verifiedBoost = authorStats.isVerified ? 1.5 : 1.0;

    // Combine
    const raw = (recencyScore * 100 + engagementScore * 5 + txScore * 10) * verifiedBoost;

    return Math.round(raw * 10000) / 10000; // 4 decimal places
}
