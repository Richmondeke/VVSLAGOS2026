import type { ScopedClient } from "@vvs/shared";
import type {
    IModerationService,
    IAdminService,
    Report,
    ReportInput,
    DisputeResolution,
    PlatformSettings,
    SettingsUpdateInput,
    AnalyticsQuery,
    AnalyticsResult,
} from "@vvs/contracts";
import { fileReport } from "./moderation/reporting.js";
import { suspendUser, banUser } from "./moderation/actions.js";
import { getSettings, updateSettings } from "./admin/settings.js";

export function createModerationService(db: ScopedClient): IModerationService {
    return {
        async report(reporterId: string, input: ReportInput): Promise<Report> {
            return fileReport(db, reporterId, input);
        },

        async suspend(userId: string, reason: string, adminId: string): Promise<void> {
            return suspendUser(db, userId, adminId, reason);
        },

        async ban(userId: string, reason: string, adminId: string): Promise<void> {
            return banUser(db, userId, adminId, reason);
        },

        async resolveDispute(
            _disputeId: string,
            _resolution: DisputeResolution,
            _adminId: string,
        ): Promise<void> {
            // TODO: implement dispute resolution with IEscrowService
        },
    };
}

export function createAdminService(db: ScopedClient): IAdminService {
    return {
        async getSettings(): Promise<PlatformSettings> {
            return getSettings(db);
        },

        async updateSettings(input: SettingsUpdateInput, adminId: string): Promise<PlatformSettings> {
            return updateSettings(db, input, adminId);
        },

        async analytics(_query: AnalyticsQuery): Promise<AnalyticsResult> {
            // TODO: implement analytics queries
            return {
                metric: _query.metric,
                value: 0,
                period: _query.period,
                timestamp: new Date(),
            };
        },
    };
}
