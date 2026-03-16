import { sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { createChildLogger, writeToOutbox } from "@vvs/shared";
import { createWalletsRepo, createLedgerRepo, wallets } from "@vvs/finance";

const logger = createChildLogger("finance-reconciliation");

const DRIFT_ALERT_THRESHOLD = 0.05; // 5%

/**
 * Reconciliation job: verifies wallet balances match ledger entries.
 * Designed to run as a BullMQ repeatable job (daily).
 */
export async function runFinanceReconciliation(db: ScopedClient): Promise<{
    total: number;
    consistent: number;
    drifted: number;
    errors: { walletId: string; drift: number; stored: number; calculated: number }[];
}> {
    const ledgerRepo = createLedgerRepo(db);

    // Get all wallets
    const allWallets = await db.select().from(wallets);

    let consistent = 0;
    let drifted = 0;
    const errors: { walletId: string; drift: number; stored: number; calculated: number }[] = [];

    for (const wallet of allWallets) {
        const result = await ledgerRepo.verifyBalance(wallet.id, wallet.availableBalance);

        if (result.isConsistent) {
            consistent++;
        } else {
            drifted++;
            const driftPct = wallet.availableBalance > 0
                ? result.drift / wallet.availableBalance
                : result.drift > 0 ? 1 : 0;

            errors.push({
                walletId: wallet.id,
                drift: result.drift,
                stored: result.stored,
                calculated: result.calculated,
            });

            logger.error({
                walletId: wallet.id,
                drift: result.drift,
                stored: result.stored,
                calculated: result.calculated,
                driftPct,
            }, "Balance drift detected");

            // Alert if drift exceeds threshold
            if (driftPct > DRIFT_ALERT_THRESHOLD) {
                logger.error({ walletId: wallet.id, driftPct }, "CRITICAL: drift exceeds 5% threshold");
            }
        }
    }

    logger.info({
        total: allWallets.length,
        consistent,
        drifted,
    }, "Reconciliation complete");

    return { total: allWallets.length, consistent, drifted, errors };
}
