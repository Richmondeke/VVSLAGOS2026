# Database

## One PostgreSQL Instance, One Schema Per Package

Single PostgreSQL 16 instance. Each package gets its own schema. No cross-schema queries in application code. Drizzle ORM manages all schema definitions and migration generation.

```
PostgreSQL 16
├── auth            (users, sessions, tokens, invites, referrals, kyc, tiers, badges)
├── members         (profiles, categories, availability, portfolio, media, case_studies)
├── marketplace     (listings, pricing_tiers, orders, order_state_log, deliverables)
├── finance         (wallets, ledger, funding, withdrawals, escrow, milestones, reviews, scores)
├── social          (posts, engagements, conversations, messages, read_receipts, blocks)
├── platform        (notif_prefs, notif_log, templates, routes, reports, actions, bans, admin, audit, settings)
├── reporting       (materialised views + denormalised analytics, read-only)
└── outbox          (transactional outbox, shared infrastructure)
```

## Schema Definitions with Drizzle

Each package defines its own Drizzle schema in TypeScript. Example for the finance package's wallets table:

```typescript
// packages/finance/src/schema.ts
import { pgSchema, uuid, integer, timestamp, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const financeSchema = pgSchema('finance');

export const wallets = financeSchema.table('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  availableBalance: integer('available_balance').notNull().default(0),
  lockedBalance: integer('locked_balance').notNull().default(0),
  currency: text('currency').notNull().default('NGN'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const ledgerEntries = financeSchema.table('ledger_entries', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id),
  entryType: text('entry_type').notNull(),  // 'credit' | 'debit'
  amount: integer('amount').notNull(),      // smallest currency unit (kobo)
  balanceAfter: integer('balance_after').notNull(),
  reference: text('reference').notNull(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

Migrations are generated via `drizzle-kit generate` and output clean SQL files into the `migrations/` directory, organised per package.

## Enforced Isolation

Each package connects through its own database role/user. The role can only access its own schema:

- Grant each role usage and full privileges on its own schema only.
- Every role can append to the outbox (insert-only, no reads or deletes).
- A dedicated read-only role for reporting gets read access across all schemas.
- The admin dashboard reads from the `reporting` schema only.

The shared infrastructure layer provides a `createScopedClient(schema)` factory — each package receives a Drizzle client scoped to its own schema. You can't accidentally query another package's tables.

## Reporting

The `reporting` schema is populated two ways:

1. **Materialised views** refreshed on a schedule (every ~5 minutes), using concurrent refresh strategies to avoid locking.
2. **Event-driven BullMQ worker** that listens for events and maintains denormalised aggregates.

Every reporting table has a `last_refreshed_at` timestamp. The admin UI shows it. No guessing about freshness.
