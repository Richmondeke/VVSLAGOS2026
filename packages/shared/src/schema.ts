import { sql } from "drizzle-orm";
import {
    index,
    integer,
    jsonb,
    pgSchema,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    boolean,
} from "drizzle-orm/pg-core";

export const outboxSchema = pgSchema("outbox");

export const events = outboxSchema.table(
    "events",
    {
        id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
        eventType: text("event_type").notNull(),
        eventVersion: integer("event_version").notNull().default(1),
        payload: jsonb("payload").notNull(),
        idempotencyKey: text("idempotency_key").notNull(),
        orderingKey: text("ordering_key"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        publishedAt: timestamp("published_at", { withTimezone: true }),
    },
    (table) => [
        uniqueIndex("idx_outbox_events_idempotency_key").on(table.idempotencyKey),
        index("idx_outbox_events_unpublished").on(table.createdAt).where(sql`published_at IS NULL`),
    ],
);

export const deadLetters = outboxSchema.table("dead_letters", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalEventId: integer("original_event_id").references(() => events.id),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    errorMessage: text("error_message").notNull(),
    retryCount: integer("retry_count").notNull(),
    failedAt: timestamp("failed_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolution: text("resolution"),
});

export const consumerOffsets = outboxSchema.table(
    "consumer_offsets",
    {
        consumerName: text("consumer_name").notNull(),
        eventId: integer("event_id")
            .notNull()
            .references(() => events.id),
        processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.consumerName, table.eventId] })],
);

export const rsvps = pgTable("rsvps", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    attendance: text("attendance").notNull(),
    events: text("events").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    phone: text("phone"),
    gender: text("gender"),
    occupation: text("occupation"),
    company: text("company"),
    role: text("role"),
    heardAbout: text("heard_about"),
    referredByAdmin: text("referred_by_admin"),
});

export const contentEvents = pgTable(
    "content_events",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        customSlug: text("custom_slug").notNull().unique(),
        coverImage: text("cover_image"),
        eventDate: timestamp("event_date", { withTimezone: true }),
        isPublished: boolean("is_published").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_content_events_slug").on(table.customSlug),
        index("idx_content_events_published").on(table.isPublished),
    ]
);

export const contentNews = pgTable(
    "content_news",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        content: text("content").notNull(),
        coverImage: text("cover_image"),
        isPublished: boolean("is_published").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_content_news_published").on(table.isPublished),
    ]
);

export const contentOpportunities = pgTable(
    "content_opportunities",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        brand: text("brand"), // Replaces 'company'
        brandLogo: text("brand_logo"),
        isVerifiedBrand: boolean("is_verified_brand").default(false).notNull(),
        description: text("description").notNull(),
        type: text("type").notNull(), // e.g. Job, Grant, Casting
        category: text("category").notNull().default('Other'), // e.g. Fashion, Tech
        location: text("location"),
        deadline: timestamp("deadline", { withTimezone: true }),
        budget: text("budget"),
        xpReward: integer("xp_reward").default(0),
        url: text("url"), // External apply link
        isPublished: boolean("is_published").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_content_opportunities_published").on(table.isPublished),
    ]
);


export const communityMembers = pgTable("community_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    age: integer("age").notNull(),
    email: text("email").notNull(),
    occupation: text("occupation").notNull(),
    city: text("city").notNull(),
    gender: text("gender").notNull(),
    interests: text("interests").array(),
    selfieUrl: text("selfie_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const futureLabsApplications = pgTable("future_labs_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    gender: text("gender").notNull(),
    city: text("city").notNull(),
    category: text("category").notNull(),
    portfolioUrl: text("portfolio_url"),
    statement: text("statement").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

