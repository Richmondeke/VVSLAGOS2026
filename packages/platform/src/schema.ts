import {
    boolean,
    index,
    integer,
    jsonb,
    pgSchema,
    serial,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const platformSchema = pgSchema("platform");

// --- Notification Preferences ---

export const notificationPreferences = platformSchema.table(
    "notification_preferences",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        preferences: jsonb("preferences").notNull(), // { [eventType]: { email, push, sms, in_app } }
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("idx_platform_notif_prefs_user").on(t.userId),
    ],
);

// --- Notification Log ---

export const notificationLog = platformSchema.table(
    "notification_log",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id").notNull(),
        eventType: text("event_type").notNull(),
        channel: text("channel").notNull(), // email, push, sms, in_app
        status: text("status").notNull(), // sent, failed, skipped, rate_limited
        reference: text("reference"), // idempotency key or external ID
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_platform_notif_log_user").on(t.userId),
        index("idx_platform_notif_log_event").on(t.eventType),
        index("idx_platform_notif_log_created").on(t.createdAt),
    ],
);

// --- Notification Templates ---

export const notificationTemplates = platformSchema.table(
    "notification_templates",
    {
        id: text("id").primaryKey(),
        subject: text("subject"),
        body: text("body").notNull(), // handlebars template
        channelType: text("channel_type").notNull(),
        version: integer("version").default(1).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
);

// --- Notification Routes ---

export const notificationRoutes = platformSchema.table(
    "notification_routes",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventType: text("event_type").notNull(),
        templateId: text("template_id")
            .notNull()
            .references(() => notificationTemplates.id),
        recipientField: text("recipient_field").notNull(), // JSON path e.g. "payload.userId"
        channels: text("channels").array().notNull(), // ["email", "push", "in_app"]
        enabled: boolean("enabled").default(true).notNull(),
        maxPerUser: integer("max_per_user"),
        maxPerUserWindow: integer("max_per_user_window"), // seconds
        cooldownSeconds: integer("cooldown_seconds"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_platform_notif_routes_event").on(t.eventType),
    ],
);

// --- Moderation Reports ---

export const moderationReports = platformSchema.table(
    "moderation_reports",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        reporterId: uuid("reporter_id").notNull(),
        targetType: text("target_type").notNull(), // post, member, message
        targetId: uuid("target_id").notNull(),
        category: text("category").notNull(), // spam, inappropriate, fraud, harassment
        description: text("description"),
        status: text("status").default("pending").notNull(), // pending, under_review, resolved, dismissed
        assignedTo: uuid("assigned_to"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_platform_reports_status").on(t.status),
        index("idx_platform_reports_target").on(t.targetType, t.targetId),
    ],
);

// --- Moderation Actions ---

export const moderationActions = platformSchema.table(
    "moderation_actions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        reportId: uuid("report_id").references(() => moderationReports.id),
        targetUserId: uuid("target_user_id").notNull(),
        actionType: text("action_type").notNull(), // warn, remove_content, suspend, ban
        duration: integer("duration"), // days, nullable
        reason: text("reason").notNull(),
        adminId: uuid("admin_id").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_platform_actions_target").on(t.targetUserId),
        index("idx_platform_actions_admin").on(t.adminId),
    ],
);

// --- Ban Records ---

export const banRecords = platformSchema.table(
    "ban_records",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        reason: text("reason").notNull(),
        adminId: uuid("admin_id").notNull(),
        bannedAt: timestamp("banned_at", { withTimezone: true }).defaultNow().notNull(),
        resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    },
    (t) => [
        index("idx_platform_bans_user").on(t.userId),
    ],
);

// --- Appeal Records ---

export const appealRecords = platformSchema.table(
    "appeal_records",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        moderationActionId: uuid("moderation_action_id")
            .notNull()
            .references(() => moderationActions.id),
        appealerId: uuid("appealer_id").notNull(),
        reason: text("reason").notNull(),
        reviewedBy: uuid("reviewed_by"),
        outcome: text("outcome"), // upheld, overturned, modified
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    },
    (t) => [
        index("idx_platform_appeals_action").on(t.moderationActionId),
    ],
);

// --- Admin Users ---

export const adminUsers = platformSchema.table(
    "admin_users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        role: text("role").notNull(), // super_admin, moderator, support
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("idx_platform_admin_users_user").on(t.userId),
    ],
);

// --- Admin Audit Log ---

export const adminAuditLog = platformSchema.table(
    "admin_audit_log",
    {
        id: serial("id").primaryKey(),
        adminUserId: uuid("admin_user_id").notNull(),
        action: text("action").notNull(),
        targetType: text("target_type"),
        targetId: text("target_id"),
        details: jsonb("details"),
        correlationId: text("correlation_id"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_platform_audit_admin").on(t.adminUserId),
        index("idx_platform_audit_created").on(t.createdAt),
    ],
);

// --- Platform Settings ---

export const platformSettings = platformSchema.table(
    "platform_settings",
    {
        key: text("key").primaryKey(),
        value: jsonb("value").notNull(),
        updatedBy: uuid("updated_by"),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
);
