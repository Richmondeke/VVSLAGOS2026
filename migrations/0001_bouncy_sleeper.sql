CREATE TABLE "content_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"custom_slug" text NOT NULL,
	"cover_image" text,
	"event_date" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_events_custom_slug_unique" UNIQUE("custom_slug")
);
--> statement-breakpoint
CREATE TABLE "content_news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"cover_image" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"company" text,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_content_events_slug" ON "content_events" USING btree ("custom_slug");--> statement-breakpoint
CREATE INDEX "idx_content_events_published" ON "content_events" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_content_news_published" ON "content_news" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_content_opportunities_published" ON "content_opportunities" USING btree ("is_published");