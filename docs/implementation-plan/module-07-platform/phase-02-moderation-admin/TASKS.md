## Phase 7.2 Task List: Moderation, Admin, Platform Settings

### Moderation Service
[ ] 1.  Create `packages/platform/src/moderation/reporting.ts`
[ ] 2.  Implement `fileReport(reporterId, input)` — creates report, notifies moderation queue
[ ] 3.  Implement `assignReport(reportId, adminId)` — assigns to moderator
[ ] 4.  Implement `resolveReport(reportId, adminId, action, reason)` — resolves with action
[ ] 5.  Create `packages/platform/src/moderation/actions.ts`
[ ] 6.  Implement `warnUser(userId, adminId, reason)` — creates moderation_action + notification
[ ] 7.  Implement `suspendUser(userId, adminId, reason, durationDays)` — writes `platform.user.suspended` event
[ ] 8.  Implement `banUser(userId, adminId, reason)` — creates ban_record, writes `platform.user.banned` event
[ ] 9.  Implement `reinstateUser(userId, adminId, reason)` — lifts suspension
[ ] 10. All moderation actions write to admin_audit_log atomically with the action
[ ] 11. Implement `handleAppeal(appealId, reviewerAdminId, outcome, reason)` — reviewer must differ from original admin
[ ] 12. Test: suspend user → `platform.user.suspended` event in outbox
[ ] 13. Test: ban user → ban_record created + `platform.user.banned` event
[ ] 14. Test: appeal reviewer must be different admin (same admin rejected)

### Admin Auth & RBAC
[ ] 15. Create `packages/platform/src/admin/auth.ts`
[ ] 16. Implement `getAdminRole(userId)` — returns role or null if not admin
[ ] 17. Create Fastify `adminRequired` hook: checks JWT + admin_users record
[ ] 18. Create `requireRole(minRole)` middleware: super_admin > moderator > support
[ ] 19. Test: non-admin user rejected; support role cannot access super_admin endpoints

### Platform Settings Service
[ ] 20. Create `packages/platform/src/admin/settings.ts`
[ ] 21. Implement `getSetting(key)` — returns parsed JSONB value
[ ] 22. Implement `setSetting(key, value, adminId)` — updates + writes `platform.settings.updated` event + audit log
[ ] 23. Settings include: platformFeePercent, minFeeKobo, inviteLimits (by tier), proThresholds, provisionalVerificationDays, featureFlags
[ ] 24. Settings are cached in memory with 60-second TTL (reduces DB reads on hot paths)
[ ] 25. Implement `getSettings()` — returns all settings as typed object
[ ] 26. Test: update setting → event in outbox → cached value invalidated

### Admin Dispute Resolution
[ ] 27. Create `packages/platform/src/admin/disputes.ts`
[ ] 28. Implement `getDisputeQueue()` — returns open disputes ordered by SLA urgency (48h first response, 7-day resolution target)
[ ] 29. Implement `getDisputeDetail(disputeId)` — returns full dispute context: order, deliverables, messages, evidence, revision history
[ ] 30. Implement `resolveDispute(disputeId, outcome, adminId)` — outcome: full_release | full_refund | partial split
[ ] 31. Resolution calls IEscrowService (full release or refund) or escrow.refundPartial (split)
[ ] 32. Writes resolution explanation to order state log
[ ] 33. Sends resolution notification to both parties (via outbox event)
[ ] 34. Test: full release → provider receives payment, client notified
[ ] 35. Test: full refund → client refunded, platform fee not charged
[ ] 36. Test: partial split → both wallets updated correctly

### Analytics & Dashboard
[ ] 37. Create `packages/platform/src/admin/analytics.ts`
[ ] 38. Implement `getGmvStats(period)` — total + trending GMV from reporting schema
[ ] 39. Implement `getTransactionVolume(period)` — count + avg order value
[ ] 40. Implement `getMemberStats()` — total, new this week, provider-to-client ratio
[ ] 41. Implement `getListingStats()` — active listings by category
[ ] 42. Implement `getDisputeRate()` — disputed / funded orders ratio
[ ] 43. Implement `getFunnelMetrics()` — registration → approval → listing → order → completion rates
[ ] 44. Implement `getDeadLetterCount()` — count of unresolved dead-letter events

### Public Interface Implementation
[ ] 45. Implement IModerationService from contracts
[ ] 46. Implement IAdminService from contracts
[ ] 47. Create `packages/platform/src/index.ts` — exports public surface

### Admin Routes
[ ] 48. GET /admin/dashboard — analytics overview
[ ] 49. GET /admin/members — member list with filters
[ ] 50. GET /admin/members/:id — member detail
[ ] 51. POST /admin/members/:id/approve — approve registration
[ ] 52. POST /admin/members/:id/suspend — suspend member
[ ] 53. POST /admin/members/:id/ban — ban member
[ ] 54. GET /admin/disputes — dispute queue
[ ] 55. GET /admin/disputes/:id — dispute detail
[ ] 56. POST /admin/disputes/:id/resolve — resolve dispute
[ ] 57. GET /admin/settings — get all settings
[ ] 58. PATCH /admin/settings/:key — update setting
[ ] 59. GET /admin/dead-letters — dead-letter count + list
[ ] 60. POST /admin/dead-letters/:id/retry — retry dead letter
[ ] 61. Register all admin routes with adminRequired hook
