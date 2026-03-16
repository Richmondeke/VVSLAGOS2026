// @vvs/finance

// Schema
export { financeSchema } from "./schema.js";
export * from "./schema.js";

// Repositories
export * from "./repositories/index.js";

// Gateway (Paystack)
export {
    createPaystackGateway,
    createMockPaystackGateway,
    type IPaystackGateway,
    type InitializePaymentInput,
    type InitializePaymentResult,
    type VerifyPaymentResult,
    type InitiateTransferInput,
    type InitiateTransferResult,
    type VerifyTransferResult,
} from "./gateway.js";

// Funding
export { initiateFunding, handlePaystackWebhook } from "./funding.js";

// Withdrawals
export { requestWithdrawal, processWithdrawal, handleTransferWebhook } from "./withdrawals.js";

// Escrow
export {
    createEscrow,
    markFunded,
    releaseFull,
    refundFull,
    refundPartial,
    disputeEscrow,
    cancelEscrow,
    type CreateEscrowInput,
} from "./escrow.js";

// Reviews
export { submitReview, getReviewsForUser, type SubmitReviewInput } from "./reviews.js";

// Scoring & Reputation
export { calculateScore, updateReputationScore, getReputationScore } from "./scoring.js";

// Thresholds
export { checkProThreshold, emitThresholdReachedIfEligible, type ThresholdConfig } from "./thresholds.js";

// Public interfaces (IWalletService, IEscrowService, IRatingsService)
export { createWalletService, createEscrowService, createRatingsService } from "./interfaces.js";

// Routes
export { financeRoutes, type FinanceRoutesOpts } from "./routes.js";
