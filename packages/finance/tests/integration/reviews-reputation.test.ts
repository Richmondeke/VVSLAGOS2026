import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { submitReview } from "../../src/reviews.js";
import { calculateScore, updateReputationScore } from "../../src/scoring.js";
import { checkProThreshold, emitThresholdReachedIfEligible } from "../../src/thresholds.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "finance,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

describe("Reviews", () => {
    it("submits a valid review", async () => {
        await withTestTransaction(db, async (tx) => {
            const review = await submitReview(tx, {
                orderId: crypto.randomUUID(),
                reviewerId: crypto.randomUUID(),
                revieweeId: crypto.randomUUID(),
                rating: 5,
                body: "Excellent work!",
            });

            expect(review.rating).toBe(5);
            expect(review.body).toBe("Excellent work!");
        });
    });

    it("rejects duplicate review for same order + reviewer", async () => {
        await withTestTransaction(db, async (tx) => {
            const orderId = crypto.randomUUID();
            const reviewerId = crypto.randomUUID();
            const revieweeId = crypto.randomUUID();

            await submitReview(tx, { orderId, reviewerId, revieweeId, rating: 4 });

            await expect(
                submitReview(tx, { orderId, reviewerId, revieweeId, rating: 5 }),
            ).rejects.toThrow("already reviewed");
        });
    });

    it("rejects self-review", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await expect(
                submitReview(tx, {
                    orderId: crypto.randomUUID(),
                    reviewerId: userId,
                    revieweeId: userId,
                    rating: 5,
                }),
            ).rejects.toThrow("Cannot review yourself");
        });
    });

    it("rejects rating outside 1-5 range", async () => {
        await withTestTransaction(db, async (tx) => {
            await expect(
                submitReview(tx, {
                    orderId: crypto.randomUUID(),
                    reviewerId: crypto.randomUUID(),
                    revieweeId: crypto.randomUUID(),
                    rating: 6,
                }),
            ).rejects.toThrow("Rating must be an integer between 1 and 5");
        });
    });
});

describe("Reputation Scoring", () => {
    it("< 3 reviews returns null score", async () => {
        await withTestTransaction(db, async (tx) => {
            const revieweeId = crypto.randomUUID();

            // Submit 2 reviews
            for (let i = 0; i < 2; i++) {
                await submitReview(tx, {
                    orderId: crypto.randomUUID(),
                    reviewerId: crypto.randomUUID(),
                    revieweeId,
                    rating: 5,
                });
            }

            const result = await calculateScore(tx, revieweeId);
            expect(result.score).toBeNull();
            expect(result.reviewCount).toBe(2);
        });
    });

    it("3 reviews returns correct average", async () => {
        await withTestTransaction(db, async (tx) => {
            const revieweeId = crypto.randomUUID();

            // Submit 3 reviews: 4, 5, 3
            const ratings = [4, 5, 3];
            for (const rating of ratings) {
                await submitReview(tx, {
                    orderId: crypto.randomUUID(),
                    reviewerId: crypto.randomUUID(),
                    revieweeId,
                    rating,
                });
            }

            const result = await calculateScore(tx, revieweeId);
            expect(result.score).toBe(4); // (4+5+3)/3 = 4.0
            expect(result.reviewCount).toBe(3);
        });
    });

    it("updateReputationScore persists score and history", async () => {
        await withTestTransaction(db, async (tx) => {
            const revieweeId = crypto.randomUUID();

            for (let i = 0; i < 3; i++) {
                await submitReview(tx, {
                    orderId: crypto.randomUUID(),
                    reviewerId: crypto.randomUUID(),
                    revieweeId,
                    rating: 5,
                });
            }

            const result = await updateReputationScore(tx, revieweeId);
            expect(result.score).toBe(5);
            expect(result.reviewCount).toBe(3);
        });
    });
});

describe("Pro Threshold", () => {
    it("returns false when score is null", () => {
        expect(checkProThreshold(null, 20)).toBe(false);
    });

    it("returns false when score below threshold", () => {
        expect(checkProThreshold(3.5, 20)).toBe(false);
    });

    it("returns false when transactions below threshold", () => {
        expect(checkProThreshold(4.5, 5)).toBe(false);
    });

    it("returns true when both thresholds met", () => {
        expect(checkProThreshold(4.5, 15)).toBe(true);
    });

    it("emits threshold event when eligible", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const emitted = await emitThresholdReachedIfEligible(tx, userId, 4.5, 15);
            expect(emitted).toBe(true);
        });
    });
});
