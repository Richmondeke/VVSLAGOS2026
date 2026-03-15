# How Packages Talk to Each Other

Two patterns. Each has a specific purpose. Using the wrong one for the wrong job is a bug.

## Interface Calls — When You Need an Answer

When Package A needs something from Package B right now, it calls Package B's public interface. These are direct function calls inside the same process, injected via dependency injection at startup.

**Example:** The finance package defines a `WalletService` interface (in `packages/contracts/src/finance.ts`) with methods like `getBalance`, `debit`, and `credit`. The marketplace package receives this through DI and calls it during order processing. The interface definition lives in the contracts package. The implementation lives in the finance package. The wiring happens in the Fastify API application layer. In tests, you swap the real implementation for a mock.

```typescript
// packages/contracts/src/finance.ts
export interface IWalletService {
  getBalance(userId: string): Promise<Money>;
  debit(userId: string, amount: number, ref: string): Promise<DebitResult>;
  credit(userId: string, amount: number, ref: string): Promise<CreditResult>;
}

// apps/api/src/container.ts — DI wiring at startup
import { WalletService } from '@vvs/finance';
import { OrderSaga } from '@vvs/marketplace';

const walletService = new WalletService(financeScopedDb);
const orderSaga = new OrderSaga(walletService, escrowService, outboxWriter);
```

If you ever need to extract a package into a separate service, you swap the DI binding from a local function call to a remote client — consuming code doesn't change.

**Use for:** Anything where the caller needs a result, needs transactional consistency, or is on the request hot path. Verification checks, balance lookups, escrow operations, dispute resolution.

## Async Events — When You Don't Need an Answer

When something happened and other packages might want to know, publish an event. The publisher doesn't know or care who's listening.

**Example:** After an order completes, the marketplace package writes an `order.completed` event to the outbox (in the same database transaction) with the order ID, client ID, provider ID, and timestamp. A BullMQ worker polls the outbox and distributes events to consumers.

**Use for:** Notifications, feed updates, analytics, search indexing, audit logging. Anything where the publisher's job is already done.

## What's Forbidden

- **Cross-schema queries.** No reading from the auth schema inside the finance package.
- **Importing another package's internals.** You can import the `IWalletService` interface from `@vvs/contracts`. You cannot import a finance package's internal repository module.
- **Events for synchronous flows.** The order → escrow → wallet pipeline uses interface calls. Events are never used when the caller needs a result.
- **Shared mutable tables.** No table is written to by more than one package. (Exception: the outbox events table, which is append-only infrastructure.)

## Decision Quick Reference

| Need | Pattern |
|---|---|
| Check balance before locking escrow | Interface call |
| Fund escrow from wallet | Interface call |
| Release escrow to provider | Interface call |
| Verify user tier before listing | Interface call |
| Notify user of new message | Event → BullMQ → platform |
| Update feed with new listing | Event → BullMQ → social |
| Update analytics dashboard | Event → BullMQ → reporting worker |
| Send welcome email | Event → BullMQ → platform (Resend/Postmark adapter) |
