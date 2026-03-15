# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a **specification-first project** — all architecture and product decisions are documented but implementation has not yet begun. The `docs/` directory contains the full technical spec; the monorepo code structure (apps/, packages/, migrations/) is yet to be created.

## Planned Tech Stack

- **Runtime:** Node.js LTS, TypeScript strict mode
- **API:** Fastify (plugin architecture maps to modular monolith domains)
- **ORM:** Drizzle (code-first schemas, clean SQL migrations)
- **Queue:** BullMQ + Redis (retries, delayed jobs, dead-letter handling)
- **Database:** PostgreSQL 16 (one instance, one schema per domain package)
- **Monorepo:** pnpm 9.x workspaces + Turborepo 2.x
- **Frontend:** Next.js (web/admin), Expo (mobile)
- **Linting/Formatting:** Biome

## Planned Commands

Once the monorepo is scaffolded:

```bash
pnpm install            # Install all workspace dependencies
pnpm biome check .      # Lint + format check
pnpm tsc --noEmit       # Type check across monorepo
pnpm vitest run         # Run all tests
pnpm turbo build        # Build all packages (cached)
pnpm turbo test         # Run tests with Turborepo cache
```

Single-package test (once packages exist):
```bash
pnpm --filter @vvs/auth vitest run
```

## Architecture: Modular Monolith

One deployable API process with strict internal boundaries between domains. Designed to decompose into microservices later — module boundaries are the seams.

### Domain Packages (`packages/`)

| Package | Responsibility |
|---------|---------------|
| `shared` | Drizzle DB client, BullMQ factory, Pino logger, error types, test utils |
| `auth` | Registration, login, invites, KYC, member tiers, badges |
| `members` | Profiles, portfolios, case studies, media |
| `marketplace` | Listings, orders, order state machine, deliverables |
| `finance` | Wallets, escrow, ledger, Paystack integration, ratings/reputation |
| `social` | Feed, messaging, real-time engagement |
| `platform` | Notifications, moderation, admin operations, audit log |

### Cross-Domain Communication

Two patterns — never cross them:

1. **Interface calls** (synchronous, typed, DI-injected): For requests needing immediate response — balance checks, escrow operations, tier verification. Example: `marketplace` calls `IEscrowService` from `finance` to fund escrow within the order saga.

2. **Async events via transactional outbox**: For fire-and-forget — notifications, feed updates, analytics. Event written to `outbox` schema in the **same DB transaction** as the state change, then relayed to BullMQ.

### Database Schema Layout

One PostgreSQL instance, isolated per domain:
- Schemas: `auth`, `members`, `marketplace`, `finance`, `social`, `platform`, `reporting`, `outbox`
- Each package connects via its own DB role with access to its schema only
- Append-only tables (`order_state_log`, `ledger_entries`, `audit_logs`) use declarative partitioning

### Order Saga (Critical Flow)

The most complex flow — order creation through payment release:

```
draft → pending_funding → funded → in_progress → delivered → pending_approval → completed → rated
```

- Uses **interface calls** (not events) for consistency within the saga
- Every state transition appended to `order_state_log` (immutable audit trail)
- Escrow funded synchronously; release triggered by buyer approval event

### Event Reliability

- **Transactional outbox**: prevents lost events on process crash
- **Idempotency keys**: all Paystack webhooks and event handlers deduplicated
- **Consumer offsets**: tracked in DB to prevent reprocessing
- **Dead-letter queue**: failed events after 5 retries go to admin-inspectable `outbox.dead_letters`

## Testing Strategy

Framework: **Vitest**

| Level | Scope | Isolation |
|-------|-------|-----------|
| Unit | Pure functions, state machines, scoring | No dependencies |
| Integration | Drizzle repositories, BullMQ publishing, saga flows | Per-test rolled-back DB transaction via `withTestTransaction()` |
| Contract | Fastify routes (response shapes + HTTP status) | Fastify `inject()` + test DB |
| E2E | Full user journeys across all packages | Real PostgreSQL, all schemas wired |

E2E journeys to maintain: onboarding, marketplace order lifecycle, dispute resolution, notifications.

## Key Design Decisions (see `docs/architecture/` for full rationale)

- **Reputation is transaction-based**: scores derived only from completed paid transactions, not followers or posts
- **Referral-only membership**: every member must be invited; approval required before full access
- **Escrow-first payments**: funds held in platform escrow until buyer approves delivery
- **Additive-only events**: breaking event schema changes get new event names with migration window

## Implementation Build Order

When implementing, follow this dependency order:
1. `shared` (infrastructure primitives)
2. `auth`
3. `finance`
4. `members`
5. `marketplace`
6. `social`
7. `platform`
8. Next.js web/admin client
9. Expo mobile client

## Docs Reference

- `docs/architecture/` — 14 technical spec documents (DB schema, event catalog, API contracts, etc.)
- `docs/implementation-plan/` — 9-module implementation roadmap with task-level detail
- `docs/prd/` — Product requirements
