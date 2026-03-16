# Module 7 — Platform: Deviations from Spec

## Phase 7.1 — Notifications

1. **Channel adapters are interface + mock only**: The spec called for Resend (email), Expo Push, and Termii/Africa's Talking (SMS) adapters. We implemented typed interfaces (`IEmailAdapter`, `IPushAdapter`, `ISmsAdapter`, `IInAppAdapter`) with mock implementations that record calls. Real adapters are deferred until deployment config is available.

2. **Template rendering uses simple `{{key}}` replacement, not Handlebars**: The spec referenced Handlebars templates. We implemented a lightweight `{{key.path}}` replacer with dot-notation traversal, avoiding the Handlebars dependency. Sufficient for current template needs; can swap in Handlebars later if needed.

3. **Dispatcher is a callable function, not a BullMQ worker**: The spec says the dispatcher is a BullMQ worker consuming notification jobs. We implemented `createNotificationDispatcher()` as a callable object with `dispatch(eventType, payload)`. A BullMQ worker wrapper can call `dispatch()` when wired up — the logic is decoupled from transport.

4. **In-app channel does not use WebSocket**: Spec says in-app delivers via WebSocket if user is online. Current implementation records the notification via the mock adapter. WebSocket real-time delivery is deferred to Module 6/7 integration.

5. **admin_audit_log is not partitioned by month**: Task 12 called for declarative partitioning. Deferred — partitioning can be added via ALTER TABLE when data volume warrants it.

6. **Seed notification route configs not created**: Tasks 42-50 (seed SQL for initial routes like welcome_email, order_funded, etc.) are deferred. Routes can be seeded as part of deployment/ops setup.

## Phase 7.2 — Moderation & Admin

7. **Admin dispute resolution deferred (Tasks 27-36)**: The full dispute queue, detail view, and escrow-integrated resolution require cross-domain calls to `IEscrowService` and marketplace order state. These are deferred until the marketplace→finance integration is fully wired. The `resolveDispute` stub exists in `interfaces.ts`.

8. **Analytics dashboard deferred (Tasks 37-44)**: GMV stats, transaction volume, member stats, listing stats, dispute rate, funnel metrics, and dead-letter count all require cross-schema reporting queries. These are deferred to a dedicated analytics/reporting phase.

9. **Admin member list/detail/approve routes not implemented**: Tasks 49-51 require reading from auth/members schemas. Deferred to cross-domain admin integration.

10. **Dead-letter management routes not implemented**: Tasks 59-60 require querying the outbox.dead_letters table. Deferred to ops tooling phase.

11. **adminRequired hook uses inline `checkAdmin()` helper, not Fastify preHandler**: The spec suggested a Fastify hook/middleware. We used an inline `checkAdmin(request)` helper that extracts `userId` from the request and calls `requireAdmin()`. This keeps the pattern simple and avoids issues with Fastify hook typing. Can be promoted to a proper preHandler decorator later.

12. **Report category includes "harassment"**: The `@vvs/contracts` `Report` type defines categories as `"spam" | "inappropriate" | "fraud"`. The route schema also accepts `"harassment"` which the DB stores but the contract type doesn't include. This is intentional — the DB is more permissive, and the contract type can be extended when needed.

13. **Settings cache uses module-level variable**: The in-memory cache for platform settings uses a module-level `settingsCache` variable with 60s TTL. This works for single-process deployment. For multi-process, a shared cache (Redis) would be needed.
