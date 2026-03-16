import type { ScopedClient } from "@vvs/shared";
import { writeToOutbox } from "@vvs/shared";

const DEFAULT_PRO_SCORE_THRESHOLD = 4.0;
const DEFAULT_PRO_TRANSACTION_THRESHOLD = 10;

export type ThresholdConfig = {
    minScore: number;
    minTransactions: number;
};

/**
 * Checks if a user meets the Pro tier threshold.
 * Returns true if both score and transaction count thresholds are met.
 */
export function checkProThreshold(
    currentScore: number | null,
    transactionCount: number,
    config?: Partial<ThresholdConfig>,
): boolean {
    const minScore = config?.minScore ?? DEFAULT_PRO_SCORE_THRESHOLD;
    const minTransactions = config?.minTransactions ?? DEFAULT_PRO_TRANSACTION_THRESHOLD;

    if (currentScore === null) return false;
    return currentScore >= minScore && transactionCount >= minTransactions;
}

/**
 * Fires a threshold.reached event if the user qualifies for Pro.
 */
export async function emitThresholdReachedIfEligible(
    db: ScopedClient,
    userId: string,
    currentScore: number | null,
    transactionCount: number,
    config?: Partial<ThresholdConfig>,
): Promise<boolean> {
    if (!checkProThreshold(currentScore, transactionCount, config)) {
        return false;
    }

    await writeToOutbox(db, "finance.threshold.reached", {
        userId,
        reputationScore: currentScore!,
        thresholdName: "pro",
        timestamp: new Date(),
    }, `threshold-pro-${userId}`, userId);

    return true;
}
