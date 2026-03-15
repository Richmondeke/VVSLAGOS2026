## Phase 9.1 Task List: Admin Dashboard Core

### Setup
[ ] 1.  Initialise Next.js App Router in `apps/admin` (separate app from `apps/web`)
[ ] 2.  Admin auth: JWT with admin role check, redirect non-admins to /unauthorized
[ ] 3.  Admin navigation: Dashboard, Members, Orders, Disputes, Finance, Settings (P0 nav items)
[ ] 4.  Shared admin layout with sidebar navigation

### Dashboard Home (P0)
[ ] 5.  Build /admin page: operational overview
[ ] 6.  GMV: total + trend indicator (up/down vs last period)
[ ] 7.  Transaction volume + average order value
[ ] 8.  Member count (total + new this period)
[ ] 9.  Dispute rate: disputed / funded orders %
[ ] 10. Action items section (prominent):
[ ] 11.   Pending approvals count + link
[ ] 12.   Open disputes count + SLA indicator (red if 48h response SLA breached)
[ ] 13.   Orders at risk count (>48h no provider response + approaching 14-day inactivity)
[ ] 14.   Dead-letter count (unresolved failed events)
[ ] 15. Data freshness indicator: "Last updated X minutes ago" + refresh button

### Members Management (P0)
[ ] 16. Build /admin/members: searchable table (name, email, tier, verification, registration date, referrer, tx count, reputation, status)
[ ] 17. Filters: tier, verification status, account status, date range
[ ] 18. Inline quick actions: approve button for pending, suspend button for active
[ ] 19. Build /admin/members/approvals: approval queue
[ ] 20.   Each applicant: name, email, invite code, referrer name + referrer tier/reputation
[ ] 21.   Actions: Approve (+ optional provisional verification) / Reject (+ reason)
[ ] 22.   Bulk approve button
[ ] 23. Build /admin/members/:id: full member detail
[ ] 24.   All sections: profile, tier controls, verification docs, referral tree, orders, wallet summary, moderation history
[ ] 25.   Admin actions: warn, suspend (duration), ban, adjust tier, grant provisional verification
[ ] 26. ADM-M01 through ADM-M07 modals implemented

### Orders Overview (P0)
[ ] 27. Build /admin/orders: all platform orders table
[ ] 28. Columns: order ID, client, provider, listing, amount, status, created, last activity
[ ] 29. Filters: status, date range, amount range, flagged (inactivity/disputed)
[ ] 30. "At Risk" tab: orders with no provider response > 48h (SLA indicator per order)

### Dispute Resolution (P0)
[ ] 31. Build /admin/disputes: prioritised queue
[ ] 32. Dispute cards: order summary, filing party, category, date, SLA timer
[ ] 33. Build /admin/disputes/:id: full dispute detail on one page
[ ] 34.   Order context: listing, deliverables, timeline
[ ] 35.   Evidence from both parties (files, messages auto-pulled, version history)
[ ] 36.   Revision history: how many revisions requested before dispute
[ ] 37.   Resolution panel: full release / full refund / partial split (% inputs)
[ ] 38.   Written explanation field (required)
[ ] 39.   Full audit trail
[ ] 40. ADM-M05 (resolve dispute modal) implemented

### Finance Overview (P0)
[ ] 41. Build /admin/finance page
[ ] 42. Platform fee revenue collected (total + this period)
[ ] 43. GMV summary
[ ] 44. Active escrow total (money currently locked in orders)
[ ] 45. Failed/stuck transactions (requires manual intervention)
[ ] 46. Reconciliation status: last run timestamp, any drift alerts
[ ] 47. Dead-letter queue count + link to dead-letter view (even if full DLQ page is P2)

### Platform Settings (P0)
[ ] 48. Build /admin/settings page
[ ] 49. Fee settings: platform fee % (default 7.5%), minimum fee (₦500)
[ ] 50. Tier settings: invite limits per tier, Pro thresholds
[ ] 51. Verification settings: provisional duration (90 days)
[ ] 52. Feature flags: enable/disable feed, post types
[ ] 53. Search: seed category boost toggle
[ ] 54. ADM-M08 (confirmation before settings change) implemented
[ ] 55. All changes logged in audit trail (viewable in admin_audit_log DB, P0 backend; P2 UI)

### Exit Criteria
- Admin can approve a pending member with optional provisional verification
- Admin can resolve a dispute (full release, full refund, and partial split all work)
- "Orders at risk" section shows orders needing attention
- Settings changes take effect immediately (platform fee change reflected in next escrow release)
- RBAC: support account cannot access suspend/ban controls
- Dead-letter count visible on dashboard
