## Phase 8.1 Task List: Web Client Auth & Onboarding

### Next.js Setup
[x] 1.  Initialise Next.js App Router in `apps/web` with TypeScript
[x] 2.  Install and configure Tailwind CSS
[x] 3.  Install shared packages: `@vvs/contracts`, `@vvs/shared`
[x] 4.  Create API client utility: typed fetch wrapper using IAuthService types
[ ] 5.  Configure PWA: install `next-pwa`, create manifest.json, service worker
[x] 6.  Configure Next.js middleware for auth guard (redirect unauthenticated users to /login)
[x] 7.  Create global layout: bottom tab navigation (Discover, Orders, Messages, Profile), notification bell

### Auth Pages (P0)
[x] 8.  Build /register page: invite code → account creation → pending approval screen
[x] 9.  Build /login page: email + password, social login options, "forgot password?"
[x] 10. Build /forgot-password and /reset-password pages
[x] 11. Implement JWT storage: access token in memory, refresh token in httpOnly cookie
[x] 12. Implement silent token refresh on 401 responses
[x] 13. Error states: wrong credentials → inline error (no field enumeration); network failure → retry prompt
[x] 14. Test: login flow with correct credentials navigates to /discover

### Post-Approval Onboarding (P0)
[x] 15. Build /welcome page (shown once after first login post-approval)
[x] 16. Step 1: Welcome with referrer name
[x] 17. Step 2: Profile completion form (bio, profession, category, skills, photo)
[x] 18. Step 3: Intent selection (hire / offer services / both)
[x] 19. Step 4: CTA routing based on intent (→ /discover or → /verify-identity)
[x] 20. Store "onboarding complete" flag to skip on subsequent logins
[ ] 21. Onboarding must complete in under 2 minutes on 3G (test with Chrome DevTools throttling)

### Identity Verification Page (P0)
[x] 22. Build /verify-identity page
[x] 23. Document type selector (NIN/driver's licence/passport/voter's card)
[x] 24. File upload with progress indicator
[x] 25. KYC provider timeout state: "Verification is taking longer than usual. We'll notify you."
[x] 26. NIN/BVN mismatch state: specific retry guidance message

### Shared Components
[x] 27. Build TierBadge component (Free/Verified/Pro with correct colours)
[x] 28. Build AvailabilityIndicator component (green/yellow/grey dot + label)
[x] 29. Build RatingDisplay component (read mode: stars + score; write mode: star selector)
[x] 30. Build EmptyState component (icon + message + CTA)
[x] 31. Build ConfirmationDialog component (default and destructive and money variants)
[x] 32. Build Toast/Snackbar component (success/error/info, auto-dismiss 4s)
[x] 33. Build ConnectionStatusBanner (offline/reconnecting states)
[x] 34. Build LoadingSkeleton for member cards and listing cards
[ ] 35. Test: all shared components render correctly in Storybook or equivalent

### Exit Criteria
- Registration → approval pending screen flow works end-to-end with real API
- Login with correct credentials → redirects to /discover
- Onboarding flow completes in < 2 minutes on throttled connection
- JWT refresh works silently: expired access token → auto-refresh → original request retried
- All shared components render in all states (including error/empty/loading)
