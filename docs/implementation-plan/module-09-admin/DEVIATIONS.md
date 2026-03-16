# Module 9 — Admin Dashboard: Deviations from Spec

## Phase 9.1 — Admin Core

1. **GMV and revenue metrics not implemented**: Dashboard shows member/order counts and dispute rate but not GMV totals, trend indicators, or average order value. These require aggregate queries on the finance/ledger tables with period comparisons.

2. **Dead-letter queue count not shown**: The dashboard action items section has a placeholder for dead-letter count but the outbox dead-letter query is not wired.

3. **Members table simplified**: Shows email, status, registration date. Missing: name (profile not joined), tier badge, verification status, referrer, tx count, reputation score. These require cross-domain joins or denormalized views.

4. **Approval queue uses member list with status filter**: Rather than a dedicated `/admin/members/approvals` page, the approval queue is the members list filtered by `status=pending_approval` with inline approve buttons. Bulk approve not implemented.

5. **Member detail page simplified**: Shows profile info and admin actions (approve/reject/suspend/ban/reinstate). Missing: tier controls, verification docs viewer, referral tree, order history, wallet summary, moderation history timeline.

6. **ADM-M01 through ADM-M07 modals not fully implemented**: Suspend and ban have reason modals. Warn, adjust tier, and grant provisional verification modals are deferred.

7. **Dispute detail uses order detail page**: No dedicated `/admin/disputes/:id` page. Disputes link to the order detail page which shows the full state log. Missing: evidence viewer, revision history, resolution panel with split controls.

8. **Finance page shows counts not amounts**: Active escrow count shown but not total amount. Platform fee revenue, GMV summary, reconciliation status, and failed transaction list require aggregate ledger queries.

9. **Admin auth uses shared login flow**: Admin login reuses the same `/auth/login` endpoint as the web client. Admin role verification happens on API calls via `x-admin-user-id` header. A dedicated admin-only login with role verification at login time would be more secure.

10. **No RBAC enforcement in UI**: All admin pages are visible to any logged-in user. The API enforces role checks, but the UI doesn't hide controls based on role (e.g., support shouldn't see suspend/ban buttons).

11. **Settings page read-only for most settings**: Only platform fee percentage is editable via the UI. Tier limits, reputation thresholds, and feature flags display current values but edit flows are not wired.

12. **"At Risk" orders tab not implemented**: The orders page has status filters but no dedicated "at risk" view that checks for >48h provider inactivity or approaching 14-day timeout.
