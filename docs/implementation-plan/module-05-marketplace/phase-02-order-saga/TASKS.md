## Phase 5.2 Task List: Order Saga

### Order Saga Core
[ ] 1.  Create `packages/marketplace/src/order-saga.ts`
[ ] 2.  OrderSaga constructor receives: IWalletService, IEscrowService (injected via DI), OutboxWriter, db (scoped Drizzle client)
[ ] 3.  Implement `createOrder(input)` — creates order in draft state, logs to order_state_log
[ ] 4.  Implement `acceptOrder(orderId, providerId)` — provider accepts, logs transition
[ ] 5.  Implement `declineOrder(orderId, providerId, reason)` — provider declines with reason
[ ] 6.  Implement `fund(orderId, paymentSource)` — the critical path (see below)
[ ] 7.  Implement `startWork(orderId, providerId)` — transitions funded → in_progress
[ ] 8.  Implement `submitDeliverable(orderId, providerId, input)` — uploads deliverable, transitions to delivered
[ ] 9.  Implement `requestRevision(orderId, clientId, notes)` — transitions back to in_progress, logs revision
[ ] 10. Implement `approveDeliverable(orderId, clientId)` — triggers escrow release, transitions to completed
[ ] 11. Implement `raiseDispute(orderId, raisedBy, reason, category)` — freezes order and escrow
[ ] 12. Implement `cancelOrder(orderId, clientId)` — cancels before in_progress, triggers refund
[ ] 13. Implement `handleProviderInactivity(orderId)` — triggered by BullMQ delayed job at 7 and 14 days

### fund() — The Critical Path
[ ] 14. fund() accepts: orderId, paymentSource (direct_paystack | wallet_debit)
[ ] 15. Load order, verify it's in accepted state
[ ] 16. Start Drizzle transaction
[ ] 17. Step 1: Create escrow via IEscrowService.create() — on failure: cancel order, throw
[ ] 18. Step 2: Debit wallet via IWalletService.debit() — on failure: cancel escrow, cancel order, throw
[ ] 19. Step 3: Mark escrow as funded via IEscrowService.markFunded()
[ ] 20. Step 4: Transition order to funded state
[ ] 21. Step 5: Write `marketplace.order.funded` event to outbox
[ ] 22. All 5 steps in a single Drizzle transaction — commit or rollback together
[ ] 23. Correlation ID from AsyncLocalStorage is threaded through every interface call and log line

### approveDeliverable() — Release Path
[ ] 24. Load order, verify in delivered state, verify caller is the client
[ ] 25. Call IEscrowService.releaseFull(agreementId, idempotencyKey) — idempotency key = `release-{orderId}`
[ ] 26. Transition order to completed
[ ] 27. Write `marketplace.order.completed` event to outbox (same transaction)
[ ] 28. On release failure: retry 3x with backoff, then escalate to admin dead-letter queue
[ ] 29. Test: approveDeliverable correctly releases escrow and transitions order to completed

### Compensation Tests
[ ] 30. Test: escrow creation fails → order transitions to cancelled, no wallet debit
[ ] 31. Test: wallet debit fails (insufficient funds) → escrow cancelled, order cancelled, client notified
[ ] 32. Test: escrow markFunded fails → wallet credit restored, order cancelled
[ ] 33. Test: all compensation tests verified with mocked finance interfaces
[ ] 34. Test: same fund() call with same idempotency key is a no-op (idempotent)

### Inactivity Handling
[ ] 35. Create `apps/workers/src/jobs/order-inactivity.ts`
[ ] 36. When order is funded: schedule a BullMQ delayed job for 7 days and 14 days
[ ] 37. At 7 days: send nudge notification to provider (write event to outbox)
[ ] 38. At 14 days: transition order to awaiting_client_decision state
[ ] 39. Client can then cancel for full refund (no formal dispute required)
[ ] 40. Test: 7-day job fires and writes notification event to outbox

### Full End-to-End Order Tests
[ ] 41. Happy path E2E: createOrder → acceptOrder → fund (wallet) → startWork → submitDeliverable → approveDeliverable → verify balances → verify events
[ ] 42. Dispute path E2E: fund → disputeOrder → resolveDispute (partial) → verify both wallets
[ ] 43. Cancellation path E2E: fund → cancelOrder → verify full refund to client wallet
[ ] 44. Verify: correlation ID appears in every log line, every state_log entry, and every outbox event for a single saga run

### Routes
[ ] 45. Create `packages/marketplace/src/routes.ts`
[ ] 46. POST /marketplace/listings — create listing
[ ] 47. GET /marketplace/listings — search/discover
[ ] 48. GET /marketplace/listings/:id — listing detail
[ ] 49. POST /marketplace/orders — create order (client)
[ ] 50. POST /marketplace/orders/:id/accept — provider accepts
[ ] 51. POST /marketplace/orders/:id/decline — provider declines
[ ] 52. POST /marketplace/orders/:id/fund — client funds
[ ] 53. POST /marketplace/orders/:id/deliver — provider submits deliverables
[ ] 54. POST /marketplace/orders/:id/revise — client requests revision
[ ] 55. POST /marketplace/orders/:id/approve — client approves deliverables
[ ] 56. POST /marketplace/orders/:id/dispute — either party raises dispute
[ ] 57. POST /marketplace/orders/:id/cancel — client cancels
[ ] 58. GET /marketplace/orders — list own orders (as client + as provider)
[ ] 59. GET /marketplace/orders/:id — order detail
[ ] 60. Register routes in api container, inject IWalletService and IEscrowService via DI
