## Phase 1.3 Task List: Database Client & Outbox Schema

### PostgreSQL Setup
[x] 1.  Create `docker-compose.yml` at repo root with PostgreSQL 16 service
[x] 2.  Set up PostgreSQL with username, password, and database name
[x] 3.  Add `.env.local` template for DATABASE_URL, REDIS_URL vars
[x] 4.  Run `docker compose up -d` and verify connection with psql

### Drizzle Setup
[x] 5.  Install `drizzle-orm` and `postgres` driver in `packages/shared`
[x] 6.  Install `drizzle-kit` as devDependency at root
[x] 7.  Create `packages/shared/src/db/client.ts` with `createScopedClient(schema)` factory
[x] 8.  Implement connection pool configuration (max connections, idle timeout)
[x] 9.  Create `packages/shared/src/db/migration-runner.ts` using drizzle-kit integration
[x] 10. Add `drizzle.config.ts` at repo root pointing to all schema files
[x] 11. Test basic query with scoped client against PostgreSQL instance

### Outbox Schema
[x] 12. Create `packages/shared/src/schema.ts` with outbox schema definition
[x] 13. Define `outbox.events` table per spec (id, eventType, eventVersion, payload, idempotencyKey, orderingKey, createdAt, publishedAt)
[x] 14. Define `outbox.dead_letters` table per spec (id, original_event_id, event_type, payload, error_message, retry_count, failed_at, resolved_at, resolution)
[x] 15. Define `outbox.consumer_offsets` table per spec (consumer_name, event_id, processed_at)
[x] 16. Add GIN index on `created_at` filtered WHERE `published_at IS NULL` for polling efficiency
[x] 17. Generate migration: `drizzle-kit generate` for outbox schema
[x] 18. Run migration and verify tables created in PostgreSQL

### Scoped Client
[x] 19. Implement `createScopedClient` — returns a Drizzle client restricted to one schema
[x] 20. Each business package gets its own database role with schema-only access
[x] 21. Write SQL to create roles: auth_role, members_role, marketplace_role, finance_role, social_role, platform_role
[x] 22. Create `packages/shared/src/db/roles.sql` with all GRANT statements
[x] 23. Verify role isolation: finance_role cannot read from auth schema (test with psql)
[x] 24. Every role can INSERT into outbox.events (append-only grant)

### Drizzle Kit Config
[x] 25. Add `migrate` script to root `package.json`: runs drizzle-kit migrate
[x] 26. Add `generate` script: runs drizzle-kit generate
[x] 27. Verify migration files are clean SQL (no Prisma-style engine blocks)
[ ] 28. Test rollback strategy manually (drop migration, re-run)
