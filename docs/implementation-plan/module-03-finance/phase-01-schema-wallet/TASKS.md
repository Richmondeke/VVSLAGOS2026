## Phase 3.1 Task List: Finance Schema & Wallet Foundation

### Schema Definition
[x] 1.  Create `packages/finance/src/schema.ts`
[x] 2.  Define `finance.wallets` table: id (UUID PK), userId (UUID unique), availableBalance (integer, default 0), lockedBalance (integer, default 0), currency (text, default 'NGN'), createdAt, updatedAt
[x] 3.  All balances stored in kobo (integer). ₦1 = 100 kobo. No decimals.
[x] 4.  Define `finance.ledger_entries` table: id (auto-increment), walletId (FK), entryType (credit/debit), amount (integer > 0), balanceAfter (integer), reference (text), idempotencyKey (unique), createdAt
[x] 5.  Define `finance.funding_requests` table: id (UUID PK), walletId (FK), amount, paystackReference (unique), status (pending/completed/failed), createdAt, updatedAt
[x] 6.  Define `finance.funding_webhooks` table: id (UUID PK), paystackReference (unique), payload (JSONB), processedAt
[x] 7.  Define `finance.withdrawal_requests` table: id (UUID PK), walletId (FK), amount, bankDetails (JSONB), paystackTransferId (unique, nullable), status (pending/processing/completed/failed), createdAt, updatedAt
[x] 8.  Define `finance.escrow_agreements` table: id (UUID PK), orderId (UUID unique), clientWalletId (FK), providerWalletId (FK), totalAmount, platformFee, status (pending/funded/active/released/refunded/disputed), createdAt, updatedAt
[x] 9.  Define `finance.escrow_milestones` table: id (UUID PK), escrowId (FK), amount, description, status (pending/submitted/approved/released/refunded), sequence, createdAt, updatedAt
[x] 10. Define `finance.escrow_releases` table: id (UUID PK), escrowId (FK), milestoneId (FK, nullable), amount, releaseType (milestone/full/partial_refund), idempotencyKey (unique), createdAt
[x] 11. Define `finance.reviews` table: id (UUID PK), orderId (UUID unique per reviewer/reviewee pair), reviewerId (UUID), revieweeId (UUID), rating (1-5), body (text), windowOpenedAt, submittedAt, createdAt
[x] 12. Define `finance.reputation_scores` table: id (UUID PK), userId (UUID unique), score (numeric 1-5, nullable), reviewCount, lastCalculatedAt
[x] 13. Define `finance.reputation_history` table: id, userId (FK), score, trigger (review submitted), createdAt
[x] 14. Add indexes: walletId on ledger, escrowId on milestones, userId on reputation
[x] 15. Add CHECK constraint on ledger: `amount > 0`
[x] 16. Add CHECK constraint on ledger: `entry_type IN ('credit', 'debit')`
[x] 17. Generate migration and run — verify all tables created
[x] 18. Verify `idempotencyKey` UNIQUE constraint on ledger_entries

### Wallet Repository
[x] 19. Create `packages/finance/src/repositories/wallets.ts`
[x] 20. Implement `create(userId)` — creates zero-balance wallet
[x] 21. Implement `findByUserId(userId)` — returns wallet or throws NotFoundError
[x] 22. Implement `getBalance(userId)` — returns `{ available, locked }` in kobo
[x] 23. Implement `atomicDebit(walletId, amount, idempotencyKey)` — raw SQL conditional update
[x] 24. The atomic debit: `UPDATE wallets SET available_balance = available_balance - $amount WHERE id = $id AND available_balance >= $amount RETURNING available_balance`
[x] 25. If zero rows returned: throw InsufficientFundsError
[x] 26. Implement `atomicCredit(walletId, amount, idempotencyKey)` — adds to available_balance
[x] 27. Implement `lockFunds(walletId, amount)` — moves from available to locked (for escrow)
[x] 28. Implement `unlockFunds(walletId, amount)` — moves from locked to available (for refund)

### Ledger Repository
[x] 29. Create `packages/finance/src/repositories/ledger.ts`
[x] 30. Implement `recordEntry(tx, { walletId, entryType, amount, balanceAfter, reference, idempotencyKey })`
[x] 31. Implement `getEntriesForWallet(walletId, page)` — paginated history
[x] 32. Implement `verifyBalance(walletId)` — recalculates from ledger sum, compares to wallet.availableBalance
[x] 33. verifyBalance returns `{ calculated, stored, drift, isConsistent }` — used by reconciliation job
[x] 34. Test: record credit, record debit, verify balance == credits - debits

### Concurrency Testing
[x] 35. Write test: 50 concurrent debits of ₦100 from a wallet with ₦4,000 balance
[x] 36. Expected: exactly 40 debits succeed, 10 fail with InsufficientFundsError
[x] 37. Expected: final balance is exactly ₦0 (no double-spend)
[x] 38. Expected: ledger has exactly 40 credit entries totalling ₦4,000
[x] 39. Run this test 5 times to verify determinism
