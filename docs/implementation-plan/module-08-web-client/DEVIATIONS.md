# Module 8 — Web Client: Deviations from Spec

## Phase 8.1 — Auth & Onboarding

1. **PWA not configured**: `next-pwa`, `manifest.json`, and service worker setup are deferred. The app works as a standard web app; PWA can be layered on once core flows are stable.

2. **Social login not implemented**: Login page includes email/password only. OAuth providers (Google, etc.) are deferred to a follow-up.

3. **Photo upload in onboarding skipped**: The profile completion step collects bio, profession, category, and skills but not avatar/photo upload. File upload requires R2/S3 integration.

4. **Middleware uses deprecated `middleware.ts` convention**: Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`. The current middleware works but should be migrated.

5. **Auth context uses client-side fetch for session restore**: The `AuthProvider` calls `/auth/refresh` on mount to restore sessions. This works but causes a brief loading state on first render. Server Components with cookies-based auth would eliminate this flash.

6. **Auth uses dual-cookie pattern**: The API sets httpOnly `vvs_refresh` and `vvs_session` cookies for secure token storage. A separate non-httpOnly `vvs_logged_in` indicator cookie is set client-side so Next.js middleware can gate protected routes (middleware can't see cross-origin httpOnly cookies).

## Phase 8.2 — Discovery, Profiles, Listings

6. **Discover page is basic**: Missing category filter chips, filter panel (price range, reputation, availability), sort options, services/people toggle, "Recently Completed" carousel, and offline cached-results mode.

7. **Listing detail page missing reviews/portfolio sections**: The provider card, pricing tiers, and order CTA are built. Reviews, portfolio samples grid, and "Contact Provider" CTA are deferred.

8. **Public member profile not implemented**: `/members/:userId` public read-only profile is deferred. Only the authenticated user's `/profile` page exists.

9. **Profile edit page not implemented**: `/profile/edit` inline edit mode is deferred. The profile page currently has a placeholder Edit button.

10. **Provider setup checklist not implemented**: The persistent checklist card on `/profile` is deferred.

11. **Listing edit page not implemented**: `/listings/:id/edit` shares the same form as create but requires loading existing data. Deferred.

## Phase 8.3 — Orders, Wallet, Notifications

12. **Order detail page simplified**: Status timeline is horizontal only (no mobile vertical variant). Fee breakdown modal for provider acceptance and detailed Paystack payment modal are stubs.

13. **Rating modal not implemented**: The post-completion rating flow (stars + optional review) is deferred.

14. **Wallet Add Funds / Withdraw are button stubs**: The buttons exist but don't open Paystack checkout or bank account modals. Requires Paystack client-side SDK integration.

15. **WebSocket messaging not implemented**: Messages use HTTP polling (load on mount). Real-time WebSocket delivery, reconnection, and local message queuing are deferred.

16. **Notification bell doesn't show unread count**: The bell icon links to `/notifications` but doesn't fetch/display an unread count badge dynamically.

17. **Settings page is minimal**: Change password, bank account, and tier celebration modals are stubs. Privacy toggles don't persist.

## Cross-Cutting

18. **No Storybook or component tests**: Shared components (TierBadge, RatingDisplay, etc.) are built but not tested with Storybook or unit tests.

19. **Tailwind v4 `@theme` syntax used**: Tailwind CSS v4 uses `@theme` instead of `tailwind.config.js` for design tokens. Custom colors are defined in `globals.css` using the new syntax.

20. **No file upload component**: Drag-and-drop multi-file upload with per-file progress requires a dedicated component with R2/S3 presigned URL integration. Deferred.
