## Phase 6.2 Task List: Feed

### Feed Service
[x] 1.  Create `packages/social/src/posting.ts`
[x] 2.  Implement `createPost(userId, input)` — validates post type, content policy
[x] 3.  Only allowed post types at launch: completed_project, service_announcement
[x] 4.  Content policy: reject posts with no media attachment if type is completed_project
[x] 5.  Write `social.post.created` event to outbox
[x] 6.  Implement `deletePost(userId, postId)` — soft delete (isVisible = false)
[x] 7.  Implement `flagPost(reporterId, postId, reason)` — write `social.post.flagged` event to outbox

### Feed Ranking
[x] 8.  Create `packages/social/src/ranking.ts`
[x] 9.  Implement `calculateRankScore(post, authorProfile)` — returns numeric score
[x] 10. Ranking factors: verified-user engagement weight, author transaction history, recency decay
[x] 11. Recency: newer posts score higher with a half-life of ~3 days
[x] 12. Verified engagement: likes/bookmarks from Verified/Pro members count more than Free members
[x] 13. Transaction signal: authors with more completed transactions rank higher
[ ] 14. Implement `refreshFeedRankings()` — BullMQ job, runs every 30 minutes
[x] 15. Test: verified author with transactions ranks higher than unverified with no transactions

### Timeline Generation
[x] 16. Create `packages/social/src/timeline.ts`
[x] 17. Implement `getTimeline(userId, page)` — returns ranked posts for this user
[x] 18. Filter: only visible posts, no blocked users, no content-policy-removed posts
[x] 19. Implement `engage(userId, postId, type)` — creates engagement record
[x] 20. Engagement types: like, bookmark, comment
[x] 21. Write `social.engagement.received` event to outbox (triggers notification)

### Event Consumers
[x] 22. Consume `members.portfolio.published` → auto-create completed_project feed post
[x] 23. Consume `marketplace.listing.created` → optionally surface as service_announcement
[x] 24. Consume `platform.user.suspended` → set all user's posts to isVisible = false
[ ] 25. Consume `auth.identity.verified` → update verified status for ranking weight

### Routes
[x] 26. GET /social/feed — timeline
[x] 27. POST /social/feed — create post
[x] 28. DELETE /social/feed/:postId — delete post
[x] 29. POST /social/feed/:postId/engage — like/bookmark/comment
[x] 30. Register routes in api container

### Public Interface Implementation
[x] 31. Implement IFeedService from contracts
[x] 32. Implement IMessagingService from contracts
[x] 33. Create `packages/social/src/index.ts` — exports public surface only
