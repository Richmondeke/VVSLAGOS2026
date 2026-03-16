CREATE SCHEMA "outbox";
--> statement-breakpoint
CREATE TABLE "outbox"."consumer_offsets" (
	"consumer_name" text NOT NULL,
	"event_id" integer NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consumer_offsets_consumer_name_event_id_pk" PRIMARY KEY("consumer_name","event_id")
);
--> statement-breakpoint
CREATE TABLE "outbox"."dead_letters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "outbox"."dead_letters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"original_event_id" integer,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text NOT NULL,
	"retry_count" integer NOT NULL,
	"failed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolution" text
);
--> statement-breakpoint
CREATE TABLE "outbox"."events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "outbox"."events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_type" text NOT NULL,
	"event_version" integer DEFAULT 1 NOT NULL,
	"payload" jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"ordering_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "outbox"."consumer_offsets" ADD CONSTRAINT "consumer_offsets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "outbox"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox"."dead_letters" ADD CONSTRAINT "dead_letters_original_event_id_events_id_fk" FOREIGN KEY ("original_event_id") REFERENCES "outbox"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_outbox_events_idempotency_key" ON "outbox"."events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_outbox_events_unpublished" ON "outbox"."events" USING btree ("created_at") WHERE published_at IS NULL;