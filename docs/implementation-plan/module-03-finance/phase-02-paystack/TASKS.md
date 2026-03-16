## Phase 3.2 Task List: Paystack Integration & Funding

### Paystack Gateway Adapter
[x] 1.  Create `packages/finance/src/gateway.ts`
[x] 2.  Implement `initializePayment({ email, amount, reference, callbackUrl })` — Paystack Initialize Transaction API
[x] 3.  Implement `verifyPayment(reference)` — Paystack Verify Transaction API
[x] 4.  Implement `verifyWebhookSignature(payload, signature, secret)` — HMAC-SHA512 verification
[x] 5.  Implement `initiateTransfer({ amount, bankCode, accountNumber, reference, reason })` — Paystack Transfer API
[x] 6.  Implement `verifyTransfer(transferCode)` — check transfer status
[x] 7.  All Paystack calls: typed with request/response interfaces from contracts
[x] 8.  All Paystack calls: structured error handling (Paystack errors wrapped in typed errors)
[x] 9.  Create mock Paystack adapter for tests (implements same interface)
[x] 10. Test: payment initialization returns authorization_url; payment verification returns status

### Wallet Funding Flow
[x] 11. Create `packages/finance/src/funding.ts`
[x] 12. Implement `initiateFunding(userId, amount)` — creates funding request, calls Paystack, returns checkout URL
[x] 13. Generate unique Paystack reference: `vvs-fund-{userId}-{timestamp}`
[x] 14. Implement `handlePaystackWebhook(payload, signature)` — processes charge.success event
[x] 15. Webhook handler Step 1: Verify HMAC signature — reject if invalid
[x] 16. Webhook handler Step 2: Check idempotency — if funding_webhooks has this reference, return 200 immediately
[x] 17. Webhook handler Step 3: Find funding request by reference — reject if not found
[x] 18. Webhook handler Step 4: Start Drizzle transaction
[x] 19. Webhook handler Step 5: Insert into funding_webhooks (unique constraint is safety net)
[x] 20. Webhook handler Step 6: Credit wallet via atomicCredit
[x] 21. Webhook handler Step 7: Record ledger entry
[x] 22. Webhook handler Step 8: Write `finance.wallet.funded` event to outbox
[x] 23. Webhook handler Step 9: Commit transaction
[x] 24. Test: same webhook payload processed 10 times → exactly 1 credit to wallet
[x] 25. Test: webhook with invalid signature → rejected (HTTP 400)
[x] 26. Test: successful webhook credits wallet and writes outbox event atomically

### Withdrawal Flow
[x] 27. Create `packages/finance/src/withdrawals.ts`
[x] 28. Implement `requestWithdrawal(userId, amount, bankDetails)` — validates balance, creates pending withdrawal
[x] 29. Implement `processWithdrawal(withdrawalId)` — BullMQ job: calls Paystack Transfer API
[x] 30. Implement `handleTransferWebhook(payload)` — processes transfer.success and transfer.failed events
[x] 31. On transfer.success: mark withdrawal completed, write `finance.withdrawal.completed` event
[x] 32. On transfer.failed: mark withdrawal failed, notify user, release funds
[x] 33. Test: withdrawal deducts from available balance, marks locked
[x] 34. Test: withdrawal amount exceeds balance → InsufficientFundsError

### Routes
[x] 35. Create `packages/finance/src/routes.ts`
[x] 36. POST /finance/fund — auth required, initiates Paystack checkout
[x] 37. POST /finance/webhooks/paystack — no auth (verified by signature), handles Paystack callbacks
[x] 38. POST /finance/withdraw — auth required, Verified+ tier only
[x] 39. GET /finance/wallet — auth required, returns balance + transaction history
[x] 40. Register routes in api container
