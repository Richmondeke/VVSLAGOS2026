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
[ ] 15. Define `outbox.consumer_offsets` table per spec (consumer_name, event_id, processed_at)
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
