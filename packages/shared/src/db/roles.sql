-- Database roles for schema isolation
-- Each domain package gets its own role with access restricted to its schema

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS members;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS social;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS reporting;
CREATE SCHEMA IF NOT EXISTS outbox;

-- Create roles
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'auth_role') THEN CREATE ROLE auth_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'members_role') THEN CREATE ROLE members_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'marketplace_role') THEN CREATE ROLE marketplace_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'finance_role') THEN CREATE ROLE finance_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'social_role') THEN CREATE ROLE social_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'platform_role') THEN CREATE ROLE platform_role; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reporting_role') THEN CREATE ROLE reporting_role; END IF;
END $$;

-- Grant schema usage and full privileges within own schema
GRANT USAGE ON SCHEMA auth TO auth_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO auth_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL PRIVILEGES ON TABLES TO auth_role;

GRANT USAGE ON SCHEMA members TO members_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA members TO members_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA members GRANT ALL PRIVILEGES ON TABLES TO members_role;

GRANT USAGE ON SCHEMA marketplace TO marketplace_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA marketplace TO marketplace_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA marketplace GRANT ALL PRIVILEGES ON TABLES TO marketplace_role;

GRANT USAGE ON SCHEMA finance TO finance_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA finance TO finance_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA finance GRANT ALL PRIVILEGES ON TABLES TO finance_role;

GRANT USAGE ON SCHEMA social TO social_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA social TO social_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA social GRANT ALL PRIVILEGES ON TABLES TO social_role;

GRANT USAGE ON SCHEMA platform TO platform_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO platform_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL PRIVILEGES ON TABLES TO platform_role;

-- Reporting role: read-only across all schemas
GRANT USAGE ON SCHEMA auth TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA members TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA members TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA members GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA marketplace TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA marketplace TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA marketplace GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA finance TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA finance TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA finance GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA social TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA social TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA social GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA platform TO reporting_role;
GRANT SELECT ON ALL TABLES IN SCHEMA platform TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT SELECT ON TABLES TO reporting_role;

GRANT USAGE ON SCHEMA reporting TO reporting_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA reporting TO reporting_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA reporting GRANT ALL PRIVILEGES ON TABLES TO reporting_role;

-- All domain roles can append to outbox (insert-only)
GRANT USAGE ON SCHEMA outbox TO auth_role, members_role, marketplace_role, finance_role, social_role, platform_role;
GRANT INSERT ON ALL TABLES IN SCHEMA outbox TO auth_role, members_role, marketplace_role, finance_role, social_role, platform_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA outbox GRANT INSERT ON TABLES TO auth_role, members_role, marketplace_role, finance_role, social_role, platform_role;

-- Outbox schema full access for platform_role (relay worker needs to read + update publishedAt)
GRANT SELECT, UPDATE ON ALL TABLES IN SCHEMA outbox TO platform_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA outbox GRANT SELECT, UPDATE ON TABLES TO platform_role;
