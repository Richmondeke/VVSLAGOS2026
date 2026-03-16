CREATE SCHEMA IF NOT EXISTS "finance";
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
ALTER TABLE "finance"."escrow_agreements" ADD CONSTRAINT "escrow_agreements_client_wallet_id_wallets_id_fk" FOREIGN KEY ("client_wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_agreements" ADD CONSTRAINT "escrow_agreements_provider_wallet_id_wallets_id_fk" FOREIGN KEY ("provider_wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_escrow_agreements_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "finance"."escrow_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_releases" ADD CONSTRAINT "escrow_releases_escrow_id_escrow_agreements_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "finance"."escrow_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."escrow_releases" ADD CONSTRAINT "escrow_releases_milestone_id_escrow_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "finance"."escrow_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."funding_requests" ADD CONSTRAINT "funding_requests_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "finance"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE UNIQUE INDEX "idx_finance_withdrawal_transfer_id" ON "finance"."withdrawal_requests" USING btree ("paystack_transfer_id") WHERE paystack_transfer_id IS NOT NULL;