# Repo Layout

This section describes the repository structure for the monorepo and the conventions used for package organisation.

```
vvs-members/
├── apps/
│   ├── api/                    # Fastify server — routes, middleware, DI wiring
│   ├── web/                    # Next.js (App Router) — public web client
│   ├── mobile/                 # Expo (React Native) — cross-platform mobile
│   ├── admin/                  # Next.js — admin dashboard
│   └── workers/                # BullMQ workers: outbox relay, reconciliation, reporting
│
├── packages/
│   ├── contracts/              # Shared TypeScript types, interfaces, event schemas (ZERO runtime)
│   ├── shared/                 # Drizzle client, BullMQ events, errors, Pino logger, Vitest helpers
│   ├── auth/                   # Registration, login, invites, verification, tiers
│   ├── members/                # Profiles, portfolios, case studies
│   ├── marketplace/            # Listings, orders, deliverables, order saga
│   ├── finance/                # Wallet, escrow, ledger, ratings, reputation
│   ├── social/                 # Feed, messaging
│   └── platform/               # Notifications, moderation, admin ops
│
├── migrations/
│   ├── auth/                   # Drizzle-generated SQL migrations
│   ├── members/
│   ├── marketplace/
│   ├── finance/
│   ├── social/
│   ├── platform/
│   └── reporting/
│
├── turbo.json                  # Turborepo task config
├── pnpm-workspace.yaml         # Workspace package globs
├── tsconfig.base.json          # Shared TypeScript config
├── biome.json                  # Linting + formatting
└── package.json
```

### Package layout convention

Each business package is organised as flat domain files, not nested sub-packages:

```
packages/auth/
├── src/
│   ├── registration.ts
│   ├── login.ts
│   ├── session.ts
│   ├── invites.ts
│   ├── referrals.ts
│   ├── verification.ts
│   ├── tiers.ts
│   ├── schema.ts              # Drizzle schema definitions for auth tables
│   ├── repositories/
│   ├── interfaces.ts          # Public API other packages call
│   ├── events.ts              # Events this package publishes
│   └── index.ts               # Re-exports public surface
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── package.json
```

A file graduates to its own directory when it passes ~500 lines or needs its own dependencies. Not before.
