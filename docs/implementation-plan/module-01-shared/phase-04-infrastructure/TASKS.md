## Phase 1.4 Task List: BullMQ, Logger, Errors, Test Utils

### Redis + BullMQ Setup
[x] 1.  Add Redis service to `docker-compose.yml`
[x] 2.  Install `bullmq` and `ioredis` in `packages/shared`
[x] 3.  Create `packages/shared/src/events/queue-factory.ts` — creates typed BullMQ queues
[x] 4.  Create `packages/shared/src/events/outbox-writer.ts` — writes to outbox.events within a Drizzle transaction
[x] 5.  Implement outbox writer: accepts db transaction context + event payload, writes atomically
[x] 6.  Create `packages/shared/src/events/relay-worker.ts` — polls unpublished outbox events, pushes to BullMQ
[x] 7.  Relay worker: uses `SELECT ... FOR UPDATE SKIP LOCKED` to avoid double-processing
[x] 8.  Relay worker: marks events as published after successful BullMQ enqueue
[x] 9.  Create in-memory event bus for Vitest tests (no Redis required in unit tests)
[ ] 10. Test: write event to outbox in a transaction, verify relay picks it up and enqueues to BullMQ

### Pino Logger
[x] 11. Install `pino` and `pino-pretty` in `packages/shared`
[x] 12. Create `packages/shared/src/logger/index.ts` with root logger factory
[x] 13. Implement `AsyncLocalStorage` for correlation ID propagation
[x] 14. Implement `createChildLogger(packageName)` for namespaced loggers
[x] 15. Logger must include: correlationId, packageName, timestamp, level
[x] 16. In test environment: use `pino-pretty` with minimal output
[x] 17. In production: structured JSON output
[x] 18. Test: verify correlationId threads through AsyncLocalStorage across async calls

### Error Types
[x] 19. Create `packages/shared/src/errors/index.ts`
[x] 20. Implement `NotFoundError` (maps to HTTP 404)
[x] 21. Implement `ForbiddenError` (maps to HTTP 403)
[x] 22. Implement `ValidationError` (maps to HTTP 400) with field-level details
[x] 23. Implement `ConflictError` (maps to HTTP 409)
[x] 24. Implement `InsufficientFundsError` (maps to HTTP 422) with walletId and requiredAmount
[x] 25. Implement `UnauthorizedError` (maps to HTTP 401)
[x] 26. Each error class: extends Error, has a `code` string, a `statusCode` number
[x] 27. Create `mapErrorToHttp(error)` utility used by Fastify error handler

### Idempotency Utilities
[x] 28. Create `packages/shared/src/idempotency/key-generator.ts`
[x] 29. Implement `generateIdempotencyKey(prefix, ...parts)` — deterministic UUID from inputs
[x] 30. Implement `checkIdempotency(db, key)` — returns existing result or null
[x] 31. Implement `recordIdempotency(db, key, result)` — stores result atomically

### Test Utilities
[x] 32. Install `vitest` as devDependency in `packages/shared`
[x] 33. Create `packages/shared/src/test-utils/factories.ts`
[x] 34. Implement `createTestUser(overrides?)` factory
[x] 35. Implement `createTestWallet(overrides?)` factory
[x] 36. Implement `createTestOrder(overrides?)` factory
[x] 37. Create `packages/shared/src/test-utils/db.ts` — test DB helpers
[x] 38. Implement `withTestTransaction(fn)` — wraps test in a rolled-back transaction
[x] 39. Implement `seedTestDb(schemas)` — applies schemas and seeds minimal data
[x] 40. Create `vitest.config.ts` at repo root with workspace support
[x] 41. Run `pnpm vitest run` — all tests pass (24 tests across 5 files)
