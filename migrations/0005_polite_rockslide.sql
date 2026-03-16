CREATE SCHEMA IF NOT EXISTS "marketplace";
--> statement-breakpoint
CREATE TABLE "marketplace"."deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"version" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"pricing_model" text DEFAULT 'fixed' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"response_time_avg" integer,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."order_state_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"actor_id" uuid,
	"reason" text,
	"metadata" jsonb,
	"correlation_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"selected_tier_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"correlation_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."pricing_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"tier_name" text NOT NULL,
	"price" integer NOT NULL,
	"deliverables" text,
	"estimated_days" integer,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."revision_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"notes" text,
	"specific_files" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace"."verification_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"verification_status" text NOT NULL,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketplace"."deliverables" ADD CONSTRAINT "deliverables_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."order_state_log" ADD CONSTRAINT "order_state_log_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "marketplace"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."orders" ADD CONSTRAINT "orders_selected_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("selected_tier_id") REFERENCES "marketplace"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."pricing_tiers" ADD CONSTRAINT "pricing_tiers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "marketplace"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."revision_requests" ADD CONSTRAINT "revision_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_marketplace_deliverables_order_id" ON "marketplace"."deliverables" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_listings_provider_id" ON "marketplace"."listings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_listings_status" ON "marketplace"."listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_marketplace_listings_category" ON "marketplace"."listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_marketplace_listings_search_vector" ON "marketplace"."listings" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_marketplace_state_log_order_id" ON "marketplace"."order_state_log" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_state_log_created_at" ON "marketplace"."order_state_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_marketplace_orders_listing_id" ON "marketplace"."orders" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_orders_client_id" ON "marketplace"."orders" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_orders_provider_id" ON "marketplace"."orders" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_orders_status" ON "marketplace"."orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_marketplace_pricing_tiers_listing_id" ON "marketplace"."pricing_tiers" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_marketplace_revision_requests_order_id" ON "marketplace"."revision_requests" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_marketplace_verification_cache_user_id" ON "marketplace"."verification_cache" USING btree ("user_id");