ALTER TABLE "content_opportunities" RENAME COLUMN "company" TO "brand";
ALTER TABLE "content_opportunities" ADD COLUMN "brand_logo" text;
ALTER TABLE "content_opportunities" ADD COLUMN "is_verified_brand" boolean DEFAULT false NOT NULL;
ALTER TABLE "content_opportunities" ADD COLUMN "category" text DEFAULT 'Other' NOT NULL;
ALTER TABLE "content_opportunities" ADD COLUMN "location" text;
ALTER TABLE "content_opportunities" ADD COLUMN "deadline" timestamp with time zone;
ALTER TABLE "content_opportunities" ADD COLUMN "budget" text;
ALTER TABLE "content_opportunities" ADD COLUMN "xp_reward" integer DEFAULT 0;
