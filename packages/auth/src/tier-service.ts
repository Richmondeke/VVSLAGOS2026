import type { ScopedClient } from "@vvs/shared";
import { writeToOutbox } from "@vvs/shared";
import type { MemberTier } from "@vvs/contracts";
import { createTiersRepo, type TierRow } from "./repositories/tiers.js";

// Default Pro upgrade thresholds — configurable via platform settings
let proThresholds = {
    minTransactions: 5,
    minRating: 4.2,
};

export function setProThresholds(thresholds: { minTransactions?: number; minRating?: number }): void {
    proThresholds = { ...proThresholds, ...thresholds };
}

export async function getTier(
    db: ScopedClient,
    userId: string,
): Promise<MemberTier> {
    const tiersRepo = createTiersRepo(db);
    const row = await tiersRepo.getCurrentTier(userId);
    return row?.tier ?? "free";
}

export type ProEligibility = {
    eligible: boolean;
    transactionCount: number;
    rating: number;
    requiredTransactions: number;
    requiredRating: number;
};

/**
 * Check Pro upgrade eligibility.
 * Caller must provide transaction count and rating (from finance package via interface call).
 */
export function checkProUpgrade(
    transactionCount: number,
    rating: number,
): ProEligibility {
    return {
        eligible:
            transactionCount >= proThresholds.minTransactions && rating >= proThresholds.minRating,
        transactionCount,
        rating,
        requiredTransactions: proThresholds.minTransactions,
        requiredRating: proThresholds.minRating,
    };
}

export async function upgradeTierToProIfEligible(
    db: ScopedClient,
    userId: string,
    transactionCount: number,
    rating: number,
): Promise<boolean> {
    const tiersRepo = createTiersRepo(db);

    // Idempotency: check if already Pro
    const currentTier = await tiersRepo.getCurrentTier(userId);
    if (currentTier?.tier === "pro") {
        return false;
    }

    const eligibility = checkProUpgrade(transactionCount, rating);
    if (!eligibility.eligible) {
        return false;
    }

    await tiersRepo.setTier({
        userId,
        tier: "pro",
        reason: `Reached Pro threshold: ${transactionCount} transactions, ${rating} rating`,
    });

    await writeToOutbox(
        db,
        "finance.threshold.reached",
        {
            userId,
            reputationScore: rating,
            thresholdName: "pro_upgrade",
            timestamp: new Date(),
        },
        `pro-upgrade:${userId}`,
        userId,
    );

    return true;
}

export async function setTier(
    db: ScopedClient,
    userId: string,
    tier: MemberTier,
    adminId: string,
    reason: string,
): Promise<TierRow> {
    const tiersRepo = createTiersRepo(db);
    return tiersRepo.setTier({
        userId,
        tier,
        changedBy: adminId,
        reason,
    });
}
