## Phase 1.5 Task List: Fastify API Shell

### Fastify Setup
[x] 1.  Install `fastify`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/multipart` in `apps/api`
[x] 2.  Create `apps/api/src/index.ts` — starts server on configured port
[x] 3.  Create `apps/api/src/app.ts` — builds and configures Fastify instance
[x] 4.  Register global error handler using `mapErrorToHttp` from shared errors
[x] 5.  Register correlation ID hook: generates UUID on each request, stores in AsyncLocalStorage
[x] 6.  Add request logging hook: logs method, path, correlationId on request + response
[x] 7.  Register `@fastify/rate-limit` with Redis backend (200/min unauth, 600/min auth)
[x] 8.  Create `apps/api/src/container.ts` — DI wiring placeholder (to be filled per module)
[x] 9.  Create health check route: GET /health → `{ status: 'ok', timestamp: ... }`
[x] 10. Test health check endpoint with Vitest's inject()

### JSON Schema Validation
[x] 11. Define Fastify schema conventions: all routes have request + response schemas
[x] 12. Create `apps/api/src/schemas/common.ts` with shared Fastify schema fragments (pagination, money, error response)
[x] 13. Add Ajv strict mode to Fastify config (unknown properties rejected by default)

### Rate Limiting
[x] 14. Configure per-IP sliding window: 200/min unauthenticated
[ ] 15. Configure per-user token bucket: 300/min authenticated
[ ] 16. Add stricter limits for sensitive endpoints (to be applied per-route): login 10/min, password reset 5/min, funding/withdrawal 20/min
[ ] 17. Verify rate limit returns HTTP 429 with `Retry-After` header

### DI Container Pattern
[x] 18. Create `apps/api/src/container.ts` demonstrating the DI wiring pattern
[x] 19. Document in comments: how to add a new package's services to the container
[ ] 20. Fastify decorates the request object with `req.container` giving access to injected services

### Workers Shell
[x] 21. Create `apps/workers/src/index.ts` — starts BullMQ workers
[x] 22. Register relay worker (from Phase 1.4) in the workers app
[x] 23. Add graceful shutdown handler: flush pending BullMQ jobs, close DB connection
[ ] 24. Test: start workers process, verify it connects to Redis and logs startup

### Environment Config
[x] 25. Install `zod` in `packages/shared`
[x] 26. Create `packages/shared/src/config/env.ts` with Zod schema for all env vars
[x] 27. Env vars: DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV, PORT, LOG_LEVEL
[x] 28. App fails fast with clear error if any required env var is missing
[ ] 29. Test: start app without DATABASE_URL — expect clear error message, not stack trace
