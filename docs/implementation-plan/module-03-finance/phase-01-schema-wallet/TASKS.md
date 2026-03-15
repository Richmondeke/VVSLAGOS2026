## Phase 3.1 Task List: Finance Schema & Wallet Foundation

### Schema Definition
[ ] 1.  Create `packages/finance/src/schema.ts`
[ ] 2.  Define `finance.wallets` table: id (UUID PK), userId (UUID unique), availableBalance (integer, default 0), lockedBalance (integer, default 0), currency (text, default 'NGN'), createdAt, updatedAt
[ ] 3.  All balances stored in kobo (integer). ₦1 = 100 kobo. No decimals.
[ ] 4.  Define `finance.ledger_entries` table: id (auto-increment), walletId (FK), entryType (credit/debit), amount (integer > 0), balanceAfter (integer), reference (text), idempotencyKey (unique), createdAt
[ ] 5.  Define `finance.funding_requests` table: id (UUID PK), walletId (FK), amount, paystackReference (unique), status (pending/completed/failed), createdAt, updatedAt
[ ] 6.  Define `finance.funding_webhooks` table: id (UUID PK), paystackReference (unique), payload (JSONB), processedAt
[ ] 7.  Define `finance.withdrawal_requests` table: id (UUID PK), walletId (FK), amount, bankDetails (JSONB), paystackTransferId (unique, nullable), status (pending/processing/completed/failed), createdAt, updatedAt
[ ] 8.  Define `finance.escrow_agreements` table: id (UUID PK), orderId (UUID unique), clientWalletId (FK), providerWalletId (FK), totalAmount, platformFee, status (pending/funded/active/released/refunded/disputed), createdAt, updatedAt
[ ] 9.  Define `finance.escrow_milestones` table: id (UUID PK), escrowId (FK), amount, description, status (pending/submitted/approved/released/refunded), sequence, createdAt, updatedAt
[ ] 10. Define `finance.escrow_releases` table: id (UUID PK), escrowId (FK), milestoneId (FK, nullable), amount, releaseType (milestone/full/partial_refund), idempotencyKey (unique), createdAt
[ ] 11. Define `finance.reviews` table: id (UUID PK), orderId (UUID unique per reviewer/reviewee pair), reviewerId (UUID), revieweeId (UUID), rating (1-5), body (text), windowOpenedAt, submittedAt, createdAt
[ ] 12. Define `finance.reputation_scores` table: id (UUID PK), userId (UUID unique), score (numeric 1-5, nullable), reviewCount, lastCalculatedAt
[ ] 13. Define `finance.reputation_history` table: id, userId (FK), score, trigger (review submitted), createdAt
[ ] 14. Add indexes: walletId on ledger, escrowId on milestones, userId on reputation
[ ] 15. Add CHECK constraint on ledger: `amount > 0`
[ ] 16. Add CHECK constraint on ledger: `entry_type IN ('credit', 'debit')`
[ ] 17. Generate migration and run — verify all tables created
[ ] 18. Verify `idempotencyKey` UNIQUE constraint on ledger_entries

### Wallet Repository
[ ] 19. Create `packages/finance/src/repositories/wallets.ts`
[ ] 20. Implement `create(userId)` — creates zero-balance wallet
[ ] 21. Implement `findByUserId(userId)` — returns wallet or throws NotFoundError
[ ] 22. Implement `getBalance(userId)` — returns `{ available, locked }` in kobo
[ ] 23. Implement `atomicDebit(walletId, amount, idempotencyKey)` — raw SQL conditional update
[ ] 24. The atomic debit: `UPDATE wallets SET available_balance = available_balance - $amount WHERE id = $id AND available_balance >= $amount RETURNING available_balance`
[ ] 25. If zero rows returned: throw InsufficientFundsError
[ ] 26. Implement `atomicCredit(walletId, amount, idempotencyKey)` — adds to available_balance
[ ] 27. Implement `lockFunds(walletId, amount)` — moves from available to locked (for escrow)
[ ] 28. Implement `unlockFunds(walletId, amount)` — moves from locked to available (for refund)

### Ledger Repository
[ ] 29. Create `packages/finance/src/repositories/ledger.ts`
[ ] 30. Implement `recordEntry(tx, { walletId, entryType, amount, balanceAfter, reference, idempotencyKey })`
[ ] 31. Implement `getEntriesForWallet(walletId, page)` — paginated history
[ ] 32. Implement `verifyBalance(walletId)` — recalculates from ledger sum, compares to wallet.availableBalance
[ ] 33. verifyBalance returns `{ calculated, stored, drift, isConsistent }` — used by reconciliation job
[ ] 34. Test: record credit, record debit, verify balance == credits - debits

### Concurrency Testing
[ ] 35. Write test: 50 concurrent debits of ₦100 from a wallet with ₦4,000 balance
[ ] 36. Expected: exactly 40 debits succeed, 10 fail with InsufficientFundsError
[ ] 37. Expected: final balance is exactly ₦0 (no double-spend)
[ ] 38. Expected: ledger has exactly 40 credit entries totalling ₦4,000
[ ] 39. Run this test 5 times to verify determinism
