## Phase 3.2 Task List: Paystack Integration & Funding

### Paystack Gateway Adapter
[ ] 1.  Create `packages/finance/src/gateway.ts`
[ ] 2.  Implement `initializePayment({ email, amount, reference, callbackUrl })` — Paystack Initialize Transaction API
[ ] 3.  Implement `verifyPayment(reference)` — Paystack Verify Transaction API
[ ] 4.  Implement `verifyWebhookSignature(payload, signature, secret)` — HMAC-SHA512 verification
[ ] 5.  Implement `initiateTransfer({ amount, bankCode, accountNumber, reference, reason })` — Paystack Transfer API
[ ] 6.  Implement `verifyTransfer(transferCode)` — check transfer status
[ ] 7.  All Paystack calls: typed with request/response interfaces from contracts
[ ] 8.  All Paystack calls: structured error handling (Paystack errors wrapped in typed errors)
[ ] 9.  Create mock Paystack adapter for tests (implements same interface)
[ ] 10. Test: payment initialization returns authorization_url; payment verification returns status

### Wallet Funding Flow
[ ] 11. Create `packages/finance/src/funding.ts`
[ ] 12. Implement `initiateFunding(userId, amount)` — creates funding request, calls Paystack, returns checkout URL
[ ] 13. Generate unique Paystack reference: `vvs-fund-{userId}-{timestamp}`
[ ] 14. Implement `handlePaystackWebhook(payload, signature)` — processes charge.success event
[ ] 15. Webhook handler Step 1: Verify HMAC signature — reject if invalid
[ ] 16. Webhook handler Step 2: Check idempotency — if funding_webhooks has this reference, return 200 immediately
[ ] 17. Webhook handler Step 3: Find funding request by reference — reject if not found
[ ] 18. Webhook handler Step 4: Start Drizzle transaction
[ ] 19. Webhook handler Step 5: Insert into funding_webhooks (unique constraint is safety net)
[ ] 20. Webhook handler Step 6: Credit wallet via atomicCredit
[ ] 21. Webhook handler Step 7: Record ledger entry
[ ] 22. Webhook handler Step 8: Write `finance.wallet.funded` event to outbox
[ ] 23. Webhook handler Step 9: Commit transaction
[ ] 24. Test: same webhook payload processed 10 times → exactly 1 credit to wallet
[ ] 25. Test: webhook with invalid signature → rejected (HTTP 400)
[ ] 26. Test: successful webhook credits wallet and writes outbox event atomically

### Withdrawal Flow
[ ] 27. Create `packages/finance/src/withdrawals.ts`
[ ] 28. Implement `requestWithdrawal(userId, amount, bankDetails)` — validates balance, creates pending withdrawal
[ ] 29. Implement `processWithdrawal(withdrawalId)` — BullMQ job: calls Paystack Transfer API
[ ] 30. Implement `handleTransferWebhook(payload)` — processes transfer.success and transfer.failed events
[ ] 31. On transfer.success: mark withdrawal completed, write `finance.withdrawal.completed` event
[ ] 32. On transfer.failed: mark withdrawal failed, notify user, release funds
[ ] 33. Test: withdrawal deducts from available balance, marks locked
[ ] 34. Test: withdrawal amount exceeds balance → InsufficientFundsError

### Routes
[ ] 35. Create `packages/finance/src/routes.ts`
[ ] 36. POST /finance/fund — auth required, initiates Paystack checkout
[ ] 37. POST /finance/webhooks/paystack — no auth (verified by signature), handles Paystack callbacks
[ ] 38. POST /finance/withdraw — auth required, Verified+ tier only
[ ] 39. GET /finance/wallet — auth required, returns balance + transaction history
[ ] 40. Register routes in api container
