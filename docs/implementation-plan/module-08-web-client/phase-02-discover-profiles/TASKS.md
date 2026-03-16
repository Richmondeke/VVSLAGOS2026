## Phase 8.2 Task List: Discovery, Profiles, Listings

### Discover Page (P0 — Default Landing)
[x] 1.  Build /discover page as the default authenticated landing
[x] 2.  Search bar with immediate feedback (loading indicator on input)
[ ] 3.  Category filter chips (horizontal scroll on mobile)
[ ] 4.  Filter panel: price range, min reputation, availability (bottom sheet on mobile)
[ ] 5.  Sort options: relevance, rating, price, newest
[x] 6.  Listing cards: title, provider avatar+name, "from ₦X", rating, tx count, response time badge
[ ] 7.  Toggle: "Services" (default) / "People"
[ ] 8.  "Recently Completed" carousel section at top (shows proof of marketplace activity)
[x] 9.  Empty state: "No services found for [query]. Know someone who offers this? Invite them."
[ ] 10. Error state: search timeout → stale results shown + "Refreshing..." indicator
[ ] 11. Offline state: show cached listings from service worker with "Showing cached results" banner

### Listing Detail Page (P0)
[x] 12. Build /listings/:id page
[x] 13. Provider card: avatar, name, tier badge, rating, tx count, response time, "Referred by [Name]"
[x] 14. Pricing tier selector (Basic/Standard/Premium) with clear deliverables comparison
[x] 15. Sticky "Order This Service" CTA on mobile scroll
[ ] 16. "Contact Provider" secondary CTA
[ ] 17. Portfolio samples grid
[ ] 18. Reviews section with ratings
[x] 19. Order flow modal: MKT-M01 (tier confirmation, deliverables, notes, submit)
[ ] 20. Error state: provider became unverified → "This listing is currently unavailable"

### Create/Edit Listing Page (P0)
[x] 21. Build /listings/new and /listings/:id/edit pages
[x] 22. Multi-step form: basics, pricing tiers, portfolio samples, preview
[x] 23. Pricing tier builder: up to 3 tiers with deliverables/timeline per tier
[ ] 24. Gate: show verification prompt if not Verified+

### Profile Pages (P0)
[x] 25. Build /profile (own profile, editable)
[x] 26. Availability toggle (prominent, top of page)
[ ] 27. Portfolio gallery with media items
[x] 28. Reputation metrics: rating, tx count, "New member" if < 3 reviews
[x] 29. Tier progress indicator: "2 more transactions to reach Pro"
[x] 30. "Referred by [Name]" displayed prominently
[ ] 31. Reviews section
[ ] 32. Build /members/:userId (public profile, read-only, with Contact/Hire CTAs)
[ ] 33. Build /profile/edit (inline edit mode)
[ ] 34. Portfolio item upload modal: MEM-M01 (title, description, media upload, tags)
[ ] 35. File upload component with drag-and-drop and per-file progress on slow connections

### Provider Setup Checklist (P0)
[ ] 36. Build provider checklist card (persistent on /profile if not complete)
[ ] 37. Checklist: profile complete / identity verified / first listing created / availability = "Available"
[ ] 38. Each unchecked item links directly to the relevant action
[ ] 39. Converts to "You're live!" confirmation when all items complete

### My Listings (P0)
[x] 40. Build /listings/mine page with status, quick stats, pause/edit/delete actions
[ ] 41. Pause confirmation modal: MKT-M11
[ ] 42. Delete confirmation modal: MKT-M12

### Exit Criteria
- Discover page loads in < 300ms p95 (measured with Lighthouse)
- Listings searchable by keyword with correct results from API
- Listing order flow: select tier → submit order → order created in draft state
- Provider setup checklist accurately reflects current completion state
- Offline: service worker serves cached listings with "Showing cached results" banner
