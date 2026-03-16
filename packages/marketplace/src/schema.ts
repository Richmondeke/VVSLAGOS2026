import { sql } from "drizzle-orm";
import {
    boolean,
    customType,
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

export const marketplaceSchema = pgSchema("marketplace");

// Custom type for tsvector
const tsvector = customType<{ data: string }>({
    dataType() {
        return "tsvector";
    },
});

// --- listings ---

export const listings = marketplaceSchema.table(
    "listings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        providerId: uuid("provider_id").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        category: text("category"),
        pricingModel: text("pricing_model", { enum: ["fixed", "hourly", "project"] })
            .default("fixed")
            .notNull(),
        status: text("status", { enum: ["draft", "active", "paused", "removed"] })
            .default("draft")
            .notNull(),
        responseTimeAvg: integer("response_time_avg"),
        searchVector: tsvector("search_vector"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_marketplace_listings_provider_id").on(table.providerId),
        index("idx_marketplace_listings_status").on(table.status),
        index("idx_marketplace_listings_category").on(table.category),
        index("idx_marketplace_listings_search_vector").using("gin", table.searchVector),
    ],
);

// --- pricing_tiers ---

export const pricingTiers = marketplaceSchema.table(
    "pricing_tiers",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        listingId: uuid("listing_id")
            .notNull()
            .references(() => listings.id),
        tierName: text("tier_name", { enum: ["basic", "standard", "premium"] }).notNull(),
        price: integer("price").notNull(),
        deliverables: text("deliverables"),
        estimatedDays: integer("estimated_days"),
        displayOrder: integer("display_order").default(0).notNull(),
    },
    (table) => [
        index("idx_marketplace_pricing_tiers_listing_id").on(table.listingId),
    ],
);

// --- orders ---

export const orders = marketplaceSchema.table(
    "orders",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        listingId: uuid("listing_id")
            .notNull()
            .references(() => listings.id),
        clientId: uuid("client_id").notNull(),
        providerId: uuid("provider_id").notNull(),
        selectedTierId: uuid("selected_tier_id")
            .notNull()
            .references(() => pricingTiers.id),
        amount: integer("amount").notNull(),
        status: text("status", {
            enum: [
                "draft",
                "accepted",
                "declined",
                "pending_funding",
                "funded",
                "in_progress",
                "delivered",
                "pending_approval",
                "completed",
                "rated",
                "disputed",
                "resolved_released",
                "resolved_refunded",
                "resolved_partial",
                "cancelled",
                "refunded",
            ],
        })
            .default("draft")
            .notNull(),
        correlationId: text("correlation_id"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_marketplace_orders_listing_id").on(table.listingId),
        index("idx_marketplace_orders_client_id").on(table.clientId),
        index("idx_marketplace_orders_provider_id").on(table.providerId),
        index("idx_marketplace_orders_status").on(table.status),
    ],
);

// --- order_state_log ---
// Note: declarative partitioning by month deferred — requires raw SQL outside Drizzle

export const orderStateLog = marketplaceSchema.table(
    "order_state_log",
    {
        id: serial("id").primaryKey(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id),
        fromStatus: text("from_status").notNull(),
        toStatus: text("to_status").notNull(),
        actorId: uuid("actor_id"),
        reason: text("reason"),
        metadata: jsonb("metadata"),
        correlationId: text("correlation_id"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_marketplace_state_log_order_id").on(table.orderId),
        index("idx_marketplace_state_log_created_at").on(table.createdAt),
    ],
);

// --- deliverables ---

export const deliverables = marketplaceSchema.table(
    "deliverables",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id),
        uploadedBy: uuid("uploaded_by").notNull(),
        fileUrl: text("file_url").notNull(),
        fileName: text("file_name").notNull(),
        fileSize: integer("file_size"),
        version: integer("version").default(1).notNull(),
        notes: text("notes"),
        status: text("status", { enum: ["submitted", "accepted", "rejected"] })
            .default("submitted")
            .notNull(),
        uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_marketplace_deliverables_order_id").on(table.orderId),
    ],
);

// --- verification_cache ---

export const verificationCache = marketplaceSchema.table(
    "verification_cache",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        tier: text("tier", { enum: ["free", "verified", "pro"] }).notNull(),
        verificationStatus: text("verification_status", {
            enum: ["pending", "provisional", "verified", "rejected", "expired"],
        }).notNull(),
        lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_marketplace_verification_cache_user_id").on(table.userId),
    ],
);

// --- revision_requests ---

export const revisionRequests = marketplaceSchema.table(
    "revision_requests",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id),
        requestedBy: uuid("requested_by").notNull(),
        notes: text("notes"),
        specificFiles: text("specific_files").array(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_marketplace_revision_requests_order_id").on(table.orderId),
    ],
);
