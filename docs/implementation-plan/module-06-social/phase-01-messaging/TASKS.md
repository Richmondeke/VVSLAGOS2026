## Phase 6.1 Task List: Messaging

### Schema
[ ] 1.  Create `packages/social/src/schema.ts`
[ ] 2.  Define `social.conversations` table: id (UUID PK), member1Id (UUID), member2Id (UUID), createdAt, lastMessageAt. UNIQUE(member1Id, member2Id) — one thread per pair
[ ] 3.  Normalise member pair: always store smaller UUID as member1Id (consistent ordering)
[ ] 4.  Define `social.messages` table: id (UUID PK), conversationId (FK), senderId (UUID), body (text), createdAt
[ ] 5.  Define `social.read_receipts` table: id, messageId (FK), readerId (UUID), readAt. UNIQUE(messageId, readerId)
[ ] 6.  Define `social.attachments` table: id (UUID PK), messageId (FK), fileUrl, fileName, fileSize, mimeType, createdAt
[ ] 7.  Define `social.blocks` table: id (UUID PK), blockerId (UUID), blockedId (UUID), createdAt. UNIQUE(blockerId, blockedId)
[ ] 8.  Define `social.feed_posts` table: id (UUID PK), authorId (UUID), postType (completed_project/service_announcement), body (text), mediaUrls (text[]), linkedListingId (UUID nullable), isVisible (boolean), rankScore (numeric), createdAt, updatedAt
[ ] 9.  Define `social.feed_engagements` table: id (UUID PK), postId (FK), userId (UUID), type (like/bookmark/comment), body (text, nullable for non-comments), createdAt
[ ] 10. Generate migration and run

### Messaging Service
[ ] 11. Create `packages/social/src/conversations.ts`
[ ] 12. Implement `getOrCreateConversation(userId1, userId2)` — idempotent, one conversation per pair
[ ] 13. Implement `getInbox(userId, page)` — paginated conversations sorted by lastMessageAt
[ ] 14. Check blocking: if either user has blocked the other, conversation is inaccessible
[ ] 15. Create `packages/social/src/messages.ts`
[ ] 16. Implement `sendMessage(conversationId, senderId, input)` — validates tier rate limit
[ ] 17. Implement rate limiting: Free = 20/day, Verified = 100/day, Pro = unlimited
[ ] 18. Rate limit checks use Redis counters (sliding 24-hour window)
[ ] 19. Context-gating for Free tier: message can only be sent if sender has active/past order with recipient OR has viewed their listing
[ ] 20. Implement `markRead(conversationId, userId, messageId)` — creates read receipt
[ ] 21. Write `social.message.sent` event to outbox (triggers push notification)
[ ] 22. Test: message rate limits enforced per tier
[ ] 23. Test: context gate blocks Free-tier cold messages
[ ] 24. Test: blocking prevents conversation access

### WebSocket Real-time
[ ] 25. Install `@fastify/websocket` in `apps/api`
[ ] 26. Create `apps/api/src/ws/messaging-handler.ts`
[ ] 27. On WebSocket connect: authenticate (validate JWT), register in Redis as online
[ ] 28. On new message: publish to Redis pub/sub channel for that conversation
[ ] 29. All API instances subscribe to Redis pub/sub and forward to connected WebSockets
[ ] 30. On WebSocket disconnect: remove from Redis online registry
[ ] 31. Fallback: if WebSocket is unavailable, client polls GET /messages/:conversationId?since={timestamp}
[ ] 32. Test: send message via REST → received via WebSocket within 100ms (local test)
[ ] 33. Test: WebSocket disconnect → reconnect → missed messages delivered on reconnect

### Blocking
[ ] 34. Create `packages/social/src/blocking.ts`
[ ] 35. Implement `blockUser(blockerId, blockedId)` — creates block record
[ ] 36. Implement `unblockUser(blockerId, blockedId)` — removes block
[ ] 37. Implement `isBlocked(userA, userB)` — bidirectional check
[ ] 38. Test: blocked user cannot send messages; cannot start conversations

### Routes
[ ] 39. GET /social/messages — inbox
[ ] 40. POST /social/messages/:userId — start conversation (or get existing)
[ ] 41. GET /social/messages/:conversationId — message thread
[ ] 42. POST /social/messages/:conversationId — send message
[ ] 43. POST /social/messages/:conversationId/:messageId/read — mark read
[ ] 44. POST /social/block/:userId — block
[ ] 45. DELETE /social/block/:userId — unblock
[ ] 46. WS /social/ws — WebSocket connection
[ ] 47. Register routes in api container
