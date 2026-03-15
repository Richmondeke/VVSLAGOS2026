# VVS Members — Complete Architecture & Technology Specification

**Version:** 3.0  
**Date:** March 2026  
**Author:** RateMe Ltd Engineering

---

## 1. What VVS Members Is

VVS Members is a referral-only professional network and creative services marketplace. Members showcase work, offer verified services, hire trusted talent, and transact through built-in escrow. Reputation is earned through paid transactions, not followers.

This document specifies the complete technical architecture and technology stack for building it.

---

## 2. Architectural Approach

VVS Members is a modular monolith. One deployable application, one database instance, strict internal boundaries between business domains.

Modules talk to each other through typed interfaces — direct function calls inside the same process. When something happens that other modules might care about but the originator doesn't need a response, it publishes an event through a transactional outbox. That's it. Two communication patterns, clearly separated by intent.

The system is designed to be split into independent services later if needed. The module boundaries are the seams. But splitting is a scaling decision, not a launch decision.

---

## 3. Technology Stack

Every choice below was selected against three criteria: **is it simple to set up?**, **does the Lagos/Nigerian dev market have talent for it?**, and **does it avoid introducing infrastructure the architecture doesn't require?**

### Core Stack

| Layer | Technology | Why This One |
|---|---|---|
| **Language** | TypeScript (strict mode) | One language across API, web, mobile, and workers. Non-negotiable given the spec's typed interfaces and shared contracts. |
| **Runtime** | Node.js (LTS — currently v22) | Battle-tested, largest ecosystem, best AI-assisted coding support, deepest Nigerian talent pool. |
| **HTTP Framework** | Fastify | 2–3× Express throughput, built-in JSON schema validation and serialization, plugin architecture maps perfectly to the modular monolith. |
| **Database** | PostgreSQL 16 | Schema-per-package, row-level security, declarative partitioning, full-text search — all native. |
| **ORM / Query Builder** | Drizzle ORM | Code-first TypeScript schemas, generates clean SQL migrations, ~5KB bundle, no binary dependencies, SQL-like API that doesn't hide what's running. |
| **Monorepo Tool** | Turborepo + pnpm workspaces | Minimal config, fast caching, non-intrusive — just runs your scripts faster. pnpm's symlink-based `node_modules` is the most efficient for monorepos. |
| **Background Jobs** | BullMQ + Redis | The outbox relay, reconciliation jobs, notification dispatch, and reporting workers all need a reliable queue. BullMQ gives retries, delayed jobs, priorities, and dead-letter handling out of the box. |
| **Cache / Rate Limiting** | Redis (same instance as BullMQ at launch) | Rate limiting in a fast key-value store. Redis handles both this and BullMQ — one piece of infrastructure doing double duty. |

### Client Applications

| Layer | Technology | Why This One |
|---|---|---|
| **Web Client** | Next.js (App Router) | SSR for SEO on public profiles/listings, React Server Components for performance, file-based routing. Strong React/Next.js familiarity in the Nigerian dev community. |
| **Mobile Client** | Expo (React Native) | Officially recommended way to start React Native projects in 2026. Same TypeScript, same React mental model. EAS Build removes the "you need a Mac" barrier. OTA updates bypass app store review. |
| **Admin Dashboard** | Next.js (same stack as web, separate app) | Shares the `contracts` package. No need to learn a different framework for admin. |

### External Services

| Layer | Technology | Why This One |
|---|---|---|
| **Auth** | Custom (built in the `auth` package) | The auth domain is deeply intertwined with business logic — invites, referrals, tiers, KYC. Use `argon2` for hashing, `jose` for JWTs, `arctic` for social login adapters. |
| **File Storage** | S3-compatible object storage | Cloudflare R2 (zero egress fees) or AWS S3. Abstracted behind the `media` module interface. |
| **Email** | Resend or Postmark | Simple transactional email APIs. Pluggable behind the platform package's email channel adapter. |
| **Payment Gateway** | Paystack | Nigerian-first, well-documented API, webhook-based — exactly what the finance package's gateway adapter expects. Flutterwave as a secondary option. |
| **Deployment** | Single VPS or managed container (Railway, Render, or DigitalOcean App Platform) | A modular monolith is one deployable. One API process + one worker process is all you need until past 10,000 active members. |
| **CI/CD** | GitHub Actions | Free for public repos, generous minutes for private. Turborepo's remote cache integrates natively. |

### Toolchain

| Tool | Purpose |
|---|---|
| **pnpm 9.x** | Package management. Symlink-based `node_modules`, fastest installs, native workspace support. |
| **Turborepo 2.x** | Task caching and orchestration across monorepo packages. |
| **TypeScript 5.x (strict)** | One `tsconfig.base.json` at root, extended per package. |
| **Vitest** | Testing. Fast, native TypeScript support, compatible with Fastify and Drizzle. |
| **Biome** | Linting + formatting in one tool. Faster than ESLint + Prettier combined. Written in Rust. |
| **tsx** | Run TypeScript directly in development without a build step. |
| **tsup** | Bundle packages for production when needed. |

### Why These Over Alternatives

**Fastify over Express, Hono, or NestJS.** Express has no built-in validation or serialization. Hono is optimised for edge/serverless cold starts — irrelevant for a monolith on a persistent server. NestJS adds decorators, DI containers, and a steep learning curve for something the architecture already handles with its own DI wiring. Fastify's plugin architecture is modular without being heavy — each package registers as a Fastify plugin with its own routes and lifecycle hooks.

**Drizzle ORM over Prisma or Kysely.** Drizzle schemas are plain TypeScript files — each package defines its own in its own directory, matching the layout exactly. The SQL-like API lets you write the finance package's atomic conditional updates and ledger invariants precisely. No Rust binary dependency (~5KB vs Prisma's ~50MB). `drizzle-kit` generates clean, reviewable SQL migration files — critical for a system that handles money. Kysely is a pure query builder without schema management or migrations.

**Turborepo over Nx.** The repo layout is a standard pnpm workspace. Turborepo adds caching without changing the structure. One `turbo.json` file. Nx is more powerful but heavier to adopt for a team of 1–3 engineers. If the team grows to 5+, Nx is a reasonable migration target.

**Expo over Flutter.** Same language (TypeScript), shared `contracts` package, no Mac required for iOS builds (EAS Build), OTA updates for marketplace bug fixes. Flutter uses Dart — separate language, separate expertise, smaller Nigerian talent pool.

**Custom auth over Clerk/Auth0/Supabase Auth.** The auth package has invite codes with per-tier limits, referral chains, admin approval queues, KYC flows, and a custom tier system. No off-the-shelf service models this.

### What You Don't Need at Launch

| Thing People Will Suggest | Why You Should Skip It |
|---|---|
| **Kubernetes** | One API process and one worker process. A managed container platform is sufficient until independent scaling per package is needed. |
| **Kafka / RabbitMQ** | BullMQ + the database outbox covers event needs. Graduate to a dedicated broker when throughput demands it. |
| **Elasticsearch** | Start with PostgreSQL full-text search for 1–10K members. The search index worker is already wired to swap backends later. |
| **GraphQL** | REST with Fastify's schema validation gives typed request/response contracts without the complexity of schema stitching across 6 business packages. |
| **Terraform / Pulumi** | Infrastructure-as-code for two containers and a database is premature. Use the hosting platform's UI. |
| **Microservices** | This entire document exists to explain why you don't need them yet. |

---

## 4. Repo Layout

```
vvs-members/
├── apps/
│   ├── api/                    # Fastify server — routes, middleware, DI wiring
│   ├── web/                    # Next.js (App Router) — public web client
│   ├── mobile/                 # Expo (React Native) — cross-platform mobile
│   ├── admin/                  # Next.js — admin dashboard
│   └── workers/                # BullMQ workers: outbox relay, reconciliation, reporting
│
├── packages/
│   ├── contracts/              # Shared TypeScript types, interfaces, event schemas (ZERO runtime)
│   ├── shared/                 # Drizzle client, BullMQ events, errors, Pino logger, Vitest helpers
│   ├── auth/                   # Registration, login, invites, verification, tiers
│   ├── members/                # Profiles, portfolios, case studies
│   ├── marketplace/            # Listings, orders, deliverables, order saga
│   ├── finance/                # Wallet, escrow, ledger, ratings, reputation
│   ├── social/                 # Feed, messaging
│   └── platform/               # Notifications, moderation, admin ops
│
├── migrations/
│   ├── auth/                   # Drizzle-generated SQL migrations
│   ├── members/
│   ├── marketplace/
│   ├── finance/
│   ├── social/
│   ├── platform/
│   └── reporting/
│
├── turbo.json                  # Turborepo task config
├── pnpm-workspace.yaml         # Workspace package globs
├── tsconfig.base.json          # Shared TypeScript config
├── biome.json                  # Linting + formatting
└── package.json
```

Each business package is organised as flat domain files, not nested sub-packages:

```
packages/auth/
├── src/
│   ├── registration.ts
│   ├── login.ts
│   ├── session.ts
│   ├── invites.ts
│   ├── referrals.ts
│   ├── verification.ts
│   ├── tiers.ts
│   ├── schema.ts              # Drizzle schema definitions for auth tables
│   ├── repositories/
│   ├── interfaces.ts          # Public API other packages call
│   ├── events.ts              # Events this package publishes
│   └── index.ts               # Re-exports public surface
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── package.json
```

A file graduates to its own directory when it passes ~500 lines or needs its own dependencies. Not before.

---

## 5. Database

### One PostgreSQL Instance, One Schema Per Package

Single PostgreSQL 16 instance. Each package gets its own schema. No cross-schema queries in application code. Drizzle ORM manages all schema definitions and migration generation.

```
PostgreSQL 16
├── auth            (users, sessions, tokens, invites, referrals, kyc, tiers, badges)
├── members         (profiles, categories, availability, portfolio, media, case_studies)
├── marketplace     (listings, pricing_tiers, orders, order_state_log, deliverables)
├── finance         (wallets, ledger, funding, withdrawals, escrow, milestones, reviews, scores)
├── social          (posts, engagements, conversations, messages, read_receipts, blocks)
├── platform        (notif_prefs, notif_log, templates, routes, reports, actions, bans, admin, audit, settings)
├── reporting       (materialised views + denormalised analytics, read-only)
└── outbox          (transactional outbox, shared infrastructure)
```

### Schema Definitions with Drizzle

Each package defines its own Drizzle schema in TypeScript. Example for the finance package's wallets table:

```typescript
// packages/finance/src/schema.ts
import { pgSchema, uuid, integer, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const financeSchema = pgSchema('finance');

export const wallets = financeSchema.table('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  availableBalance: integer('available_balance').notNull().default(0),
  lockedBalance: integer('locked_balance').notNull().default(0),
  currency: text('currency').notNull().default('NGN'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const ledgerEntries = financeSchema.table('ledger_entries', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id),
  entryType: text('entry_type').notNull(),  // 'credit' | 'debit'
  amount: integer('amount').notNull(),      // smallest currency unit (kobo)
  balanceAfter: integer('balance_after').notNull(),
  reference: text('reference').notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

Migrations are generated via `drizzle-kit generate` and output clean SQL files into the `migrations/` directory, organised per package.

### Enforced Isolation

Each package connects through its own database role/user. The role can only access its own schema:

- Grant each role usage and full privileges on its own schema only.
- Every role can append to the outbox (insert-only, no reads or deletes).
- A dedicated read-only role for reporting gets read access across all schemas.
- The admin dashboard reads from the `reporting` schema only.

The shared infrastructure layer provides a `createScopedClient(schema)` factory — each package receives a Drizzle client scoped to its own schema. You can't accidentally query another package's tables.

### Reporting

The `reporting` schema is populated two ways:

1. **Materialised views** refreshed on a schedule (every ~5 minutes), using concurrent refresh strategies to avoid locking.
2. **Event-driven BullMQ worker** that listens for events and maintains denormalised aggregates.

Every reporting table has a `last_refreshed_at` timestamp. The admin UI shows it. No guessing about freshness.

---

## 6. How Packages Talk to Each Other

Two patterns. Each has a specific purpose. Using the wrong one for the wrong job is a bug.

### Interface Calls — When You Need an Answer

When Package A needs something from Package B right now, it calls Package B's public interface. These are direct function calls inside the same process, injected via dependency injection at startup.

**Example:** The finance package defines a `WalletService` interface (in `packages/contracts/src/finance.ts`) with methods like `getBalance`, `debit`, and `credit`. The marketplace package receives this through DI and calls it during order processing. The interface definition lives in the contracts package. The implementation lives in the finance package. The wiring happens in the Fastify API application layer. In tests, you swap the real implementation for a mock.

```typescript
// packages/contracts/src/finance.ts
export interface IWalletService {
  getBalance(userId: string): Promise<Money>;
  debit(userId: string, amount: number, ref: string): Promise<DebitResult>;
  credit(userId: string, amount: number, ref: string): Promise<CreditResult>;
}

// apps/api/src/container.ts — DI wiring at startup
import { WalletService } from '@vvs/finance';
import { OrderSaga } from '@vvs/marketplace';

const walletService = new WalletService(financeScopedDb);
const orderSaga = new OrderSaga(walletService, escrowService, outboxWriter);
```

If you ever need to extract a package into a separate service, you swap the DI binding from a local function call to a remote client — consuming code doesn't change.

**Use for:** Anything where the caller needs a result, needs transactional consistency, or is on the request hot path. Verification checks, balance lookups, escrow operations, dispute resolution.

### Async Events — When You Don't Need an Answer

When something happened and other packages might want to know, publish an event. The publisher doesn't know or care who's listening.

**Example:** After an order completes, the marketplace package writes an `order.completed` event to the outbox (in the same database transaction) with the order ID, client ID, provider ID, and timestamp. A BullMQ worker polls the outbox and distributes events to consumers.

**Use for:** Notifications, feed updates, analytics, search indexing, audit logging. Anything where the publisher's job is already done.

### What's Forbidden

- **Cross-schema queries.** No reading from the auth schema inside the finance package.
- **Importing another package's internals.** You can import the `IWalletService` interface from `@vvs/contracts`. You cannot import a finance package's internal repository module.
- **Events for synchronous flows.** The order → escrow → wallet pipeline uses interface calls. Events are never used when the caller needs a result.
- **Shared mutable tables.** No table is written to by more than one package. (Exception: the outbox events table, which is append-only infrastructure.)

### Decision Quick Reference

| Need | Pattern |
|---|---|
| Check balance before locking escrow | Interface call |
| Fund escrow from wallet | Interface call |
| Release escrow to provider | Interface call |
| Verify user tier before listing | Interface call |
| Notify user of new message | Event → BullMQ → platform |
| Update feed with new listing | Event → BullMQ → social |
| Update analytics dashboard | Event → BullMQ → reporting worker |
| Send welcome email | Event → BullMQ → platform (Resend/Postmark adapter) |

---

## 7. Reliability Primitives

### Transactional Outbox

Every event is written to the outbox table in the same database transaction as the state change that produced it. A separate BullMQ relay worker polls the outbox and distributes to consumers.

**Outbox table structure (Drizzle schema):**

```typescript
// packages/shared/src/schema.ts
import { pgSchema, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const outboxSchema = pgSchema('outbox');

export const events = outboxSchema.table('events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  eventType: text('event_type').notNull(),
  eventVersion: integer('event_version').notNull().default(1),
  payload: jsonb('payload').notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  orderingKey: text('ordering_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
});
```

An index on `created_at` filtered to rows where `published_at` is null supports efficient polling.

**The critical pattern:** The state change and the event write happen in one atomic database transaction (via Drizzle's `db.transaction()`). If the transaction commits, the event is guaranteed to eventually be published. If BullMQ/Redis is down, the event waits in the outbox until the relay can deliver it. No silent data loss.

### Idempotency

Every event handler and Paystack webhook handler can be called twice (or ten times) and produce the same result. Tables that receive event-driven writes have unique constraints on idempotency keys. Application code checks before writing. The database enforces as a safety net.

For Paystack webhooks specifically: the webhook tracking table has a unique constraint on payment reference. Replay the same webhook 50 times, the wallet gets credited once.

### Consumer Offset Tracking

Every event consumer uses the same deduplication pattern — no ad-hoc logic per handler. A shared `consumer_offsets` table tracks what each consumer has processed:

| Column | Type | Constraints |
|---|---|---|
| `consumer_name` | Text | Composite primary key |
| `event_id` | Integer (FK → outbox) | Composite primary key |
| `processed_at` | Timestamp with timezone | Default now |

Every consumer handler (implemented as BullMQ workers) follows the same pattern: check if already processed → if yes, skip → if no, handle then record offset.

### Event Ordering

Events for the same entity can arrive out of sequence — `order.funded` after `order.completed` — which breaks projections and notifications.

**Rule:** Every outbox event carries an `ordering_key` (e.g., `order:abc123`, `wallet:user456`).

The relay publishes events with the same ordering key to the same BullMQ queue or job name. BullMQ processes jobs sequentially within a named queue when concurrency is set to 1 per ordering group.

**For consumers that don't need ordering** (analytics, reporting), they process with higher concurrency for maximum throughput.

**For consumers that do** (notifications, feed projections), they subscribe per ordering key and process sequentially.

### Saga Orchestration

The order-to-payment flow (order → escrow → wallet) is a state machine in the marketplace package:

```
Order States:
  draft → pending_funding → funded → in_progress → delivered →
  pending_approval → completed → rated

  Any state → disputed → resolved_released | resolved_refunded
  Any state before in_progress → cancelled → refunded

Compensations:
  Escrow creation fails   → cancel order
  Wallet debit fails      → cancel escrow, cancel order
  Escrow release fails    → retry 3x (idempotent), then escalate to admin
  Wallet credit fails     → retry 3x (idempotent), hold in escrow, escalate
```

The saga uses interface calls to the finance package, not events. Every state transition is logged in the `order_state_log` — an append-only audit trail of what happened, when, why, and what compensating actions were taken.

**Correlation ID threading:** The Fastify request that triggers a saga carries a correlation ID (generated at the gateway via a Fastify `onRequest` hook, stored in `AsyncLocalStorage`). Every interface call within the saga passes this ID through. Every log line (via Pino), every state transition record, and every outbox event includes it. When something fails in production, search by correlation ID and you get the entire saga trail — wallet debit, escrow creation, state transitions, compensations — in one query.

### Dead-Letter Queue

Failed events (after 5 retries with exponential backoff) go to a dead-letter table:

| Column | Type | Purpose |
|---|---|---|
| `id` | Auto-incrementing integer | Primary key |
| `original_event_id` | Integer (FK → outbox) | Link to original event |
| `event_type` | Text | Event type that failed |
| `payload` | JSON | Full event payload |
| `error_message` | Text | Last error |
| `retry_count` | Integer | Attempts made |
| `failed_at` | Timestamp | When it entered the DLQ |
| `resolved_at` | Timestamp | When an admin handled it |
| `resolution` | Text | `retried`, `discarded`, or `fixed_and_retried` |

Admin dashboard shows dead-letter counts. Alerts fire when count exceeds thresholds.

BullMQ's built-in retry and dead-letter mechanisms handle the worker-level retries. The dead-letter table above is for events that exhaust all retries — giving the admin dashboard a single place to inspect and resolve failures.

### Event Versioning

Default strategy: additive only. New fields are optional. Existing fields never removed or renamed. If a new version adds `totalAmount` and `currency`, they're optional — existing consumers ignore them.

Breaking changes get a new event name (e.g., `order.completed.v3`). Old event published alongside new one for minimum 30 days while consumers migrate.

### Reconciliation

Any package that caches another package's data runs a scheduled reconciliation job (via BullMQ repeatable jobs). The job compares its local projection against the source of truth (via interface call) and corrects drift. If corrections exceed 5% of cached records, an alert fires.

### Rate Limiting

System-wide rate limiting lives in the Fastify API layer (via `@fastify/rate-limit` backed by Redis), not inside individual packages. Applied before any business logic runs.

| Layer | Mechanism | Limits |
|---|---|---|
| Global | Per-IP sliding window (Redis) | 200 req/min unauthenticated, 600 req/min authenticated |
| Per-user | Token bucket (Redis) | 300 req/min across all endpoints |
| Sensitive endpoints | Stricter per-user limits | Login: 10/min. Password reset: 5/min. Funding/withdrawal: 20/min. |
| Tier-based (in-package) | Enforced inside social package | Free tier messaging: 20 messages/day. Verified: 100/day. Pro: unlimited. |

Rate limit responses return HTTP 429 with a `Retry-After` header. Limits are stored in Redis and configurable via platform admin settings.

### Data Retention

Append-only tables grow indefinitely without a retention policy. These tables have explicit retention rules:

| Table | Hot Storage | Cold Storage | Notes |
|---|---|---|---|
| `order_state_log` | 2 years | Archived to object storage (R2/S3) | Partitioned by month. Old partitions detached and exported. |
| `admin_audit_log` | 2 years | Archived to object storage | Same partitioning strategy. Regulatory: retain cold archives 7 years minimum. |
| `notification_log` | 6 months | Purged (not archived) | Low-value data. No need to keep old delivery records. |
| `ledger_entries` | Indefinite | N/A | Financial records are never deleted or archived. Partitioned by month for query performance. |
| `outbox.events` | 30 days after published | Purged | Once published and confirmed delivered, outbox events are housekeeping data. |
| `outbox.dead_letters` | Until resolved + 90 days | Purged | Resolved dead letters kept 90 days for post-mortems, then purged. |

Partitioning strategy: use PostgreSQL's native declarative partitioning on timestamp columns for all append-only tables. A BullMQ repeatable job (monthly cron) creates next month's partition and detaches/exports partitions past the retention window.

---

## 8. Message Broker

At launch, the message broker is **BullMQ backed by Redis**. The transactional outbox table provides the durability guarantee (event written atomically with state change). The BullMQ relay worker polls the outbox and distributes events to consumer workers with at-least-once delivery, retries, and dead-letter handling.

BullMQ provides persistent queues (backed by Redis), consumer groups, delayed jobs, and priority queues — sufficient for all launch requirements. If throughput demands it later, the relay can be pointed at a dedicated broker (NATS JetStream, RabbitMQ) without changing business package code.

Fire-and-forget pub/sub is explicitly off the table. Unacceptable for a system that moves money.

---

## 9. Search Indexing

At launch, search (profiles, listings, portfolio) runs on **PostgreSQL full-text search** via `tsvector` columns and GIN indexes. This is adequate for 1,000–10,000 members. No external search infrastructure needed.

But the architecture is wired for a future upgrade. Every searchable entity already publishes events on create and update:

- `members.profile.created`, `members.profile.updated`
- `members.portfolio.published`
- `marketplace.listing.created`, `marketplace.listing.updated`

A **search index BullMQ worker** in the workers application consumes these events and writes to the search backend — PostgreSQL full-text columns today, Elasticsearch or Meilisearch tomorrow. The worker is the only code that needs to change when the backend upgrades. Package code calls search through the repository layer and never knows what's behind it.

**When to upgrade:** When full-text search latency exceeds 200ms on typical queries, or when you need fuzzy matching, faceted filtering, or skill-based recommendations that PostgreSQL can't express cleanly. At that point, add the search engine, point the worker at it, swap the repository implementation. The event plumbing is already in place.

---

## 10. Package Specifications

---

### `contracts`

Type-only package. Zero runtime dependencies. Every package depends on this for shared vocabulary — TypeScript interfaces, enums, event payload types, Zod schemas for validation. Sub-exports per domain: `@vvs/contracts/auth`, `@vvs/contracts/finance`, etc.

Separated from `shared` deliberately: a type change here only invalidates packages that import the changed type. It doesn't trigger rebuilds of packages that only depend on runtime utilities like the logger or DB client.

---

### `shared`

Foundation infrastructure. No business logic.

| Directory | What It Does |
|---|---|
| `db/` | Drizzle client factory, `createScopedClient(schema)`, connection pooling (via `postgres` driver or `node-postgres`), migration runner integration with `drizzle-kit`. |
| `events/` | Outbox writer (Drizzle transaction insert), BullMQ consumer registration, in-memory implementation for Vitest tests. |
| `errors/` | `NotFoundError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `InsufficientFundsError`. Mapped to HTTP status codes by a Fastify error handler. |
| `logger/` | Pino structured JSON logging with correlation IDs via `AsyncLocalStorage`. Namespaced child loggers per package. |
| `test-utils/` | Factories (`createTestUser()`, `createTestWallet()`), in-memory event bus, Drizzle transaction wrappers for test isolation. |
| `idempotency/` | Key generation and deduplication utilities. |

**Schema:** `outbox`

---

### `auth`

Everything involved in getting onto the platform and proving who you are.

**Schema:** `auth`

#### Domain Files

| File | What It Does |
|---|---|
| `registration.ts` | Sign-up (email/phone + password or social login). Creates auth record only — profile creation is the members package's job via event. |
| `login.ts` | Credential validation (argon2 verify), session creation. |
| `session.ts` | JWT issuance (via `jose`), refresh, revocation, device tracking. |
| `password.ts` | Argon2 hashing (adaptive cost), reset flow, change password. |
| `oauth.ts` | Social login adapters via `arctic` (pluggable per provider — Google, Apple, etc). |
| `invites.ts` | Generate invite codes/links. Enforce per-member limits by tier. |
| `referrals.ts` | Redeem invites, link invitee to inviter, track referral chains. |
| `approval.ts` | Queue new sign-ups for admin approval. Approve/reject. |
| `verification.ts` | KYC document upload (to R2/S3), third-party identity verification (pluggable provider), admin manual review. |
| `tiers.ts` | Tier management: Free → Verified → VVS Circle/Pro. Controls what each tier can do. |
| `badges.ts` | Issue and revoke badges (Verified, Founding Member, Pro). |
| `schema.ts` | Drizzle schema definitions for all auth tables. |

#### Public Interfaces

**IAuthService**
- `register(input)` → AuthUser
- `login(input)` → Session
- `refreshSession(token)` → Session
- `revokeSession(sessionId)` → void

**IReferralService**
- `generateInvite(userId)` → InviteCode
- `redeemInvite(code, userId)` → Referral
- `approve(referralId)` → void
- `reject(referralId, reason)` → void

**IIdentityService**
- `submitVerification(userId, docs)` → Verification
- `getStatus(userId)` → VerificationStatus
- `getTier(userId)` → MemberTier
- `upgradeTier(userId, tier)` → void

#### Tables

`users`, `sessions`, `tokens`, `invite_codes`, `referrals`, `referral_approvals`, `kyc_documents`, `verifications`, `member_tiers`, `badges`

#### Events Published

| Event | Async Consumers |
|---|---|
| `auth.user.registered` | members (scaffold profile), finance (create wallet), platform (welcome notif via Resend/Postmark) |
| `auth.referral.approved` | platform (approval notif) |
| `auth.identity.verified` | members (badge update), platform (notif), social (feed visibility) |
| `auth.user.deactivated` | platform (cleanup), social (hide content) |

#### Testing (Vitest)

- Registration, login, token lifecycle — zero business deps
- Invite generation, redemption, limit enforcement
- KYC flow with mocked provider responses
- Tier transitions and badge logic

#### Seam to Watch

This package has two conceptual halves: auth/session concerns (registration, login, sessions, social login, password) and membership lifecycle concerns (invites, referrals, verification, tiers, badges). They're co-located now because they share the "getting onto the platform" domain and it's not worth splitting at this team size. But they have different change rates — auth code stabilises early, membership rules change with every business experiment. If `tiers`, `badges`, and `verification` start growing significantly, they can migrate into the members package without breaking the architecture: the `auth.identity.verified` event boundary already exists, and the members package already consumes it. No action now — just awareness that this is the first place a split would happen.

---

### `members`

Member presence — profiles and portfolios.

**Schema:** `members`

#### Domain Files

| File | What It Does |
|---|---|
| `profiles.ts` | Profile CRUD: bio, profession, category, skills, availability. Content policy enforcement. Visibility controls. |
| `search.ts` | Full-text search across profiles using PostgreSQL `tsvector` + GIN indexes — by profession, category, location, availability. |
| `portfolio.ts` | Portfolio item CRUD: title, description, media, tags. |
| `media.ts` | Upload to R2/S3, thumbnail generation (via `sharp`), CDN URL management. Abstracts object storage behind an interface. |
| `case-studies.ts` | Structured format: challenge → approach → outcome → metrics. |
| `collaborators.ts` | Tag members on portfolio pieces. Requires confirmation. |
| `export.ts` | GDPR data export. |
| `schema.ts` | Drizzle schema definitions for all members tables. |

#### Public Interfaces

**IProfileService**
- `create(userId)` → Profile
- `update(userId, input)` → Profile
- `get(userId)` → Profile
- `search(query)` → Paginated\<ProfileSummary\>

**IPortfolioService**
- `createItem(userId, input)` → PortfolioItem
- `getItems(userId, page)` → Paginated\<PortfolioItem\>

#### Tables

`profiles`, `profile_categories`, `profile_availability`, `portfolio_items`, `portfolio_media`, `case_studies`, `collaborators`

#### Events Published

| Event | Async Consumers |
|---|---|
| `members.profile.created` | social (enable feed posting), search index BullMQ worker |
| `members.profile.updated` | Search index worker |
| `members.portfolio.published` | social (surface in feed), search index worker |

#### Events Consumed

| Event | What Happens |
|---|---|
| `auth.user.registered` | Scaffold empty profile |
| `auth.identity.verified` | Update badge/tier display |

#### Testing (Vitest)

- Profile CRUD with fake userId
- Search with synthetic data (PostgreSQL full-text)
- Content policy enforcement
- Media upload with mocked S3 client

---

### `marketplace`

The commercial core — service listings, orders, and the saga that ties money to work.

**Schema:** `marketplace`

#### Domain Files

| File | What It Does |
|---|---|
| `listings.ts` | Service listing CRUD: title, description, category, pricing model (fixed/hourly/project), deliverables, timeline. Verified+ members only (checks `IIdentityService`). |
| `pricing.ts` | Per-listing pricing tiers (Basic/Standard/Premium). |
| `discovery.ts` | Search and filter: category, price range, rating, availability. Backed by PostgreSQL full-text at launch. |
| `orders.ts` | Order state machine. Every transition logged to `order_state_log`. |
| `deliverables.ts` | File delivery (via R2/S3), versioning, client accept/reject. |
| `order-saga.ts` | Orchestrates order → escrow → wallet. Handles compensations. |
| `schema.ts` | Drizzle schema definitions for all marketplace tables. |

#### The Order Saga

The saga constructor receives injected interfaces: `IWalletService` and `IEscrowService` (from finance), plus the `OutboxWriter`.

**`fund(orderId)` flow:**

1. Load the order (Drizzle query).
2. **Step 1 — Create escrow.** Call `escrow.create(...)`. On failure → transition order to `cancelled` with reason `escrow_creation_failed`, throw.
3. **Step 2 — Debit wallet.** Call `wallet.debit(clientId, total, reference)`. On failure → call `escrow.cancel(...)`, transition order to `cancelled` with reason `insufficient_funds`, throw.
4. **Step 3 — Mark funded.** Call `escrow.markFunded(...)`, transition order to `funded`, write `marketplace.order.funded` event to outbox (in same Drizzle transaction).

**`releaseMilestone(orderId, milestoneId)` flow:**

1. Load the order.
2. Call `escrow.releaseMilestone(...)`. Credit is handled inside the finance package (escrow and wallet share a schema/transaction).
3. If all milestones released → transition order to `completed`, write `marketplace.order.completed` event.

#### Public Interfaces

**IListingService**
- `create(userId, input)` → Listing
- `search(query)` → Paginated\<ListingSummary\>
- `getWithRating(listingId)` → ListingWithRating

**IOrderService**
- `create(input)` → Order
- `fund(orderId)` → void
- `submitDeliverable(orderId, input)` → void
- `approveMilestone(orderId, milestoneId)` → void
- `dispute(orderId, reason)` → void
- `status(orderId)` → OrderStatus

#### Tables

`listings`, `pricing_tiers`, `orders`, `order_state_log`, `deliverables`, `verification_cache`

`order_state_log` is append-only — every transition, every compensation, timestamped. Retention: 2 years in hot storage, archived to R2/S3 after (see Section 7, Data Retention).

`verification_cache` is a local projection of auth verification data, reconciled hourly (via BullMQ repeatable job). **Write-path vs read-path rule:** listing creation always calls `IIdentityService` live — the cache is never trusted for write-path decisions. The cache is for discovery and display only (search results, listing cards, profile badges). This means a revoked verification blocks new listings immediately, even if the cache hasn't caught up yet.

#### Events Published

| Event | Async Consumers |
|---|---|
| `marketplace.listing.created` | social (feed), platform (notif), search index worker |
| `marketplace.listing.updated` | Search index worker |
| `marketplace.order.funded` | platform (notify both parties) |
| `marketplace.order.completed` | finance (open rating window), platform (notify), social (feed) |
| `marketplace.order.disputed` | platform (moderation queue + notify) |

#### Interface Dependencies

| Interface | From | Purpose |
|---|---|---|
| IIdentityService | auth | Tier check before listing |
| IWalletService | finance | Debit/credit during saga |
| IEscrowService | finance | Create/fund/release escrow |
| IRatingsService | finance | Aggregate rating on listings |

#### Testing (Vitest)

- Listing CRUD with mocked identity service
- Order state machine: every valid transition, every invalid transition
- Saga happy path + every failure/compensation path — all with mocked finance interfaces
- Discovery with synthetic data

---

### `finance`

All the money. Wallet, escrow, ledger, ratings, reputation. Co-located so the tightest financial operations (escrow release → wallet credit) can share a database transaction via Drizzle.

**Schema:** `finance`

#### Domain Files

| File | What It Does |
|---|---|
| `wallets.ts` | One wallet per member. Balance: available vs. locked. |
| `ledger.ts` | Immutable double-entry transaction log. Every credit, debit, hold, release is a record. `sum(credits) - sum(debits) = balance` is an invariant, tested. |
| `funding.ts` | Top-up via Paystack. Webhook handling with idempotency. |
| `withdrawals.ts` | Withdraw to bank (via Paystack Transfers): request → pending → processing → completed/failed. |
| `gateway.ts` | Paystack adapter. Common interface so providers are swappable (Flutterwave fallback). Webhook signature verification. |
| `escrow.ts` | Create agreements, lock funds, release on milestone approval, refund on cancellation. |
| `milestones.ts` | Milestone state: pending → submitted → approved → released. |
| `disputes.ts` | Freeze disputed milestones. Flag for moderation. |
| `reviews.ts` | Post-transaction reviews. Both parties rate. Time-limited window (14 days). |
| `scoring.ts` | Reputation score calculation. |
| `thresholds.ts` | Rep thresholds that unlock capabilities. |
| `schema.ts` | Drizzle schema definitions for all finance tables. |

#### Reputation Scoring

```
score = Σ (rating × reviewer_weight × recency × tx_weight)
        ÷ Σ (reviewer_weight × recency × tx_weight)

rating          = 1–5 stars
reviewer_weight = reviewer's own rep score, clamped to [0.1, 2.0]. New users = 1.0.
recency         = e^(-0.005 × days_since_review)   — half-life ≈ 139 days
tx_weight       = min(log₂(transaction_value_ngn / 10000 + 1), 3.0)

Minimum 3 reviews for a visible score.
Range: 1.0 – 5.0.
Recalculated incrementally on each new review.
```

**Note on `tx_weight` cap:** Without the cap at 3.0, a single ₦10M transaction with a 5-star review would outweigh ten ₦100K transactions averaging 4.8 stars. The cap ensures high-value transactions carry more weight (a ₦10M job matters more than a ₦10K job) but can't dominate a track record of consistent quality at lower price points. The cap value (3.0) is a product decision — adjust based on observed marketplace behaviour post-launch.

#### Ledger Structure

The `ledger_entries` table:

| Column | Type | Constraints |
|---|---|---|
| `id` | Auto-incrementing integer | Primary key |
| `wallet_id` | UUID (FK → wallets) | Not null |
| `entry_type` | Text | Check: `credit` or `debit` |
| `amount` | Integer (smallest currency unit — kobo) | Check: > 0 |
| `balance_after` | Integer | Running balance (read optimisation) |
| `reference` | Text | Not null |
| `idempotency_key` | Text | Unique, not null |
| `created_at` | Timestamp with timezone | Default now |

`balance_after` is a **read optimisation, not the source of truth**. The source of truth is always `sum(credits) - sum(debits)` across all ledger entries for a wallet. If `balance_after` ever corrupts, you recalculate from the ledger — the daily reconciliation job (BullMQ repeatable) does exactly this.

Concurrent debits use an **atomic conditional update** via Drizzle's raw SQL — no row locks, no lock-wait queues. The update decrements `available_balance` only where the current balance is sufficient, returning the new balance. If insufficient funds, zero rows are updated and the debit is rejected. If two debits race, PostgreSQL serialises the updates at the row level — the second one sees the first one's result. No pessimistic locking needed.

```typescript
// Atomic conditional debit — Drizzle raw SQL
const result = await db.execute(sql`
  UPDATE finance.wallets
  SET available_balance = available_balance - ${amount},
      updated_at = now()
  WHERE id = ${walletId}
    AND available_balance >= ${amount}
  RETURNING available_balance
`);

if (result.rows.length === 0) {
  throw new InsufficientFundsError(walletId, amount);
}
```

#### Public Interfaces

**IWalletService**
- `create(userId)` → Wallet
- `getBalance(userId)` → Money
- `debit(userId, amount, ref)` → DebitResult
- `credit(userId, amount, ref)` → CreditResult
- `withdraw(userId, amount, bankDetails)` → Withdrawal

**IEscrowService**
- `create(input)` → EscrowAgreement
- `markFunded(agreementId)` → void
- `approveMilestone(agreementId, milestoneId)` → void
- `releaseMilestone(agreementId, milestoneId)` → ReleaseResult
- `cancel(agreementId, reason)` → void
- `dispute(agreementId, reason)` → void

**IRatingsService**
- `submit(input)` → Review
- `getUserRating(userId)` → AggregateRating
- `getListingRating(listingId)` → AggregateRating

#### Tables

`wallets`, `ledger_entries`, `funding_requests`, `funding_webhooks`, `withdrawal_requests`, `escrow_agreements`, `escrow_milestones`, `escrow_releases`, `reviews`, `reputation_scores`, `reputation_history`

`funding_webhooks` has a unique constraint on Paystack payment reference — the idempotency guard.

#### Events Published

| Event | Async Consumers |
|---|---|
| `finance.wallet.funded` | platform (notif) |
| `finance.withdrawal.completed` | platform (notif) |
| `finance.review.submitted` | marketplace (update listing rating), platform (notif) |
| `finance.threshold.reached` | auth (consider tier upgrade) |

#### Events Consumed

| Event | What Happens |
|---|---|
| `auth.user.registered` | Create wallet (zero balance) |
| `marketplace.order.completed` | Open 14-day rating window |

#### Testing (Vitest)

- Wallet balance integrity: `sum(credits) - sum(debits) = balance`
- 50 concurrent debits on same wallet — no double-spend
- Escrow full lifecycle: create → fund → milestones → release → credit
- Dispute: create → fund → dispute → admin resolve → refund
- Paystack webhook replay: same payment reference 10 times → one credit
- Scoring algorithm with controlled inputs
- Threshold crossing detection

---

### `social`

Feed and messaging.

**Schema:** `social`

#### Domain Files

| File | What It Does |
|---|---|
| `posting.ts` | Create posts. Allowed types: completed project, case study, WIP, collaborator call, service announcement. Reject everything else. |
| `timeline.ts` | Build personalised feed with ranking. |
| `ranking.ts` | Score posts by: work quality signals, verified-user engagement, transaction history, recency. |
| `engagement.ts` | Likes, bookmarks, comments. Per-post metrics. |
| `content-policy.ts` | Detect and reject non-work content. |
| `conversations.ts` | 1:1 conversations. Tier-based messaging limits. Real-time via Fastify WebSocket plugin. |
| `messages.ts` | Send/receive, read receipts, attachments (via R2/S3). |
| `blocking.ts` | Block/unblock. |
| `schema.ts` | Drizzle schema definitions for all social tables. |

#### Public Interfaces

**IFeedService**
- `post(userId, input)` → FeedPost
- `timeline(userId, page)` → Paginated\<FeedPost\>
- `engage(userId, postId, type)` → void

**IMessagingService**
- `startConversation(senderId, recipientId)` → Conversation
- `send(conversationId, senderId, input)` → Message
- `inbox(userId, page)` → Paginated\<Conversation\>

#### Tables

`feed_posts`, `feed_engagements`, `algorithm_weights`, `conversations`, `messages`, `read_receipts`, `attachments`, `blocks`

#### Events Published

| Event | Async Consumers |
|---|---|
| `social.message.sent` | platform (push notif) |
| `social.post.flagged` | platform (moderation queue) |
| `social.engagement.received` | platform (notif) |

#### Events Consumed

| Event | What Happens |
|---|---|
| `members.profile.created` | Enable feed posting |
| `members.portfolio.published` | Auto-create feed post |
| `marketplace.listing.created` | Optionally surface in feed |
| `auth.identity.verified` | Adjust engagement weight for verified users |
| `platform.user.suspended` | Hide content, disable messaging |

#### Testing (Vitest)

- Posting: valid types accepted, invalid rejected
- Ranking with synthetic data
- Messaging: send, receive, rate limiting, blocking
- Timeline generation

---

### `platform`

Notifications, moderation, admin. The operational backbone.

**Schema:** `platform`

#### Domain Files

| File | What It Does |
|---|---|
| `notifications/dispatcher.ts` | Config-driven: reads routing rules from DB (via Drizzle), not code. Adding a notification for a new event = inserting a row, not writing a handler. |
| `notifications/channels/push.ts` | Push notification service adapter (Expo Push Notifications for mobile). |
| `notifications/channels/email.ts` | Email service adapter (Resend or Postmark). Template rendering. |
| `notifications/channels/sms.ts` | SMS service adapter (Termii or Africa's Talking for Nigerian numbers). |
| `notifications/channels/in-app.ts` | In-app feed, stored in DB. Delivered via WebSocket or polling. |
| `notifications/preferences.ts` | Per-member channel preferences. |
| `notifications/templates.ts` | Template management. |
| `moderation/reporting.ts` | Report content/users. Categories: spam, inappropriate, fraud. |
| `moderation/review-queue.ts` | Admin queue: assign, prioritise, resolve. |
| `moderation/actions.ts` | Warn, remove content, suspend, ban. |
| `moderation/auto-detect.ts` | Automated content scanning. |
| `moderation/appeals.ts` | Appeal moderation decisions. |
| `admin/auth.ts` | Admin authentication. RBAC: Super Admin, Moderator, Support. |
| `admin/audit.ts` | Immutable audit log. |
| `admin/settings.ts` | Platform settings: invite limits, fees, tier thresholds, feature flags. |
| `admin/analytics.ts` | Dashboard data from the reporting schema. |
| `admin/bulk-ops.ts` | Mass invite, mass badge, mass notification. |
| `schema.ts` | Drizzle schema definitions for all platform tables. |

#### Config-Driven Notification Routing

The `notification_routes` table drives all routing:

| Column | Type | Purpose |
|---|---|---|
| `id` | Auto-incrementing integer | Primary key |
| `event_type` | Text | Event to match |
| `template_id` | Text | Template to render |
| `recipient_field` | Text | Path into event payload to extract recipient |
| `channels` | Array of text | Which channels to use (push, email, in_app, sms) |
| `enabled` | Boolean | On/off toggle |
| `max_per_user` | Integer | Rate limit: max sends of this type per user |
| `max_per_user_window` | Text | Window for rate limit (e.g., `1 hour`, `1 day`, null = lifetime) |
| `cooldown_seconds` | Integer | Minimum gap between sends of this type to same user |

The dispatcher (a BullMQ worker) is generic. It doesn't know what `marketplace.order.funded` means. It knows: event type X → template Y → recipient at payload path Z → channels A, B, C. New event support is a database insert, not a deploy.

**Notification rate limiting:** A misconfigured route row could spam every user across every channel. The dispatcher enforces per-type rate limits before dispatching: it checks the notification log (via Drizzle query) for recent sends of the same type to the same recipient and skips if the limit is hit. Examples: welcome email has `max_per_user = 1` with no window (lifetime dedup). Push notifications for engagement have `max_per_user = 5, max_per_user_window = '1 hour'`. If no limits are set on a route, the dispatcher applies a global safety default of 10 sends per type per user per hour.

#### Public Interfaces

**IModerationService**
- `report(reporterId, input)` → Report
- `suspend(userId, reason, adminId)` → void
- `ban(userId, reason, adminId)` → void
- `resolveDispute(disputeId, resolution, adminId)` → void

**IAdminService**
- `getSettings()` → PlatformSettings
- `updateSettings(input, adminId)` → PlatformSettings
- `analytics(query)` → AnalyticsResult

#### Tables

`notification_preferences`, `notification_log`, `notification_templates`, `notification_routes`, `moderation_reports`, `moderation_actions`, `content_flags`, `ban_records`, `appeal_records`, `admin_users`, `admin_audit_log`, `platform_settings`

#### Events Published

| Event | Async Consumers |
|---|---|
| `platform.user.suspended` | social (hide content), marketplace (pause listings) |
| `platform.user.banned` | All packages (cleanup) |
| `platform.settings.updated` | All packages (re-read config) |

#### Events Consumed

Everything. This is the fan-in point. But because routing is config-driven, the code doesn't change when new events are added.

#### Testing (Vitest)

- Dispatcher routing logic with mock channel adapters (Resend, Expo Push, Termii)
- Template rendering with various payloads
- Preference filtering (disabled channels don't fire)
- Moderation lifecycle: report → assign → review → action
- Admin RBAC
- Audit log immutability
- Analytics queries against seeded reporting data

#### Seam to Watch

Platform is the largest package by file count (17 domain files) and the only one with nested directories. It's doing triple duty: notifications, moderation, and admin. This is fine at launch — they're all "platform operations" and share an operational cadence. But if moderation grows in complexity (automated content scanning with ML, multi-stage appeal workflows, external review panels), it could justify extraction into its own `moderation` package. The boundaries are already clean: moderation files don't import notification files, and the only shared dependency is the admin audit log.

---

## 11. Dependency Map

```
                    @vvs/contracts (TypeScript types only)
                         │
                    @vvs/shared (Drizzle, BullMQ, Pino, errors)
                         │
        ┌────────┬───────┼───────┬──────────┬──────────┐
        │        │       │       │          │          │
    @vvs/auth  @vvs/   @vvs/  @vvs/     @vvs/     @vvs/
               members market  finance   social   platform
                       place
        │        │       │       │          │         │
        │        │       ├──IF──►│          │         │
        │        │       │       │          │         │
        ├──IF───►│       │       │          │         │
        │        │       │       │          │         │
        ├─event─►├─event►├event─►├──event──►├─event──►│
        │        │       │       │          │         │

    ──IF──►  = interface call (synchronous, DI-injected)
    ─event►  = async event via transactional outbox → BullMQ
```

The only cross-package interface call on the critical transactional path is marketplace → finance. Everything else between packages is async events.

Marketplace also calls auth's `IIdentityService` for tier verification — this is on the listing-creation path, not the payment path.

---

## 12. Testing

All tests use **Vitest**. Integration and E2E tests use a real PostgreSQL instance (via Docker in development, CI service in GitHub Actions).

### Per-Package

| Level | Tests | Deps |
|---|---|---|
| Unit | Pure functions, validation, scoring, state machines | Nothing |
| Integration | Drizzle repositories, BullMQ event publishing, saga paths | Test DB (own schema) + mocked interfaces |
| Contract | Fastify routes return correct shapes and codes | Test DB + Fastify `inject()` |

### Cross-Package E2E

In the API application's E2E test directory. Real PostgreSQL, all schemas, all packages wired:

| Test | Flow |
|---|---|
| Onboarding | Register → invite → redeem → approve → verify → profile |
| Marketplace | List → order → fund escrow → deliver → approve → release → rate |
| Dispute | Order → fund → dispute → admin resolve → refund |
| Social | Profile → portfolio → feed post → engage → notification |
| Notifications | Seed a notification route config row → trigger the matching event → assert the correct channel adapter (Resend/Expo Push/Termii) was called with the correct template and recipient. |

All E2E tests run with mock channel adapters that record calls instead of sending real messages. Assertions verify the adapter was called, with the right payload, via the right channel.

### Financial Stress

- 50 concurrent debits on one wallet → correct final balance, no double-spend
- Multiple concurrent escrow fundings for same client → balance checks serialised
- Same Paystack webhook replayed 10× → wallet credited once

### Failure Injection

- BullMQ/Redis down → outbox accumulates, relay publishes on recovery, zero loss
- PostgreSQL connection lost mid-saga → compensations fire
- Slow consumer → dead-letter queue catches it

---

## 13. Infrastructure at Launch

```
┌─────────────────────────────────────────────────────────┐
│              VPS / Managed Container Platform            │
│           (Railway, Render, or DigitalOcean)             │
│                                                          │
│  ┌───────────┐  ┌────────────┐  ┌──────────────────┐    │
│  │   API     │  │  Workers   │  │  Web + Admin      │    │
│  │ (Fastify) │  │  (BullMQ)  │  │  (Next.js SSR)    │    │
│  └─────┬─────┘  └─────┬──────┘  └────────┬─────────┘    │
│        │               │                  │              │
└────────┼───────────────┼──────────────────┼──────────────┘
         │               │                  │
    ┌────┴─────┐   ┌─────┴─────┐    ┌──────┴──────┐
    │PostgreSQL│   │   Redis   │    │  CDN / R2   │
    │ 16       │   │  (managed)│    │  (files +   │
    │ (managed)│   │           │    │   media)    │
    └──────────┘   └───────────┘    └─────────────┘
```

Managed PostgreSQL and Redis from the hosting provider. CDN-backed object storage for media uploads. Expo EAS handles mobile builds and OTA updates. That's the entire infrastructure footprint.

**Total infrastructure:** 3 services (API, workers, web/admin) + 2 data stores (PostgreSQL, Redis) + 1 object storage bucket. No Kubernetes, no Kafka, no Elasticsearch.

---

## 14. Build Order

| Step | Package | Key Technology | Why This Order |
|---|---|---|---|
| 1 | `shared` | Drizzle client factory, BullMQ outbox writer, Pino logger, Vitest helpers | Everything depends on it |
| 2 | `auth` | Argon2, jose, arctic (OAuth), Fastify routes + JSON schema validation | No business deps. The door to the platform. |
| 3 | `finance` | Drizzle (raw SQL for atomic wallet ops), Paystack adapter, BullMQ reconciliation | Only needs `auth.user.registered` event. Build and stress-test early. |
| 4 | `members` | Drizzle, S3/R2 client for media, PostgreSQL full-text search, `sharp` for thumbnails | Only needs `auth.user.registered` event. Light, fast to build. |
| 5 | `marketplace` | Order saga with injected finance interfaces, Drizzle state machine | Needs finance + auth interfaces. The saga lives here. |
| 6 | `social` | Drizzle, Fastify WebSocket plugin for real-time messaging | Needs member/portfolio events. Can parallel with step 5. |
| 7 | `platform` | BullMQ workers (notification dispatch), config-driven routing, Resend/Postmark/Termii/Expo Push adapters | Needs events from everything. Build last. |

---

## 15. Future Decomposition

The monolith is designed to split if needed. Here's what changes:

| Now | Later | Change |
|---|---|---|
| Interface calls = TypeScript function calls | Interface calls = HTTP/gRPC | Swap Fastify DI binding. Consumer code unchanged. |
| One PostgreSQL instance | Separate databases | Each schema already has own Drizzle migrations, roles, connections. |
| One BullMQ relay | Per-service relay | Relay is already separate from business code. |
| One Turborepo repo | Multiple repos | Extract along package lines. |

**Split when:** dedicated teams per domain (3+ engineers on finance), independent deploy cadence needed, or regulatory isolation required (e.g. PCI for payments).

### `finance` — The Hardest Split

Finance is the one package deliberately designed to resist decomposition. Escrow and wallet share a schema so that milestone release → wallet credit can happen in a single Drizzle database transaction. This is the right trade-off for data integrity at current scale.

If compliance or team growth forces a split (e.g., wallet becomes its own service), the shared-transaction assumption breaks. At that point, escrow release → wallet credit becomes a saga within finance's own boundary:

1. Escrow marks milestone as `release_pending`
2. Escrow calls wallet service (now over the network) to credit
3. On success: escrow marks milestone as `released`
4. On failure: escrow retries (idempotent credit), escalates to admin after 3 failures
5. BullMQ reconciliation job catches any drift between escrow's `release_pending` records and wallet's credit confirmations

This is more complex than the current in-process transaction, which is exactly why the split shouldn't happen until it's forced by external requirements.

---

## 16. Summary

### Architecture

| Package | Domain Files | Tables | Interfaces Exposed | Events Out |
|---|---|---|---|---|
| contracts | types only | 0 | — | — |
| shared | 6 dirs | 2 | — | — |
| auth | 11 | 10 | IAuthService, IReferralService, IIdentityService | 4 |
| members | 7 | 7 | IProfileService, IPortfolioService | 3 |
| marketplace | 6 | 6 | IListingService, IOrderService | 5 |
| finance | 11 | 11 | IWalletService, IEscrowService, IRatingsService | 4 |
| social | 8 | 8 | IFeedService, IMessagingService | 3 |
| platform | 17 | 12 | IModerationService, IAdminService | 3 |
| **Total** | **66 + types** | **56** | **10** | **22** |

### Technology

| Category | Count | Components |
|---|---|---|
| **Core Runtime** | 3 | TypeScript, Node.js, Fastify |
| **Data** | 3 | PostgreSQL, Drizzle ORM, Redis |
| **Async** | 1 | BullMQ |
| **Clients** | 2 | Next.js (web + admin), Expo (mobile) |
| **Toolchain** | 5 | pnpm, Turborepo, Vitest, Biome, tsx |
| **External Services** | 4 | Paystack, R2/S3, Resend/Postmark, Expo Push |
| **Infrastructure** | 3 | Managed PostgreSQL, Managed Redis, Managed container platform |

**14 dependencies that matter.** One language, one database, one cache/queue, and frameworks that stay out of the architecture's way. The spec is well-designed. The tech stack honours it.