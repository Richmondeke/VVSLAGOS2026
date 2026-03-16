# Module 6: Social — Implementation Deviations

## Phase 6.1: Messaging

### 1. Rate limiting uses injected `MessageRateLimitCheck` instead of Redis counters
**Spec:** Task 18 calls for Redis counters with sliding 24-hour window.
**Implementation:** Rate limiting is abstracted behind a `MessageRateLimitCheck` interface with `getTier()` and `getMessageCountLast24h()` methods. This allows tests to use in-memory mocks and production to use Redis. The Redis sliding window implementation is deferred until the Redis integration layer is built.

### 2. Context-gating for Free tier not yet implemented
**Spec:** Task 19 requires Free-tier users to only message users they have active/past orders with or whose listings they've viewed.
**Implementation:** Deferred. This requires cross-domain queries into marketplace (orders) which would violate module boundaries. Will be implemented as an interface call (`IOrderService.hasRelationship()`) when the cross-domain DI wiring is complete.

### 3. WebSocket real-time delivery deferred
**Spec:** Tasks 25–33 detail WebSocket handler with Redis pub/sub.
**Implementation:** Not implemented in this phase. REST polling is the current delivery mechanism. WebSocket support requires `@fastify/websocket`, Redis pub/sub integration, and authentication middleware — planned for a dedicated real-time infrastructure phase.

### 4. Post type uses contract's `"project"` instead of spec's `"completed_project"`
**Spec:** Schema and tasks reference `completed_project` as a post type.
**Implementation:** The `@vvs/contracts` `FeedPost.type` uses `"project"` not `"completed_project"`. All implementation aligned with the contract type to maintain type safety. The DB stores the contract value directly.

### 5. No unique constraint on engagements — dedup handled in application
**Spec:** Schema implies unique engagements per user/post/type.
**Implementation:** Removed the `UNIQUE(post_id, user_id, type)` index because comments must allow multiple entries from the same user. Likes and bookmarks are deduplicated via check-then-insert in the repository layer. This is safe within a single transaction but could allow duplicates under concurrent access (acceptable at current scale).

## Phase 6.2: Feed

### 6. Feed title stored implicitly in body
**Spec:** `FeedPost` contract type has `title` and `content` as separate fields.
**Implementation:** The DB schema has only `body` (text). The `title` field in `FeedPost` is returned as empty string. Posts are content-first; titles can be extracted from the first line if needed.

### 7. `refreshFeedRankings()` BullMQ job not yet implemented
**Spec:** Task 14 calls for a repeatable BullMQ job running every 30 minutes.
**Implementation:** The `calculateRankScore()` function exists as a pure function, but the scheduled job to update `rank_score` column in the DB is deferred. Timeline currently sorts by `createdAt` instead of `rank_score`. Will be added when the BullMQ repeatable job infrastructure is wired up.

### 8. `auth.identity.verified` consumer not implemented for feed ranking
**Spec:** Task 25 says consume verified events to update ranking weight.
**Implementation:** Deferred. The ranking function accepts `isVerified` as input. The consumer that updates a local cache of verified status needs cross-domain event subscription which is partially built but not wired for this specific event.

### 9. Event consumers defined in package, not wired as BullMQ workers
**Spec:** Event consumers should be BullMQ workers in `apps/workers`.
**Implementation:** Consumer handler functions (`handlePortfolioPublished`, `handleListingCreated`, `handleUserSuspended`) are defined in `packages/social/src/consumers.ts` as pure functions. They are not yet registered as BullMQ workers in `apps/workers` — this will be done alongside the other deferred workers in a cross-domain wiring phase.

### 10. Timeline filtering is N+1 for engagement counts
**Spec:** Timeline should return posts with engagement metrics.
**Implementation:** Engagement counts are fetched per-post in a loop. Should be batched with a single aggregation query for performance at scale.
