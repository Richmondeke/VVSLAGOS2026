import { and, eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { ConflictError, ValidationError, writeToOutbox } from "@vvs/shared";
import { reviews } from "./schema.js";

export type ReviewRow = typeof reviews.$inferSelect;

const REVIEW_WINDOW_DAYS = 14;

export type SubmitReviewInput = {
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    body?: string;
    windowOpenedAt?: Date;
};

/**
 * Submits a review for a completed order.
 */
export async function submitReview(
    db: ScopedClient,
    input: SubmitReviewInput,
): Promise<ReviewRow> {
    // Validate rating range
    if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
        throw new ValidationError("Rating must be an integer between 1 and 5");
    }

    // Validate review window
    if (input.windowOpenedAt) {
        const windowClose = new Date(input.windowOpenedAt.getTime() + REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        if (new Date() > windowClose) {
            throw new ValidationError("Review window has closed (14 days after order completion)");
        }
    }

    // Check reviewer hasn't already reviewed this order
    const existing = await db
        .select()
        .from(reviews)
        .where(
            and(
                eq(reviews.orderId, input.orderId),
                eq(reviews.reviewerId, input.reviewerId),
            ),
        );
    if (existing.length > 0) {
        throw new ConflictError("You have already reviewed this order");
    }

    // Validate reviewer is a participant (reviewerId != revieweeId)
    if (input.reviewerId === input.revieweeId) {
        throw new ValidationError("Cannot review yourself");
    }

    const rows = await db
        .insert(reviews)
        .values({
            orderId: input.orderId,
            reviewerId: input.reviewerId,
            revieweeId: input.revieweeId,
            rating: input.rating,
            body: input.body ?? null,
            windowOpenedAt: input.windowOpenedAt ?? null,
        })
        .returning();

    const review = rows[0]!;

    // Write outbox event
    await writeToOutbox(db, "finance.review.submitted", {
        reviewId: review.id,
        orderId: review.orderId,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        rating: review.rating,
        timestamp: new Date(),
    }, `review-submitted-${review.id}`, review.revieweeId);

    return review;
}

/**
 * Gets all reviews for a user (as reviewee).
 */
export async function getReviewsForUser(
    db: ScopedClient,
    userId: string,
): Promise<ReviewRow[]> {
    return db.select().from(reviews).where(eq(reviews.revieweeId, userId));
}
