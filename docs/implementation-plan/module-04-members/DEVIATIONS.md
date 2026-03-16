# Module 4: Members — Implementation Deviations

## Phase 4.1: Schema & Profiles

### 1. `searchVector` is not a generated column
**Spec:** `searchVector tsvector` generated column from bio + profession + skills
**Actual:** Plain `tsvector` column (not auto-generated)
**Reason:** Drizzle ORM doesn't natively support PostgreSQL generated columns with `tsvector` type. The search vector needs to be updated manually (via a trigger or application-level update) when bio/profession/skills change. A DB trigger can be added later for automatic maintenance.

### 2. `profiles.availabilityStatus` uses different values than contract type
**Spec (contracts):** `"available" | "unavailable" | "limited"`
**Actual (schema):** `"available" | "busy" | "not_taking_work"`
**Reason:** The task list explicitly specifies `available/busy/not_taking_work` for the schema. A mapping layer in `profiles.ts` translates between schema values and contract types (`busy` → `limited`, `not_taking_work` → `unavailable`).

### 3. `profiles.primaryCategoryId` is UUID, not a string category name
**Spec (contracts):** `category: string` on the `Profile` type
**Actual (schema):** `primary_category_id UUID` referencing `profile_categories`
**Reason:** The task list specifies a `profile_categories` reference table with proper relational design. The contract's `category` string field is populated at the service layer (currently returns empty string — will resolve via category lookup when categories are seeded).

### 4. `profiles` has `displayName` not in the contract type
**Spec (contracts):** No `displayName` field on `Profile`
**Actual (schema):** `display_name text` column on profiles
**Reason:** The task list explicitly specifies `displayName` as a column. It's stored in the schema for future use but not exposed via the contract interface yet.

### 5. `case_studies.metrics` stored as text, not jsonb
**Spec:** `metrics (text)` per task list
**Actual:** `text` column, JSON-serialized at the service layer
**Reason:** The task list specifies `text` type. The contract type uses `Record<string, string | number>`. Serialization/deserialization happens in `portfolio.ts` via `JSON.stringify`/`JSON.parse`.

### 6. Migration uses `CREATE SCHEMA IF NOT EXISTS`
**Spec:** Drizzle-generated `CREATE SCHEMA "members"`
**Actual:** Manually patched to `CREATE SCHEMA IF NOT EXISTS "members"`
**Reason:** Same as Module 2 — the `members` schema may already exist from `seedTestDb()` in `@vvs/shared` test utils.

### 7. `ProfileSummary.tier` and `verificationStatus` are hardcoded
**Spec:** `tier: MemberTier` and `verificationStatus: VerificationStatus` on `ProfileSummary`
**Actual:** Returns `"free"` and `"pending"` respectively
**Reason:** Tier and verification data lives in the `auth` schema. Cross-domain resolution requires an interface call to `IIdentityService.getTier()` and `IIdentityService.getStatus()`. This will be wired when the DI container connects auth and members services.

### 8. `findPublicByUsername` implemented as `findPublicByUserId`
**Spec (task 16):** `findPublicByUsername(username)` — public profile lookup
**Actual:** `findPublicByUserId(userId)` — lookup by user ID + public flag
**Reason:** The schema has no `username` column (not in the task list or contracts). User IDs are used as the public profile identifier. A username field can be added to profiles later if needed.

### 9. Workers and API tsconfig changes
**Spec:** Not specified
**Actual:** Set `composite: false` in `apps/api/tsconfig.json` and `apps/workers/tsconfig.json`; removed `paths` from `tsconfig.base.json`
**Reason:** App-level tsconfigs with `composite: true` (inherited from base) couldn't resolve cross-package imports via `package.json` `exports`. Apps don't need to emit declarations, so `composite: false` is correct. The `paths` in the base config resolved relative to each extending config's directory (wrong), so they were removed in favor of pnpm workspace resolution via `package.json` `exports` fields.

### 10. Soft delete doesn't mark title
**Spec (task 36):** `deleteItem(itemId, userId)` — soft delete
**Actual:** Sets `isPublished = false` only
**Reason:** No `deletedAt` column exists in the schema. Soft delete is implemented by unpublishing. A `deletedAt` timestamp column could be added later for proper soft-delete semantics with filtered queries.
