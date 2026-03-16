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
