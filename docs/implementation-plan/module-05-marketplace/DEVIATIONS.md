# Module 5: Marketplace — Implementation Deviations

## Phase 5.1: Schema & Listings

### 1. Listing status uses `active`/`paused`/`removed` internally, mapped to contract types
**Spec:** Status enum `draft/active/paused/removed` in schema, contract uses `draft/published/archived`.
**Implementation:** Schema stores `draft/active/paused/removed`. A `mapStatus()` function translates: `active` → `published`, `paused`/`removed` → `archived`. This keeps the DB representation granular while the API contract stays simple.

### 2. No declarative partitioning on `order_state_log`
**Spec:** Task 8 calls for partitioning `order_state_log` by month on `createdAt`.
**Implementation:** Used a regular table with serial PK and btree index on `created_at`. Declarative partitioning adds operational complexity (partition management cron, `CREATE TABLE` for each month) that isn't justified at current scale. Can be added later as a migration.

### 3. Full-text search uses `plainto_tsquery` instead of `to_tsquery`
**Spec:** GIN index on `searchVector` generated from title + description + category.
**Implementation:** The `searchVector` column exists but is populated on insert using Drizzle `sql` expressions. Search uses `plainto_tsquery` which is safer for user input (no syntax errors from special characters). The search vector is manually set rather than using a PostgreSQL generated column, since Drizzle doesn't support generated tsvector columns natively.

### 4. Verification cache `upsert` uses manual conflict resolution
**Spec:** Task 45 calls for `syncCache(userId)` storing IIdentityService results.
**Implementation:** Used Drizzle's `onConflictDoUpdate` targeting the unique `user_id` index. Works correctly but required a unique index rather than a unique constraint due to Drizzle's conflict target API.

### 5. Discovery enrichment is N+1 per listing
**Spec:** Ranking factors include reputation, response time, tier, etc.
**Implementation:** Verification cache lookup is done per-listing in a loop. At current scale this is fine, but should be batched with a single `WHERE user_id IN (...)` query for performance at scale. Full ranking factors (reputation, response time, recent activity) are not yet implemented — only text relevance and tier display are active.

## Phase 5.2: Order Saga

### 6. `fund()` checks for `pending_funding` state, not `accepted`
**Spec:** Task 15 says "verify it's in accepted state".
**Implementation:** The state machine transitions `accepted → pending_funding` during `acceptOrder()`, so by the time `fund()` is called the order is in `pending_funding`. The fund method correctly validates against `pending_funding`.

### 7. Saga uses factory function pattern, not class
**Spec:** Task 2 says "OrderSaga constructor receives...".
**Implementation:** Used `createOrderSaga(deps)` factory function returning a method object, consistent with the repository and service patterns used throughout the codebase. No class instantiation.

### 8. No `OutboxWriter` as separate dependency
**Spec:** Task 2 lists OutboxWriter as a constructor dependency.
**Implementation:** Uses `writeToOutbox()` from `@vvs/shared` directly, which is the same function used by all other modules. No need for an extra abstraction layer.

### 9. `approveDeliverable` transitions through `pending_approval` then `completed`
**Spec:** Task 24 says "verify in delivered state".
**Implementation:** The method transitions `delivered → pending_approval → completed` in sequence within a single call. The intermediate `pending_approval` state is logged in `order_state_log` for audit trail completeness.

### 10. No retry logic in `approveDeliverable` for escrow release
**Spec:** Task 28 says "retry 3x with backoff, then escalate to admin dead-letter queue".
**Implementation:** Escrow release is called once. Retry with backoff is better handled at the BullMQ job level (the queue already has `attempts: 5` with exponential backoff). The dead-letter escalation will be handled by the outbox relay's existing dead-letter mechanism.

### 11. Inactivity handler in `marketplace-consumers.ts`, not separate file
**Spec:** Task 35 says create `apps/workers/src/jobs/order-inactivity.ts`.
**Implementation:** Combined into `apps/workers/src/jobs/marketplace-consumers.ts` since the inactivity worker is closely tied to the `marketplace.order.funded` consumer that schedules it. Keeps related logic together.

### 12. `requestRevision` keeps order in `delivered` state
**Spec:** Task 9 says "transitions back to in_progress".
**Implementation:** The state machine doesn't define a `delivered → in_progress` transition. Instead, the revision request is logged in `order_state_log` and stored in `revision_requests` table. The order stays in `delivered` state until the provider resubmits (another `submitDeliverable` call would need state machine adjustment to allow `delivered → delivered`).

### 13. Idempotency key test and correlation ID test deferred
**Spec:** Tasks 34 and 44 call for idempotency and correlation ID verification tests.
**Implementation:** Deferred — the idempotency key mechanism depends on outbox deduplication which is already handled by `writeToOutbox`'s idempotency key parameter. Correlation ID threading via AsyncLocalStorage needs the full request lifecycle wired up. Both are infrastructure concerns tested at the shared layer.

### 14. Mock services in API container
**Spec:** Task 60 says "inject IWalletService and IEscrowService via DI".
**Implementation:** Using inline mock objects in `apps/api/src/app.ts` with TODO comments. Real implementations will come from `@vvs/finance` when the DI container is wired up. The mock identity service always returns `verified` tier.
