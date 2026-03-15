## Phase 4.1 Task List: Members Schema & Profiles

### Schema
[ ] 1.  Create `packages/members/src/schema.ts`
[ ] 2.  Define `members.profiles` table: id (UUID PK), userId (UUID unique FK), displayName, bio (text), profession, primaryCategory, skills (text[]), locationCity, locationCountry, profilePhotoUrl, availabilityStatus (available/busy/not_taking_work), isPublic (boolean), createdAt, updatedAt
[ ] 3.  Define `members.profile_categories` reference table: id, name, slug, parentCategoryId (self-ref, nullable), isActive
[ ] 4.  Define `members.profile_availability` table: id (UUID PK), userId (UUID unique), status, updatedAt (for change tracking)
[ ] 5.  Define `members.portfolio_items` table: id (UUID PK), userId (FK), title, description (text), tags (text[]), isPublished (boolean), createdAt, updatedAt
[ ] 6.  Define `members.portfolio_media` table: id (UUID PK), portfolioItemId (FK), url, thumbnailUrl, mediaType (image/video), displayOrder, createdAt
[ ] 7.  Define `members.case_studies` table: id (UUID PK), portfolioItemId (FK, nullable), userId (FK), challenge (text), approach (text), outcome (text), metrics (text), isPublished (boolean), createdAt, updatedAt
[ ] 8.  Define `members.collaborators` table: id (UUID PK), portfolioItemId (FK), collaboratorUserId (FK → users), confirmedAt (nullable), rejectedAt (nullable), createdAt
[ ] 9.  Add full-text search column to profiles: `searchVector tsvector` generated column from bio + profession + skills
[ ] 10. Add GIN index on searchVector column
[ ] 11. Generate migration and run

### Profile Repository
[ ] 12. Create `packages/members/src/repositories/profiles.ts`
[ ] 13. Implement `create(userId, data)` — creates profile from auth.user.registered event
[ ] 14. Implement `update(userId, data)` — partial update
[ ] 15. Implement `findByUserId(userId)` — returns profile or NotFoundError
[ ] 16. Implement `findPublicByUsername(username)` — public profile lookup
[ ] 17. Implement `search(query, filters, page)` — full-text search with filters (category, availability, minReputation)
[ ] 18. Search: order by relevance first, then availability, then reputation (spec ranking order)
[ ] 19. Test: create, update, and retrieve profile
[ ] 20. Test: search by profession finds correct members
[ ] 21. Test: filter by availability returns only available members

### Profile Service
[ ] 22. Create `packages/members/src/profiles.ts`
[ ] 23. Implement `createProfile(userId)` — called when auth.user.registered event consumed
[ ] 24. Implement `updateProfile(userId, input)` — validates + updates
[ ] 25. Implement `getProfile(userId)` — returns full profile
[ ] 26. Implement `searchProfiles(query)` — delegates to repository
[ ] 27. Create event consumer: listens for `auth.user.registered`, scaffolds empty profile
[ ] 28. Create event consumer: listens for `auth.identity.verified`, updates badge display
[ ] 29. Test: auth.user.registered event consumed → profile created automatically
[ ] 30. Test: auth.identity.verified event → badge updated on profile

### Portfolio Service
[ ] 31. Create `packages/members/src/portfolio.ts`
[ ] 32. Implement `createItem(userId, input)` — creates portfolio item with media
[ ] 33. Implement `publishItem(itemId, userId)` — publishes, writes `members.portfolio.published` event to outbox
[ ] 34. Implement `unpublishItem(itemId, userId)` — hides from public view
[ ] 35. Implement `getItems(userId, page)` — paginated portfolio items
[ ] 36. Implement `deleteItem(itemId, userId)` — soft delete

### Media Service (S3 stub)
[ ] 37. Create `packages/members/src/media.ts`
[ ] 38. Implement `generateUploadUrl(userId, filename, mimeType)` — returns pre-signed S3 URL
[ ] 39. Implement `confirmUpload(userId, key)` — verifies file exists in S3, generates thumbnail job
[ ] 40. Implement `deleteMedia(key)` — removes from S3
[ ] 41. Create mock S3 adapter for tests

### Routes
[ ] 42. Create `packages/members/src/routes.ts`
[ ] 43. GET /members/me — own profile
[ ] 44. PATCH /members/me — update own profile
[ ] 45. GET /members/:userId — public profile (read-only)
[ ] 46. GET /members/search — full-text search
[ ] 47. POST /members/portfolio — create portfolio item
[ ] 48. GET /members/:userId/portfolio — list portfolio items
[ ] 49. POST /members/portfolio/:itemId/publish — publish portfolio item
[ ] 50. POST /members/media/upload-url — get pre-signed upload URL
[ ] 51. Register routes in api container

### Public Interface Implementation
[ ] 52. Implement IProfileService from contracts
[ ] 53. Implement IPortfolioService from contracts
[ ] 54. Create `packages/members/src/index.ts` exporting public surface
