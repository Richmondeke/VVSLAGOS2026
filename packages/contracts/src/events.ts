import type { MemberTier } from "./common.js";

// --- Auth Events ---

export type UserRegisteredPayload = {
    userId: string;
    email?: string;
    phone?: string;
    tier: MemberTier;
    timestamp: Date;
};

export type ReferralApprovedPayload = {
    referralId: string;
    inviteeId: string;
    inviterId: string;
    timestamp: Date;
};

export type IdentityVerifiedPayload = {
    userId: string;
    verificationId: string;
    newTier: MemberTier;
    previousTier: MemberTier;
    timestamp: Date;
};

export type UserDeactivatedPayload = {
    userId: string;
    reason?: string;
    timestamp: Date;
};

// --- Members Events ---

export type ProfileCreatedPayload = {
    userId: string;
    profileId: string;
    timestamp: Date;
};

export type ProfileUpdatedPayload = {
    userId: string;
    profileId: string;
    changes: string[];
    timestamp: Date;
};

export type PortfolioPublishedPayload = {
    userId: string;
    portfolioItemId: string;
    itemType: "project" | "case_study" | "media";
    timestamp: Date;
};

// --- Marketplace Events ---

export type ListingCreatedPayload = {
    listingId: string;
    providerId: string;
    category: string;
    timestamp: Date;
};

export type ListingUpdatedPayload = {
    listingId: string;
    providerId: string;
    changes: string[];
    timestamp: Date;
};

export type OrderFundedPayload = {
    orderId: string;
    clientId: string;
    providerId: string;
    escrowId: string;
    totalAmount: number;
    timestamp: Date;
};

export type OrderCompletedPayload = {
    orderId: string;
    clientId: string;
    providerId: string;
    totalAmount: number;
    timestamp: Date;
};

export type OrderDisputedPayload = {
    orderId: string;
    clientId: string;
    providerId: string;
    reason: string;
    timestamp: Date;
};

// --- Finance Events ---

export type WalletFundedPayload = {
    userId: string;
    walletId: string;
    amount: number;
    reference: string;
    timestamp: Date;
};

export type WithdrawalCompletedPayload = {
    userId: string;
    withdrawalId: string;
    amount: number;
    timestamp: Date;
};

export type ReviewSubmittedPayload = {
    reviewId: string;
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    timestamp: Date;
};

export type ThresholdReachedPayload = {
    userId: string;
    reputationScore: number;
    thresholdName: string;
    timestamp: Date;
};

// --- Social Events ---

export type MessageSentPayload = {
    messageId: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    timestamp: Date;
};

export type PostFlaggedPayload = {
    postId: string;
    userId: string;
    reason: string;
    timestamp: Date;
};

export type EngagementReceivedPayload = {
    postId: string;
    postAuthorId: string;
    engagerId: string;
    type: "like" | "bookmark" | "comment";
    timestamp: Date;
};

// --- Platform Events ---

export type UserSuspendedPayload = {
    userId: string;
    reason: string;
    timestamp: Date;
};

export type UserBannedPayload = {
    userId: string;
    reason: string;
    banExpiresAt?: Date;
    timestamp: Date;
};

export type SettingsUpdatedPayload = {
    settingKeys: string[];
    updatedBy: string;
    timestamp: Date;
};

// --- Event Type Map ---

export type EventMap = {
    "auth.user.registered": UserRegisteredPayload;
    "auth.referral.approved": ReferralApprovedPayload;
    "auth.identity.verified": IdentityVerifiedPayload;
    "auth.user.deactivated": UserDeactivatedPayload;
    "members.profile.created": ProfileCreatedPayload;
    "members.profile.updated": ProfileUpdatedPayload;
    "members.portfolio.published": PortfolioPublishedPayload;
    "marketplace.listing.created": ListingCreatedPayload;
    "marketplace.listing.updated": ListingUpdatedPayload;
    "marketplace.order.funded": OrderFundedPayload;
    "marketplace.order.completed": OrderCompletedPayload;
    "marketplace.order.disputed": OrderDisputedPayload;
    "finance.wallet.funded": WalletFundedPayload;
    "finance.withdrawal.completed": WithdrawalCompletedPayload;
    "finance.review.submitted": ReviewSubmittedPayload;
    "finance.threshold.reached": ThresholdReachedPayload;
    "social.message.sent": MessageSentPayload;
    "social.post.flagged": PostFlaggedPayload;
    "social.engagement.received": EngagementReceivedPayload;
    "platform.user.suspended": UserSuspendedPayload;
    "platform.user.banned": UserBannedPayload;
    "platform.settings.updated": SettingsUpdatedPayload;
};

export type EventType = keyof EventMap;
