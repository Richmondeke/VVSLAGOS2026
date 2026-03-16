CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE TABLE "auth"."badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_type" text NOT NULL,
	"issued_by" uuid,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."invite_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_id" uuid NOT NULL,
	"code" text NOT NULL,
	"max_uses" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."kyc_documents" (
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
CREATE TABLE "auth"."member_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"changed_by" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."referral_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_info" jsonb,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
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
CREATE TABLE "auth"."verifications" (
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
ALTER TABLE "auth"."badges" ADD CONSTRAINT "badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."badges" ADD CONSTRAINT "badges_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."invite_codes" ADD CONSTRAINT "invite_codes_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."member_tiers" ADD CONSTRAINT "member_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."member_tiers" ADD CONSTRAINT "member_tiers_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."referral_approvals" ADD CONSTRAINT "referral_approvals_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "auth"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."referral_approvals" ADD CONSTRAINT "referral_approvals_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."referrals" ADD CONSTRAINT "referrals_invite_code_id_invite_codes_id_fk" FOREIGN KEY ("invite_code_id") REFERENCES "auth"."invite_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."referrals" ADD CONSTRAINT "referrals_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."referrals" ADD CONSTRAINT "referrals_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."verifications" ADD CONSTRAINT "verifications_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_badges_user_id" ON "auth"."badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_badges_active" ON "auth"."badges" USING btree ("user_id","badge_type") WHERE revoked_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_invite_codes_code" ON "auth"."invite_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_auth_invite_codes_inviter_id" ON "auth"."invite_codes" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_auth_kyc_documents_user_id" ON "auth"."kyc_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_kyc_documents_status" ON "auth"."kyc_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_member_tiers_user_id" ON "auth"."member_tiers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referral_approvals_referral_id" ON "auth"."referral_approvals" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_inviter_id" ON "auth"."referrals" USING btree ("inviter_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_invitee_id" ON "auth"."referrals" USING btree ("invitee_id");--> statement-breakpoint
CREATE INDEX "idx_auth_referrals_status" ON "auth"."referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_user_id" ON "auth"."sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_sessions_active" ON "auth"."sessions" USING btree ("user_id") WHERE revoked_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_tokens_token" ON "auth"."tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_auth_tokens_user_id" ON "auth"."tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_users_email" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_users_phone" ON "auth"."users" USING btree ("phone") WHERE phone IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_auth_users_status" ON "auth"."users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_user_id" ON "auth"."verifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_status" ON "auth"."verifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_auth_verifications_expired_provisional" ON "auth"."verifications" USING btree ("expires_at") WHERE status = 'provisional' AND expires_at IS NOT NULL;