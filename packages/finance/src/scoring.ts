import { eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { writeToOutbox } from "@vvs/shared";
import { reviews, reputationScores, reputationHistory } from "./schema.js";

const MIN_REVIEWS_FOR_SCORE = 3;

/**
 * Calculates the reputation score for a user.
 * Simple arithmetic mean of all ratings received.
 * Returns null if fewer than MIN_REVIEWS_FOR_SCORE reviews.
 */
export async function calculateScore(
    db: ScopedClient,
    userId: string,
): Promise<{ score: number | null; reviewCount: number }> {
    const userReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.revieweeId, userId));

    const reviewCount = userReviews.length;

    if (reviewCount < MIN_REVIEWS_FOR_SCORE) {
        return { score: null, reviewCount };
    }

    const totalRating = userReviews.reduce((sum, r) => sum + r.rating, 0);
    const score = Number((totalRating / reviewCount).toFixed(2));

    return { score, reviewCount };
}

/**
 * Recalculates and persists the reputation score for a user.
 * Called after each new review.
 */
export async function updateReputationScore(
    db: ScopedClient,
    userId: string,
): Promise<{ score: number | null; reviewCount: number }> {
    const result = await calculateScore(db, userId);

    // Upsert reputation score
    const existing = await db
        .select()
        .from(reputationScores)
        .where(eq(reputationScores.userId, userId));

    if (existing.length === 0) {
        await db.insert(reputationScores).values({
            userId,
            score: result.score?.toString() ?? null,
            reviewCount: result.reviewCount,
        });
    } else {
        await db
            .update(reputationScores)
            .set({
                score: result.score?.toString() ?? null,
                reviewCount: result.reviewCount,
                lastCalculatedAt: new Date(),
            })
            .where(eq(reputationScores.userId, userId));
    }

    // Record history entry if score is not null
    if (result.score !== null) {
        await db.insert(reputationHistory).values({
            userId,
            score: result.score.toString(),
            trigger: "review_submitted",
        });
    }

    return result;
}

/**
 * Gets the stored reputation score for a user.
 */
export async function getReputationScore(
    db: ScopedClient,
    userId: string,
): Promise<{ score: number | null; reviewCount: number }> {
    const rows = await db
        .select()
        .from(reputationScores)
        .where(eq(reputationScores.userId, userId));

    if (rows.length === 0) {
        return { score: null, reviewCount: 0 };
    }

    const row = rows[0]!;
    return {
        score: row.score ? Number(row.score) : null,
        reviewCount: row.reviewCount,
    };
}
