import type { MemberTier } from "./common.js";

// --- Types ---

export type Report = {
    id: string;
    reporterId: string;
    reportedUserId?: string;
    reportedContentId?: string;
    category: "spam" | "inappropriate" | "fraud";
    description: string;
    status: "pending" | "under_review" | "resolved";
    createdAt: Date;
};

export type ReportInput = {
    reportedUserId?: string;
    reportedContentId?: string;
    category: Report["category"];
    description: string;
};

export type DisputeResolution = {
    action: "refund" | "release" | "split";
    clientAmount?: number;
    providerAmount?: number;
};

export type PlatformSettings = {
    inviteLimitPerTier: Record<MemberTier, number>;
    platformFeePercentage: number;
    reputationThresholds: Record<string, number>;
    featureFlags: Record<string, boolean>;
    updatedAt: Date;
};

export type SettingsUpdateInput = Partial<Omit<PlatformSettings, "updatedAt">>;

export type AnalyticsQuery = {
    metric: string;
    period: string;
    filters?: Record<string, string>;
};

export type AnalyticsResult = {
    metric: string;
    value: number | Record<string, number>;
    period: string;
    timestamp: Date;
};

// --- Interfaces ---

export interface IModerationService {
    report(reporterId: string, input: ReportInput): Promise<Report>;
    suspend(userId: string, reason: string, adminId: string): Promise<void>;
    ban(userId: string, reason: string, adminId: string): Promise<void>;
    resolveDispute(
        disputeId: string,
        resolution: DisputeResolution,
        adminId: string,
    ): Promise<void>;
}

export interface IAdminService {
    getSettings(): Promise<PlatformSettings>;
    updateSettings(input: SettingsUpdateInput, adminId: string): Promise<PlatformSettings>;
    analytics(query: AnalyticsQuery): Promise<AnalyticsResult>;
}
