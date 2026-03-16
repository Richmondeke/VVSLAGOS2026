import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, ValidationError, writeToOutbox } from "@vvs/shared";
import { fundingRequests, fundingWebhooks } from "./schema.js";
import { createWalletsRepo } from "./repositories/wallets.js";
import { createLedgerRepo } from "./repositories/ledger.js";
import type { IPaystackGateway } from "./gateway.js";

export type FundingRequestRow = typeof fundingRequests.$inferSelect;

/**
 * Initiates wallet funding via Paystack.
 * Creates a funding request and returns the Paystack checkout URL.
 */
export async function initiateFunding(
    db: ScopedClient,
    gateway: IPaystackGateway,
    userId: string,
    amount: number,
    email: string,
    callbackUrl?: string,
): Promise<{ checkoutUrl: string; reference: string }> {
    if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
    }

    const walletsRepo = createWalletsRepo(db);
    const wallet = await walletsRepo.findByUserId(userId);

    const reference = `vvs-fund-${userId}-${Date.now()}`;

    // Create funding request record
    await db.insert(fundingRequests).values({
        walletId: wallet.id,
        amount,
        paystackReference: reference,
    });

    // Initialize Paystack payment
    const result = await gateway.initializePayment({
        email,
        amount,
        reference,
        callbackUrl,
    });

    return {
        checkoutUrl: result.authorizationUrl,
        reference: result.reference,
    };
}

/**
 * Handles Paystack charge.success webhook.
 * Idempotent: same webhook processed multiple times produces exactly 1 credit.
 */
export async function handlePaystackWebhook(
    db: ScopedClient,
    gateway: IPaystackGateway,
    rawPayload: string,
    signature: string,
): Promise<void> {
    // Step 1: Verify HMAC signature
    if (!gateway.verifyWebhookSignature(rawPayload, signature)) {
        throw new ValidationError("Invalid webhook signature");
    }

    const payload = JSON.parse(rawPayload) as {
        event: string;
        data: { reference: string; amount: number; [key: string]: unknown };
    };

    // Only handle charge.success
    if (payload.event !== "charge.success") {
        return;
    }

    const reference = payload.data.reference;

    // Step 2: Check idempotency — already processed?
    const existingWebhook = await db
        .select()
        .from(fundingWebhooks)
        .where(eq(fundingWebhooks.paystackReference, reference));
    if (existingWebhook.length > 0) {
        return; // Already processed, return 200
    }

    // Step 3: Find funding request
    const fundingReqs = await db
        .select()
        .from(fundingRequests)
        .where(eq(fundingRequests.paystackReference, reference));
    if (fundingReqs.length === 0) {
        throw new NotFoundError("FundingRequest", reference);
    }
    const fundingReq = fundingReqs[0]!;

    // Steps 4-9: Atomic transaction
    // Insert webhook record (unique constraint is safety net)
    await db.insert(fundingWebhooks).values({
        paystackReference: reference,
        payload: payload.data,
    });

    // Credit wallet
    const walletsRepo = createWalletsRepo(db);
    const idempotencyKey = `fund-${reference}`;
    const newBalance = await walletsRepo.atomicCredit(fundingReq.walletId, fundingReq.amount, idempotencyKey);

    // Record ledger entry
    const ledgerRepo = createLedgerRepo(db);
    await ledgerRepo.recordEntry({
        walletId: fundingReq.walletId,
        entryType: "credit",
        amount: fundingReq.amount,
        balanceAfter: newBalance,
        reference: `paystack:${reference}`,
        idempotencyKey,
    });

    // Update funding request status
    await db
        .update(fundingRequests)
        .set({ status: "completed", updatedAt: sql`NOW()` })
        .where(eq(fundingRequests.id, fundingReq.id));

    // Get wallet to find userId for event
    const wallet = await walletsRepo.findById(fundingReq.walletId);

    // Write outbox event
    await writeToOutbox(db, "finance.wallet.funded", {
        userId: wallet.userId,
        walletId: wallet.id,
        amount: fundingReq.amount,
        reference,
        timestamp: new Date(),
    }, `wallet-funded-${reference}`, wallet.userId);
}
