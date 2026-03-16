import { sql } from "drizzle-orm";
import {
    check,
    index,
    integer,
    jsonb,
    numeric,
    pgSchema,
    serial,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const financeSchema = pgSchema("finance");

// --- wallets ---

export const wallets = financeSchema.table(
    "wallets",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        availableBalance: integer("available_balance").default(0).notNull(),
        lockedBalance: integer("locked_balance").default(0).notNull(),
        currency: text("currency").default("NGN").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_wallets_user_id").on(table.userId),
    ],
);

// --- ledger_entries ---

export const ledgerEntries = financeSchema.table(
    "ledger_entries",
    {
        id: serial("id").primaryKey(),
        walletId: uuid("wallet_id")
            .notNull()
            .references(() => wallets.id),
        entryType: text("entry_type", { enum: ["credit", "debit"] }).notNull(),
        amount: integer("amount").notNull(),
        balanceAfter: integer("balance_after").notNull(),
        reference: text("reference"),
        idempotencyKey: text("idempotency_key").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_finance_ledger_wallet_id").on(table.walletId),
        uniqueIndex("idx_finance_ledger_idempotency_key").on(table.idempotencyKey),
        check("chk_ledger_amount_positive", sql`amount > 0`),
        check("chk_ledger_entry_type", sql`entry_type IN ('credit', 'debit')`),
    ],
);

// --- funding_requests ---

export const fundingRequests = financeSchema.table(
    "funding_requests",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        walletId: uuid("wallet_id")
            .notNull()
            .references(() => wallets.id),
        amount: integer("amount").notNull(),
        paystackReference: text("paystack_reference").notNull(),
        status: text("status", { enum: ["pending", "completed", "failed"] })
            .default("pending")
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_funding_paystack_ref").on(table.paystackReference),
    ],
);

// --- funding_webhooks ---

export const fundingWebhooks = financeSchema.table(
    "funding_webhooks",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        paystackReference: text("paystack_reference").notNull(),
        payload: jsonb("payload").notNull(),
        processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_webhooks_paystack_ref").on(table.paystackReference),
    ],
);

// --- withdrawal_requests ---

export const withdrawalRequests = financeSchema.table(
    "withdrawal_requests",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        walletId: uuid("wallet_id")
            .notNull()
            .references(() => wallets.id),
        amount: integer("amount").notNull(),
        bankDetails: jsonb("bank_details").notNull(),
        paystackTransferId: text("paystack_transfer_id"),
        status: text("status", { enum: ["pending", "processing", "completed", "failed"] })
            .default("pending")
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_withdrawal_transfer_id")
            .on(table.paystackTransferId)
            .where(sql`paystack_transfer_id IS NOT NULL`),
    ],
);

// --- escrow_agreements ---

export const escrowAgreements = financeSchema.table(
    "escrow_agreements",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id").notNull(),
        clientWalletId: uuid("client_wallet_id")
            .notNull()
            .references(() => wallets.id),
        providerWalletId: uuid("provider_wallet_id")
            .notNull()
            .references(() => wallets.id),
        totalAmount: integer("total_amount").notNull(),
        platformFee: integer("platform_fee").notNull(),
        status: text("status", {
            enum: ["pending", "funded", "active", "released", "refunded", "disputed"],
        })
            .default("pending")
            .notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_escrow_order_id").on(table.orderId),
    ],
);

// --- escrow_milestones ---

export const escrowMilestones = financeSchema.table(
    "escrow_milestones",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        escrowId: uuid("escrow_id")
            .notNull()
            .references(() => escrowAgreements.id),
        amount: integer("amount").notNull(),
        description: text("description").notNull(),
        status: text("status", { enum: ["pending", "submitted", "approved", "released", "refunded"] })
            .default("pending")
            .notNull(),
        sequence: integer("sequence").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_finance_milestones_escrow_id").on(table.escrowId),
    ],
);

// --- escrow_releases ---

export const escrowReleases = financeSchema.table(
    "escrow_releases",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        escrowId: uuid("escrow_id")
            .notNull()
            .references(() => escrowAgreements.id),
        milestoneId: uuid("milestone_id").references(() => escrowMilestones.id),
        amount: integer("amount").notNull(),
        releaseType: text("release_type", { enum: ["milestone", "full", "partial_refund"] }).notNull(),
        idempotencyKey: text("idempotency_key").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_releases_idempotency").on(table.idempotencyKey),
    ],
);

// --- reviews ---

export const reviews = financeSchema.table(
    "reviews",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id").notNull(),
        reviewerId: uuid("reviewer_id").notNull(),
        revieweeId: uuid("reviewee_id").notNull(),
        rating: integer("rating").notNull(),
        body: text("body"),
        windowOpenedAt: timestamp("window_opened_at", { withTimezone: true }),
        submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_reviews_order_reviewer").on(table.orderId, table.reviewerId),
        index("idx_finance_reviews_reviewee_id").on(table.revieweeId),
    ],
);

// --- reputation_scores ---

export const reputationScores = financeSchema.table(
    "reputation_scores",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        score: numeric("score", { precision: 3, scale: 2 }),
        reviewCount: integer("review_count").default(0).notNull(),
        lastCalculatedAt: timestamp("last_calculated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_finance_reputation_user_id").on(table.userId),
    ],
);

// --- reputation_history ---

export const reputationHistory = financeSchema.table(
    "reputation_history",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        score: numeric("score", { precision: 3, scale: 2 }).notNull(),
        trigger: text("trigger").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_finance_reputation_history_user_id").on(table.userId),
    ],
);
