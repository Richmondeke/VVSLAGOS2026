import { sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgSchema,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

// --- users ---

export const users = authSchema.table(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        email: text("email").notNull(),
        phone: text("phone"),
        passwordHash: text("password_hash").notNull(),
        emailVerified: boolean("email_verified").default(false).notNull(),
        phoneVerified: boolean("phone_verified").default(false).notNull(),
        status: text("status", { enum: ["active", "suspended", "banned", "pending_approval", "rejected"] })
            .default("pending_approval")
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_auth_users_email").on(table.email),
        uniqueIndex("idx_auth_users_phone").on(table.phone).where(sql`phone IS NOT NULL`),
        index("idx_auth_users_status").on(table.status),
    ],
);

// --- sessions ---

export const sessions = authSchema.table(
    "sessions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        deviceInfo: jsonb("device_info"),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_auth_sessions_user_id").on(table.userId),
        index("idx_auth_sessions_active").on(table.userId).where(sql`revoked_at IS NULL`),
    ],
);

// --- tokens ---

export const tokens = authSchema.table(
    "tokens",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        type: text("type", { enum: ["email_verify", "password_reset", "refresh"] }).notNull(),
        token: text("token").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        usedAt: timestamp("used_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_auth_tokens_token").on(table.token),
        index("idx_auth_tokens_user_id").on(table.userId),
    ],
);

// --- invite_codes ---

export const inviteCodes = authSchema.table(
    "invite_codes",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        inviterId: uuid("inviter_id")
            .notNull()
            .references(() => users.id),
        code: text("code").notNull(),
        maxUses: integer("max_uses").notNull(),
        usedCount: integer("used_count").default(0).notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_auth_invite_codes_code").on(table.code),
        index("idx_auth_invite_codes_inviter_id").on(table.inviterId),
    ],
);

// --- referrals ---

export const referrals = authSchema.table(
    "referrals",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        inviteCodeId: uuid("invite_code_id")
            .notNull()
            .references(() => inviteCodes.id),
        inviterId: uuid("inviter_id")
            .notNull()
            .references(() => users.id),
        inviteeId: uuid("invitee_id")
            .notNull()
            .references(() => users.id),
        status: text("status", { enum: ["pending", "approved", "rejected"] })
            .default("pending")
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_auth_referrals_inviter_id").on(table.inviterId),
        index("idx_auth_referrals_invitee_id").on(table.inviteeId),
        index("idx_auth_referrals_status").on(table.status),
    ],
);

// --- referral_approvals ---

export const referralApprovals = authSchema.table(
    "referral_approvals",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        referralId: uuid("referral_id")
            .notNull()
            .references(() => referrals.id),
        adminId: uuid("admin_id")
            .notNull()
            .references(() => users.id),
        action: text("action", { enum: ["approved", "rejected"] }).notNull(),
        reason: text("reason"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("idx_auth_referral_approvals_referral_id").on(table.referralId)],
);

// --- kyc_documents ---

export const kycDocuments = authSchema.table(
    "kyc_documents",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        docType: text("doc_type", { enum: ["NIN", "drivers_license", "passport", "voters_card"] }).notNull(),
        frontUrl: text("front_url").notNull(),
        backUrl: text("back_url"),
        status: text("status", { enum: ["pending", "approved", "rejected"] })
            .default("pending")
            .notNull(),
        submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
        reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    },
    (table) => [
        index("idx_auth_kyc_documents_user_id").on(table.userId),
        index("idx_auth_kyc_documents_status").on(table.status),
    ],
);

// --- verifications ---

export const verifications = authSchema.table(
    "verifications",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        status: text("status", {
            enum: ["pending", "provisional", "verified", "rejected", "expired"],
        }).notNull(),
        method: text("method", { enum: ["automated", "manual"] }).notNull(),
        grantedBy: uuid("granted_by").references(() => users.id),
        expiresAt: timestamp("expires_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_auth_verifications_user_id").on(table.userId),
        index("idx_auth_verifications_status").on(table.status),
        index("idx_auth_verifications_expired_provisional")
            .on(table.expiresAt)
            .where(sql`status = 'provisional' AND expires_at IS NOT NULL`),
    ],
);

// --- member_tiers ---

export const memberTiers = authSchema.table(
    "member_tiers",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        seq: integer("seq").generatedAlwaysAsIdentity(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        tier: text("tier", { enum: ["free", "verified", "pro"] }).notNull(),
        changedBy: uuid("changed_by").references(() => users.id),
        reason: text("reason"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [index("idx_auth_member_tiers_user_id").on(table.userId)],
);

// --- badges ---

export const badges = authSchema.table(
    "badges",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id),
        badgeType: text("badge_type", { enum: ["verified", "founding_member", "pro"] }).notNull(),
        issuedBy: uuid("issued_by").references(() => users.id),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_auth_badges_user_id").on(table.userId),
        index("idx_auth_badges_active").on(table.userId, table.badgeType).where(sql`revoked_at IS NULL`),
    ],
);
