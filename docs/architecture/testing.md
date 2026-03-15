# Testing Strategy

All tests use **Vitest**. Integration and E2E tests use a real PostgreSQL instance (via Docker in development, CI service in GitHub Actions).

## Per-Package

| Level | Tests | Deps |
|---|---|---|
| Unit | Pure functions, validation, scoring, state machines | Nothing |
| Integration | Drizzle repositories, BullMQ event publishing, saga paths | Test DB (own schema) + mocked interfaces |
| Contract | Fastify routes return correct shapes and codes | Test DB + Fastify `inject()` |

## Cross-Package E2E

In the API application's E2E test directory. Real PostgreSQL, all schemas, all packages wired:

| Test | Flow |
|---|---|
| Onboarding | Register → invite → redeem → approve → verify → profile |
| Marketplace | List → order → fund escrow → deliver → approve → release → rate |
| Dispute | Order → fund → dispute → admin resolve → refund |
| Social | Profile → portfolio → feed post → engage → notification |
| Notifications | Seed a notification route config row → trigger the matching event → assert the correct channel adapter (Resend/Expo Push/Termii) was called with the correct template and recipient. |

## Financial Stress

- 50 concurrent debits on one wallet → correct final balance, no double-spend
- Multiple concurrent escrow fundings for same client → balance checks serialised
- Same Paystack webhook replayed 10× → wallet credited once

## Failure Injection

- BullMQ/Redis down → outbox accumulates, relay publishes on recovery, zero loss
- PostgreSQL connection lost mid-saga → compensations fire
- Slow consumer → dead-letter queue catches it

For the full testing plan, see `docs/architecture/complete_architecture.md`.
