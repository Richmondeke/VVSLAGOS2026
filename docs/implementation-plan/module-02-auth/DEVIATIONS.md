# Module 2: Auth — Implementation Deviations

## Phase 2.1: Schema & Repository Layer

### 1. `users.status` includes additional values
**Spec:** `active | suspended | banned`
**Actual:** `active | suspended | banned | pending_approval | rejected`
**Reason:** Registration flow requires `pending_approval` for invite-only approval queue, and `rejected` for admin-rejected users. These states are needed before Phase 2.2 registration logic.

### 2. `member_tiers` has a `seq` identity column
**Spec:** Only `id`, `userId`, `tier`, `changedBy`, `reason`, `createdAt`
**Actual:** Added `seq` integer column with `GENERATED ALWAYS AS IDENTITY`
**Reason:** `createdAt` timestamps can be identical for rapid inserts within the same transaction (e.g., during tier migration scripts or tests). The `seq` column provides deterministic insertion ordering for `getCurrentTier()` and `getHistory()` queries.

### 3. Migration uses `CREATE SCHEMA IF NOT EXISTS`
**Spec:** Standard Drizzle-generated `CREATE SCHEMA`
**Actual:** Manually patched to `CREATE SCHEMA IF NOT EXISTS "auth"`
**Reason:** The `auth` schema may already exist from `seedTestDb()` in `@vvs/shared` test utils. Without `IF NOT EXISTS`, the migration fails on databases where schemas were pre-created.

### 4. `sessions` partial index simplified
**Spec:** Index on `WHERE revoked_at IS NULL AND expires_at > NOW()`
**Actual:** Index on `WHERE revoked_at IS NULL`
**Reason:** PostgreSQL requires partial index predicates to use only IMMUTABLE functions. `NOW()` is STABLE, not IMMUTABLE, so it cannot be used in a partial index. Expiry filtering happens at query time instead.

## Phase 2.2: Registration, Login, Sessions

### 5. OAuth state is base64url-encoded instead of using cookies
**Spec:** No specific mechanism prescribed
**Actual:** PKCE `codeVerifier` is encoded into the OAuth `state` parameter as base64url JSON
**Reason:** Avoids `@fastify/cookie` dependency and cookie management. Stateless approach — all OAuth callback data travels in the URL state parameter.

### 6. Login rate limiting deferred
**Spec:** 5 failed attempts = lock
**Actual:** Not implemented at the service layer
**Reason:** Rate limiting is handled by `@fastify/rate-limit` at the route level (already configured in the API shell). Per-user login attempt tracking (DB-backed) can be added when the admin approval queue is built in Phase 2.3.

### 7. OAuth callback test deferred
**Spec:** Test OAuth callback with known/unknown email
**Actual:** OAuth integration tests deferred
**Reason:** Requires mocking Google's token endpoint and userinfo endpoint. Will add when testing infrastructure for external HTTP mocks is set up.

### 8. Container wiring deferred
**Spec:** Register routes plugin in `apps/api/src/container.ts`
**Actual:** Deferred
**Reason:** The API shell needs a scoped DB client for the auth schema. Will wire when connecting the API to the auth database with proper schema routing.

### 9. `pnpm.onlyBuiltDependencies` added to root package.json
**Spec:** Not mentioned
**Actual:** Added `@biomejs/biome`, `argon2`, `esbuild`, `msgpackr-extract` to allowed build list
**Reason:** pnpm 10.x blocks native module builds by default. argon2 requires native compilation for Argon2id password hashing.
