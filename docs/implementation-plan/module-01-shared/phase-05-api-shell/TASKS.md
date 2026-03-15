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

### Exit Criteria
- `GET /health` returns `200 { status: 'ok' }` with < 50ms response time
- Correlation ID appears in all log lines for a single request
- Rate limiter correctly 429s after limit is exceeded (test with hey or similar)
- Missing env var causes immediate process exit with descriptive error
- `pnpm dev` starts API + workers with hot reload
