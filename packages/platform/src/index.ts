// @vvs/platform

// Schema
export * from "./schema.js";

// Repositories
export { createNotificationsRepo } from "./repositories/notifications.js";
export type { NotificationPreferencesRow, NotificationLogRow, NotificationTemplateRow, NotificationRouteRow } from "./repositories/notifications.js";
export { createModerationRepo } from "./repositories/moderation.js";
export type { ModerationReportRow, ModerationActionRow, BanRecordRow, AppealRecordRow, AdminAuditLogRow } from "./repositories/moderation.js";
export { createAdminRepo } from "./repositories/admin.js";
export type { AdminUserRow, PlatformSettingRow } from "./repositories/admin.js";

// Notification channels
export {
    type IEmailAdapter, createMockEmailAdapter,
    type IPushAdapter, createMockPushAdapter,
    type ISmsAdapter, createMockSmsAdapter,
    type IInAppAdapter, createMockInAppAdapter,
} from "./notifications/channels/index.js";

// Notification dispatcher
export { createNotificationDispatcher } from "./notifications/dispatcher.js";
export type { DispatcherDeps } from "./notifications/dispatcher.js";

// Moderation
export { fileReport, assignReport, resolveReport, getPendingReports } from "./moderation/reporting.js";
export { warnUser, suspendUser, banUser, reinstateUser, handleAppeal } from "./moderation/actions.js";

// Admin
export { getAdminRole, requireAdmin, requireRole } from "./admin/auth.js";
export { getSetting, setSetting, getSettings, updateSettings, clearSettingsCache } from "./admin/settings.js";

// Interfaces (contract implementations)
export { createModerationService, createAdminService } from "./interfaces.js";

// Routes
export { platformRoutes } from "./routes.js";
export type { PlatformRoutesOpts } from "./routes.js";
