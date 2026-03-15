# Cross-Module End-to-End Tests

**Folder:** `e2e-tests/`
**Purpose:** Validate full user journeys across all modules after implementation.

---

## Task list

### Setup
[ ] 1.  All schemas applied to test PostgreSQL instance
[ ] 2.  All packages wired in DI container (real implementations, not mocks)
[ ] 3.  Mock channel adapters (Resend, Expo Push, Termii) — record calls, don't send
[ ] 4.  Mock Paystack adapter — returns success/failure based on test configuration

### Core Journey Tests
[ ] 5.  Onboarding E2E: generate invite code → register with code → admin approves → first login → complete onboarding → profile visible in search
[ ] 6.  Marketplace E2E: Verified member creates listing → client finds it in search → places order → provider accepts → client funds (wallet debit) → provider delivers → client approves → escrow releases → both parties rate → reputation score updates
[ ] 7.  Paystack funding E2E: client initiates Paystack checkout → webhook fires (mock) → wallet credited → client uses wallet to fund order
[ ] 8.  Dispute E2E: order funded → either party disputes → admin sees dispute in queue → admin resolves (partial split) → both wallets updated → both parties notified
[ ] 9.  Social E2E: provider publishes portfolio item → auto-creates feed post → client sees post in feed → client messages provider → real-time delivery confirmed
[ ] 10. Notification E2E: seed notification_routes config → trigger auth.user.registered event → assert email channel adapter called with correct template and recipient

### Financial Stress Tests
[ ] 11. 50 concurrent debits on one wallet: correct final balance, no double-spend
[ ] 12. Multiple concurrent escrow fundings for same client: balance checks serialised
[ ] 13. Same Paystack webhook replayed 10×: wallet credited exactly once

### Failure Injection Tests
[ ] 14. Redis down during saga: outbox accumulates events; on Redis recovery, relay publishes all pending events; zero event loss
[ ] 15. PostgreSQL connection lost mid-saga: compensating transactions fire correctly
[ ] 16. Slow consumer: events accumulate in BullMQ, eventually processed, no duplicate processing

### Acceptance Criteria
[ ] 17. All E2E tests pass on clean database
[ ] 18. All E2E tests are deterministic: pass/fail consistently on 5 consecutive runs
[ ] 19. Financial stress tests: 5/5 runs without integrity violations
[ ] 20. Full marketplace journey (test 6) completes in < 5 seconds wall clock time
