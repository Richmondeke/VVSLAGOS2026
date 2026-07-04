CREATE TABLE IF NOT EXISTS "future_labs_applications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text NOT NULL,
    "gender" text NOT NULL,
    "city" text NOT NULL,
    "category" text NOT NULL,
    "portfolio_url" text,
    "statement" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
