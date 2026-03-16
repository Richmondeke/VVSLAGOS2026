CREATE SCHEMA IF NOT EXISTS "members";
--> statement-breakpoint
CREATE TABLE "members"."case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_item_id" uuid,
	"user_id" uuid NOT NULL,
	"challenge" text,
	"approach" text,
	"outcome" text,
	"metrics" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_item_id" uuid NOT NULL,
	"collaborator_user_id" uuid NOT NULL,
	"confirmed_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"tags" text[],
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."portfolio_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_item_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"media_type" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."profile_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."profile_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_category_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members"."profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text,
	"bio" text,
	"profession" text,
	"primary_category_id" uuid,
	"skills" text[],
	"location_city" text,
	"location_country" text,
	"profile_photo_url" text,
	"availability_status" text DEFAULT 'available' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members"."case_studies" ADD CONSTRAINT "case_studies_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members"."collaborators" ADD CONSTRAINT "collaborators_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members"."portfolio_media" ADD CONSTRAINT "portfolio_media_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_members_case_studies_user_id" ON "members"."case_studies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_members_case_studies_portfolio_item_id" ON "members"."case_studies" USING btree ("portfolio_item_id");--> statement-breakpoint
CREATE INDEX "idx_members_collaborators_portfolio_item_id" ON "members"."collaborators" USING btree ("portfolio_item_id");--> statement-breakpoint
CREATE INDEX "idx_members_collaborators_user_id" ON "members"."collaborators" USING btree ("collaborator_user_id");--> statement-breakpoint
CREATE INDEX "idx_members_portfolio_user_id" ON "members"."portfolio_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_members_portfolio_published" ON "members"."portfolio_items" USING btree ("user_id") WHERE is_published = true;--> statement-breakpoint
CREATE INDEX "idx_members_media_portfolio_item_id" ON "members"."portfolio_media" USING btree ("portfolio_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_members_availability_user_id" ON "members"."profile_availability" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_members_categories_slug" ON "members"."profile_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_members_categories_parent" ON "members"."profile_categories" USING btree ("parent_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_members_profiles_user_id" ON "members"."profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_members_profiles_availability" ON "members"."profiles" USING btree ("availability_status");--> statement-breakpoint
CREATE INDEX "idx_members_profiles_is_public" ON "members"."profiles" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_members_profiles_search_vector" ON "members"."profiles" USING gin ("search_vector");