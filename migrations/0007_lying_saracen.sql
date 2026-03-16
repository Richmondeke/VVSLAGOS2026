CREATE SCHEMA IF NOT EXISTS "platform";
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
DROP INDEX IF EXISTS "social"."idx_social_engagements_like_unique";--> statement-breakpoint
ALTER TABLE "platform"."appeal_records" ADD CONSTRAINT "appeal_records_moderation_action_id_moderation_actions_id_fk" FOREIGN KEY ("moderation_action_id") REFERENCES "platform"."moderation_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."moderation_actions" ADD CONSTRAINT "moderation_actions_report_id_moderation_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "platform"."moderation_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."notification_routes" ADD CONSTRAINT "notification_routes_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "platform"."notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "idx_platform_notif_routes_event" ON "platform"."notification_routes" USING btree ("event_type");