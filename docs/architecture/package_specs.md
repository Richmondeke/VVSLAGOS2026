# Package Specifications

This section describes the role and surface area of each package in the monorepo.

## `contracts`

Type-only package. Zero runtime dependencies. Every package depends on this for shared vocabulary — TypeScript interfaces, enums, event payload types, Zod schemas for validation. Sub-exports per domain: `@vvs/contracts/auth`, `@vvs/contracts/finance`, etc.

Separated from `shared` deliberately: a type change here only invalidates packages that import the changed type. It doesn't trigger rebuilds of packages that only depend on runtime utilities like the logger or DB client.

---

## `shared`

Foundation infrastructure. No business logic.

| Directory | What It Does |
|---|---|
| `db/` | Drizzle client factory, `createScopedClient(schema)`, connection pooling (via `postgres` driver or `node-postgres`), migration runner integration with `drizzle-kit`. |
| `events/` | Outbox writer (Drizzle transaction insert), BullMQ consumer registration, in-memory implementation for Vitest tests. |
| `errors/` | `NotFoundError`, `ForbiddenError`, `ValidationError`, `ConflictError`, `InsufficientFundsError`. Mapped to HTTP status codes by a Fastify error handler. |
| `logger/` | Pino structured JSON logging with correlation IDs via `AsyncLocalStorage`. Namespaced child loggers per package. |
| `test-utils/` | Factories (`createTestUser()`, `createTestWallet()`), in-memory event bus, Drizzle transaction wrappers for test isolation. |
| `idempotency/` | Key generation and deduplication utilities. |

**Schema:** `outbox`

---

## `auth`

Everything involved in getting onto the platform and proving who you are.

**Schema:** `auth`

### Domain Files

| File | What It Does |
|---|---|
| `registration.ts` | Sign-up (email/phone + password or social login). Creates auth record only — profile creation is the members package's job via event. |
| `login.ts` | Credential validation (argon2 verify), session creation. |
| `session.ts` | JWT issuance (via `jose`), refresh, revocation, device tracking. |
| `password.ts` | Argon2 hashing (adaptive cost), reset flow, change password. |
| `oauth.ts` | Social login adapters via `arctic` (pluggable per provider — Google, Apple, etc). |
| `invites.ts` | Generate invite codes/links. Enforce per-member limits by tier. |
| `referrals.ts` | Redeem invites, link invitee to inviter, track referral chains. |
| `approval.ts` | Queue new sign-ups for admin approval. Approve/reject. |
| `verification.ts` | KYC document upload (to R2/S3), third-party identity verification (pluggable provider), admin manual review. |
| `tiers.ts` | Tier management: Free → Verified → VVS Circle/Pro. Controls what each tier can do. |
| `badges.ts` | Issue and revoke badges (Verified, Founding Member, Pro). |
| `schema.ts` | Drizzle schema definitions for all auth tables. |

### Public Interfaces

**IAuthService**
- `register(input)` → AuthUser
- `login(input)` → Session
- `refreshSession(token)` → Session
- `revokeSession(sessionId)` → void

**IReferralService**
- `generateInvite(userId)` → InviteCode
- `redeemInvite(code, userId)` → Referral
- `approve(referralId)` → void
- `reject(referralId, reason)` → void

**IIdentityService**
- `submitVerification(userId, docs)` → Verification
- `getStatus(userId)` → VerificationStatus
- `getTier(userId)` → MemberTier
- `upgradeTier(userId, tier)` → void

### Events Published

| Event | Async Consumers |
|---|---|
| `auth.user.registered` | members (scaffold profile), finance (create wallet), platform (welcome notif via Resend/Postmark) |
| `auth.referral.approved` | platform (approval notif) |
| `auth.identity.verified` | members (badge update), platform (notif), social (feed visibility) |
| `auth.user.deactivated` | platform (cleanup), social (hide content) |

---

## `members`

Member presence — profiles and portfolios.

**Schema:** `members`

### Domain Files

| File | What It Does |
|---|---|
| `profiles.ts` | Profile CRUD: bio, profession, category, skills, availability. Content policy enforcement. Visibility controls. |
| `search.ts` | Full-text search across profiles using PostgreSQL `tsvector` + GIN indexes — by profession, category, location, availability. |
| `portfolio.ts` | Portfolio item CRUD: title, description, media, tags. |
| `media.ts` | Upload to R2/S3, thumbnail generation (via `sharp`), CDN URL management. Abstracts object storage behind an interface. |
| `case-studies.ts` | Structured format: challenge → approach → outcome → metrics. |
| `collaborators.ts` | Tag members on portfolio pieces. Requires confirmation. |
| `export.ts` | GDPR data export. |
| `schema.ts` | Drizzle schema definitions for all members tables. |

### Public Interfaces

**IProfileService**
- `create(userId)` → Profile
- `update(userId, input)` → Profile
- `get(userId)` → Profile
- `search(query)` → Paginated<ProfileSummary>

**IPortfolioService**
- `createItem(userId, input)` → PortfolioItem
- `getItems(userId, page)` → Paginated<PortfolioItem>

---

For the full package specification (all packages and detailed domain breakdowns), refer to the full architecture spec: `docs/architecture/complete_architecture.md`.
