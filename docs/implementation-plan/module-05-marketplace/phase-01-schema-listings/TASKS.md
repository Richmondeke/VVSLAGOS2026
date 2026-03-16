## Phase 5.1 Task List: Marketplace Schema & Listings

### Schema
[x] 1.  Create `packages/marketplace/src/schema.ts`
[x] 2.  Define `marketplace.listings` table: id (UUID PK), providerId (UUID FK), title, description (text), category, pricingModel (fixed/hourly/project), status (draft/active/paused/removed), responseTimeAvg (integer, minutes), createdAt, updatedAt
[x] 3.  Add full-text search column: searchVector generated from title + description + category
[x] 4.  Add GIN index on searchVector
[x] 5.  Define `marketplace.pricing_tiers` table: id (UUID PK), listingId (FK), tierName (basic/standard/premium), price (integer kobo), deliverables (text), estimatedDays (integer), displayOrder
[x] 6.  Define `marketplace.orders` table: id (UUID PK), listingId (FK), clientId (UUID), providerId (UUID), selectedTierId (FK), amount (integer kobo), status (see state machine), correlationId (text), createdAt, updatedAt
[x] 7.  Define `marketplace.order_state_log` table: id (auto-increment), orderId (FK), fromStatus, toStatus, actorId (UUID nullable), reason (text), metadata (JSONB), correlationId, createdAt
[x] 8.  Partition order_state_log by month (declarative partitioning on createdAt)
[x] 9.  Define `marketplace.deliverables` table: id (UUID PK), orderId (FK), uploadedBy (UUID), fileUrl, fileName, fileSize, version (integer), notes (text), status (submitted/accepted/rejected), uploadedAt
[x] 10. Define `marketplace.verification_cache` table: id (UUID PK), userId (UUID unique), tier, verificationStatus, lastSyncedAt
[x] 11. Define `marketplace.revision_requests` table: id (UUID PK), orderId (FK), requestedBy (UUID), notes (text), specificFiles (text[]), createdAt
[x] 12. Generate migration and run

### Order State Machine
[x] 13. Create `packages/marketplace/src/orders.ts`
[x] 14. Implement the full order state machine as a TypeScript class with explicit transitions
[x] 15. Valid transitions: draft→accepted, draft→declined, accepted→pending_funding, pending_funding→funded, funded→in_progress, in_progress→delivered, delivered→pending_approval, pending_approval→completed, completed→rated
[x] 16. Dispute branch: any funded state → disputed → resolved_released | resolved_refunded | resolved_partial
[x] 17. Cancellation branch: any state before in_progress → cancelled → refunded
[x] 18. Each transition: validates current state, logs to order_state_log, updates order.status
[x] 19. Implement `transitionOrder(orderId, newStatus, actorId, reason, metadata)` — atomic with log
[x] 20. Invalid transitions must throw ValidationError with clear message
[x] 21. Test: every valid transition from every state
[x] 22. Test: every invalid transition is rejected with clear error
[x] 23. Test: transition log has correct entry after each state change

### Listing CRUD
[x] 24. Create `packages/marketplace/src/listings.ts`
[x] 25. Implement `createListing(userId, input)` — calls IIdentityService.getTier() first (LIVE call, never cached)
[x] 26. If tier is Free: throw ForbiddenError — only Verified+ can list
[x] 27. If tier is revoked after listing creation: createListing blocks immediately (read-time check, not cache)
[x] 28. Implement `updateListing(userId, listingId, input)` — owner only
[x] 29. Implement `pauseListing(userId, listingId)` — changes status to paused
[x] 30. Implement `deleteListing(userId, listingId)` — soft delete (status = removed)
[x] 31. Write `marketplace.listing.created` event to outbox on creation
[x] 32. Test: Free-tier member cannot create listing
[x] 33. Test: Verified member creates listing successfully
[x] 34. Test: listing creation event written to outbox

### Discovery
[x] 35. Create `packages/marketplace/src/discovery.ts`
[x] 36. Implement `searchListings(query, filters, sort, page)` — full-text search
[x] 37. Filters: category, minPrice, maxPrice, minReputation, availability
[x] 38. Sort options: relevance (default), rating, price_asc, price_desc, newest
[x] 39. Ranking factors per spec: text relevance, availability, reputation, response time, recent activity, tier, seed category boost
[x] 40. The "Recently Completed" section: query completed orders from last 30 days where provider opted to showcase
[x] 41. Test: search returns listings matching query
[x] 42. Test: filter by category returns only that category
[x] 43. Test: paused listings do not appear in search results

### Verification Cache
[x] 44. Create `packages/marketplace/src/verification-cache.ts`
[x] 45. Implement `syncCache(userId)` — calls IIdentityService.getTier() and stores result
[x] 46. BullMQ repeatable job: sync cache every hour for all providers
[x] 47. CRITICAL: Write-path decisions (listing creation) ALWAYS use live IIdentityService call
[x] 48. Read-path display (search results, badges) MAY use cache
[x] 49. Test: revoked verification blocks listing creation immediately (live call, not cache)
[x] 50. Test: cache is a display optimization, not a security gate
