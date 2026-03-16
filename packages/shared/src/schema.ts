import { sql } from "drizzle-orm";
import {
    index,
    integer,
    jsonb,
    pgSchema,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
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
