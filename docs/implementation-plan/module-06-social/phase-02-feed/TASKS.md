## Phase 6.2 Task List: Feed

### Feed Service
[ ] 1.  Create `packages/social/src/posting.ts`
[ ] 2.  Implement `createPost(userId, input)` — validates post type, content policy
[ ] 3.  Only allowed post types at launch: completed_project, service_announcement
[ ] 4.  Content policy: reject posts with no media attachment if type is completed_project
[ ] 5.  Write `social.post.created` event to outbox
[ ] 6.  Implement `deletePost(userId, postId)` — soft delete (isVisible = false)
[ ] 7.  Implement `flagPost(reporterId, postId, reason)` — write `social.post.flagged` event to outbox

### Feed Ranking
[ ] 8.  Create `packages/social/src/ranking.ts`
[ ] 9.  Implement `calculateRankScore(post, authorProfile)` — returns numeric score
[ ] 10. Ranking factors: verified-user engagement weight, author transaction history, recency decay
[ ] 11. Recency: newer posts score higher with a half-life of ~3 days
[ ] 12. Verified engagement: likes/bookmarks from Verified/Pro members count more than Free members
[ ] 13. Transaction signal: authors with more completed transactions rank higher
[ ] 14. Implement `refreshFeedRankings()` — BullMQ job, runs every 30 minutes
[ ] 15. Test: verified author with transactions ranks higher than unverified with no transactions

### Timeline Generation
[ ] 16. Create `packages/social/src/timeline.ts`
[ ] 17. Implement `getTimeline(userId, page)` — returns ranked posts for this user
[ ] 18. Filter: only visible posts, no blocked users, no content-policy-removed posts
[ ] 19. Implement `engage(userId, postId, type)` — creates engagement record
[ ] 20. Engagement types: like, bookmark, comment
[ ] 21. Write `social.engagement.received` event to outbox (triggers notification)

### Event Consumers
[ ] 22. Consume `members.portfolio.published` → auto-create completed_project feed post
[ ] 23. Consume `marketplace.listing.created` → optionally surface as service_announcement
[ ] 24. Consume `platform.user.suspended` → set all user's posts to isVisible = false
[ ] 25. Consume `auth.identity.verified` → update verified status for ranking weight

### Routes
[ ] 26. GET /social/feed — timeline
[ ] 27. POST /social/feed — create post
[ ] 28. DELETE /social/feed/:postId — delete post
[ ] 29. POST /social/feed/:postId/engage — like/bookmark/comment
[ ] 30. Register routes in api container

### Public Interface Implementation
[ ] 31. Implement IFeedService from contracts
[ ] 32. Implement IMessagingService from contracts
[ ] 33. Create `packages/social/src/index.ts` — exports public surface only
