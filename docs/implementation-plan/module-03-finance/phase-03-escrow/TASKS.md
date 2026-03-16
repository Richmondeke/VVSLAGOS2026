## Phase 3.3 Task List: Escrow System

### Escrow Service
[x] 1.  Create `packages/finance/src/escrow.ts`
[x] 2.  Implement `create({ orderId, clientUserId, providerUserId, totalAmount, platformFeeRate })` — creates escrow agreement in pending state
[x] 3.  Calculate platform fee: `Math.round(totalAmount * platformFeeRate)`, minimum 500 kobo
[x] 4.  Implement `markFunded(agreementId, idempotencyKey)` — transitions escrow to funded state
[x] 5.  On markFunded: atomically debit client wallet, lock funds in escrow (ledger entries)
[x] 6.  Implement `releaseFull(agreementId, idempotencyKey)` — releases full escrow to provider
[x] 7.  On releaseFull: deduct platform fee, credit provider wallet, record platform fee ledger entry, transition to released
[x] 8.  Implement `refundFull(agreementId, idempotencyKey)` — refunds full escrow to client
[x] 9.  On refundFull: release locked funds back to client available balance, transition to refunded
[x] 10. Implement `refundPartial(agreementId, providerAmount, clientAmount, idempotencyKey)` — dispute split
[x] 11. Implement `dispute(agreementId, reason)` — freezes escrow, transitions to disputed
[x] 12. Implement `cancel(agreementId, reason)` — cancels escrow, full refund to client
[x] 13. All escrow state transitions write outbox events atomically
[x] 14. Test: create → markFunded → releaseFull — verify wallet balances before and after
[x] 15. Test: platform fee deducted correctly on release (7.5% of total)
[x] 16. Test: cancel → refund — client balance restored to exact pre-order amount
[x] 17. Test: dispute transition freezes escrow (dispute → attempt to release → rejected)

### Escrow Lifecycle Tests
[x] 18. Full happy path test: create escrow → fund → mark active → release → verify provider wallet increased
[x] 19. Full cancellation test: create → fund → cancel → verify client balance fully restored
[x] 20. Dispute + partial resolution: create → fund → dispute → partial (60/40) → verify both balances
[x] 21. Fee calculation test: ₦100,000 order → provider receives ₦92,500, platform gets ₦7,500
[x] 22. Minimum fee test: ₦50 order → platform fee is ₦5 (minimum 500 kobo), provider gets ₦45

### Ratings & Reputation
[x] 23. Create `packages/finance/src/reviews.ts`
[x] 24. Implement `submitReview({ orderId, reviewerId, revieweeId, rating, body })` — creates review
[x] 25. Validate: review window is open (order completed < 14 days ago)
[x] 26. Validate: reviewer was a participant in this order
[x] 27. Validate: reviewer hasn't already reviewed this order (unique per orderId+reviewerId)
[x] 28. Write `finance.review.submitted` event to outbox after submission
[x] 29. Create `packages/finance/src/scoring.ts`
[x] 30. Implement `calculateScore(userId)` — at launch: simple arithmetic mean of all ratings
[x] 31. Minimum 3 reviews required before score is returned (return null below threshold)
[x] 32. Implement `updateReputationScore(userId)` — called after each new review
[x] 33. After update: check if Pro threshold met, if so write `finance.threshold.reached` event
[x] 34. Create `packages/finance/src/thresholds.ts`
[x] 35. Implement `checkProThreshold(userId, currentScore, transactionCount)` — reads thresholds from platform settings
[x] 36. Test: member with < 3 reviews returns null score
[x] 37. Test: member with 3 reviews returns correct average
[x] 38. Test: Pro threshold event fires when score and transaction count both met

### Public Interface Implementation
[x] 39. Implement IWalletService from contracts in `packages/finance/src/interfaces.ts`
[x] 40. Implement IEscrowService from contracts
[x] 41. Implement IRatingsService from contracts
[x] 42. Create `packages/finance/src/index.ts` — exports only public surface
[x] 43. Register finance services in `apps/api/src/container.ts`

### Reconciliation Job
[x] 44. Create `apps/workers/src/jobs/finance-reconciliation.ts`
[x] 45. BullMQ repeatable job runs daily
[x] 46. For each wallet: run `verifyBalance(walletId)`, log drift
[x] 47. If drift exceeds 5% of records: fire alert (log at error level + write to outbox)
[x] 48. Test: introduce manual drift in wallet balance → reconciliation detects it
