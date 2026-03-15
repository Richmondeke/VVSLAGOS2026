## Phase 8.1 Task List: Web Client Auth & Onboarding

### Next.js Setup
[ ] 1.  Initialise Next.js App Router in `apps/web` with TypeScript
[ ] 2.  Install and configure Tailwind CSS
[ ] 3.  Install shared packages: `@vvs/contracts`, `@vvs/shared`
[ ] 4.  Create API client utility: typed fetch wrapper using IAuthService types
[ ] 5.  Configure PWA: install `next-pwa`, create manifest.json, service worker
[ ] 6.  Configure Next.js middleware for auth guard (redirect unauthenticated users to /login)
[ ] 7.  Create global layout: bottom tab navigation (Discover, Orders, Messages, Profile), notification bell

### Auth Pages (P0)
[ ] 8.  Build /register page: invite code → account creation → pending approval screen
[ ] 9.  Build /login page: email + password, social login options, "forgot password?"
[ ] 10. Build /forgot-password and /reset-password pages
[ ] 11. Implement JWT storage: access token in memory, refresh token in httpOnly cookie
[ ] 12. Implement silent token refresh on 401 responses
[ ] 13. Error states: wrong credentials → inline error (no field enumeration); network failure → retry prompt
[ ] 14. Test: login flow with correct credentials navigates to /discover

### Post-Approval Onboarding (P0)
[ ] 15. Build /welcome page (shown once after first login post-approval)
[ ] 16. Step 1: Welcome with referrer name
[ ] 17. Step 2: Profile completion form (bio, profession, category, skills, photo)
[ ] 18. Step 3: Intent selection (hire / offer services / both)
[ ] 19. Step 4: CTA routing based on intent (→ /discover or → /verify-identity)
[ ] 20. Store "onboarding complete" flag to skip on subsequent logins
[ ] 21. Onboarding must complete in under 2 minutes on 3G (test with Chrome DevTools throttling)

### Identity Verification Page (P0)
[ ] 22. Build /verify-identity page
[ ] 23. Document type selector (NIN/driver's licence/passport/voter's card)
[ ] 24. File upload with progress indicator
[ ] 25. KYC provider timeout state: "Verification is taking longer than usual. We'll notify you."
[ ] 26. NIN/BVN mismatch state: specific retry guidance message

### Shared Components
[ ] 27. Build TierBadge component (Free/Verified/Pro with correct colours)
[ ] 28. Build AvailabilityIndicator component (green/yellow/grey dot + label)
[ ] 29. Build RatingDisplay component (read mode: stars + score; write mode: star selector)
[ ] 30. Build EmptyState component (icon + message + CTA)
[ ] 31. Build ConfirmationDialog component (default and destructive and money variants)
[ ] 32. Build Toast/Snackbar component (success/error/info, auto-dismiss 4s)
[ ] 33. Build ConnectionStatusBanner (offline/reconnecting states)
[ ] 34. Build LoadingSkeleton for member cards and listing cards
[ ] 35. Test: all shared components render correctly in Storybook or equivalent

### Exit Criteria
- Registration → approval pending screen flow works end-to-end with real API
- Login with correct credentials → redirects to /discover
- Onboarding flow completes in < 2 minutes on throttled connection
- JWT refresh works silently: expired access token → auto-refresh → original request retried
- All shared components render in all states (including error/empty/loading)
