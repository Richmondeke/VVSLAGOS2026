CREATE SCHEMA IF NOT EXISTS "social";
--> statement-breakpoint
CREATE TABLE "social"."attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member1_id" uuid NOT NULL,
	"member2_id" uuid NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."feed_engagements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."feed_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"post_type" text NOT NULL,
	"body" text NOT NULL,
	"media_urls" text[],
	"linked_listing_id" uuid,
	"is_visible" boolean DEFAULT true NOT NULL,
	"rank_score" numeric(10, 4) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social"."read_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"reader_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social"."attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "social"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."feed_engagements" ADD CONSTRAINT "feed_engagements_post_id_feed_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "social"."feed_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "social"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."read_receipts" ADD CONSTRAINT "read_receipts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "social"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_social_attachments_message" ON "social"."attachments" USING btree ("message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_social_blocks_unique" ON "social"."blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "idx_social_blocks_blocker" ON "social"."blocks" USING btree ("blocker_id");--> statement-breakpoint
CREATE INDEX "idx_social_blocks_blocked" ON "social"."blocks" USING btree ("blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_social_conversations_pair" ON "social"."conversations" USING btree ("member1_id","member2_id");--> statement-breakpoint
CREATE INDEX "idx_social_conversations_member1" ON "social"."conversations" USING btree ("member1_id");--> statement-breakpoint
CREATE INDEX "idx_social_conversations_member2" ON "social"."conversations" USING btree ("member2_id");--> statement-breakpoint
CREATE INDEX "idx_social_engagements_post" ON "social"."feed_engagements" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_social_engagements_user" ON "social"."feed_engagements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_social_feed_posts_author" ON "social"."feed_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_social_feed_posts_type" ON "social"."feed_posts" USING btree ("post_type");--> statement-breakpoint
CREATE INDEX "idx_social_feed_posts_visible_rank" ON "social"."feed_posts" USING btree ("is_visible","rank_score");--> statement-breakpoint
CREATE INDEX "idx_social_feed_posts_created" ON "social"."feed_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_social_messages_conversation" ON "social"."messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_social_messages_sender" ON "social"."messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_social_messages_created" ON "social"."messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_social_read_receipts_unique" ON "social"."read_receipts" USING btree ("message_id","reader_id");