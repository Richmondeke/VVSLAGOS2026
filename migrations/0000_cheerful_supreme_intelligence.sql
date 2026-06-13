CREATE SCHEMA "outbox";
--> statement-breakpoint
CREATE SCHEMA "vvs_auth";
--> statement-breakpoint
CREATE SCHEMA "finance";
--> statement-breakpoint
CREATE SCHEMA "marketplace";
--> statement-breakpoint
CREATE SCHEMA "members";
--> statement-breakpoint
CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE SCHEMA "social";
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
CREATE TABLE "rsvps" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rsvps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"attendance" text NOT NULL,
	"events" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_type" text NOT NULL,
	"issued_by" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"code" text NOT NULL,
	"max_uses" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."kyc_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"doc_type" text NOT NULL,
	"front_url" text NOT NULL,
	"back_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."member_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seq" integer GENERATED ALWAYS AS IDENTITY (sequence name "vvs_auth"."member_tiers_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"changed_by" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."referral_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_info" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password_hash" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'pending_approval' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vvs_auth"."verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"method" text NOT NULL,
	"granted_by" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."escrow_agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"client_wallet_id" uuid NOT NULL,
	"provider_wallet_id" uuid NOT NULL,
	"total_amount" integer NOT NULL,
	"platform_fee" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."escrow_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sequence" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."escrow_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"milestone_id" uuid,
	"amount" integer NOT NULL,
	"release_type" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."funding_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"paystack_reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."funding_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"paystack_reference" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."ledger_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_id" uuid NOT NULL,
	"entry_type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference" text,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_ledger_amount_positive" CHECK (amount > 0),
	CONSTRAINT "chk_ledger_entry_type" CHECK (entry_type IN ('credit', 'debit'))
);
--> statement-breakpoint
CREATE TABLE "finance"."reputation_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score" numeric(3, 2) NOT NULL,
	"trigger" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."reputation_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"last_calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"reviewee_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"body" text,
	"window_opened_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"available_balance" integer DEFAULT 0 NOT NULL,
	"locked_balance" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."withdrawal_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"bank_details" jsonb NOT NULL,
	"paystack_transfer_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
CREATE TABLE "platform"."admin_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"details" jsonb,
	"correlation_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."appeal_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderation_action_id" uuid NOT NULL,
	"appealer_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"reviewed_by" uuid,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "platform"."ban_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"admin_id" uuid NOT NULL,
	"banned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "platform"."moderation_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid,
	"target_user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"duration" integer,
	"reason" text NOT NULL,
	"admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."moderation_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."notification_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"channel" text NOT NULL,
	"status" text NOT NULL,
	"reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferences" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."notification_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"template_id" text NOT NULL,
	"recipient_field" text NOT NULL,
	"channels" text[] NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"max_per_user" integer,
	"max_per_user_window" integer,
	"cooldown_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."notification_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"channel_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
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
ALTER TABLE "outbox"."consumer_offsets" ADD CONSTRAINT "consumer_offsets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "outbox"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox"."dead_letters" ADD CONSTRAINT "dead_letters_original_event_id_events_id_fk" FOREIGN KEY ("original_event_id") REFERENCES "outbox"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."badges" ADD CONSTRAINT "badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."badges" ADD CONSTRAINT "badges_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."invite_codes" ADD CONSTRAINT "invite_codes_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."member_tiers" ADD CONSTRAINT "member_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."member_tiers" ADD CONSTRAINT "member_tiers_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."referral_approvals" ADD CONSTRAINT "referral_approvals_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "vvs_auth"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."referral_approvals" ADD CONSTRAINT "referral_approvals_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."referrals" ADD CONSTRAINT "referrals_invite_code_id_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "vvs_auth"."invite_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."referrals" ADD CONSTRAINT "referrals_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."referrals" ADD CONSTRAINT "referrals_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vvs_auth"."verifications" ADD CONSTRAINT "verifications_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "vvs_auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_agreements" ADD CONSTRAINT "escrow_agreements_client_wallet_id_wallets_id_fk" FOREIGN KEY ("client_wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_agreements" ADD CONSTRAINT "escrow_agreements_provider_wallet_id_wallets_id_fk" FOREIGN KEY ("provider_wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_escrow_agreements_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "finance"."escrow_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_releases" ADD CONSTRAINT "escrow_releases_escrow_id_escrow_agreements_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "finance"."escrow_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_releases" ADD CONSTRAINT "escrow_releases_milestone_id_escrow_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "finance"."escrow_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."funding_requests" ADD CONSTRAINT "funding_requests_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."deliverables" ADD CONSTRAINT "deliverables_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."order_state_log" ADD CONSTRAINT "order_state_log_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "marketplace"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."orders" ADD CONSTRAINT "orders_selected_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("selected_tier_id") REFERENCES "marketplace"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."pricing_tiers" ADD CONSTRAINT "pricing_tiers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "marketplace"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace"."revision_requests" ADD CONSTRAINT "revision_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "marketplace"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members"."case_studies" ADD CONSTRAINT "case_studies_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members"."collaborators" ADD CONSTRAINT "collaborators_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members"."portfolio_media" ADD CONSTRAINT "portfolio_media_portfolio_item_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_item_id") REFERENCES "members"."portfolio_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."appeal_records" ADD CONSTRAINT "appeal_records_moderation_action_id_moderation_actions_id_fk" FOREIGN KEY ("moderation_action_id") REFERENCES "platform"."moderation_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."moderation_actions" ADD CONSTRAINT "moderation_actions_report_id_moderation_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "platform"."moderation_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."notification_routes" ADD CONSTRAINT "notification_routes_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "platform"."notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."attachments" ADD CONSTRAINT "attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "social"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."feed_engagements" ADD CONSTRAINT "feed_engagements_post_id_feed_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "social"."feed_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "social"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social"."read_receipts" ADD CONSTRAINT "read_receipts_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "social"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_outbox_events_idempotency_key" ON "outbox"."events" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_outbox_events_unpublished" ON "outbox"."events" USING btree ("created_at") WHERE published_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_auth_badges_user_id" ON "vvs_auth"."badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_badges_active" ON "vvs_auth"."badges" USING btree ("user_id","badge_type") WHERE revoked_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_invite_codes_code" ON "vvs_auth"."invite_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_auth_invite_codes_inviter_id" ON "vvs_auth"."invite_codes" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_auth_kyc_documents_user_id" ON "vvs_auth"."kyc_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_kyc_documents_status" ON "vvs_auth"."kyc_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_member_tiers_user_id" ON "vvs_auth"."member_tiers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referral_approvals_referral_id" ON "vvs_auth"."referral_approvals" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_inviter_id" ON "vvs_auth"."referrals" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_invitee_id" ON "vvs_auth"."referrals" USING btree ("invitee_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_status" ON "vvs_auth"."referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_user_id" ON "vvs_auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_active" ON "vvs_auth"."sessions" USING btree ("user_id") WHERE revoked_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_tokens_token" ON "vvs_auth"."tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_auth_tokens_user_id" ON "vvs_auth"."tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_users_email" ON "vvs_auth"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_users_phone" ON "vvs_auth"."users" USING btree ("phone") WHERE phone IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_auth_users_status" ON "vvs_auth"."users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_user_id" ON "vvs_auth"."verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_status" ON "vvs_auth"."verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_expired_provisional" ON "vvs_auth"."verifications" USING btree ("expires_at") WHERE status = 'provisional' AND expires_at IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_escrow_order_id" ON "finance"."escrow_agreements" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_finance_milestones_escrow_id" ON "finance"."escrow_milestones" USING btree ("escrow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_releases_idempotency" ON "finance"."escrow_releases" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_funding_paystack_ref" ON "finance"."funding_requests" USING btree ("paystack_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_webhooks_paystack_ref" ON "finance"."funding_webhooks" USING btree ("paystack_reference");--> statement-breakpoint
CREATE INDEX "idx_finance_ledger_wallet_id" ON "finance"."ledger_entries" USING btree ("wallet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_ledger_idempotency_key" ON "finance"."ledger_entries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_finance_reputation_history_user_id" ON "finance"."reputation_history" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_reputation_user_id" ON "finance"."reputation_scores" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_reviews_order_reviewer" ON "finance"."reviews" USING btree ("order_id","reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_finance_reviews_reviewee_id" ON "finance"."reviews" USING btree ("reviewee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_wallets_user_id" ON "finance"."wallets" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_finance_withdrawal_transfer_id" ON "finance"."withdrawal_requests" USING btree ("paystack_transfer_id") WHERE paystack_transfer_id IS NOT NULL;--> statement-breakpoint
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
CREATE UNIQUE INDEX "idx_marketplace_verification_cache_user_id" ON "marketplace"."verification_cache" USING btree ("user_id");--> statement-breakpoint
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
CREATE INDEX "idx_members_profiles_search_vector" ON "members"."profiles" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_admin" ON "platform"."admin_audit_log" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_created" ON "platform"."admin_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_platform_admin_users_user" ON "platform"."admin_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_appeals_action" ON "platform"."appeal_records" USING btree ("moderation_action_id");--> statement-breakpoint
CREATE INDEX "idx_platform_bans_user" ON "platform"."ban_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_actions_target" ON "platform"."moderation_actions" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_actions_admin" ON "platform"."moderation_actions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_platform_reports_status" ON "platform"."moderation_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_platform_reports_target" ON "platform"."moderation_reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_platform_notif_log_user" ON "platform"."notification_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_notif_log_event" ON "platform"."notification_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_platform_notif_log_created" ON "platform"."notification_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_platform_notif_prefs_user" ON "platform"."notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_notif_routes_event" ON "platform"."notification_routes" USING btree ("event_type");--> statement-breakpoint
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