import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { InsufficientFundsError, NotFoundError, ValidationError, writeToOutbox } from "@vvs/shared";
import type { BankDetails } from "@vvs/contracts";
import { withdrawalRequests } from "./schema.js";
import { createWalletsRepo } from "./repositories/wallets.js";
import { createLedgerRepo } from "./repositories/ledger.js";
import type { IPaystackGateway } from "./gateway.js";

export type WithdrawalRequestRow = typeof withdrawalRequests.$inferSelect;

/**
 * Creates a withdrawal request. Debits available balance immediately.
 */
export async function requestWithdrawal(
    db: ScopedClient,
    userId: string,
    amount: number,
    bankDetails: BankDetails,
): Promise<WithdrawalRequestRow> {
    if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
    }

    const walletsRepo = createWalletsRepo(db);
    const wallet = await walletsRepo.findByUserId(userId);

    // Debit available balance
    const idempotencyKey = `withdraw-${wallet.id}-${Date.now()}`;
    const newBalance = await walletsRepo.atomicDebit(wallet.id, amount, idempotencyKey);

    // Record ledger entry
    const ledgerRepo = createLedgerRepo(db);
    await ledgerRepo.recordEntry({
        walletId: wallet.id,
        entryType: "debit",
        amount,
        balanceAfter: newBalance,
        reference: `withdrawal:pending`,
        idempotencyKey,
    });

    // Create withdrawal request
    const rows = await db
        .insert(withdrawalRequests)
        .values({
            walletId: wallet.id,
            amount,
            bankDetails,
        })
        .returning();

    return rows[0]!;
}

/**
 * Processes a pending withdrawal via Paystack Transfer API.
 * Called by BullMQ job.
 */
export async function processWithdrawal(
    db: ScopedClient,
    gateway: IPaystackGateway,
    withdrawalId: string,
): Promise<void> {
    const rows = await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.id, withdrawalId));

    if (rows.length === 0) {
        throw new NotFoundError("WithdrawalRequest", withdrawalId);
    }
    const withdrawal = rows[0]!;

    if (withdrawal.status !== "pending") {
        return; // Already processing or completed
    }

    // Mark as processing
    await db
        .update(withdrawalRequests)
        .set({ status: "processing", updatedAt: sql`NOW()` })
        .where(eq(withdrawalRequests.id, withdrawalId));

    const details = withdrawal.bankDetails as BankDetails;
    const reference = `vvs-withdraw-${withdrawalId}`;

    const result = await gateway.initiateTransfer({
        amount: withdrawal.amount,
        bankCode: details.bankCode,
        accountNumber: details.accountNumber,
        reference,
        reason: "VVS withdrawal",
    });

    await db
        .update(withdrawalRequests)
        .set({ paystackTransferId: result.transferCode, updatedAt: sql`NOW()` })
        .where(eq(withdrawalRequests.id, withdrawalId));
}

/**
 * Handles Paystack transfer webhook events.
 */
export async function handleTransferWebhook(
    db: ScopedClient,
    event: string,
    data: { transfer_code: string; reference: string; amount: number },
): Promise<void> {
    const rows = await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.paystackTransferId, data.transfer_code));

    if (rows.length === 0) {
        return; // Unknown transfer, ignore
    }
    const withdrawal = rows[0]!;

    if (event === "transfer.success") {
        await db
            .update(withdrawalRequests)
            .set({ status: "completed", updatedAt: sql`NOW()` })
            .where(eq(withdrawalRequests.id, withdrawal.id));

        const walletsRepo = createWalletsRepo(db);
        const wallet = await walletsRepo.findById(withdrawal.walletId);

        await writeToOutbox(db, "finance.withdrawal.completed", {
            userId: wallet.userId,
            withdrawalId: withdrawal.id,
            amount: withdrawal.amount,
            timestamp: new Date(),
        }, `withdrawal-completed-${withdrawal.id}`, wallet.userId);
    } else if (event === "transfer.failed") {
        // Release funds back to wallet
        const walletsRepo = createWalletsRepo(db);
        const wallet = await walletsRepo.findById(withdrawal.walletId);
        const idempotencyKey = `withdraw-refund-${withdrawal.id}`;
        const newBalance = await walletsRepo.atomicCredit(wallet.id, withdrawal.amount, idempotencyKey);

        const ledgerRepo = createLedgerRepo(db);
        await ledgerRepo.recordEntry({
            walletId: wallet.id,
            entryType: "credit",
            amount: withdrawal.amount,
            balanceAfter: newBalance,
            reference: `withdrawal-refund:${withdrawal.id}`,
            idempotencyKey,
        });

        await db
            .update(withdrawalRequests)
            .set({ status: "failed", updatedAt: sql`NOW()` })
            .where(eq(withdrawalRequests.id, withdrawal.id));
    }
}
