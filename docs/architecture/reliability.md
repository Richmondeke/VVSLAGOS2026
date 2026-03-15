# Reliability Primitives

## Transactional Outbox

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

## Idempotency

Every event handler and Paystack webhook handler can be called twice (or ten times) and produce the same result. Tables that receive event-driven writes have unique constraints on idempotency keys. Application code checks before writing. The database enforces as a safety net.

For Paystack webhooks specifically: the webhook tracking table has a unique constraint on payment reference. Replay the same webhook 50 times, the wallet gets credited once.

## Consumer Offset Tracking

Every event consumer uses the same deduplication pattern — no ad-hoc logic per handler. A shared `consumer_offsets` table tracks what each consumer has processed:

| Column | Type | Constraints |
|---|---|---|
| `consumer_name` | Text | Composite primary key |
| `event_id` | Integer (FK → outbox) | Composite primary key |
| `processed_at` | Timestamp with timezone | Default now |

Every consumer handler (implemented as BullMQ workers) follows the same pattern: check if already processed → if yes, skip → if no, handle then record offset.

## Event Ordering

Events for the same entity can arrive out of sequence — `order.funded` after `order.completed` — which breaks projections and notifications.

**Rule:** Every outbox event carries an `ordering_key` (e.g., `order:abc123`, `wallet:user456`).

The relay publishes events with the same ordering key to the same BullMQ queue or job name. BullMQ processes jobs sequentially within a named queue when concurrency is set to 1 per ordering group.

**For consumers that don't need ordering** (analytics, reporting), they process with higher concurrency for maximum throughput.

**For consumers that do** (notifications, feed projections), they subscribe per ordering key and process sequentially.

## Saga Orchestration

The order-to-payment flow (order → escrow → wallet) is a state machine in the marketplace package:

```
Order States:
  draft → pending_funding → funded → in_progress → delivered →
  pending_approval → completed → rated

  Any state → disputed → resolved_released | resolved_refunded
  Any state before in_progress → cancelled → refunded
```

The saga uses interface calls to the finance package, not events. Every state transition is logged in the `order_state_log` — an append-only audit trail of what happened, when, why, and what compensating actions were taken.

**Correlation ID threading:** The Fastify request that triggers a saga carries a correlation ID (generated at the gateway via a Fastify `onRequest` hook, stored in `AsyncLocalStorage`). Every interface call within the saga passes this ID through. Every log line (via Pino), every state transition record, and every outbox event includes it. When something fails in production, search by correlation ID and you get the entire saga trail — wallet debit, escrow creation, state transitions, compensations — in one query.

## Dead-Letter Queue

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

## Event Versioning

Default strategy: additive only. New fields are optional. Existing fields never removed or renamed. If a new version adds `totalAmount` and `currency`, they're optional — existing consumers ignore them.

Breaking changes get a new event name (e.g., `order.completed.v3`). Old event published alongside new one for minimum 30 days while consumers migrate.

## Reconciliation

Any package that caches another package's data runs a scheduled reconciliation job (via BullMQ repeatable jobs). The job compares its local projection against the source of truth (via interface call) and corrects drift. If corrections exceed 5% of cached records, an alert fires.

## Rate Limiting

System-wide rate limiting lives in the Fastify API layer (via `@fastify/rate-limit` backed by Redis), not inside individual packages. Applied before any business logic runs.

| Layer | Mechanism | Limits |
|---|---|---|
| Global | Per-IP sliding window (Redis) | 200 req/min unauthenticated, 600 req/min authenticated |
| Per-user | Token bucket (Redis) | 300 req/min across all endpoints |
| Sensitive endpoints | Stricter per-user limits | Login: 10/min. Password reset: 5/min. Funding/withdrawal: 20/min. |
| Tier-based (in-package) | Enforced inside social package | Free tier messaging: 20 messages/day. Verified: 100/day. Pro: unlimited. |

Rate limit responses return HTTP 429 with a `Retry-After` header. Limits are stored in Redis and configurable via platform admin settings.

## Data Retention

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
