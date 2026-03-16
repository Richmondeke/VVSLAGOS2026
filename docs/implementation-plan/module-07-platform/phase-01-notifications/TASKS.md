## Phase 7.1 Task List: Notifications

### Schema
[x] 1.  Create `packages/platform/src/schema.ts`
[x] 2.  Define `platform.notification_preferences` table: id, userId (UUID unique), preferences (JSONB: { email: bool, push: bool, sms: bool, in_app: bool } per event type)
[x] 3.  Define `platform.notification_log` table: id (auto-increment), userId, eventType, channel, status (sent/failed/skipped/rate_limited), reference, createdAt
[x] 4.  Define `platform.notification_templates` table: id (text PK), subject (nullable), body (text, handlebars template), channelType, version, createdAt
[x] 5.  Define `platform.notification_routes` table per spec: id, eventType, templateId (FK), recipientField (JSON path), channels (text[]), enabled, maxPerUser, maxPerUserWindow, cooldownSeconds
[x] 6.  Define `platform.moderation_reports` table: id (UUID PK), reporterId, targetType (post/member/message), targetId, category (spam/inappropriate/fraud/harassment), description, status (pending/under_review/resolved/dismissed), assignedTo (UUID nullable), createdAt, updatedAt
[x] 7.  Define `platform.moderation_actions` table: id, reportId (FK, nullable), targetUserId, actionType (warn/remove_content/suspend/ban), duration (nullable), reason, adminId, createdAt
[x] 8.  Define `platform.ban_records` table: id (UUID PK), userId, reason, adminId, bannedAt, resolvedAt (nullable)
[x] 9.  Define `platform.appeal_records` table: id, moderationActionId (FK), appealerId, reason, reviewedBy (FK, nullable), outcome, createdAt, resolvedAt
[x] 10. Define `platform.admin_users` table: id (UUID PK), userId (FK → auth.users), role (super_admin/moderator/support), isActive, createdAt
[x] 11. Define `platform.admin_audit_log` table: id (auto-increment), adminUserId (FK), action, targetType, targetId, details (JSONB), correlationId, createdAt
[ ] 12. Partition admin_audit_log by month
[x] 13. Define `platform.platform_settings` table: key (text PK), value (JSONB), updatedBy, updatedAt
[x] 14. Generate migration and run

### Channel Adapters
[x] 15. Create `packages/platform/src/notifications/channels/email.ts`
[x] 16. Implement Resend adapter: sendEmail({ to, subject, htmlBody, textBody })
[x] 17. Create mock Resend adapter for tests (records calls, doesn't send)
[x] 18. Create `packages/platform/src/notifications/channels/push.ts`
[x] 19. Implement Expo Push Notifications adapter: sendPush({ expoPushToken, title, body, data })
[x] 20. Create mock Expo Push adapter for tests
[x] 21. Create `packages/platform/src/notifications/channels/sms.ts`
[x] 22. Implement Termii adapter (or Africa's Talking): sendSms({ to, message })
[x] 23. Create mock SMS adapter for tests
[x] 24. Create `packages/platform/src/notifications/channels/in-app.ts`
[x] 25. In-app channel: writes to notification_log + delivers via WebSocket if user is online

### Notification Dispatcher
[x] 26. Create `packages/platform/src/notifications/dispatcher.ts`
[ ] 27. Dispatcher is a BullMQ worker consuming notification jobs
[x] 28. For each incoming event: query notification_routes WHERE event_type = $eventType AND enabled = true
[x] 29. Extract recipient from event payload using `recipientField` path (e.g., "payload.userId")
[x] 30. Fetch user's notification preferences — skip disabled channels
[x] 31. Check rate limits: query notification_log for recent sends of same type to same user
[x] 32. If maxPerUser exceeded within window: skip, log as rate_limited
[x] 33. If cooldownSeconds not elapsed: skip, log as rate_limited
[x] 34. Global safety default: if no limits set, cap at 10 sends per type per user per hour
[x] 35. Render template using Handlebars with event payload as context
[x] 36. Dispatch to each allowed channel concurrently
[x] 37. Log outcome (sent/failed) for each channel to notification_log
[x] 38. Test: event processed → correct template rendered → correct channel adapter called
[x] 39. Test: maxPerUser = 1 (welcome email) → second trigger skipped, logged as rate_limited
[x] 40. Test: disabled channel in preferences → not dispatched
[x] 41. Test: invalid template → graceful failure, logged, does not crash dispatcher

### Seed Notification Route Configs
[ ] 42. Create a seed SQL file for initial notification_routes:
[ ] 43. auth.user.registered → template:welcome_email, channel: email, maxPerUser: 1
[ ] 44. marketplace.order.funded → template:order_funded, channels: push+email+in_app
[ ] 45. marketplace.order.completed → template:order_completed, channels: push+email+in_app
[ ] 46. marketplace.order.disputed → template:dispute_opened, channels: push+email+in_app+sms
[ ] 47. social.message.sent → template:new_message, channels: push+in_app, maxPerUser: 5, window: 1 hour
[ ] 48. finance.wallet.funded → template:wallet_funded, channels: push+in_app
[ ] 49. finance.withdrawal.completed → template:withdrawal_done, channels: push+email
[ ] 50. Run seed file against database

### Tests
[x] 51. Test: auth.user.registered event → welcome email channel adapter called once (mock)
[x] 52. Test: same event triggered 3 times → adapter called exactly once (maxPerUser=1)
[x] 53. Test: marketplace.order.funded → push, email, and in-app adapters all called
[x] 54. Test: user has email disabled in preferences → only push + in-app sent
[x] 55. Test: notification_log has correct entries after dispatch
