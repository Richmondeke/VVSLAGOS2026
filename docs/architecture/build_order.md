# Build Order

This section describes the recommended build order for the packages in the repo.

| Step | Package | Key Technology | Why This Order |
|---|---|---|---|
| 1 | `shared` | Drizzle client factory, BullMQ outbox writer, Pino logger, Vitest helpers | Everything depends on it |
| 2 | `auth` | Argon2, jose, arctic (OAuth), Fastify routes + JSON schema validation | No business deps. The door to the platform. |
| 3 | `finance` | Drizzle (raw SQL for atomic wallet ops), Paystack adapter, BullMQ reconciliation | Only needs `auth.user.registered` event. Build and stress-test early. |
| 4 | `members` | Drizzle, S3/R2 client for media, PostgreSQL full-text search, `sharp` for thumbnails | Only needs `auth.user.registered` event. Light, fast to build. |
| 5 | `marketplace` | Order saga with injected finance interfaces, Drizzle state machine | Needs finance + auth interfaces. The saga lives here. |
| 6 | `social` | Drizzle, Fastify WebSocket plugin for real-time messaging | Needs member/portfolio events. Can parallel with step 5. |
| 7 | `platform` | BullMQ workers (notification dispatch), config-driven routing, Resend/Postmark/Termii/Expo Push adapters | Needs events from everything. Build last. |
