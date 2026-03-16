## Phase 4.1 Task List: Members Schema & Profiles

### Schema
[x] 1.  Create `packages/members/src/schema.ts`
[x] 2.  Define `members.profiles` table: id (UUID PK), userId (UUID unique FK), displayName, bio (text), profession, primaryCategory, skills (text[]), locationCity, locationCountry, profilePhotoUrl, availabilityStatus (available/busy/not_taking_work), isPublic (boolean), createdAt, updatedAt
[x] 3.  Define `members.profile_categories` reference table: id, name, slug, parentCategoryId (self-ref, nullable), isActive
[x] 4.  Define `members.profile_availability` table: id (UUID PK), userId (UUID unique), status, updatedAt (for change tracking)
[x] 5.  Define `members.portfolio_items` table: id (UUID PK), userId (FK), title, description (text), tags (text[]), isPublished (boolean), createdAt, updatedAt
[x] 6.  Define `members.portfolio_media` table: id (UUID PK), portfolioItemId (FK), url, thumbnailUrl, mediaType (image/video), displayOrder, createdAt
[x] 7.  Define `members.case_studies` table: id (UUID PK), portfolioItemId (FK, nullable), userId (FK), challenge (text), approach (text), outcome (text), metrics (text), isPublished (boolean), createdAt, updatedAt
[x] 8.  Define `members.collaborators` table: id (UUID PK), portfolioItemId (FK), collaboratorUserId (FK → users), confirmedAt (nullable), rejectedAt (nullable), createdAt
[x] 9.  Add full-text search column to profiles: `searchVector tsvector` generated column from bio + profession + skills
[x] 10. Add GIN index on searchVector column
[x] 11. Generate migration and run

### Profile Repository
[x] 12. Create `packages/members/src/repositories/profiles.ts`
[x] 13. Implement `create(userId, data)` — creates profile from auth.user.registered event
[x] 14. Implement `update(userId, data)` — partial update
[x] 15. Implement `findByUserId(userId)` — returns profile or NotFoundError
[x] 16. Implement `findPublicByUsername(username)` — public profile lookup
[x] 17. Implement `search(query, filters, page)` — full-text search with filters (category, availability, minReputation)
[x] 18. Search: order by relevance first, then availability, then reputation (spec ranking order)
[x] 19. Test: create, update, and retrieve profile
[x] 20. Test: search by profession finds correct members
[x] 21. Test: filter by availability returns only available members

### Profile Service
[x] 22. Create `packages/members/src/profiles.ts`
[x] 23. Implement `createProfile(userId)` — called when auth.user.registered event consumed
[x] 24. Implement `updateProfile(userId, input)` — validates + updates
[x] 25. Implement `getProfile(userId)` — returns full profile
[x] 26. Implement `searchProfiles(query)` — delegates to repository
[x] 27. Create event consumer: listens for `auth.user.registered`, scaffolds empty profile
[x] 28. Create event consumer: listens for `auth.identity.verified`, updates badge display
[x] 29. Test: auth.user.registered event consumed → profile created automatically
[x] 30. Test: auth.identity.verified event → badge updated on profile

### Portfolio Service
[x] 31. Create `packages/members/src/portfolio.ts`
[x] 32. Implement `createItem(userId, input)` — creates portfolio item with media
[x] 33. Implement `publishItem(itemId, userId)` — publishes, writes `members.portfolio.published` event to outbox
[x] 34. Implement `unpublishItem(itemId, userId)` — hides from public view
[x] 35. Implement `getItems(userId, page)` — paginated portfolio items
[x] 36. Implement `deleteItem(itemId, userId)` — soft delete

### Media Service (S3 stub)
[x] 37. Create `packages/members/src/media.ts`
[x] 38. Implement `generateUploadUrl(userId, filename, mimeType)` — returns pre-signed S3 URL
[x] 39. Implement `confirmUpload(userId, key)` — verifies file exists in S3, generates thumbnail job
[x] 40. Implement `deleteMedia(key)` — removes from S3
[x] 41. Create mock S3 adapter for tests

### Routes
[x] 42. Create `packages/members/src/routes.ts`
[x] 43. GET /members/me — own profile
[x] 44. PATCH /members/me — update own profile
[x] 45. GET /members/:userId — public profile (read-only)
[x] 46. GET /members/search — full-text search
[x] 47. POST /members/portfolio — create portfolio item
[x] 48. GET /members/:userId/portfolio — list portfolio items
[x] 49. POST /members/portfolio/:itemId/publish — publish portfolio item
[x] 50. POST /members/media/upload-url — get pre-signed upload URL
[x] 51. Register routes in api container

### Public Interface Implementation
[x] 52. Implement IProfileService from contracts
[x] 53. Implement IPortfolioService from contracts
[x] 54. Create `packages/members/src/index.ts` exporting public surface
