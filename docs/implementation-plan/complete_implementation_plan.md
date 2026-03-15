# VVS Members — Comprehensive Implementation Plan
**Version:** 1.0 | **Date:** March 2026 | **Author:** RateMe Ltd Engineering

---

## How to Use This Document

This plan governs execution. For every phase, before writing a single line of code:

1. **Read** the task list for that phase entirely
2. **Create** the folder structure: `module-{N}-{name}/phase-{N}-{name}/`
3. **Copy** the task checklist into a `TASKS.md` inside that phase folder
4. **Implement** each task, checking it off as you go
5. **Run** the exit criteria tests before proceeding
6. **Only move forward** when all checkboxes in that phase are ticked

> **Rule:** No phase begins until the previous phase's exit criteria pass. No exceptions.

---

## Folder Structure Convention

```
vvs-members/
└── implementation/
    ├── module-01-shared/
    │   ├── phase-01-foundation/
    │   │   ├── TASKS.md          ← copy task list here before starting
    │   │   └── COMPLETED.md      ← notes on what was built and any deviations
    │   └── phase-02-events/
    ├── module-02-auth/
    ├── module-03-finance/
    ├── module-04-members/
    ├── module-05-marketplace/
    ├── module-06-social/
    ├── module-07-platform/
    ├── module-08-web-client/
    └── module-09-admin/
```

---

## Build Order Summary

| Order | Module | Depends On | Key Risk |
|-------|--------|------------|----------|
| 1 | Shared Infrastructure | Nothing | Everything depends on this — get it right first |
| 2 | Auth | Shared | No business deps; the platform door |
| 3 | Finance | Shared, Auth events | Money handling — stress test early |
| 4 | Members | Shared, Auth events | Light; fast to build |
| 5 | Marketplace | Finance + Auth interfaces | Saga complexity; highest-risk module |
| 6 | Social | Members events | Can parallel with Marketplace |
| 7 | Platform | All events | Fan-in point; build last |
| 8 | Web Client | All API modules | SSR + auth flows |
| 9 | Admin Dashboard | All API modules + Reporting | Operational tooling |

---

---

# MODULE 1: Shared Infrastructure

**Folder:** `module-01-shared/`
**Purpose:** Foundation layer — Drizzle client, BullMQ, Pino logger, error types, test utilities. Zero business logic. Everything else depends on this.
**Packages:** `packages/contracts`, `packages/shared`

---

## Phase 1.1 — Monorepo Bootstrap

**Folder:** `module-01-shared/phase-01-monorepo-bootstrap/`

### TASKS.md — Copy this before starting

```
## Phase 1.1 Task List: Monorepo Bootstrap

### Repository Setup
[ ] 1.  Initialise git repo at project root
[ ] 2.  Create root `package.json` with `"private": true` and workspace config
[ ] 3.  Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
[ ] 4.  Install pnpm 9.x globally and verify version
[ ] 5.  Create `turbo.json` with pipeline definitions: build, test, lint, dev
[ ] 6.  Create root `tsconfig.base.json` with strict mode, paths, and composite settings
[ ] 7.  Create `biome.json` with linting + formatting rules (4-space indent, double quotes, trailing commas)
[ ] 8.  Create `.gitignore` covering node_modules, dist, .turbo, .env files
[ ] 9.  Create `.env.example` at root with all required env var keys (no values)
[ ] 10. Create root `README.md` with setup instructions

### Folder Skeleton
[ ] 11. Create `apps/api/` with empty `package.json` and `src/index.ts`
[ ] 12. Create `apps/web/` with empty `package.json`
[ ] 13. Create `apps/admin/` with empty `package.json`
[ ] 14. Create `apps/workers/` with empty `package.json` and `src/index.ts`
[ ] 15. Create `packages/contracts/` with `package.json` and `src/index.ts`
[ ] 16. Create `packages/shared/` with `package.json` and `src/index.ts`
[ ] 17. Create `packages/auth/` through `packages/platform/` with empty package stubs
[ ] 18. Create `migrations/` with subdirs: auth, members, marketplace, finance, social, platform, reporting
[ ] 19. Run `pnpm install` at root — verify workspace links resolve correctly
[ ] 20. Run `pnpm turbo build` — verify no errors on empty packages

### TypeScript Config Per Package
[ ] 21. Add `tsconfig.json` to each package extending `../../tsconfig.base.json`
[ ] 22. Verify `packages/contracts` has `"declaration": true` and zero runtime deps
[ ] 23. Run `pnpm tsc --noEmit` across all packages — zero errors

### CI Skeleton
[ ] 24. Create `.github/workflows/ci.yml` with: install, lint, type-check, test
[ ] 25. Verify GitHub Actions workflow parses correctly (use act locally or push to check)
```

### Exit Criteria
- `pnpm install` completes with zero errors
- `pnpm turbo build` succeeds across all packages
- `pnpm tsc --noEmit` at root passes with zero type errors
- `pnpm biome check .` passes
- Folder structure matches the spec in Section 4 of the Architecture doc exactly

---

## Phase 1.2 — Contracts Package

**Folder:** `module-01-shared/phase-02-contracts/`

### TASKS.md

```
## Phase 1.2 Task List: Contracts Package

### Foundation Types
[ ] 1.  Define `Money` type: `{ amount: number; currency: 'NGN' }`
[ ] 2.  Define `Paginated<T>` type: `{ items: T[]; total: number; page: number; pageSize: number }`
[ ] 3.  Define `MemberTier` enum: Free | Verified | Pro
[ ] 4.  Define `VerificationStatus` enum: Pending | Provisional | Verified | Rejected | Expired
[ ] 5.  Define `OrderStatus` enum with all states from spec (draft → rated + disputed branch)
[ ] 6.  Define `EntryType` enum: credit | debit
[ ] 7.  Define `NotificationChannel` enum: push | email | sms | in_app

### Auth Interfaces
[ ] 8.  Define `IAuthService` interface: register, login, refreshSession, revokeSession
[ ] 9.  Define `IReferralService` interface: generateInvite, redeemInvite, approve, reject
[ ] 10. Define `IIdentityService` interface: submitVerification, getStatus, getTier, upgradeTier
[ ] 11. Define `AuthUser`, `Session`, `InviteCode`, `Referral`, `Verification` types

### Finance Interfaces
[ ] 12. Define `IWalletService` interface: create, getBalance, debit, credit, withdraw
[ ] 13. Define `IEscrowService` interface: create, markFunded, approveMilestone, releaseMilestone, cancel, dispute
[ ] 14. Define `IRatingsService` interface: submit, getUserRating, getListingRating
[ ] 15. Define `Wallet`, `DebitResult`, `CreditResult`, `EscrowAgreement`, `AggregateRating` types

### Members Interfaces
[ ] 16. Define `IProfileService` interface: create, update, get, search
[ ] 17. Define `IPortfolioService` interface: createItem, getItems
[ ] 18. Define `Profile`, `ProfileSummary`, `PortfolioItem` types

### Marketplace Interfaces
[ ] 19. Define `IListingService` interface: create, search, getWithRating
[ ] 20. Define `IOrderService` interface: create, fund, submitDeliverable, approveMilestone, dispute, status
[ ] 21. Define `Listing`, `ListingSummary`, `ListingWithRating`, `Order`, `OrderStatus` types

### Social Interfaces
[ ] 22. Define `IFeedService` interface: post, timeline, engage
[ ] 23. Define `IMessagingService` interface: startConversation, send, inbox
[ ] 24. Define `FeedPost`, `Conversation`, `Message` types

### Platform Interfaces
[ ] 25. Define `IModerationService` interface: report, suspend, ban, resolveDispute
[ ] 26. Define `IAdminService` interface: getSettings, updateSettings, analytics
[ ] 27. Define `PlatformSettings`, `AnalyticsResult` types

### Event Payload Types
[ ] 28. Define auth event payloads: UserRegisteredPayload, ReferralApprovedPayload, IdentityVerifiedPayload, UserDeactivatedPayload
[ ] 29. Define members event payloads: ProfileCreatedPayload, ProfileUpdatedPayload, PortfolioPublishedPayload
[ ] 30. Define marketplace event payloads: ListingCreatedPayload, OrderFundedPayload, OrderCompletedPayload, OrderDisputedPayload
[ ] 31. Define finance event payloads: WalletFundedPayload, WithdrawalCompletedPayload, ReviewSubmittedPayload, ThresholdReachedPayload
[ ] 32. Define social event payloads: MessageSentPayload, PostFlaggedPayload, EngagementReceivedPayload
[ ] 33. Define platform event payloads: UserSuspendedPayload, UserBannedPayload, SettingsUpdatedPayload

### Sub-exports Setup
[ ] 34. Create `packages/contracts/src/auth.ts` and export auth types/interfaces
[ ] 35. Create `packages/contracts/src/finance.ts` and export finance types/interfaces
[ ] 36. Create `packages/contracts/src/members.ts` and export members types/interfaces
[ ] 37. Create `packages/contracts/src/marketplace.ts` and export marketplace types/interfaces
[ ] 38. Create `packages/contracts/src/social.ts` and export social types/interfaces
[ ] 39. Create `packages/contracts/src/platform.ts` and export platform types/interfaces
[ ] 40. Create `packages/contracts/src/events.ts` and export all event payload types
[ ] 41. Update `packages/contracts/package.json` exports map with sub-path exports

### Validation
[ ] 42. Verify contracts package has ZERO runtime dependencies (types only)
[ ] 43. Run `pnpm tsc --noEmit` — zero errors
[ ] 44. Import a type from each sub-export in a test file and verify resolution
```

### Exit Criteria
- `packages/contracts` has zero runtime dependencies
- All 10 service interfaces are defined and exported
- All 22 event payload types are defined
- Sub-path exports (`@vvs/contracts/auth`, etc.) resolve correctly
- `pnpm tsc --noEmit` passes across all packages

---

## Phase 1.3 — Database Client & Outbox Schema

**Folder:** `module-01-shared/phase-03-database/`

### TASKS.md

```
## Phase 1.3 Task List: Database Client & Outbox Schema

### PostgreSQL Setup
[ ] 1.  Create `docker-compose.yml` at repo root with PostgreSQL 16 service
[ ] 2.  Set up PostgreSQL with username, password, and database name
[ ] 3.  Add `.env.local` template for DATABASE_URL, REDIS_URL vars
[ ] 4.  Run `docker compose up -d` and verify connection with psql

### Drizzle Setup
[ ] 5.  Install `drizzle-orm` and `postgres` driver in `packages/shared`
[ ] 6.  Install `drizzle-kit` as devDependency at root
[ ] 7.  Create `packages/shared/src/db/client.ts` with `createScopedClient(schema)` factory
[ ] 8.  Implement connection pool configuration (max connections, idle timeout)
[ ] 9.  Create `packages/shared/src/db/migration-runner.ts` using drizzle-kit integration
[ ] 10. Add `drizzle.config.ts` at repo root pointing to all schema files
[ ] 11. Test basic query with scoped client against PostgreSQL instance

### Outbox Schema
[ ] 12. Create `packages/shared/src/schema.ts` with outbox schema definition
[ ] 13. Define `outbox.events` table per spec (id, eventType, eventVersion, payload, idempotencyKey, orderingKey, createdAt, publishedAt)
[ ] 14. Define `outbox.dead_letters` table per spec (id, original_event_id, event_type, payload, error_message, retry_count, failed_at, resolved_at, resolution)
[ ] 15. Define `outbox.consumer_offsets` table (consumer_name, event_id, processed_at)
[ ] 16. Add GIN index on `created_at` filtered WHERE `published_at IS NULL` for polling efficiency
[ ] 17. Generate migration: `drizzle-kit generate` for outbox schema
[ ] 18. Run migration and verify tables created in PostgreSQL

### Scoped Client
[ ] 19. Implement `createScopedClient` — returns a Drizzle client restricted to one schema
[ ] 20. Each business package gets its own database role with schema-only access
[ ] 21. Write SQL to create roles: auth_role, members_role, marketplace_role, finance_role, social_role, platform_role
[ ] 22. Create `packages/shared/src/db/roles.sql` with all GRANT statements
[ ] 23. Verify role isolation: finance_role cannot read from auth schema (test with psql)
[ ] 24. Every role can INSERT into outbox.events (append-only grant)

### Drizzle Kit Config
[ ] 25. Add `migrate` script to root `package.json`: runs drizzle-kit migrate
[ ] 26. Add `generate` script: runs drizzle-kit generate
[ ] 27. Verify migration files are clean SQL (no Prisma-style engine blocks)
[ ] 28. Test rollback strategy manually (drop migration, re-run)
```

### Exit Criteria
- `docker compose up` brings up PostgreSQL 16 with outbox schema applied
- `createScopedClient('auth')` returns a working Drizzle client scoped to auth schema
- `createScopedClient('finance')` cannot query auth schema tables (role isolation)
- Outbox `events`, `dead_letters`, and `consumer_offsets` tables exist with correct columns
- Migration files exist in `migrations/` directory and are reviewable SQL

---

## Phase 1.4 — BullMQ, Pino Logger, Error Types, Test Utils

**Folder:** `module-01-shared/phase-04-infrastructure/`

### TASKS.md

```
## Phase 1.4 Task List: BullMQ, Logger, Errors, Test Utils

### Redis + BullMQ Setup
[ ] 1.  Add Redis service to `docker-compose.yml`
[ ] 2.  Install `bullmq` and `ioredis` in `packages/shared`
[ ] 3.  Create `packages/shared/src/events/queue-factory.ts` — creates typed BullMQ queues
[ ] 4.  Create `packages/shared/src/events/outbox-writer.ts` — writes to outbox.events within a Drizzle transaction
[ ] 5.  Implement outbox writer: accepts db transaction context + event payload, writes atomically
[ ] 6.  Create `packages/shared/src/events/relay-worker.ts` — polls unpublished outbox events, pushes to BullMQ
[ ] 7.  Relay worker: uses `SELECT ... FOR UPDATE SKIP LOCKED` to avoid double-processing
[ ] 8.  Relay worker: marks events as published after successful BullMQ enqueue
[ ] 9.  Create in-memory event bus for Vitest tests (no Redis required in unit tests)
[ ] 10. Test: write event to outbox in a transaction, verify relay picks it up and enqueues to BullMQ

### Pino Logger
[ ] 11. Install `pino` and `pino-pretty` in `packages/shared`
[ ] 12. Create `packages/shared/src/logger/index.ts` with root logger factory
[ ] 13. Implement `AsyncLocalStorage` for correlation ID propagation
[ ] 14. Implement `createChildLogger(packageName)` for namespaced loggers
[ ] 15. Logger must include: correlationId, packageName, timestamp, level
[ ] 16. In test environment: use `pino-pretty` with minimal output
[ ] 17. In production: structured JSON output
[ ] 18. Test: verify correlationId threads through AsyncLocalStorage across async calls

### Error Types
[ ] 19. Create `packages/shared/src/errors/index.ts`
[ ] 20. Implement `NotFoundError` (maps to HTTP 404)
[ ] 21. Implement `ForbiddenError` (maps to HTTP 403)
[ ] 22. Implement `ValidationError` (maps to HTTP 400) with field-level details
[ ] 23. Implement `ConflictError` (maps to HTTP 409)
[ ] 24. Implement `InsufficientFundsError` (maps to HTTP 422) with walletId and requiredAmount
[ ] 25. Implement `UnauthorizedError` (maps to HTTP 401)
[ ] 26. Each error class: extends Error, has a `code` string, a `statusCode` number
[ ] 27. Create `mapErrorToHttp(error)` utility used by Fastify error handler

### Idempotency Utilities
[ ] 28. Create `packages/shared/src/idempotency/key-generator.ts`
[ ] 29. Implement `generateIdempotencyKey(prefix, ...parts)` — deterministic UUID from inputs
[ ] 30. Implement `checkIdempotency(db, key)` — returns existing result or null
[ ] 31. Implement `recordIdempotency(db, key, result)` — stores result atomically

### Test Utilities
[ ] 32. Install `vitest` as devDependency in `packages/shared`
[ ] 33. Create `packages/shared/src/test-utils/factories.ts`
[ ] 34. Implement `createTestUser(overrides?)` factory
[ ] 35. Implement `createTestWallet(overrides?)` factory
[ ] 36. Implement `createTestOrder(overrides?)` factory
[ ] 37. Create `packages/shared/src/test-utils/db.ts` — test DB helpers
[ ] 38. Implement `withTestTransaction(fn)` — wraps test in a rolled-back transaction
[ ] 39. Implement `seedTestDb(schemas)` — applies schemas and seeds minimal data
[ ] 40. Create `vitest.config.ts` at repo root with workspace support
[ ] 41. Run `pnpm vitest run` — all tests pass (empty test suite is fine here)
```

### Exit Criteria
- BullMQ queue factory creates typed queues backed by Redis
- Outbox writer correctly writes to outbox within a Drizzle transaction (verified by test)
- Relay worker picks up unpublished events and enqueues them to BullMQ (verified by test)
- Correlation ID threads through 3+ async hops via AsyncLocalStorage (test)
- All 6 error types exist with correct `statusCode` values
- `withTestTransaction` rolls back all DB writes after each test (verified by test)
- `pnpm vitest run` passes across the shared package

---

## Phase 1.5 — Fastify Application Shell

**Folder:** `module-01-shared/phase-05-api-shell/`

### TASKS.md

```
## Phase 1.5 Task List: Fastify API Shell

### Fastify Setup
[ ] 1.  Install `fastify`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/multipart` in `apps/api`
[ ] 2.  Create `apps/api/src/index.ts` — starts server on configured port
[ ] 3.  Create `apps/api/src/app.ts` — builds and configures Fastify instance
[ ] 4.  Register global error handler using `mapErrorToHttp` from shared errors
[ ] 5.  Register correlation ID hook: generates UUID on each request, stores in AsyncLocalStorage
[ ] 6.  Add request logging hook: logs method, path, correlationId on request + response
[ ] 7.  Register `@fastify/rate-limit` with Redis backend (200/min unauth, 600/min auth)
[ ] 8.  Create `apps/api/src/container.ts` — DI wiring placeholder (to be filled per module)
[ ] 9.  Create health check route: GET /health → `{ status: 'ok', timestamp: ... }`
[ ] 10. Test health check endpoint with curl or Vitest's inject()

### JSON Schema Validation
[ ] 11. Define Fastify schema conventions: all routes have request + response schemas
[ ] 12. Create `apps/api/src/schemas/common.ts` with shared Fastify schema fragments (pagination, money, error response)
[ ] 13. Add Ajv strict mode to Fastify config (unknown properties rejected by default)

### Rate Limiting
[ ] 14. Configure per-IP sliding window: 200/min unauthenticated
[ ] 15. Configure per-user token bucket: 300/min authenticated  
[ ] 16. Add stricter limits for sensitive endpoints (to be applied per-route): login 10/min, password reset 5/min, funding/withdrawal 20/min
[ ] 17. Verify rate limit returns HTTP 429 with `Retry-After` header

### DI Container Pattern
[ ] 18. Create `apps/api/src/container.ts` demonstrating the DI wiring pattern
[ ] 19. Document in comments: how to add a new package's services to the container
[ ] 20. Fastify decorates the request object with `req.container` giving access to injected services

### Workers Shell
[ ] 21. Create `apps/workers/src/index.ts` — starts BullMQ workers
[ ] 22. Register relay worker (from Phase 1.4) in the workers app
[ ] 23. Add graceful shutdown handler: flush pending BullMQ jobs, close DB connection
[ ] 24. Test: start workers process, verify it connects to Redis and logs startup

### Environment Config
[ ] 25. Install `zod` in `packages/shared`
[ ] 26. Create `packages/shared/src/config/env.ts` with Zod schema for all env vars
[ ] 27. Env vars: DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV, PORT, LOG_LEVEL
[ ] 28. App fails fast with clear error if any required env var is missing
[ ] 29. Test: start app without DATABASE_URL — expect clear error message, not stack trace
```

### Exit Criteria
- `GET /health` returns `200 { status: 'ok' }` with < 50ms response time
- Correlation ID appears in all log lines for a single request
- Rate limiter correctly 429s after limit is exceeded (test with hey or similar)
- Missing env var causes immediate process exit with descriptive error
- `pnpm dev` starts API + workers with hot reload

---

---

# MODULE 2: Auth

**Folder:** `module-02-auth/`
**Package:** `packages/auth`
**Depends on:** Module 1 complete
**No business dependencies.** Auth only consumes shared infrastructure.

---

## Phase 2.1 — Auth Schema & Database Layer

**Folder:** `module-02-auth/phase-01-schema/`

### TASKS.md

```
## Phase 2.1 Task List: Auth Schema & Database Layer

### Schema Definition
[ ] 1.  Create `packages/auth/src/schema.ts`
[ ] 2.  Define `auth.users` table: id (UUID PK), email (unique), phone (unique, nullable), passwordHash, emailVerified, phoneVerified, status (active/suspended/banned), createdAt, updatedAt
[ ] 3.  Define `auth.sessions` table: id (UUID PK), userId (FK), deviceInfo (JSON), expiresAt, revokedAt, createdAt
[ ] 4.  Define `auth.tokens` table: id (UUID PK), userId (FK), type (email_verify/password_reset/refresh), token (unique), expiresAt, usedAt, createdAt
[ ] 5.  Define `auth.invite_codes` table: id (UUID PK), inviterId (FK → users), code (unique), maxUses, usedCount, expiresAt, createdAt
[ ] 6.  Define `auth.referrals` table: id (UUID PK), inviteCodeId (FK), inviterId (FK → users), inviteeId (FK → users), status (pending/approved/rejected), createdAt
[ ] 7.  Define `auth.referral_approvals` table: id (UUID PK), referralId (FK), adminId (FK → users), action (approved/rejected), reason, createdAt
[ ] 8.  Define `auth.kyc_documents` table: id (UUID PK), userId (FK), docType (NIN/drivers_license/passport/voters_card), frontUrl, backUrl (nullable), status, submittedAt, reviewedAt
[ ] 9.  Define `auth.verifications` table: id (UUID PK), userId (FK), status (pending/provisional/verified/rejected/expired), method (automated/manual), grantedBy (FK → users, nullable), expiresAt (nullable for provisional), createdAt, updatedAt
[ ] 10. Define `auth.member_tiers` table: id, userId (FK), tier (free/verified/pro), changedBy, reason, createdAt
[ ] 11. Define `auth.badges` table: id, userId (FK), badgeType (verified/founding_member/pro), issuedBy (FK → users), revokedAt, createdAt
[ ] 12. Add all necessary indexes: userId lookups, code lookups, status filters
[ ] 13. Generate Drizzle migration for auth schema
[ ] 14. Run migration and verify tables in PostgreSQL

### Repository Layer
[ ] 15. Create `packages/auth/src/repositories/users.ts`
[ ] 16. Implement: findById, findByEmail, findByPhone, create, updateStatus, updatePassword
[ ] 17. Create `packages/auth/src/repositories/sessions.ts`
[ ] 18. Implement: create, findById, revokeById, revokeAllForUser, findActiveByUser
[ ] 19. Create `packages/auth/src/repositories/tokens.ts`
[ ] 20. Implement: create, findByToken, markUsed, deleteExpired
[ ] 21. Create `packages/auth/src/repositories/invite-codes.ts`
[ ] 22. Implement: create, findByCode, incrementUsage, getByInviter
[ ] 23. Create `packages/auth/src/repositories/referrals.ts`
[ ] 24. Implement: create, findById, findByInvitee, updateStatus, countBannedReferrals
[ ] 25. Create `packages/auth/src/repositories/verifications.ts`
[ ] 26. Implement: create, findByUserId, updateStatus, findExpiredProvisional
[ ] 27. Create `packages/auth/src/repositories/tiers.ts`
[ ] 28. Implement: getCurrentTier, setTier, getHistory
```

### Exit Criteria
- All 10 auth tables exist in PostgreSQL with correct columns and constraints
- Each repository method is tested with `withTestTransaction` (rolls back after each test)
- UNIQUE constraints correctly reject duplicate emails/phones/codes
- FK constraints correctly prevent orphaned records
- `drizzle-kit generate` produces clean, reviewable SQL migration files

---

## Phase 2.2 — Registration, Login, Sessions

**Folder:** `module-02-auth/phase-02-registration-login/`

### TASKS.md

```
## Phase 2.2 Task List: Registration, Login, Sessions

### Password Hashing
[ ] 1.  Install `argon2` in `packages/auth`
[ ] 2.  Create `packages/auth/src/password.ts`
[ ] 3.  Implement `hashPassword(plaintext)` using argon2 with adaptive cost config
[ ] 4.  Implement `verifyPassword(plaintext, hash)` returning boolean
[ ] 5.  Test: same plaintext produces different hashes (salt); correct password verifies; wrong password rejects

### JWT + Sessions
[ ] 6.  Install `jose` in `packages/auth`
[ ] 7.  Create `packages/auth/src/session.ts`
[ ] 8.  Implement `issueAccessToken(userId, tier)` — short-lived JWT (15 min)
[ ] 9.  Implement `issueRefreshToken(sessionId)` — long-lived JWT (30 days)
[ ] 10. Implement `verifyAccessToken(token)` — validates signature + expiry, returns claims
[ ] 11. Implement `verifyRefreshToken(token)` — validates signature + expiry, returns sessionId
[ ] 12. Implement `refreshSession(refreshToken)` — issues new access token, rotates refresh token
[ ] 13. Implement `revokeSession(sessionId)` — marks session as revoked in DB
[ ] 14. Test: issued token is valid; expired token is rejected; revoked session cannot refresh

### Registration Flow
[ ] 15. Create `packages/auth/src/registration.ts`
[ ] 16. Implement `register({ inviteCode, email, password })` function
[ ] 17. Step 1: Validate invite code exists, is not exhausted, is not expired
[ ] 18. Step 2: Check email is not already registered
[ ] 19. Step 3: Hash password with argon2
[ ] 20. Step 4: Create user record (status = pending_approval)
[ ] 21. Step 5: Increment invite code usage count
[ ] 22. Step 6: Create referral record linking invitee to inviter
[ ] 23. Step 7: Write `auth.user.registered` event to outbox (same transaction as user creation)
[ ] 24. Return: user ID and confirmation that approval is pending
[ ] 25. Test: successful registration creates user + referral + outbox event atomically
[ ] 26. Test: invalid invite code rejected
[ ] 27. Test: duplicate email rejected
[ ] 28. Test: outbox event is NOT written if user creation fails (atomicity)

### Login Flow
[ ] 29. Create `packages/auth/src/login.ts`
[ ] 30. Implement `login({ email, password, deviceInfo })` function
[ ] 31. Validate: user exists, is not suspended/banned
[ ] 32. Validate: user's email is verified OR admin has approved
[ ] 33. Verify: password with argon2
[ ] 34. On success: create session, issue access + refresh tokens
[ ] 35. On failure: DO NOT enumerate which field was wrong (return generic error)
[ ] 36. Test: correct credentials return tokens
[ ] 37. Test: wrong password returns same error as wrong email (no enumeration)
[ ] 38. Test: suspended user cannot login
[ ] 39. Test: account with 5 failed attempts is rate-limited (test with the mock clock)

### OAuth (Social Login)
[ ] 40. Install `arctic` in `packages/auth`
[ ] 41. Create `packages/auth/src/oauth.ts` with Google adapter
[ ] 42. Implement `getOAuthRedirectUrl(provider, state)` — returns provider auth URL
[ ] 43. Implement `handleOAuthCallback(provider, code, state)` — exchanges code for user info
[ ] 44. If user exists (email match): log in and return tokens
[ ] 45. If user is new: require invite code in state parameter (social + invite required)
[ ] 46. Test: OAuth callback with known email logs in; unknown email without invite code rejects

### Fastify Routes
[ ] 47. Create `packages/auth/src/routes.ts` — Fastify plugin
[ ] 48. POST /auth/register — schema-validated, calls registration.ts
[ ] 49. POST /auth/login — schema-validated, calls login.ts
[ ] 50. POST /auth/refresh — validates refresh token, issues new access token
[ ] 51. POST /auth/logout — revokes session
[ ] 52. GET /auth/oauth/:provider — redirect to provider
[ ] 53. GET /auth/oauth/:provider/callback — handle callback
[ ] 54. Register routes plugin in `apps/api/src/container.ts`
[ ] 55. Integration test: POST /auth/login with Fastify inject() returns tokens
```

### Exit Criteria
- `POST /auth/register` with valid invite code creates user in pending_approval state and writes outbox event
- `POST /auth/login` with correct credentials returns access + refresh tokens
- `POST /auth/refresh` with valid refresh token issues new access token
- `POST /auth/logout` revokes the session
- Wrong password returns HTTP 401 — no enumeration of which field failed
- Suspended user cannot login (HTTP 403)
- All tests pass: `pnpm vitest run --project auth`

---

## Phase 2.3 — Invites, Referrals, KYC, Tiers

**Folder:** `module-02-auth/phase-03-invites-kyc-tiers/`

### TASKS.md

```
## Phase 2.3 Task List: Invites, Referrals, KYC, Tiers

### Invite System
[ ] 1.  Create `packages/auth/src/invites.ts`
[ ] 2.  Implement `generateInvite(userId)` — creates invite code with tier-based limit check
[ ] 3.  Tier limits: Free = 1 invite, Verified = 3 invites, Pro = 10 invites
[ ] 4.  Invite limits are read from platform settings (configurable), not hardcoded
[ ] 5.  Implement `listInvites(userId)` — returns all codes with usage status
[ ] 6.  Implement `validateInvite(code)` — check validity without consuming
[ ] 7.  Test: member at tier limit cannot generate more invites
[ ] 8.  Test: generating invite within limit creates code in DB
[ ] 9.  Test: invite limits use platform settings (mock settings to change limits)

### Referral Accountability
[ ] 10. Create `packages/auth/src/referrals.ts`
[ ] 11. Implement `getReferralChain(userId)` — walks up the tree
[ ] 12. Implement `getReferralsByInviter(userId)` — list of who this member has referred
[ ] 13. Implement `checkAccountability(inviterId)` — counts banned/suspended referrals
[ ] 14. If count >= 3: auto-reduce invite allocation (halve, minimum 1)
[ ] 15. If count >= 5: flag inviter for admin review
[ ] 16. Implement `handleReferralBanned(inviteeId)` — triggered when referree is banned
[ ] 17. Test: inviter with 3 banned referees has invite limit halved
[ ] 18. Test: inviter with 5 banned referees is flagged for review

### Admin Approval Queue
[ ] 19. Create `packages/auth/src/approval.ts`
[ ] 20. Implement `getPendingApprovals()` — list of users awaiting approval
[ ] 21. Implement `approveUser(userId, adminId, grantProvisional?)` — approves registration
[ ] 22. On approval: set user status to active, optionally grant provisional verification
[ ] 23. Implement `rejectUser(userId, adminId, reason)` — rejects registration
[ ] 24. On rejection: set user status to rejected, write notification event to outbox
[ ] 25. Write `auth.referral.approved` event to outbox on approval
[ ] 26. Test: admin can approve/reject; outbox event written on approval

### KYC / Identity Verification
[ ] 27. Create `packages/auth/src/verification.ts`
[ ] 28. Implement `submitVerification(userId, docs)` — stores document references (S3 URLs), creates pending verification
[ ] 29. Implement `grantProvisionalVerification(userId, adminId)` — creates provisional verification with 90-day expiry
[ ] 30. Implement `checkExpiredProvisional()` — BullMQ job finds expired provisional, downgrades tier, queues notification
[ ] 31. Implement `verifyIdentity(userId, providerResult)` — processes third-party KYC result
[ ] 32. On success: create verified verification record, upgrade tier to Verified
[ ] 33. On failure: store failure reason, notify user with retry guidance
[ ] 34. Test: provisional verification expires after 90 days (use mock clock)
[ ] 35. Test: successful KYC upgrades tier to Verified

### Tier Management
[ ] 36. Create `packages/auth/src/tiers.ts`
[ ] 37. Implement `getTier(userId)` — returns current MemberTier
[ ] 38. Implement `checkProUpgrade(userId)` — checks if member meets Pro criteria (5+ transactions, 4.2+ rating)
[ ] 39. Pro criteria are read from platform settings (configurable thresholds)
[ ] 40. Implement `upgradeTierToProIfEligible(userId)` — atomically upgrades if criteria met
[ ] 41. Implement `setTier(userId, tier, adminId, reason)` — admin override
[ ] 42. Write `finance.threshold.reached` event to outbox when Pro threshold crossed
[ ] 43. Test: member with 5 transactions and 4.2 rating is upgraded to Pro
[ ] 44. Test: member with 4 transactions is NOT upgraded (threshold not met)
[ ] 45. Test: tier upgrade is idempotent (calling twice doesn't create duplicate log entries)

### Badges
[ ] 46. Create `packages/auth/src/badges.ts`
[ ] 47. Implement `issueBadge(userId, badgeType, adminId)` — creates badge record
[ ] 48. Implement `revokeBadge(userId, badgeType, adminId)` — soft-deletes badge
[ ] 49. Implement `getBadges(userId)` — returns active badges
[ ] 50. Test: issue and revoke badge; revoked badge not returned by getBadges

### Public Interface Implementation
[ ] 51. Create `packages/auth/src/interfaces.ts` implementing IAuthService, IReferralService, IIdentityService from contracts
[ ] 52. Each interface method calls the appropriate internal function
[ ] 53. Create `packages/auth/src/index.ts` re-exporting public surface only
[ ] 54. Register auth routes and services in `apps/api/src/container.ts`
```

### Exit Criteria
- Invite generation enforces tier-based limits from platform settings
- Admin can approve a user with optional provisional verification
- Provisional verification expires correctly after 90 days (tested with mock clock)
- Pro tier auto-upgrade fires when both criteria are met (5+ transactions AND 4.2+ rating)
- All IAuthService, IReferralService, and IIdentityService methods are implemented and tested
- Full auth flow integration test: register → admin approve → login → get tier
- `pnpm vitest run --project auth` — all tests pass

---

---

# MODULE 3: Finance

**Folder:** `module-03-finance/`
**Package:** `packages/finance`
**Depends on:** Module 1 complete, `auth.user.registered` event schema
**Build and stress-test this early. Money handling — get it right before anything else depends on it.**

---

## Phase 3.1 — Finance Schema & Wallet Foundation

**Folder:** `module-03-finance/phase-01-schema-wallet/`

### TASKS.md

```
## Phase 3.1 Task List: Finance Schema & Wallet Foundation

### Schema Definition
[ ] 1.  Create `packages/finance/src/schema.ts`
[ ] 2.  Define `finance.wallets` table: id (UUID PK), userId (UUID unique), availableBalance (integer, default 0), lockedBalance (integer, default 0), currency (text, default 'NGN'), createdAt, updatedAt
[ ] 3.  All balances stored in kobo (integer). ₦1 = 100 kobo. No decimals.
[ ] 4.  Define `finance.ledger_entries` table: id (auto-increment), walletId (FK), entryType (credit/debit), amount (integer > 0), balanceAfter (integer), reference (text), idempotencyKey (unique), createdAt
[ ] 5.  Define `finance.funding_requests` table: id (UUID PK), walletId (FK), amount, paystackReference (unique), status (pending/completed/failed), createdAt, updatedAt
[ ] 6.  Define `finance.funding_webhooks` table: id (UUID PK), paystackReference (unique), payload (JSONB), processedAt
[ ] 7.  Define `finance.withdrawal_requests` table: id (UUID PK), walletId (FK), amount, bankDetails (JSONB), paystackTransferId (unique, nullable), status (pending/processing/completed/failed), createdAt, updatedAt
[ ] 8.  Define `finance.escrow_agreements` table: id (UUID PK), orderId (UUID unique), clientWalletId (FK), providerWalletId (FK), totalAmount, platformFee, status (pending/funded/active/released/refunded/disputed), createdAt, updatedAt
[ ] 9.  Define `finance.escrow_milestones` table: id (UUID PK), escrowId (FK), amount, description, status (pending/submitted/approved/released/refunded), sequence, createdAt, updatedAt
[ ] 10. Define `finance.escrow_releases` table: id (UUID PK), escrowId (FK), milestoneId (FK, nullable), amount, releaseType (milestone/full/partial_refund), idempotencyKey (unique), createdAt
[ ] 11. Define `finance.reviews` table: id (UUID PK), orderId (UUID unique per reviewer/reviewee pair), reviewerId (UUID), revieweeId (UUID), rating (1-5), body (text), windowOpenedAt, submittedAt, createdAt
[ ] 12. Define `finance.reputation_scores` table: id (UUID PK), userId (UUID unique), score (numeric 1-5, nullable), reviewCount, lastCalculatedAt
[ ] 13. Define `finance.reputation_history` table: id, userId (FK), score, trigger (review submitted), createdAt
[ ] 14. Add indexes: walletId on ledger, escrowId on milestones, userId on reputation
[ ] 15. Add CHECK constraint on ledger: `amount > 0`
[ ] 16. Add CHECK constraint on ledger: `entry_type IN ('credit', 'debit')`
[ ] 17. Generate migration and run — verify all tables created
[ ] 18. Verify `idempotencyKey` UNIQUE constraint on ledger_entries

### Wallet Repository
[ ] 19. Create `packages/finance/src/repositories/wallets.ts`
[ ] 20. Implement `create(userId)` — creates zero-balance wallet
[ ] 21. Implement `findByUserId(userId)` — returns wallet or throws NotFoundError
[ ] 22. Implement `getBalance(userId)` — returns `{ available, locked }` in kobo
[ ] 23. Implement `atomicDebit(walletId, amount, idempotencyKey)` — raw SQL conditional update
[ ] 24. The atomic debit: `UPDATE wallets SET available_balance = available_balance - $amount WHERE id = $id AND available_balance >= $amount RETURNING available_balance`
[ ] 25. If zero rows returned: throw InsufficientFundsError
[ ] 26. Implement `atomicCredit(walletId, amount, idempotencyKey)` — adds to available_balance
[ ] 27. Implement `lockFunds(walletId, amount)` — moves from available to locked (for escrow)
[ ] 28. Implement `unlockFunds(walletId, amount)` — moves from locked to available (for refund)

### Ledger Repository
[ ] 29. Create `packages/finance/src/repositories/ledger.ts`
[ ] 30. Implement `recordEntry(tx, { walletId, entryType, amount, balanceAfter, reference, idempotencyKey })`
[ ] 31. Implement `getEntriesForWallet(walletId, page)` — paginated history
[ ] 32. Implement `verifyBalance(walletId)` — recalculates from ledger sum, compares to wallet.availableBalance
[ ] 33. verifyBalance returns `{ calculated, stored, drift, isConsistent }` — used by reconciliation job
[ ] 34. Test: record credit, record debit, verify balance == credits - debits

### Concurrency Testing
[ ] 35. Write test: 50 concurrent debits of ₦100 from a wallet with ₦4,000 balance
[ ] 36. Expected: exactly 40 debits succeed, 10 fail with InsufficientFundsError
[ ] 37. Expected: final balance is exactly ₦0 (no double-spend)
[ ] 38. Expected: ledger has exactly 40 credit entries totalling ₦4,000
[ ] 39. Run this test 5 times to verify determinism
```

### Exit Criteria
- All 11 finance tables exist with correct constraints
- Atomic debit correctly rejects when balance is insufficient (zero rows returned)
- 50 concurrent debits test: exactly 40 succeed, final balance is zero, no double-spend — passes 5/5 runs
- `verifyBalance` detects a manually introduced inconsistency (test by directly updating wallet.availableBalance)
- Migration files are clean SQL, ledger CHECK constraints verified

---

## Phase 3.2 — Paystack Integration & Funding

**Folder:** `module-03-finance/phase-02-paystack/`

### TASKS.md

```
## Phase 3.2 Task List: Paystack Integration & Funding

### Paystack Gateway Adapter
[ ] 1.  Create `packages/finance/src/gateway.ts`
[ ] 2.  Implement `initializePayment({ email, amount, reference, callbackUrl })` — Paystack Initialize Transaction API
[ ] 3.  Implement `verifyPayment(reference)` — Paystack Verify Transaction API
[ ] 4.  Implement `verifyWebhookSignature(payload, signature, secret)` — HMAC-SHA512 verification
[ ] 5.  Implement `initiateTransfer({ amount, bankCode, accountNumber, reference, reason })` — Paystack Transfer API
[ ] 6.  Implement `verifyTransfer(transferCode)` — check transfer status
[ ] 7.  All Paystack calls: typed with request/response interfaces from contracts
[ ] 8.  All Paystack calls: structured error handling (Paystack errors wrapped in typed errors)
[ ] 9.  Create mock Paystack adapter for tests (implements same interface)
[ ] 10. Test: payment initialization returns authorization_url; payment verification returns status

### Wallet Funding Flow
[ ] 11. Create `packages/finance/src/funding.ts`
[ ] 12. Implement `initiateFunding(userId, amount)` — creates funding request, calls Paystack, returns checkout URL
[ ] 13. Generate unique Paystack reference: `vvs-fund-{userId}-{timestamp}`
[ ] 14. Implement `handlePaystackWebhook(payload, signature)` — processes charge.success event
[ ] 15. Webhook handler Step 1: Verify HMAC signature — reject if invalid
[ ] 16. Webhook handler Step 2: Check idempotency — if funding_webhooks has this reference, return 200 immediately
[ ] 17. Webhook handler Step 3: Find funding request by reference — reject if not found
[ ] 18. Webhook handler Step 4: Start Drizzle transaction
[ ] 19. Webhook handler Step 5: Insert into funding_webhooks (unique constraint is safety net)
[ ] 20. Webhook handler Step 6: Credit wallet via atomicCredit
[ ] 21. Webhook handler Step 7: Record ledger entry
[ ] 22. Webhook handler Step 8: Write `finance.wallet.funded` event to outbox
[ ] 23. Webhook handler Step 9: Commit transaction
[ ] 24. Test: same webhook payload processed 10 times → exactly 1 credit to wallet
[ ] 25. Test: webhook with invalid signature → rejected (HTTP 400)
[ ] 26. Test: successful webhook credits wallet and writes outbox event atomically

### Withdrawal Flow
[ ] 27. Create `packages/finance/src/withdrawals.ts`
[ ] 28. Implement `requestWithdrawal(userId, amount, bankDetails)` — validates balance, creates pending withdrawal
[ ] 29. Implement `processWithdrawal(withdrawalId)` — BullMQ job: calls Paystack Transfer API
[ ] 30. Implement `handleTransferWebhook(payload)` — processes transfer.success and transfer.failed events
[ ] 31. On transfer.success: mark withdrawal completed, write `finance.withdrawal.completed` event
[ ] 32. On transfer.failed: mark withdrawal failed, notify user, release funds
[ ] 33. Test: withdrawal deducts from available balance, marks locked
[ ] 34. Test: withdrawal amount exceeds balance → InsufficientFundsError

### Routes
[ ] 35. Create `packages/finance/src/routes.ts`
[ ] 36. POST /finance/fund — auth required, initiates Paystack checkout
[ ] 37. POST /finance/webhooks/paystack — no auth (verified by signature), handles Paystack callbacks
[ ] 38. POST /finance/withdraw — auth required, Verified+ tier only
[ ] 39. GET /finance/wallet — auth required, returns balance + transaction history
[ ] 40. Register routes in api container
```

### Exit Criteria
- Paystack webhook replayed 10 times credits wallet exactly once (idempotency test passes)
- Invalid signature on webhook returns 400 and does NOT credit wallet
- Successful funding writes outbox event in same transaction as wallet credit (atomicity test)
- Withdrawal correctly deducts available balance and marks locked
- All tests pass with mock Paystack adapter

---

## Phase 3.3 — Escrow System

**Folder:** `module-03-finance/phase-03-escrow/`

### TASKS.md

```
## Phase 3.3 Task List: Escrow System

### Escrow Service
[ ] 1.  Create `packages/finance/src/escrow.ts`
[ ] 2.  Implement `create({ orderId, clientUserId, providerUserId, totalAmount, platformFeeRate })` — creates escrow agreement in pending state
[ ] 3.  Calculate platform fee: `Math.round(totalAmount * platformFeeRate)`, minimum 500 kobo
[ ] 4.  Implement `markFunded(agreementId, idempotencyKey)` — transitions escrow to funded state
[ ] 5.  On markFunded: atomically debit client wallet, lock funds in escrow (ledger entries)
[ ] 6.  Implement `releaseFull(agreementId, idempotencyKey)` — releases full escrow to provider
[ ] 7.  On releaseFull: deduct platform fee, credit provider wallet, record platform fee ledger entry, transition to released
[ ] 8.  Implement `refundFull(agreementId, idempotencyKey)` — refunds full escrow to client
[ ] 9.  On refundFull: release locked funds back to client available balance, transition to refunded
[ ] 10. Implement `refundPartial(agreementId, providerAmount, clientAmount, idempotencyKey)` — dispute split
[ ] 11. Implement `dispute(agreementId, reason)` — freezes escrow, transitions to disputed
[ ] 12. Implement `cancel(agreementId, reason)` — cancels escrow, full refund to client
[ ] 13. All escrow state transitions write outbox events atomically
[ ] 14. Test: create → markFunded → releaseFull — verify wallet balances before and after
[ ] 15. Test: platform fee deducted correctly on release (7.5% of total)
[ ] 16. Test: cancel → refund — client balance restored to exact pre-order amount
[ ] 17. Test: dispute transition freezes escrow (dispute → attempt to release → rejected)

### Escrow Lifecycle Tests
[ ] 18. Full happy path test: create escrow → fund → mark active → release → verify provider wallet increased
[ ] 19. Full cancellation test: create → fund → cancel → verify client balance fully restored
[ ] 20. Dispute + partial resolution: create → fund → dispute → partial (60/40) → verify both balances
[ ] 21. Fee calculation test: ₦100,000 order → provider receives ₦92,500, platform gets ₦7,500
[ ] 22. Minimum fee test: ₦5,000 order → platform fee is ₦500 (minimum), provider gets ₦4,500

### Ratings & Reputation
[ ] 23. Create `packages/finance/src/reviews.ts`
[ ] 24. Implement `submitReview({ orderId, reviewerId, revieweeId, rating, body })` — creates review
[ ] 25. Validate: review window is open (order completed < 14 days ago)
[ ] 26. Validate: reviewer was a participant in this order
[ ] 27. Validate: reviewer hasn't already reviewed this order (unique per orderId+reviewerId)
[ ] 28. Write `finance.review.submitted` event to outbox after submission
[ ] 29. Create `packages/finance/src/scoring.ts`
[ ] 30. Implement `calculateScore(userId)` — at launch: simple arithmetic mean of all ratings
[ ] 31. Minimum 3 reviews required before score is returned (return null below threshold)
[ ] 32. Implement `updateReputationScore(userId)` — called after each new review
[ ] 33. After update: check if Pro threshold met, if so write `finance.threshold.reached` event
[ ] 34. Create `packages/finance/src/thresholds.ts`
[ ] 35. Implement `checkProThreshold(userId, currentScore, transactionCount)` — reads thresholds from platform settings
[ ] 36. Test: member with < 3 reviews returns null score
[ ] 37. Test: member with 3 reviews returns correct average
[ ] 38. Test: Pro threshold event fires when score and transaction count both met

### Public Interface Implementation
[ ] 39. Implement IWalletService from contracts in `packages/finance/src/interfaces.ts`
[ ] 40. Implement IEscrowService from contracts
[ ] 41. Implement IRatingsService from contracts
[ ] 42. Create `packages/finance/src/index.ts` — exports only public surface
[ ] 43. Register finance services in `apps/api/src/container.ts`

### Reconciliation Job
[ ] 44. Create `apps/workers/src/jobs/finance-reconciliation.ts`
[ ] 45. BullMQ repeatable job runs daily
[ ] 46. For each wallet: run `verifyBalance(walletId)`, log drift
[ ] 47. If drift exceeds 5% of records: fire alert (log at error level + write to outbox)
[ ] 48. Test: introduce manual drift in wallet balance → reconciliation detects it
```

### Exit Criteria
- Escrow full lifecycle (create → fund → release) verified with correct balance changes at each step
- 50 concurrent wallet operations during escrow: no double-spend, balances consistent
- Platform fee correctly deducted (7.5%), minimum ₦500 enforced
- Reputation score returns null below 3 reviews, correct average above threshold
- IWalletService, IEscrowService, IRatingsService all implemented and tested
- Reconciliation job detects manually introduced drift

---

---

# MODULE 4: Members

**Folder:** `module-04-members/`
**Package:** `packages/members`

---

## Phase 4.1 — Members Schema & Profile CRUD

**Folder:** `module-04-members/phase-01-schema-profiles/`

### TASKS.md

```
## Phase 4.1 Task List: Members Schema & Profiles

### Schema
[ ] 1.  Create `packages/members/src/schema.ts`
[ ] 2.  Define `members.profiles` table: id (UUID PK), userId (UUID unique FK), displayName, bio (text), profession, primaryCategory, skills (text[]), locationCity, locationCountry, profilePhotoUrl, availabilityStatus (available/busy/not_taking_work), isPublic (boolean), createdAt, updatedAt
[ ] 3.  Define `members.profile_categories` reference table: id, name, slug, parentCategoryId (self-ref, nullable), isActive
[ ] 4.  Define `members.profile_availability` table: id (UUID PK), userId (UUID unique), status, updatedAt (for change tracking)
[ ] 5.  Define `members.portfolio_items` table: id (UUID PK), userId (FK), title, description (text), tags (text[]), isPublished (boolean), createdAt, updatedAt
[ ] 6.  Define `members.portfolio_media` table: id (UUID PK), portfolioItemId (FK), url, thumbnailUrl, mediaType (image/video), displayOrder, createdAt
[ ] 7.  Define `members.case_studies` table: id (UUID PK), portfolioItemId (FK, nullable), userId (FK), challenge (text), approach (text), outcome (text), metrics (text), isPublished (boolean), createdAt, updatedAt
[ ] 8.  Define `members.collaborators` table: id (UUID PK), portfolioItemId (FK), collaboratorUserId (FK → users), confirmedAt (nullable), rejectedAt (nullable), createdAt
[ ] 9.  Add full-text search column to profiles: `searchVector tsvector` generated column from bio + profession + skills
[ ] 10. Add GIN index on searchVector column
[ ] 11. Generate migration and run

### Profile Repository
[ ] 12. Create `packages/members/src/repositories/profiles.ts`
[ ] 13. Implement `create(userId, data)` — creates profile from auth.user.registered event
[ ] 14. Implement `update(userId, data)` — partial update
[ ] 15. Implement `findByUserId(userId)` — returns profile or NotFoundError
[ ] 16. Implement `findPublicByUsername(username)` — public profile lookup
[ ] 17. Implement `search(query, filters, page)` — full-text search with filters (category, availability, minReputation)
[ ] 18. Search: order by relevance first, then availability, then reputation (spec ranking order)
[ ] 19. Test: create, update, and retrieve profile
[ ] 20. Test: search by profession finds correct members
[ ] 21. Test: filter by availability returns only available members

### Profile Service
[ ] 22. Create `packages/members/src/profiles.ts`
[ ] 23. Implement `createProfile(userId)` — called when auth.user.registered event consumed
[ ] 24. Implement `updateProfile(userId, input)` — validates + updates
[ ] 25. Implement `getProfile(userId)` — returns full profile
[ ] 26. Implement `searchProfiles(query)` — delegates to repository
[ ] 27. Create event consumer: listens for `auth.user.registered`, scaffolds empty profile
[ ] 28. Create event consumer: listens for `auth.identity.verified`, updates badge display
[ ] 29. Test: auth.user.registered event consumed → profile created automatically
[ ] 30. Test: auth.identity.verified event → badge updated on profile

### Portfolio Service
[ ] 31. Create `packages/members/src/portfolio.ts`
[ ] 32. Implement `createItem(userId, input)` — creates portfolio item with media
[ ] 33. Implement `publishItem(itemId, userId)` — publishes, writes `members.portfolio.published` event to outbox
[ ] 34. Implement `unpublishItem(itemId, userId)` — hides from public view
[ ] 35. Implement `getItems(userId, page)` — paginated portfolio items
[ ] 36. Implement `deleteItem(itemId, userId)` — soft delete

### Media Service (S3 stub)
[ ] 37. Create `packages/members/src/media.ts`
[ ] 38. Implement `generateUploadUrl(userId, filename, mimeType)` — returns pre-signed S3 URL
[ ] 39. Implement `confirmUpload(userId, key)` — verifies file exists in S3, generates thumbnail job
[ ] 40. Implement `deleteMedia(key)` — removes from S3
[ ] 41. Create mock S3 adapter for tests

### Routes
[ ] 42. Create `packages/members/src/routes.ts`
[ ] 43. GET /members/me — own profile
[ ] 44. PATCH /members/me — update own profile
[ ] 45. GET /members/:userId — public profile (read-only)
[ ] 46. GET /members/search — full-text search
[ ] 47. POST /members/portfolio — create portfolio item
[ ] 48. GET /members/:userId/portfolio — list portfolio items
[ ] 49. POST /members/portfolio/:itemId/publish — publish portfolio item
[ ] 50. POST /members/media/upload-url — get pre-signed upload URL
[ ] 51. Register routes in api container

### Public Interface Implementation
[ ] 52. Implement IProfileService from contracts
[ ] 53. Implement IPortfolioService from contracts
[ ] 54. Create `packages/members/src/index.ts` exporting public surface
```

### Exit Criteria
- `auth.user.registered` event automatically creates an empty profile (consumer tested end-to-end)
- Full-text search returns relevant profiles for skill/profession queries
- Profile search correctly filters by availability and minimum reputation
- Media upload URL generation works (with mock S3)
- IProfileService and IPortfolioService fully implemented and tested

---

---

# MODULE 5: Marketplace

**Folder:** `module-05-marketplace/`
**Package:** `packages/marketplace`
**Depends on:** Finance (IWalletService, IEscrowService), Auth (IIdentityService)
**Highest-complexity module. The order saga is the most critical piece.**

---

## Phase 5.1 — Marketplace Schema & Listings

**Folder:** `module-05-marketplace/phase-01-schema-listings/`

### TASKS.md

```
## Phase 5.1 Task List: Marketplace Schema & Listings

### Schema
[ ] 1.  Create `packages/marketplace/src/schema.ts`
[ ] 2.  Define `marketplace.listings` table: id (UUID PK), providerId (UUID FK), title, description (text), category, pricingModel (fixed/hourly/project), status (draft/active/paused/removed), responseTimeAvg (integer, minutes), createdAt, updatedAt
[ ] 3.  Add full-text search column: searchVector generated from title + description + category
[ ] 4.  Add GIN index on searchVector
[ ] 5.  Define `marketplace.pricing_tiers` table: id (UUID PK), listingId (FK), tierName (basic/standard/premium), price (integer kobo), deliverables (text), estimatedDays (integer), displayOrder
[ ] 6.  Define `marketplace.orders` table: id (UUID PK), listingId (FK), clientId (UUID), providerId (UUID), selectedTierId (FK), amount (integer kobo), status (see state machine), correlationId (text), createdAt, updatedAt
[ ] 7.  Define `marketplace.order_state_log` table: id (auto-increment), orderId (FK), fromStatus, toStatus, actorId (UUID nullable), reason (text), metadata (JSONB), correlationId, createdAt
[ ] 8.  Partition order_state_log by month (declarative partitioning on createdAt)
[ ] 9.  Define `marketplace.deliverables` table: id (UUID PK), orderId (FK), uploadedBy (UUID), fileUrl, fileName, fileSize, version (integer), notes (text), status (submitted/accepted/rejected), uploadedAt
[ ] 10. Define `marketplace.verification_cache` table: id (UUID PK), userId (UUID unique), tier, verificationStatus, lastSyncedAt
[ ] 11. Define `marketplace.revision_requests` table: id (UUID PK), orderId (FK), requestedBy (UUID), notes (text), specificFiles (text[]), createdAt
[ ] 12. Generate migration and run

### Order State Machine
[ ] 13. Create `packages/marketplace/src/orders.ts`
[ ] 14. Implement the full order state machine as a TypeScript class with explicit transitions
[ ] 15. Valid transitions: draft→accepted, draft→declined, accepted→pending_funding, pending_funding→funded, funded→in_progress, in_progress→delivered, delivered→pending_approval, pending_approval→completed, completed→rated
[ ] 16. Dispute branch: any funded state → disputed → resolved_released | resolved_refunded | resolved_partial
[ ] 17. Cancellation branch: any state before in_progress → cancelled → refunded
[ ] 18. Each transition: validates current state, logs to order_state_log, updates order.status
[ ] 19. Implement `transitionOrder(orderId, newStatus, actorId, reason, metadata)` — atomic with log
[ ] 20. Invalid transitions must throw ValidationError with clear message
[ ] 21. Test: every valid transition from every state
[ ] 22. Test: every invalid transition is rejected with clear error
[ ] 23. Test: transition log has correct entry after each state change

### Listing CRUD
[ ] 24. Create `packages/marketplace/src/listings.ts`
[ ] 25. Implement `createListing(userId, input)` — calls IIdentityService.getTier() first (LIVE call, never cached)
[ ] 26. If tier is Free: throw ForbiddenError — only Verified+ can list
[ ] 27. If tier is revoked after listing creation: createListing blocks immediately (read-time check, not cache)
[ ] 28. Implement `updateListing(userId, listingId, input)` — owner only
[ ] 29. Implement `pauseListing(userId, listingId)` — changes status to paused
[ ] 30. Implement `deleteListing(userId, listingId)` — soft delete (status = removed)
[ ] 31. Write `marketplace.listing.created` event to outbox on creation
[ ] 32. Test: Free-tier member cannot create listing
[ ] 33. Test: Verified member creates listing successfully
[ ] 34. Test: listing creation event written to outbox

### Discovery
[ ] 35. Create `packages/marketplace/src/discovery.ts`
[ ] 36. Implement `searchListings(query, filters, sort, page)` — full-text search
[ ] 37. Filters: category, minPrice, maxPrice, minReputation, availability
[ ] 38. Sort options: relevance (default), rating, price_asc, price_desc, newest
[ ] 39. Ranking factors per spec: text relevance, availability, reputation, response time, recent activity, tier, seed category boost
[ ] 40. The "Recently Completed" section: query completed orders from last 30 days where provider opted to showcase
[ ] 41. Test: search returns listings matching query
[ ] 42. Test: filter by category returns only that category
[ ] 43. Test: paused listings do not appear in search results

### Verification Cache
[ ] 44. Create `packages/marketplace/src/verification-cache.ts`
[ ] 45. Implement `syncCache(userId)` — calls IIdentityService.getTier() and stores result
[ ] 46. BullMQ repeatable job: sync cache every hour for all providers
[ ] 47. CRITICAL: Write-path decisions (listing creation) ALWAYS use live IIdentityService call
[ ] 48. Read-path display (search results, badges) MAY use cache
[ ] 49. Test: revoked verification blocks listing creation immediately (live call, not cache)
[ ] 50. Test: cache is a display optimization, not a security gate
```

### Exit Criteria
- Order state machine rejects every invalid transition with clear error
- All valid state transitions log correctly to order_state_log
- Listing creation checks verification live (not from cache)
- Free-tier member blocked from creating listings
- Full-text search returns relevant listings
- `pnpm vitest run --project marketplace` — all tests pass

---

## Phase 5.2 — Order Saga

**Folder:** `module-05-marketplace/phase-02-order-saga/`

### TASKS.md

```
## Phase 5.2 Task List: Order Saga

### Order Saga Core
[ ] 1.  Create `packages/marketplace/src/order-saga.ts`
[ ] 2.  OrderSaga constructor receives: IWalletService, IEscrowService (injected via DI), OutboxWriter, db (scoped Drizzle client)
[ ] 3.  Implement `createOrder(input)` — creates order in draft state, logs to order_state_log
[ ] 4.  Implement `acceptOrder(orderId, providerId)` — provider accepts, logs transition
[ ] 5.  Implement `declineOrder(orderId, providerId, reason)` — provider declines with reason
[ ] 6.  Implement `fund(orderId, paymentSource)` — the critical path (see below)
[ ] 7.  Implement `startWork(orderId, providerId)` — transitions funded → in_progress
[ ] 8.  Implement `submitDeliverable(orderId, providerId, input)` — uploads deliverable, transitions to delivered
[ ] 9.  Implement `requestRevision(orderId, clientId, notes)` — transitions back to in_progress, logs revision
[ ] 10. Implement `approveDeliverable(orderId, clientId)` — triggers escrow release, transitions to completed
[ ] 11. Implement `raiseDispute(orderId, raisedBy, reason, category)` — freezes order and escrow
[ ] 12. Implement `cancelOrder(orderId, clientId)` — cancels before in_progress, triggers refund
[ ] 13. Implement `handleProviderInactivity(orderId)` — triggered by BullMQ delayed job at 7 and 14 days

### fund() — The Critical Path
[ ] 14. fund() accepts: orderId, paymentSource (direct_paystack | wallet_debit)
[ ] 15. Load order, verify it's in accepted state
[ ] 16. Start Drizzle transaction
[ ] 17. Step 1: Create escrow via IEscrowService.create() — on failure: cancel order, throw
[ ] 18. Step 2: Debit wallet via IWalletService.debit() — on failure: cancel escrow, cancel order, throw
[ ] 19. Step 3: Mark escrow as funded via IEscrowService.markFunded()
[ ] 20. Step 4: Transition order to funded state
[ ] 21. Step 5: Write `marketplace.order.funded` event to outbox
[ ] 22. All 5 steps in a single Drizzle transaction — commit or rollback together
[ ] 23. Correlation ID from AsyncLocalStorage is threaded through every interface call and log line

### approveDeliverable() — Release Path
[ ] 24. Load order, verify in delivered state, verify caller is the client
[ ] 25. Call IEscrowService.releaseFull(agreementId, idempotencyKey) — idempotency key = `release-{orderId}`
[ ] 26. Transition order to completed
[ ] 27. Write `marketplace.order.completed` event to outbox (same transaction)
[ ] 28. On release failure: retry 3x with backoff, then escalate to admin dead-letter queue
[ ] 29. Test: approveDeliverable correctly releases escrow and transitions order to completed

### Compensation Tests
[ ] 30. Test: escrow creation fails → order transitions to cancelled, no wallet debit
[ ] 31. Test: wallet debit fails (insufficient funds) → escrow cancelled, order cancelled, client notified
[ ] 32. Test: escrow markFunded fails → wallet credit restored, order cancelled
[ ] 33. Test: all compensation tests verified with mocked finance interfaces
[ ] 34. Test: same fund() call with same idempotency key is a no-op (idempotent)

### Inactivity Handling
[ ] 35. Create `apps/workers/src/jobs/order-inactivity.ts`
[ ] 36. When order is funded: schedule a BullMQ delayed job for 7 days and 14 days
[ ] 37. At 7 days: send nudge notification to provider (write event to outbox)
[ ] 38. At 14 days: transition order to awaiting_client_decision state
[ ] 39. Client can then cancel for full refund (no formal dispute required)
[ ] 40. Test: 7-day job fires and writes notification event to outbox

### Full End-to-End Order Tests
[ ] 41. Happy path E2E: createOrder → acceptOrder → fund (wallet) → startWork → submitDeliverable → approveDeliverable → verify balances → verify events
[ ] 42. Dispute path E2E: fund → disputeOrder → resolveDispute (partial) → verify both wallets
[ ] 43. Cancellation path E2E: fund → cancelOrder → verify full refund to client wallet
[ ] 44. Verify: correlation ID appears in every log line, every state_log entry, and every outbox event for a single saga run

### Routes
[ ] 45. Create `packages/marketplace/src/routes.ts`
[ ] 46. POST /marketplace/listings — create listing
[ ] 47. GET /marketplace/listings — search/discover
[ ] 48. GET /marketplace/listings/:id — listing detail
[ ] 49. POST /marketplace/orders — create order (client)
[ ] 50. POST /marketplace/orders/:id/accept — provider accepts
[ ] 51. POST /marketplace/orders/:id/decline — provider declines
[ ] 52. POST /marketplace/orders/:id/fund — client funds
[ ] 53. POST /marketplace/orders/:id/deliver — provider submits deliverables
[ ] 54. POST /marketplace/orders/:id/revise — client requests revision
[ ] 55. POST /marketplace/orders/:id/approve — client approves deliverables
[ ] 56. POST /marketplace/orders/:id/dispute — either party raises dispute
[ ] 57. POST /marketplace/orders/:id/cancel — client cancels
[ ] 58. GET /marketplace/orders — list own orders (as client + as provider)
[ ] 59. GET /marketplace/orders/:id — order detail
[ ] 60. Register routes in api container, inject IWalletService and IEscrowService via DI
```

### Exit Criteria
- Full happy path E2E passes: order created → funded → delivered → approved → released → rated
- All 3 compensation scenarios pass: escrow fail, wallet fail, markFunded fail
- 50 concurrent fund() calls on same order: exactly 1 succeeds, rest fail with appropriate errors
- Correlation ID threads through entire saga visible in logs
- `pnpm vitest run --project marketplace` — all tests pass

---

---

# MODULE 6: Social

**Folder:** `module-06-social/`
**Package:** `packages/social`
**Can be built in parallel with Marketplace (Phase 5.2) if team size allows.**

---

## Phase 6.1 — Messaging

**Folder:** `module-06-social/phase-01-messaging/`

### TASKS.md

```
## Phase 6.1 Task List: Messaging

### Schema
[ ] 1.  Create `packages/social/src/schema.ts`
[ ] 2.  Define `social.conversations` table: id (UUID PK), member1Id (UUID), member2Id (UUID), createdAt, lastMessageAt. UNIQUE(member1Id, member2Id) — one thread per pair
[ ] 3.  Normalise member pair: always store smaller UUID as member1Id (consistent ordering)
[ ] 4.  Define `social.messages` table: id (UUID PK), conversationId (FK), senderId (UUID), body (text), createdAt
[ ] 5.  Define `social.read_receipts` table: id, messageId (FK), readerId (UUID), readAt. UNIQUE(messageId, readerId)
[ ] 6.  Define `social.attachments` table: id (UUID PK), messageId (FK), fileUrl, fileName, fileSize, mimeType, createdAt
[ ] 7.  Define `social.blocks` table: id (UUID PK), blockerId (UUID), blockedId (UUID), createdAt. UNIQUE(blockerId, blockedId)
[ ] 8.  Define `social.feed_posts` table: id (UUID PK), authorId (UUID), postType (completed_project/service_announcement), body (text), mediaUrls (text[]), linkedListingId (UUID nullable), isVisible (boolean), rankScore (numeric), createdAt, updatedAt
[ ] 9.  Define `social.feed_engagements` table: id (UUID PK), postId (FK), userId (UUID), type (like/bookmark/comment), body (text, nullable for non-comments), createdAt
[ ] 10. Generate migration and run

### Messaging Service
[ ] 11. Create `packages/social/src/conversations.ts`
[ ] 12. Implement `getOrCreateConversation(userId1, userId2)` — idempotent, one conversation per pair
[ ] 13. Implement `getInbox(userId, page)` — paginated conversations sorted by lastMessageAt
[ ] 14. Check blocking: if either user has blocked the other, conversation is inaccessible
[ ] 15. Create `packages/social/src/messages.ts`
[ ] 16. Implement `sendMessage(conversationId, senderId, input)` — validates tier rate limit
[ ] 17. Implement rate limiting: Free = 20/day, Verified = 100/day, Pro = unlimited
[ ] 18. Rate limit checks use Redis counters (sliding 24-hour window)
[ ] 19. Context-gating for Free tier: message can only be sent if sender has active/past order with recipient OR has viewed their listing
[ ] 20. Implement `markRead(conversationId, userId, messageId)` — creates read receipt
[ ] 21. Write `social.message.sent` event to outbox (triggers push notification)
[ ] 22. Test: message rate limits enforced per tier
[ ] 23. Test: context gate blocks Free-tier cold messages
[ ] 24. Test: blocking prevents conversation access

### WebSocket Real-time
[ ] 25. Install `@fastify/websocket` in `apps/api`
[ ] 26. Create `apps/api/src/ws/messaging-handler.ts`
[ ] 27. On WebSocket connect: authenticate (validate JWT), register in Redis as online
[ ] 28. On new message: publish to Redis pub/sub channel for that conversation
[ ] 29. All API instances subscribe to Redis pub/sub and forward to connected WebSockets
[ ] 30. On WebSocket disconnect: remove from Redis online registry
[ ] 31. Fallback: if WebSocket is unavailable, client polls GET /messages/:conversationId?since={timestamp}
[ ] 32. Test: send message via REST → received via WebSocket within 100ms (local test)
[ ] 33. Test: WebSocket disconnect → reconnect → missed messages delivered on reconnect

### Blocking
[ ] 34. Create `packages/social/src/blocking.ts`
[ ] 35. Implement `blockUser(blockerId, blockedId)` — creates block record
[ ] 36. Implement `unblockUser(blockerId, blockedId)` — removes block
[ ] 37. Implement `isBlocked(userA, userB)` — bidirectional check
[ ] 38. Test: blocked user cannot send messages; cannot start conversations

### Routes
[ ] 39. GET /social/messages — inbox
[ ] 40. POST /social/messages/:userId — start conversation (or get existing)
[ ] 41. GET /social/messages/:conversationId — message thread
[ ] 42. POST /social/messages/:conversationId — send message
[ ] 43. POST /social/messages/:conversationId/:messageId/read — mark read
[ ] 44. POST /social/block/:userId — block
[ ] 45. DELETE /social/block/:userId — unblock
[ ] 46. WS /social/ws — WebSocket connection
[ ] 47. Register routes in api container
```

### Exit Criteria
- One conversation per user pair enforced (idempotent creation)
- Rate limits enforced: Free-tier user exceeding 20 messages gets HTTP 429
- Context gate: Free-tier cold message blocked with clear error
- WebSocket delivers messages in < 100ms (local env test)
- Blocking prevents all message sending between blocked parties

---

## Phase 6.2 — Feed

**Folder:** `module-06-social/phase-02-feed/`

### TASKS.md

```
## Phase 6.2 Task List: Feed

### Feed Service
[ ] 1.  Create `packages/social/src/posting.ts`
[ ] 2.  Implement `createPost(userId, input)` — validates post type, content policy
[ ] 3.  Only allowed post types at launch: completed_project, service_announcement
[ ] 4.  Content policy: reject posts with no media attachment if type is completed_project
[ ] 5.  Write `social.post.created` event to outbox
[ ] 6.  Implement `deletePost(userId, postId)` — soft delete (isVisible = false)
[ ] 7.  Implement `flagPost(reporterId, postId, reason)` — write `social.post.flagged` event to outbox

### Feed Ranking
[ ] 8.  Create `packages/social/src/ranking.ts`
[ ] 9.  Implement `calculateRankScore(post, authorProfile)` — returns numeric score
[ ] 10. Ranking factors: verified-user engagement weight, author transaction history, recency decay
[ ] 11. Recency: newer posts score higher with a half-life of ~3 days
[ ] 12. Verified engagement: likes/bookmarks from Verified/Pro members count more than Free members
[ ] 13. Transaction signal: authors with more completed transactions rank higher
[ ] 14. Implement `refreshFeedRankings()` — BullMQ job, runs every 30 minutes
[ ] 15. Test: verified author with transactions ranks higher than unverified with no transactions

### Timeline Generation
[ ] 16. Create `packages/social/src/timeline.ts`
[ ] 17. Implement `getTimeline(userId, page)` — returns ranked posts for this user
[ ] 18. Filter: only visible posts, no blocked users, no content-policy-removed posts
[ ] 19. Implement `engage(userId, postId, type)` — creates engagement record
[ ] 20. Engagement types: like, bookmark, comment
[ ] 21. Write `social.engagement.received` event to outbox (triggers notification)

### Event Consumers
[ ] 22. Consume `members.portfolio.published` → auto-create completed_project feed post
[ ] 23. Consume `marketplace.listing.created` → optionally surface as service_announcement
[ ] 24. Consume `platform.user.suspended` → set all user's posts to isVisible = false
[ ] 25. Consume `auth.identity.verified` → update verified status for ranking weight

### Routes
[ ] 26. GET /social/feed — timeline
[ ] 27. POST /social/feed — create post
[ ] 28. DELETE /social/feed/:postId — delete post
[ ] 29. POST /social/feed/:postId/engage — like/bookmark/comment
[ ] 30. Register routes in api container

### Public Interface Implementation
[ ] 31. Implement IFeedService from contracts
[ ] 32. Implement IMessagingService from contracts
[ ] 33. Create `packages/social/src/index.ts` — exports public surface only
```

### Exit Criteria
- Only `completed_project` and `service_announcement` post types accepted
- Portfolio publish event auto-creates feed post
- Suspended user's posts hidden (consume platform.user.suspended event)
- Timeline returns ranked results (verified/transacted authors rank higher in test data)
- IFeedService and IMessagingService fully implemented

---

---

# MODULE 7: Platform

**Folder:** `module-07-platform/`
**Package:** `packages/platform`
**This is the last module built. It consumes events from everything.**

---

## Phase 7.1 — Notifications (Config-Driven)

**Folder:** `module-07-platform/phase-01-notifications/`

### TASKS.md

```
## Phase 7.1 Task List: Notifications

### Schema
[ ] 1.  Create `packages/platform/src/schema.ts`
[ ] 2.  Define `platform.notification_preferences` table: id, userId (UUID unique), preferences (JSONB: { email: bool, push: bool, sms: bool, in_app: bool } per event type)
[ ] 3.  Define `platform.notification_log` table: id (auto-increment), userId, eventType, channel, status (sent/failed/skipped/rate_limited), reference, createdAt
[ ] 4.  Define `platform.notification_templates` table: id (text PK), subject (nullable), body (text, handlebars template), channelType, version, createdAt
[ ] 5.  Define `platform.notification_routes` table per spec: id, eventType, templateId (FK), recipientField (JSON path), channels (text[]), enabled, maxPerUser, maxPerUserWindow, cooldownSeconds
[ ] 6.  Define `platform.moderation_reports` table: id (UUID PK), reporterId, targetType (post/member/message), targetId, category (spam/inappropriate/fraud/harassment), description, status (pending/under_review/resolved/dismissed), assignedTo (UUID nullable), createdAt, updatedAt
[ ] 7.  Define `platform.moderation_actions` table: id, reportId (FK, nullable), targetUserId, actionType (warn/remove_content/suspend/ban), duration (nullable), reason, adminId, createdAt
[ ] 8.  Define `platform.ban_records` table: id (UUID PK), userId, reason, adminId, bannedAt, resolvedAt (nullable)
[ ] 9.  Define `platform.appeal_records` table: id, moderationActionId (FK), appealerId, reason, reviewedBy (FK, nullable), outcome, createdAt, resolvedAt
[ ] 10. Define `platform.admin_users` table: id (UUID PK), userId (FK → auth.users), role (super_admin/moderator/support), isActive, createdAt
[ ] 11. Define `platform.admin_audit_log` table: id (auto-increment), adminUserId (FK), action, targetType, targetId, details (JSONB), correlationId, createdAt
[ ] 12. Partition admin_audit_log by month
[ ] 13. Define `platform.platform_settings` table: key (text PK), value (JSONB), updatedBy, updatedAt
[ ] 14. Generate migration and run

### Channel Adapters
[ ] 15. Create `packages/platform/src/notifications/channels/email.ts`
[ ] 16. Implement Resend adapter: sendEmail({ to, subject, htmlBody, textBody })
[ ] 17. Create mock Resend adapter for tests (records calls, doesn't send)
[ ] 18. Create `packages/platform/src/notifications/channels/push.ts`
[ ] 19. Implement Expo Push Notifications adapter: sendPush({ expoPushToken, title, body, data })
[ ] 20. Create mock Expo Push adapter for tests
[ ] 21. Create `packages/platform/src/notifications/channels/sms.ts`
[ ] 22. Implement Termii adapter (or Africa's Talking): sendSms({ to, message })
[ ] 23. Create mock SMS adapter for tests
[ ] 24. Create `packages/platform/src/notifications/channels/in-app.ts`
[ ] 25. In-app channel: writes to notification_log + delivers via WebSocket if user is online

### Notification Dispatcher
[ ] 26. Create `packages/platform/src/notifications/dispatcher.ts`
[ ] 27. Dispatcher is a BullMQ worker consuming notification jobs
[ ] 28. For each incoming event: query notification_routes WHERE event_type = $eventType AND enabled = true
[ ] 29. Extract recipient from event payload using `recipientField` path (e.g., "payload.userId")
[ ] 30. Fetch user's notification preferences — skip disabled channels
[ ] 31. Check rate limits: query notification_log for recent sends of same type to same user
[ ] 32. If maxPerUser exceeded within window: skip, log as rate_limited
[ ] 33. If cooldownSeconds not elapsed: skip, log as rate_limited
[ ] 34. Global safety default: if no limits set, cap at 10 sends per type per user per hour
[ ] 35. Render template using Handlebars with event payload as context
[ ] 36. Dispatch to each allowed channel concurrently
[ ] 37. Log outcome (sent/failed) for each channel to notification_log
[ ] 38. Test: event processed → correct template rendered → correct channel adapter called
[ ] 39. Test: maxPerUser = 1 (welcome email) → second trigger skipped, logged as rate_limited
[ ] 40. Test: disabled channel in preferences → not dispatched
[ ] 41. Test: invalid template → graceful failure, logged, does not crash dispatcher

### Seed Notification Route Configs
[ ] 42. Create a seed SQL file for initial notification_routes:
[ ] 43. auth.user.registered → template:welcome_email, channel: email, maxPerUser: 1
[ ] 44. marketplace.order.funded → template:order_funded, channels: push+email+in_app
[ ] 45. marketplace.order.completed → template:order_completed, channels: push+email+in_app
[ ] 46. marketplace.order.disputed → template:dispute_opened, channels: push+email+in_app+sms
[ ] 47. social.message.sent → template:new_message, channels: push+in_app, maxPerUser: 5, window: 1 hour
[ ] 48. finance.wallet.funded → template:wallet_funded, channels: push+in_app
[ ] 49. finance.withdrawal.completed → template:withdrawal_done, channels: push+email
[ ] 50. Run seed file against database

### Tests
[ ] 51. Test: auth.user.registered event → welcome email channel adapter called once (mock)
[ ] 52. Test: same event triggered 3 times → adapter called exactly once (maxPerUser=1)
[ ] 53. Test: marketplace.order.funded → push, email, and in-app adapters all called
[ ] 54. Test: user has email disabled in preferences → only push + in-app sent
[ ] 55. Test: notification_log has correct entries after dispatch
```

### Exit Criteria
- Config-driven routing: new notification added by inserting a row (no code change needed)
- Welcome email deduplication: `auth.user.registered` event triggered 5 times → email adapter called exactly once
- Multi-channel dispatch: order.funded sends to push + email + in-app simultaneously
- Preference filtering: disabled channel not dispatched
- All channel adapter mocks record calls correctly for assertion

---

## Phase 7.2 — Moderation, Admin, Platform Settings

**Folder:** `module-07-platform/phase-02-moderation-admin/`

### TASKS.md

```
## Phase 7.2 Task List: Moderation, Admin, Platform Settings

### Moderation Service
[ ] 1.  Create `packages/platform/src/moderation/reporting.ts`
[ ] 2.  Implement `fileReport(reporterId, input)` — creates report, notifies moderation queue
[ ] 3.  Implement `assignReport(reportId, adminId)` — assigns to moderator
[ ] 4.  Implement `resolveReport(reportId, adminId, action, reason)` — resolves with action
[ ] 5.  Create `packages/platform/src/moderation/actions.ts`
[ ] 6.  Implement `warnUser(userId, adminId, reason)` — creates moderation_action + notification
[ ] 7.  Implement `suspendUser(userId, adminId, reason, durationDays)` — writes `platform.user.suspended` event
[ ] 8.  Implement `banUser(userId, adminId, reason)` — creates ban_record, writes `platform.user.banned` event
[ ] 9.  Implement `reinstateUser(userId, adminId, reason)` — lifts suspension
[ ] 10. All moderation actions write to admin_audit_log atomically with the action
[ ] 11. Implement `handleAppeal(appealId, reviewerAdminId, outcome, reason)` — reviewer must differ from original admin
[ ] 12. Test: suspend user → `platform.user.suspended` event in outbox
[ ] 13. Test: ban user → ban_record created + `platform.user.banned` event
[ ] 14. Test: appeal reviewer must be different admin (same admin rejected)

### Admin Auth & RBAC
[ ] 15. Create `packages/platform/src/admin/auth.ts`
[ ] 16. Implement `getAdminRole(userId)` — returns role or null if not admin
[ ] 17. Create Fastify `adminRequired` hook: checks JWT + admin_users record
[ ] 18. Create `requireRole(minRole)` middleware: super_admin > moderator > support
[ ] 19. Test: non-admin user rejected; support role cannot access super_admin endpoints

### Platform Settings Service
[ ] 20. Create `packages/platform/src/admin/settings.ts`
[ ] 21. Implement `getSetting(key)` — returns parsed JSONB value
[ ] 22. Implement `setSetting(key, value, adminId)` — updates + writes `platform.settings.updated` event + audit log
[ ] 23. Settings include: platformFeePercent, minFeeKobo, inviteLimits (by tier), proThresholds, provisionalVerificationDays, featureFlags
[ ] 24. Settings are cached in memory with 60-second TTL (reduces DB reads on hot paths)
[ ] 25. Implement `getSettings()` — returns all settings as typed object
[ ] 26. Test: update setting → event in outbox → cached value invalidated

### Admin Dispute Resolution
[ ] 27. Create `packages/platform/src/admin/disputes.ts`
[ ] 28. Implement `getDisputeQueue()` — returns open disputes ordered by SLA urgency (48h first response, 7-day resolution target)
[ ] 29. Implement `getDisputeDetail(disputeId)` — returns full dispute context: order, deliverables, messages, evidence, revision history
[ ] 30. Implement `resolveDispute(disputeId, outcome, adminId)` — outcome: full_release | full_refund | partial split
[ ] 31. Resolution calls IEscrowService (full release or refund) or escrow.refundPartial (split)
[ ] 32. Writes resolution explanation to order state log
[ ] 33. Sends resolution notification to both parties (via outbox event)
[ ] 34. Test: full release → provider receives payment, client notified
[ ] 35. Test: full refund → client refunded, platform fee not charged
[ ] 36. Test: partial split → both wallets updated correctly

### Analytics & Dashboard
[ ] 37. Create `packages/platform/src/admin/analytics.ts`
[ ] 38. Implement `getGmvStats(period)` — total + trending GMV from reporting schema
[ ] 39. Implement `getTransactionVolume(period)` — count + avg order value
[ ] 40. Implement `getMemberStats()` — total, new this week, provider-to-client ratio
[ ] 41. Implement `getListingStats()` — active listings by category
[ ] 42. Implement `getDisputeRate()` — disputed / funded orders ratio
[ ] 43. Implement `getFunnelMetrics()` — registration → approval → listing → order → completion rates
[ ] 44. Implement `getDeadLetterCount()` — count of unresolved dead-letter events

### Public Interface Implementation
[ ] 45. Implement IModerationService from contracts
[ ] 46. Implement IAdminService from contracts
[ ] 47. Create `packages/platform/src/index.ts` — exports public surface

### Admin Routes
[ ] 48. GET /admin/dashboard — analytics overview
[ ] 49. GET /admin/members — member list with filters
[ ] 50. GET /admin/members/:id — member detail
[ ] 51. POST /admin/members/:id/approve — approve registration
[ ] 52. POST /admin/members/:id/suspend — suspend member
[ ] 53. POST /admin/members/:id/ban — ban member
[ ] 54. GET /admin/disputes — dispute queue
[ ] 55. GET /admin/disputes/:id — dispute detail
[ ] 56. POST /admin/disputes/:id/resolve — resolve dispute
[ ] 57. GET /admin/settings — get all settings
[ ] 58. PATCH /admin/settings/:key — update setting
[ ] 59. GET /admin/dead-letters — dead-letter count + list
[ ] 60. POST /admin/dead-letters/:id/retry — retry dead letter
[ ] 61. Register all admin routes with adminRequired hook
```

### Exit Criteria
- Config-driven notification system works end-to-end with real events
- Admin can resolve a dispute and the correct wallet operations execute
- Platform settings updated via API are immediately reflected in business logic (cache TTL tested)
- RBAC: support role cannot access suspend/ban endpoints
- All IModerationService and IAdminService methods implemented and tested
- `pnpm vitest run --project platform` — all tests pass

---

---

# MODULE 8: Web Client

**Folder:** `module-08-web-client/`
**App:** `apps/web`

---

## Phase 8.1 — Next.js Setup, Auth Pages, Onboarding

**Folder:** `module-08-web-client/phase-01-auth-onboarding/`

### TASKS.md

```
## Phase 8.1 Task List: Web Client Auth & Onboarding

### Next.js Setup
[ ] 1.  Initialise Next.js App Router in `apps/web` with TypeScript
[ ] 2.  Install and configure Tailwind CSS
[ ] 3.  Install shared packages: `@vvs/contracts`, `@vvs/shared`
[ ] 4.  Create API client utility: typed fetch wrapper using IAuthService types
[ ] 5.  Configure PWA: install `next-pwa`, create manifest.json, service worker
[ ] 6.  Configure Next.js middleware for auth guard (redirect unauthenticated users to /login)
[ ] 7.  Create global layout: bottom tab navigation (Discover, Orders, Messages, Profile), notification bell

### Auth Pages (P0)
[ ] 8.  Build /register page: invite code → account creation → pending approval screen
[ ] 9.  Build /login page: email + password, social login options, "forgot password?"
[ ] 10. Build /forgot-password and /reset-password pages
[ ] 11. Implement JWT storage: access token in memory, refresh token in httpOnly cookie
[ ] 12. Implement silent token refresh on 401 responses
[ ] 13. Error states: wrong credentials → inline error (no field enumeration); network failure → retry prompt
[ ] 14. Test: login flow with correct credentials navigates to /discover

### Post-Approval Onboarding (P0)
[ ] 15. Build /welcome page (shown once after first login post-approval)
[ ] 16. Step 1: Welcome with referrer name
[ ] 17. Step 2: Profile completion form (bio, profession, category, skills, photo)
[ ] 18. Step 3: Intent selection (hire / offer services / both)
[ ] 19. Step 4: CTA routing based on intent (→ /discover or → /verify-identity)
[ ] 20. Store "onboarding complete" flag to skip on subsequent logins
[ ] 21. Onboarding must complete in under 2 minutes on 3G (test with Chrome DevTools throttling)

### Identity Verification Page (P0)
[ ] 22. Build /verify-identity page
[ ] 23. Document type selector (NIN/driver's licence/passport/voter's card)
[ ] 24. File upload with progress indicator
[ ] 25. KYC provider timeout state: "Verification is taking longer than usual. We'll notify you."
[ ] 26. NIN/BVN mismatch state: specific retry guidance message

### Shared Components
[ ] 27. Build TierBadge component (Free/Verified/Pro with correct colours)
[ ] 28. Build AvailabilityIndicator component (green/yellow/grey dot + label)
[ ] 29. Build RatingDisplay component (read mode: stars + score; write mode: star selector)
[ ] 30. Build EmptyState component (icon + message + CTA)
[ ] 31. Build ConfirmationDialog component (default and destructive and money variants)
[ ] 32. Build Toast/Snackbar component (success/error/info, auto-dismiss 4s)
[ ] 33. Build ConnectionStatusBanner (offline/reconnecting states)
[ ] 34. Build LoadingSkeleton for member cards and listing cards
[ ] 35. Test: all shared components render correctly in Storybook or equivalent
```

### Exit Criteria
- Registration → approval pending screen flow works end-to-end with real API
- Login with correct credentials → redirects to /discover
- Onboarding flow completes in < 2 minutes on throttled connection
- JWT refresh works silently: expired access token → auto-refresh → original request retried
- All shared components render in all states (including error/empty/loading)

---

## Phase 8.2 — Discovery, Profiles, Listings

**Folder:** `module-08-web-client/phase-02-discover-profiles/`

### TASKS.md

```
## Phase 8.2 Task List: Discovery, Profiles, Listings

### Discover Page (P0 — Default Landing)
[ ] 1.  Build /discover page as the default authenticated landing
[ ] 2.  Search bar with immediate feedback (loading indicator on input)
[ ] 3.  Category filter chips (horizontal scroll on mobile)
[ ] 4.  Filter panel: price range, min reputation, availability (bottom sheet on mobile)
[ ] 5.  Sort options: relevance, rating, price, newest
[ ] 6.  Listing cards: title, provider avatar+name, "from ₦X", rating, tx count, response time badge
[ ] 7.  Toggle: "Services" (default) / "People"
[ ] 8.  "Recently Completed" carousel section at top (shows proof of marketplace activity)
[ ] 9.  Empty state: "No services found for [query]. Know someone who offers this? Invite them."
[ ] 10. Error state: search timeout → stale results shown + "Refreshing..." indicator
[ ] 11. Offline state: show cached listings from service worker with "Showing cached results" banner

### Listing Detail Page (P0)
[ ] 12. Build /listings/:id page
[ ] 13. Provider card: avatar, name, tier badge, rating, tx count, response time, "Referred by [Name]"
[ ] 14. Pricing tier selector (Basic/Standard/Premium) with clear deliverables comparison
[ ] 15. Sticky "Order This Service" CTA on mobile scroll
[ ] 16. "Contact Provider" secondary CTA
[ ] 17. Portfolio samples grid
[ ] 18. Reviews section with ratings
[ ] 19. Order flow modal: MKT-M01 (tier confirmation, deliverables, notes, submit)
[ ] 20. Error state: provider became unverified → "This listing is currently unavailable"

### Create/Edit Listing Page (P0)
[ ] 21. Build /listings/new and /listings/:id/edit pages
[ ] 22. Multi-step form: basics, pricing tiers, portfolio samples, preview
[ ] 23. Pricing tier builder: up to 3 tiers with deliverables/timeline per tier
[ ] 24. Gate: show verification prompt if not Verified+

### Profile Pages (P0)
[ ] 25. Build /profile (own profile, editable)
[ ] 26. Availability toggle (prominent, top of page)
[ ] 27. Portfolio gallery with media items
[ ] 28. Reputation metrics: rating, tx count, "New member" if < 3 reviews
[ ] 29. Tier progress indicator: "2 more transactions to reach Pro"
[ ] 30. "Referred by [Name]" displayed prominently
[ ] 31. Reviews section
[ ] 32. Build /members/:userId (public profile, read-only, with Contact/Hire CTAs)
[ ] 33. Build /profile/edit (inline edit mode)
[ ] 34. Portfolio item upload modal: MEM-M01 (title, description, media upload, tags)
[ ] 35. File upload component with drag-and-drop and per-file progress on slow connections

### Provider Setup Checklist (P0)
[ ] 36. Build provider checklist card (persistent on /profile if not complete)
[ ] 37. Checklist: profile complete / identity verified / first listing created / availability = "Available"
[ ] 38. Each unchecked item links directly to the relevant action
[ ] 39. Converts to "You're live!" confirmation when all items complete

### My Listings (P0)
[ ] 40. Build /listings/mine page with status, quick stats, pause/edit/delete actions
[ ] 41. Pause confirmation modal: MKT-M11
[ ] 42. Delete confirmation modal: MKT-M12
```

### Exit Criteria
- Discover page loads in < 300ms p95 (measured with Lighthouse)
- Listings searchable by keyword with correct results from API
- Listing order flow: select tier → submit order → order created in draft state
- Provider setup checklist accurately reflects current completion state
- Offline: service worker serves cached listings with "Showing cached results" banner

---

## Phase 8.3 — Orders, Wallet, Notifications

**Folder:** `module-08-web-client/phase-03-orders-wallet/`

### TASKS.md

```
## Phase 8.3 Task List: Orders, Wallet, Notifications

### Orders List Page (P0)
[ ] 1.  Build /orders page with "As Client" / "As Provider" tabs
[ ] 2.  Order cards: listing title, counterparty, status badge, amount, last activity
[ ] 3.  "Requires Action" indicator (orange) on orders needing input
[ ] 4.  Filter: status, date range
[ ] 5.  Empty state per tab: client → "Browse services"; provider → "Make sure your listings are active"

### Order Detail Page (P0)
[ ] 6.  Build /orders/:id page (renders differently for client vs provider)
[ ] 7.  Status timeline: horizontal (desktop) / vertical (mobile)
[ ] 8.  Listing summary, counterparty card, message thread, audit trail
[ ] 9.  Client actions by state:
[ ] 10.   draft → "Waiting for provider" / Cancel
[ ] 11.   accepted → "Pay Now" (Paystack) / "Pay from Wallet (₦X balance)"
[ ] 12.   delivered → "Approve & Release" / "Request Revision" / "Raise Dispute"
[ ] 13.   completed → "Rate this experience"
[ ] 14. Provider actions by state:
[ ] 15.   draft → "Accept Order" (with fee breakdown) / "Decline"
[ ] 16.   in_progress → "Submit Deliverables"
[ ] 17. Provider acceptance modal: MKT-M02 (fee breakdown: gross → 7.5% → net payout)
[ ] 18. Payment modal: MKT-M04 (Paystack or wallet; insufficient balance → "Top up or pay with card")
[ ] 19. Approve modal: MKT-M05 (confirmation with amount; feels weighty — money moves)
[ ] 20. Dispute modal: MKT-M06 (category, description, file attachments)
[ ] 21. Deliverable upload modal: MKT-M07 (multi-file, per-file progress)
[ ] 22. Rating modal: MKT-M08 (1-5 stars, optional review)
[ ] 23. Revision request modal: MKT-M13 (structured notes, specific files, revision count displayed)
[ ] 24. 14-day inactivity modal: MKT-M10 ("Provider hasn't responded in 14 days. Cancel or keep waiting?")
[ ] 25. Error state: Paystack failure → FIN-M05 dialog with retry

### Wallet Page (P0)
[ ] 26. Build /wallet page
[ ] 27. Balance display: "Available: ₦X" and "In Active Orders: ₦Y" (NOT "Locked in Escrow")
[ ] 28. Tooltip on "In Active Orders": "Held safely until work is approved"
[ ] 29. Transaction history: date, description, amount (+/-), running balance
[ ] 30. Filter: type (all/funded/earned/withdrawn/orders), date range
[ ] 31. "Add Funds" → FIN-M01 → Paystack checkout → FIN-M04 success
[ ] 32. "Withdraw" → FIN-M02 → bank account selector → FIN-M03 (add bank) → processing
[ ] 33. Paystack timeout state: "Payment is being processed. We'll update your balance shortly."
[ ] 34. Network loss mid-checkout: "Payment may still be processing. Check your balance in a few minutes."

### Notifications (P0)
[ ] 35. Build /notifications page: chronological, grouped (today/this week/earlier)
[ ] 36. Notification bell with unread count badge in header
[ ] 37. Bell dropdown: last 5-10 notifications + "View All"
[ ] 38. Each notification links to the relevant page
[ ] 39. Mark individual and "mark all as read"
[ ] 40. In-app notification delivery via WebSocket (same connection as messages)

### Account Settings (P0)
[ ] 41. Build /settings page
[ ] 42. Sections: security, payment methods, identity verification status, tier progress, privacy
[ ] 43. Change password modal: PLT-M02
[ ] 44. Tier progress card: current tier badge + "X more transactions to reach Pro"
[ ] 45. Tier upgrade celebration modal: PLT-M06
[ ] 46. Save bank account modal: FIN-M03 with Paystack account verification

### Messaging (P0)
[ ] 47. Build /messages page: conversation list, search
[ ] 48. Build /messages/:conversationId page: real-time thread
[ ] 49. WebSocket connection for real-time delivery
[ ] 50. Order context card at top of conversation (shows active order status between these two users)
[ ] 51. Message rate limit hit modal: SOC-M05
[ ] 52. Context-gate modal for Free tier: SOC-M06
[ ] 53. File attachment in message: SOC-M07 with upload progress
[ ] 54. "Connection lost. Reconnecting..." banner on WebSocket disconnect
[ ] 55. Messages queued locally and sent on reconnection
```

### Exit Criteria
- Full order flow testable in browser: create → accept → pay → deliver → approve → rate
- Wallet shows correct Available vs "In Active Orders" balances
- Paystack checkout timeout handled gracefully (user not left hanging)
- WebSocket messages delivered in real-time; reconnection works correctly
- All P0 modals (MKT-M01 through MKT-M13, FIN-M01 through FIN-M05) implemented

---

---

# MODULE 9: Admin Dashboard

**Folder:** `module-09-admin/`
**App:** `apps/admin`

---

## Phase 9.1 — Admin Core (P0 Surfaces)

**Folder:** `module-09-admin/phase-01-admin-core/`

### TASKS.md

```
## Phase 9.1 Task List: Admin Dashboard Core

### Setup
[ ] 1.  Initialise Next.js App Router in `apps/admin` (separate app from `apps/web`)
[ ] 2.  Admin auth: JWT with admin role check, redirect non-admins to /unauthorized
[ ] 3.  Admin navigation: Dashboard, Members, Orders, Disputes, Finance, Settings (P0 nav items)
[ ] 4.  Shared admin layout with sidebar navigation

### Dashboard Home (P0)
[ ] 5.  Build /admin page: operational overview
[ ] 6.  GMV: total + trend indicator (up/down vs last period)
[ ] 7.  Transaction volume + average order value
[ ] 8.  Member count (total + new this period)
[ ] 9.  Dispute rate: disputed / funded orders %
[ ] 10. Action items section (prominent):
[ ] 11.   Pending approvals count + link
[ ] 12.   Open disputes count + SLA indicator (red if 48h response SLA breached)
[ ] 13.   Orders at risk count (>48h no provider response + approaching 14-day inactivity)
[ ] 14.   Dead-letter count (unresolved failed events)
[ ] 15. Data freshness indicator: "Last updated X minutes ago" + refresh button

### Members Management (P0)
[ ] 16. Build /admin/members: searchable table (name, email, tier, verification, registration date, referrer, tx count, reputation, status)
[ ] 17. Filters: tier, verification status, account status, date range
[ ] 18. Inline quick actions: approve button for pending, suspend button for active
[ ] 19. Build /admin/members/approvals: approval queue
[ ] 20.   Each applicant: name, email, invite code, referrer name + referrer tier/reputation
[ ] 21.   Actions: Approve (+ optional provisional verification) / Reject (+ reason)
[ ] 22.   Bulk approve button
[ ] 23. Build /admin/members/:id: full member detail
[ ] 24.   All sections: profile, tier controls, verification docs, referral tree, orders, wallet summary, moderation history
[ ] 25.   Admin actions: warn, suspend (duration), ban, adjust tier, grant provisional verification
[ ] 26. ADM-M01 through ADM-M07 modals implemented

### Orders Overview (P0)
[ ] 27. Build /admin/orders: all platform orders table
[ ] 28. Columns: order ID, client, provider, listing, amount, status, created, last activity
[ ] 29. Filters: status, date range, amount range, flagged (inactivity/disputed)
[ ] 30. "At Risk" tab: orders with no provider response > 48h (SLA indicator per order)

### Dispute Resolution (P0)
[ ] 31. Build /admin/disputes: prioritised queue
[ ] 32. Dispute cards: order summary, filing party, category, date, SLA timer
[ ] 33. Build /admin/disputes/:id: full dispute detail on one page
[ ] 34.   Order context: listing, deliverables, timeline
[ ] 35.   Evidence from both parties (files, messages auto-pulled, version history)
[ ] 36.   Revision history: how many revisions requested before dispute
[ ] 37.   Resolution panel: full release / full refund / partial split (% inputs)
[ ] 38.   Written explanation field (required)
[ ] 39.   Full audit trail
[ ] 40. ADM-M05 (resolve dispute modal) implemented

### Finance Overview (P0)
[ ] 41. Build /admin/finance page
[ ] 42. Platform fee revenue collected (total + this period)
[ ] 43. GMV summary
[ ] 44. Active escrow total (money currently locked in orders)
[ ] 45. Failed/stuck transactions (requires manual intervention)
[ ] 46. Reconciliation status: last run timestamp, any drift alerts
[ ] 47. Dead-letter queue count + link to dead-letter view (even if full DLQ page is P2)

### Platform Settings (P0)
[ ] 48. Build /admin/settings page
[ ] 49. Fee settings: platform fee % (default 7.5%), minimum fee (₦500)
[ ] 50. Tier settings: invite limits per tier, Pro thresholds
[ ] 51. Verification settings: provisional duration (90 days)
[ ] 52. Feature flags: enable/disable feed, post types
[ ] 53. Search: seed category boost toggle
[ ] 54. ADM-M08 (confirmation before settings change) implemented
[ ] 55. All changes logged in audit trail (viewable in admin_audit_log DB, P0 backend; P2 UI)
```

### Exit Criteria
- Admin can approve a pending member with optional provisional verification
- Admin can resolve a dispute (full release, full refund, and partial split all work)
- "Orders at risk" section shows orders needing attention
- Settings changes take effect immediately (platform fee change reflected in next escrow release)
- RBAC: support account cannot access suspend/ban controls
- Dead-letter count visible on dashboard

---

---

# Cross-Module End-to-End Tests

**Folder:** `e2e-tests/`
**These run after ALL modules are complete. They test the full user journey.**

### TASKS.md

```
## E2E Test Suite Task List

### Setup
[ ] 1.  All schemas applied to test PostgreSQL instance
[ ] 2.  All packages wired in DI container (real implementations, not mocks)
[ ] 3.  Mock channel adapters (Resend, Expo Push, Termii) — record calls, don't send
[ ] 4.  Mock Paystack adapter — returns success/failure based on test configuration

### Core Journey Tests
[ ] 5.  Onboarding E2E: generate invite code → register with code → admin approves → first login → complete onboarding → profile visible in search
[ ] 6.  Marketplace E2E: Verified member creates listing → client finds it in search → places order → provider accepts → client funds (wallet debit) → provider delivers → client approves → escrow releases → both parties rate → reputation score updates
[ ] 7.  Paystack funding E2E: client initiates Paystack checkout → webhook fires (mock) → wallet credited → client uses wallet to fund order
[ ] 8.  Dispute E2E: order funded → either party disputes → admin sees dispute in queue → admin resolves (partial split) → both wallets updated → both parties notified
[ ] 9.  Social E2E: provider publishes portfolio item → auto-creates feed post → client sees post in feed → client messages provider → real-time delivery confirmed
[ ] 10. Notification E2E: seed notification_routes config → trigger auth.user.registered event → assert email channel adapter called with correct template and recipient

### Financial Stress Tests
[ ] 11. 50 concurrent debits on one wallet: correct final balance, no double-spend
[ ] 12. Multiple concurrent escrow fundings for same client: balance checks serialised
[ ] 13. Same Paystack webhook replayed 10×: wallet credited exactly once

### Failure Injection Tests
[ ] 14. Redis down during saga: outbox accumulates events; on Redis recovery, relay publishes all pending events; zero event loss
[ ] 15. PostgreSQL connection lost mid-saga: compensating transactions fire correctly
[ ] 16. Slow consumer: events accumulate in BullMQ, eventually processed, no duplicate processing

### Acceptance Criteria
[ ] 17. All E2E tests pass on clean database
[ ] 18. All E2E tests are deterministic: pass/fail consistently on 5 consecutive runs
[ ] 19. Financial stress tests: 5/5 runs without integrity violations
[ ] 20. Full marketplace journey (test 6) completes in < 5 seconds wall clock time
```

---

---

# Launch Readiness Checklist

Complete this before inviting the seed community.

```
## Pre-Launch Verification

### Security
[ ] HTTPS enforced (no HTTP in production)
[ ] JWT secret is a cryptographically random 256-bit value (not "secret123")
[ ] Paystack webhook signature verification enabled in production
[ ] All environment variables in production secrets manager (not .env file)
[ ] Database roles have minimal permissions (no superuser access to app roles)
[ ] Rate limiting active on all endpoints

### Financial Integrity
[ ] Wallet reconciliation job scheduled and verified running
[ ] Dead-letter queue alerts configured (email when count > 0)
[ ] Paystack marketplace approval confirmed (required for escrow release with fee deduction)
[ ] Test Paystack webhook in production (send test payload, verify wallet credit)

### Infrastructure
[ ] Managed PostgreSQL backups enabled (daily minimum)
[ ] Managed Redis persistence enabled (AOF or RDB)
[ ] Object storage (R2/S3) bucket configured with CDN
[ ] Zero-downtime deploy pipeline tested
[ ] Health check endpoint monitored externally

### Data
[ ] Category taxonomy seeded (Design, Photography/Videography for launch)
[ ] Notification route configs seeded (all 10 initial routes)
[ ] Platform settings seeded with correct defaults (7.5% fee, tier limits, etc.)
[ ] First admin user created (Super Admin role)

### Operational
[ ] Admin dashboard accessible and showing live data
[ ] Admin can approve test member end-to-end
[ ] Dispute resolution tested with real admin account
[ ] Content moderation policy document completed (required before feed launch)

### Performance
[ ] p95 API response time < 300ms on load test with 100 concurrent users
[ ] Search latency < 200ms on test dataset of 500 profiles
[ ] WebSocket handles 200 concurrent connections without degradation

### Mobile
[ ] PWA installable on Android (test with Chrome)
[ ] PWA installable on iOS (test with Safari)
[ ] Service worker caches critical routes for offline browse
[ ] Core flows tested on 3G throttled connection (< 10s to place an order)
```

---

*Document version 1.0 — March 2026 — RateMe Ltd Engineering*