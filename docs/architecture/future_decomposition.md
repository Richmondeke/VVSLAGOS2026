# Future Decomposition

The monolith is designed to split if needed. Here's what changes:

| Now | Later | Change |
|---|---|---|
| Interface calls = TypeScript function calls | Interface calls = HTTP/gRPC | Swap Fastify DI binding. Consumer code unchanged. |
| One PostgreSQL instance | Separate databases | Each schema already has own Drizzle migrations, roles, connections. |
| One BullMQ relay | Per-service relay | Relay is already separate from business code. |
| One Turborepo repo | Multiple repos | Extract along package lines. |

**Split when:** dedicated teams per domain (3+ engineers on finance), independent deploy cadence needed, or regulatory isolation required (e.g. PCI for payments).

## `finance` — The Hardest Split

Finance is the one package deliberately designed to resist decomposition. Escrow and wallet share a schema so that milestone release → wallet credit can happen in a single Drizzle database transaction. This is the right trade-off for data integrity at current scale.

If compliance or team growth forces a split (e.g., wallet becomes its own service), the shared-transaction assumption breaks. At that point, escrow release → wallet credit becomes a saga within finance's own boundary:

1. Escrow marks milestone as `release_pending`
2. Escrow calls wallet service (now over the network) to credit
3. On success: escrow marks milestone as `released`
4. On failure: escrow retries (idempotent credit), escalates to admin after 3 failures
5. BullMQ reconciliation job catches any drift between escrow's `release_pending` records and wallet's credit confirmations

This is more complex than the current in-process transaction, which is exactly why the split shouldn't happen until it's forced by external requirements.
