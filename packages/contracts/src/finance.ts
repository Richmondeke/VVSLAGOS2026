import type { Money, Paginated } from "./common.js";

// --- Types ---

export type Wallet = {
    id: string;
    userId: string;
    availableBalance: number; // in kobo
    lockedBalance: number; // in kobo
    currency: "NGN";
    createdAt: Date;
    updatedAt: Date;
};

export type DebitResult = {
    success: boolean;
    walletId: string;
    newBalance: number;
    transactionId: string;
    timestamp: Date;
};

export type CreditResult = {
    success: boolean;
    walletId: string;
    newBalance: number;
    transactionId: string;
    timestamp: Date;
};

export type EscrowAgreement = {
    id: string;
    orderId: string;
    clientId: string;
    providerId: string;
    totalAmount: number; // in kobo
    lockedAt: Date;
    fundedAt?: Date;
    releasedAt?: Date;
    cancelledAt?: Date;
    status: "created" | "funded" | "in_progress" | "completed" | "disputed" | "cancelled";
    milestones: EscrowMilestone[];
};

export type EscrowMilestone = {
    id: string;
    agreementId: string;
    description: string;
    amount: number; // in kobo
    status: "pending" | "submitted" | "approved" | "released";
};

export type ReleaseResult = {
    success: boolean;
    agreementId: string;
    milestoneId: string;
    amountReleased: number;
    timestamp: Date;
};

export type Withdrawal = {
    id: string;
    userId: string;
    amount: number; // in kobo
    bankDetails: BankDetails;
    status: "pending" | "processing" | "completed" | "failed";
    reference?: string;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type BankDetails = {
    accountNumber: string;
    accountName: string;
    bankCode: string;
};

export type Review = {
    id: string;
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
};

export type AggregateRating = {
    entityId: string;
    entityType: "user" | "listing";
    averageRating: number; // 1.0-5.0
    totalReviews: number;
    minReviewCount: number; // 3 for visible score
};

export type EscrowCreateInput = {
    orderId: string;
    clientId: string;
    providerId: string;
    totalAmount: number;
    milestones: { description: string; amount: number }[];
};

export type ReviewInput = {
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
};

// --- Interfaces ---

export interface IWalletService {
    create(userId: string): Promise<Wallet>;
    getBalance(userId: string): Promise<Money>;
    debit(userId: string, amount: number, ref: string): Promise<DebitResult>;
    credit(userId: string, amount: number, ref: string): Promise<CreditResult>;
    withdraw(userId: string, amount: number, bankDetails: BankDetails): Promise<Withdrawal>;
}

export interface IEscrowService {
    create(input: EscrowCreateInput): Promise<EscrowAgreement>;
    markFunded(agreementId: string): Promise<void>;
    approveMilestone(agreementId: string, milestoneId: string): Promise<void>;
    releaseMilestone(agreementId: string, milestoneId: string): Promise<ReleaseResult>;
    cancel(agreementId: string, reason: string): Promise<void>;
    dispute(agreementId: string, reason: string): Promise<void>;
}

export interface IRatingsService {
    submit(input: ReviewInput): Promise<Review>;
    getUserRating(userId: string): Promise<AggregateRating>;
    getListingRating(listingId: string): Promise<AggregateRating>;
}
