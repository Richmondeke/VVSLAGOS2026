import type { MemberTier, Paginated, VerificationStatus } from "./common.js";

// --- Types ---

export type AuthUser = {
    id: string;
    email?: string;
    phone?: string;
    passwordHash?: string;
    tier: MemberTier;
    verificationStatus: VerificationStatus;
    createdAt: Date;
    updatedAt: Date;
};

export type Session = {
    id: string;
    userId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    revokedAt?: Date;
    deviceId?: string;
    createdAt: Date;
};

export type InviteCode = {
    id: string;
    code: string;
    issuerId: string;
    maxUses: number;
    usedCount: number;
    expiresAt: Date;
    createdAt: Date;
};

export type Referral = {
    id: string;
    inviteeId: string;
    inviterId: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
    approvedAt?: Date;
    createdAt: Date;
};

export type Verification = {
    id: string;
    userId: string;
    status: VerificationStatus;
    documentUrls: string[];
    verificationProviderId?: string;
    verificationProviderRef?: string;
    rejectionReason?: string;
    submittedAt: Date;
    reviewedAt?: Date;
    updatedAt: Date;
};

export type RegisterInput = {
    email?: string;
    phone?: string;
    password: string;
    inviteCode: string;
};

export type LoginInput = {
    email?: string;
    phone?: string;
    password: string;
    deviceId?: string;
};

export type DocumentInput = {
    type: string;
    url: string;
};

// --- Interfaces ---

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthUser>;
    login(input: LoginInput): Promise<Session>;
    refreshSession(token: string): Promise<Session>;
    revokeSession(sessionId: string): Promise<void>;
}

export interface IReferralService {
    generateInvite(userId: string): Promise<InviteCode>;
    redeemInvite(code: string, userId: string): Promise<Referral>;
    approve(referralId: string): Promise<void>;
    reject(referralId: string, reason: string): Promise<void>;
}

export interface IIdentityService {
    submitVerification(userId: string, docs: DocumentInput[]): Promise<Verification>;
    getStatus(userId: string): Promise<VerificationStatus>;
    getTier(userId: string): Promise<MemberTier>;
    upgradeTier(userId: string, tier: MemberTier): Promise<void>;
}
