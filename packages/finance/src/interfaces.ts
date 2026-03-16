import type { ScopedClient } from "@vvs/shared";
import type {
    IWalletService,
    IEscrowService,
    IRatingsService,
    Wallet,
    Money,
    DebitResult,
    CreditResult,
    EscrowAgreement,
    ReleaseResult,
    Withdrawal,
    BankDetails,
    Review,
    AggregateRating,
    EscrowCreateInput,
    ReviewInput,
} from "@vvs/contracts";
import { createWalletsRepo } from "./repositories/wallets.js";
import { createLedgerRepo } from "./repositories/ledger.js";
import { requestWithdrawal } from "./withdrawals.js";
import { createEscrow, markFunded, releaseFull, cancelEscrow, disputeEscrow } from "./escrow.js";
import { submitReview, getReviewsForUser } from "./reviews.js";
import { getReputationScore, updateReputationScore } from "./scoring.js";

export function createWalletService(db: ScopedClient): IWalletService {
    const walletsRepo = createWalletsRepo(db);
    const ledgerRepo = createLedgerRepo(db);

    return {
        async create(userId: string): Promise<Wallet> {
            const row = await walletsRepo.create(userId);
            return {
                id: row.id,
                userId: row.userId,
                availableBalance: row.availableBalance,
                lockedBalance: row.lockedBalance,
                currency: row.currency as "NGN",
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };
        },

        async getBalance(userId: string): Promise<Money> {
            const balance = await walletsRepo.getBalance(userId);
            return { amount: balance.available, currency: "NGN" };
        },

        async debit(userId: string, amount: number, ref: string): Promise<DebitResult> {
            const wallet = await walletsRepo.findByUserId(userId);
            const idempotencyKey = `debit-${ref}`;
            const newBalance = await walletsRepo.atomicDebit(wallet.id, amount, idempotencyKey);

            const entry = await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "debit",
                amount,
                balanceAfter: newBalance,
                reference: ref,
                idempotencyKey,
            });

            return {
                success: true,
                walletId: wallet.id,
                newBalance,
                transactionId: String(entry.id),
                timestamp: entry.createdAt,
            };
        },

        async credit(userId: string, amount: number, ref: string): Promise<CreditResult> {
            const wallet = await walletsRepo.findByUserId(userId);
            const idempotencyKey = `credit-${ref}`;
            const newBalance = await walletsRepo.atomicCredit(wallet.id, amount, idempotencyKey);

            const entry = await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "credit",
                amount,
                balanceAfter: newBalance,
                reference: ref,
                idempotencyKey,
            });

            return {
                success: true,
                walletId: wallet.id,
                newBalance,
                transactionId: String(entry.id),
                timestamp: entry.createdAt,
            };
        },

        async withdraw(userId: string, amount: number, bankDetails: BankDetails): Promise<Withdrawal> {
            const row = await requestWithdrawal(db, userId, amount, bankDetails);
            const wallet = await walletsRepo.findById(row.walletId);
            return {
                id: row.id,
                userId: wallet.userId,
                amount: row.amount,
                bankDetails: row.bankDetails as BankDetails,
                status: row.status as Withdrawal["status"],
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            };
        },
    };
}

export function createEscrowService(db: ScopedClient): IEscrowService {
    return {
        async create(input: EscrowCreateInput): Promise<EscrowAgreement> {
            const row = await createEscrow(db, {
                orderId: input.orderId,
                clientUserId: input.clientId,
                providerUserId: input.providerId,
                totalAmount: input.totalAmount,
                milestones: input.milestones,
            });

            return {
                id: row.id,
                orderId: row.orderId,
                clientId: row.clientWalletId,
                providerId: row.providerWalletId,
                totalAmount: row.totalAmount,
                lockedAt: row.createdAt,
                status: "created",
                milestones: [],
            };
        },

        async markFunded(agreementId: string): Promise<void> {
            const key = `fund-${agreementId}-${Date.now()}`;
            await markFunded(db, agreementId, key);
        },

        async approveMilestone(_agreementId: string, _milestoneId: string): Promise<void> {
            // Milestone approval is handled by order saga in marketplace
        },

        async releaseMilestone(agreementId: string, milestoneId: string): Promise<ReleaseResult> {
            const key = `release-${agreementId}-${milestoneId}-${Date.now()}`;
            await releaseFull(db, agreementId, key);
            return {
                success: true,
                agreementId,
                milestoneId,
                amountReleased: 0, // Full release
                timestamp: new Date(),
            };
        },

        async cancel(agreementId: string, reason: string): Promise<void> {
            const key = `cancel-${agreementId}-${Date.now()}`;
            await cancelEscrow(db, agreementId, reason, key);
        },

        async dispute(agreementId: string, reason: string): Promise<void> {
            await disputeEscrow(db, agreementId, reason);
        },
    };
}

export function createRatingsService(db: ScopedClient): IRatingsService {
    return {
        async submit(input: ReviewInput): Promise<Review> {
            const row = await submitReview(db, {
                orderId: input.orderId,
                reviewerId: input.reviewerId,
                revieweeId: input.revieweeId,
                rating: input.rating,
                body: input.comment,
            });

            // Update reputation score after review
            await updateReputationScore(db, input.revieweeId);

            return {
                id: row.id,
                orderId: row.orderId,
                reviewerId: row.reviewerId,
                revieweeId: row.revieweeId,
                rating: row.rating,
                comment: row.body ?? "",
                createdAt: row.createdAt,
            };
        },

        async getUserRating(userId: string): Promise<AggregateRating> {
            const score = await getReputationScore(db, userId);
            return {
                entityId: userId,
                entityType: "user",
                averageRating: score.score ?? 0,
                totalReviews: score.reviewCount,
                minReviewCount: 3,
            };
        },

        async getListingRating(listingId: string): Promise<AggregateRating> {
            // Listing ratings aggregate reviews from orders tied to a listing
            // For now, return empty — will be connected when marketplace is implemented
            return {
                entityId: listingId,
                entityType: "listing",
                averageRating: 0,
                totalReviews: 0,
                minReviewCount: 3,
            };
        },
    };
}
