## Phase 3.3 Task List: Escrow System

### Escrow Service
[ ] 1.  Create `packages/finance/src/escrow.ts`
[ ] 2.  Implement `create({ orderId, clientUserId, providerUserId, totalAmount, platformFeeRate })` — creates escrow agreement in pending state
[ ] 3.  Calculate platform fee: `Math.round(totalAmount * platformFeeRate)`, minimum 500 kobo
[ ] 4.  Implement `markFunded(agreementId, idempotencyKey)` — transitions escrow to funded state
[ ] 5.  On markFunded: atomically debit client wallet, lock funds in escrow (ledger entries)
[ ] 6.  Implement `releaseFull(agreementId, idempotencyKey)` — releases full escrow to provider
[ ] 7.  On releaseFull: deduct platform fee, credit provider wallet, record platform fee ledger entry, transition to released
[ ] 8.  Implement `refundFull(agreementId, idempotencyKey)` — refunds full escrow to client
[ ] 9.  On refundFull: release locked funds back to client available balance, transition to refunded
[ ] 10. Implement `refundPartial(agreementId, providerAmount, clientAmount, idempotencyKey)` — dispute split
[ ] 11. Implement `dispute(agreementId, reason)` — freezes escrow, transitions to disputed
[ ] 12. Implement `cancel(agreementId, reason)` — cancels escrow, full refund to client
[ ] 13. All escrow state transitions write outbox events atomically
[ ] 14. Test: create → markFunded → releaseFull — verify wallet balances before and after
[ ] 15. Test: platform fee deducted correctly on release (7.5% of total)
[ ] 16. Test: cancel → refund — client balance restored to exact pre-order amount
[ ] 17. Test: dispute transition freezes escrow (dispute → attempt to release → rejected)

### Escrow Lifecycle Tests
[ ] 18. Full happy path test: create escrow → fund → mark active → release → verify provider wallet increased
[ ] 19. Full cancellation test: create → fund → cancel → verify client balance fully restored
[ ] 20. Dispute + partial resolution: create → fund → dispute → partial (60/40) → verify both balances
[ ] 21. Fee calculation test: ₦100,000 order → provider receives ₦92,500, platform gets ₦7,500
[ ] 22. Minimum fee test: ₦5,000 order → platform fee is ₦500 (minimum), provider gets ₦4,500

### Ratings & Reputation
[ ] 23. Create `packages/finance/src/reviews.ts`
[ ] 24. Implement `submitReview({ orderId, reviewerId, revieweeId, rating, body })` — creates review
[ ] 25. Validate: review window is open (order completed < 14 days ago)
[ ] 26. Validate: reviewer was a participant in this order
[ ] 27. Validate: reviewer hasn't already reviewed this order (unique per orderId+reviewerId)
[ ] 28. Write `finance.review.submitted` event to outbox after submission
[ ] 29. Create `packages/finance/src/scoring.ts`
[ ] 30. Implement `calculateScore(userId)` — at launch: simple arithmetic mean of all ratings
[ ] 31. Minimum 3 reviews required before score is returned (return null below threshold)
[ ] 32. Implement `updateReputationScore(userId)` — called after each new review
[ ] 33. After update: check if Pro threshold met, if so write `finance.threshold.reached` event
[ ] 34. Create `packages/finance/src/thresholds.ts`
[ ] 35. Implement `checkProThreshold(userId, currentScore, transactionCount)` — reads thresholds from platform settings
[ ] 36. Test: member with < 3 reviews returns null score
[ ] 37. Test: member with 3 reviews returns correct average
[ ] 38. Test: Pro threshold event fires when score and transaction count both met

### Public Interface Implementation
[ ] 39. Implement IWalletService from contracts in `packages/finance/src/interfaces.ts`
[ ] 40. Implement IEscrowService from contracts
[ ] 41. Implement IRatingsService from contracts
[ ] 42. Create `packages/finance/src/index.ts` — exports only public surface
[ ] 43. Register finance services in `apps/api/src/container.ts`

### Reconciliation Job
[ ] 44. Create `apps/workers/src/jobs/finance-reconciliation.ts`
[ ] 45. BullMQ repeatable job runs daily
[ ] 46. For each wallet: run `verifyBalance(walletId)`, log drift
[ ] 47. If drift exceeds 5% of records: fire alert (log at error level + write to outbox)
[ ] 48. Test: introduce manual drift in wallet balance → reconciliation detects it
