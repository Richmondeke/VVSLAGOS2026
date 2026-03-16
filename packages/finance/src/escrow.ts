import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { ConflictError, NotFoundError, ValidationError, writeToOutbox } from "@vvs/shared";
import { escrowAgreements, escrowMilestones, escrowReleases } from "./schema.js";
import { createWalletsRepo } from "./repositories/wallets.js";
import { createLedgerRepo } from "./repositories/ledger.js";

export type EscrowAgreementRow = typeof escrowAgreements.$inferSelect;
export type EscrowMilestoneRow = typeof escrowMilestones.$inferSelect;

const PLATFORM_FEE_RATE = 0.075; // 7.5%
const MIN_PLATFORM_FEE = 500; // 500 kobo = ₦5

export type CreateEscrowInput = {
    orderId: string;
    clientUserId: string;
    providerUserId: string;
    totalAmount: number;
    platformFeeRate?: number;
    milestones?: { description: string; amount: number }[];
};

/**
 * Creates an escrow agreement in pending state.
 */
export async function createEscrow(
    db: ScopedClient,
    input: CreateEscrowInput,
): Promise<EscrowAgreementRow> {
    const walletsRepo = createWalletsRepo(db);
    const clientWallet = await walletsRepo.findByUserId(input.clientUserId);
    const providerWallet = await walletsRepo.findByUserId(input.providerUserId);

    const rate = input.platformFeeRate ?? PLATFORM_FEE_RATE;
    const platformFee = Math.max(Math.round(input.totalAmount * rate), MIN_PLATFORM_FEE);

    const rows = await db
        .insert(escrowAgreements)
        .values({
            orderId: input.orderId,
            clientWalletId: clientWallet.id,
            providerWalletId: providerWallet.id,
            totalAmount: input.totalAmount,
            platformFee,
        })
        .returning();

    const escrow = rows[0]!;

    // Create milestones if provided
    if (input.milestones && input.milestones.length > 0) {
        for (let i = 0; i < input.milestones.length; i++) {
            await db.insert(escrowMilestones).values({
                escrowId: escrow.id,
                amount: input.milestones[i]!.amount,
                description: input.milestones[i]!.description,
                sequence: i + 1,
            });
        }
    }

    return escrow;
}

/**
 * Funds the escrow: debits client wallet, locks funds.
 */
export async function markFunded(
    db: ScopedClient,
    agreementId: string,
    idempotencyKey: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    assertStatus(escrow, "pending", "fund");

    const walletsRepo = createWalletsRepo(db);
    const ledgerRepo = createLedgerRepo(db);

    // Debit client wallet
    const newBalance = await walletsRepo.atomicDebit(
        escrow.clientWalletId,
        escrow.totalAmount,
        idempotencyKey,
    );

    // Record ledger entry for debit
    await ledgerRepo.recordEntry({
        walletId: escrow.clientWalletId,
        entryType: "debit",
        amount: escrow.totalAmount,
        balanceAfter: newBalance,
        reference: `escrow-fund:${agreementId}`,
        idempotencyKey,
    });

    // Lock funds on client wallet for tracking
    // (funds already debited, but we track locked amount on escrow)
    await db
        .update(escrowAgreements)
        .set({ status: "funded", updatedAt: sql`NOW()` })
        .where(eq(escrowAgreements.id, agreementId));

    await writeToOutbox(db, "marketplace.order.funded", {
        orderId: escrow.orderId,
        clientId: escrow.clientWalletId,
        providerId: escrow.providerWalletId,
        escrowId: escrow.id,
        totalAmount: escrow.totalAmount,
        timestamp: new Date(),
    }, `escrow-funded-${idempotencyKey}`, escrow.orderId);
}

/**
 * Releases full escrow to provider: deducts platform fee, credits provider.
 */
export async function releaseFull(
    db: ScopedClient,
    agreementId: string,
    idempotencyKey: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    assertStatus(escrow, "funded", "release");

    const walletsRepo = createWalletsRepo(db);
    const ledgerRepo = createLedgerRepo(db);

    const providerAmount = escrow.totalAmount - escrow.platformFee;

    // Credit provider wallet
    const newBalance = await walletsRepo.atomicCredit(
        escrow.providerWalletId,
        providerAmount,
        idempotencyKey,
    );

    // Record ledger: provider credit
    await ledgerRepo.recordEntry({
        walletId: escrow.providerWalletId,
        entryType: "credit",
        amount: providerAmount,
        balanceAfter: newBalance,
        reference: `escrow-release:${agreementId}`,
        idempotencyKey,
    });

    // Record release
    await db.insert(escrowReleases).values({
        escrowId: agreementId,
        amount: providerAmount,
        releaseType: "full",
        idempotencyKey,
    });

    // Transition to released
    await db
        .update(escrowAgreements)
        .set({ status: "released", updatedAt: sql`NOW()` })
        .where(eq(escrowAgreements.id, agreementId));

    await writeToOutbox(db, "marketplace.order.completed", {
        orderId: escrow.orderId,
        clientId: escrow.clientWalletId,
        providerId: escrow.providerWalletId,
        totalAmount: escrow.totalAmount,
        timestamp: new Date(),
    }, `escrow-released-${idempotencyKey}`, escrow.orderId);
}

/**
 * Refunds full escrow to client.
 */
export async function refundFull(
    db: ScopedClient,
    agreementId: string,
    idempotencyKey: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    assertStatus(escrow, "funded", "refund");

    const walletsRepo = createWalletsRepo(db);
    const ledgerRepo = createLedgerRepo(db);

    // Credit client wallet (full amount back)
    const newBalance = await walletsRepo.atomicCredit(
        escrow.clientWalletId,
        escrow.totalAmount,
        idempotencyKey,
    );

    await ledgerRepo.recordEntry({
        walletId: escrow.clientWalletId,
        entryType: "credit",
        amount: escrow.totalAmount,
        balanceAfter: newBalance,
        reference: `escrow-refund:${agreementId}`,
        idempotencyKey,
    });

    await db.insert(escrowReleases).values({
        escrowId: agreementId,
        amount: escrow.totalAmount,
        releaseType: "partial_refund",
        idempotencyKey,
    });

    await db
        .update(escrowAgreements)
        .set({ status: "refunded", updatedAt: sql`NOW()` })
        .where(eq(escrowAgreements.id, agreementId));
}

/**
 * Partial refund for dispute resolution: splits between provider and client.
 */
export async function refundPartial(
    db: ScopedClient,
    agreementId: string,
    providerAmount: number,
    clientAmount: number,
    idempotencyKey: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    if (escrow.status !== "disputed") {
        throw new ConflictError(`Cannot partial refund escrow in '${escrow.status}' state`);
    }

    if (providerAmount + clientAmount !== escrow.totalAmount) {
        throw new ValidationError("Provider + client amounts must equal total escrow amount");
    }

    const walletsRepo = createWalletsRepo(db);
    const ledgerRepo = createLedgerRepo(db);

    // Credit provider
    if (providerAmount > 0) {
        const providerBal = await walletsRepo.atomicCredit(
            escrow.providerWalletId,
            providerAmount,
            `${idempotencyKey}-provider`,
        );
        await ledgerRepo.recordEntry({
            walletId: escrow.providerWalletId,
            entryType: "credit",
            amount: providerAmount,
            balanceAfter: providerBal,
            reference: `escrow-partial-provider:${agreementId}`,
            idempotencyKey: `${idempotencyKey}-provider`,
        });
    }

    // Credit client
    if (clientAmount > 0) {
        const clientBal = await walletsRepo.atomicCredit(
            escrow.clientWalletId,
            clientAmount,
            `${idempotencyKey}-client`,
        );
        await ledgerRepo.recordEntry({
            walletId: escrow.clientWalletId,
            entryType: "credit",
            amount: clientAmount,
            balanceAfter: clientBal,
            reference: `escrow-partial-client:${agreementId}`,
            idempotencyKey: `${idempotencyKey}-client`,
        });
    }

    await db
        .update(escrowAgreements)
        .set({ status: "released", updatedAt: sql`NOW()` })
        .where(eq(escrowAgreements.id, agreementId));
}

/**
 * Transitions escrow to disputed state. Freezes all fund movement.
 */
export async function disputeEscrow(
    db: ScopedClient,
    agreementId: string,
    reason: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    if (escrow.status !== "funded") {
        throw new ConflictError(`Cannot dispute escrow in '${escrow.status}' state`);
    }

    await db
        .update(escrowAgreements)
        .set({ status: "disputed", updatedAt: sql`NOW()` })
        .where(eq(escrowAgreements.id, agreementId));

    await writeToOutbox(db, "marketplace.order.disputed", {
        orderId: escrow.orderId,
        clientId: escrow.clientWalletId,
        providerId: escrow.providerWalletId,
        reason,
        timestamp: new Date(),
    }, `escrow-disputed-${agreementId}`, escrow.orderId);
}

/**
 * Cancels an escrow. Full refund to client.
 */
export async function cancelEscrow(
    db: ScopedClient,
    agreementId: string,
    reason: string,
    idempotencyKey: string,
): Promise<void> {
    const escrow = await getEscrow(db, agreementId);
    if (escrow.status !== "pending" && escrow.status !== "funded") {
        throw new ConflictError(`Cannot cancel escrow in '${escrow.status}' state`);
    }

    if (escrow.status === "funded") {
        await refundFull(db, agreementId, idempotencyKey);
    } else {
        await db
            .update(escrowAgreements)
            .set({ status: "refunded", updatedAt: sql`NOW()` })
            .where(eq(escrowAgreements.id, agreementId));
    }
}

// --- Helpers ---

async function getEscrow(db: ScopedClient, id: string): Promise<EscrowAgreementRow> {
    const rows = await db.select().from(escrowAgreements).where(eq(escrowAgreements.id, id));
    if (rows.length === 0) {
        throw new NotFoundError("EscrowAgreement", id);
    }
    return rows[0]!;
}

function assertStatus(escrow: EscrowAgreementRow, expected: string, action: string): void {
    if (escrow.status !== expected) {
        throw new ConflictError(`Cannot ${action} escrow in '${escrow.status}' state (expected '${expected}')`);
    }
}
