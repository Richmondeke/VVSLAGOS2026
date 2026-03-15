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

### Exit Criteria
- BullMQ queue factory creates typed queues backed by Redis
- Outbox writer correctly writes to outbox within a Drizzle transaction (verified by test)
- Relay worker picks up unpublished events and enqueues them to BullMQ (verified by test)
- Correlation ID threads through 3+ async hops via AsyncLocalStorage (test)
- All 6 error types exist with correct `statusCode` values
- `withTestTransaction` rolls back all DB writes after each test (verified by test)
- `pnpm vitest run` passes across the shared package
