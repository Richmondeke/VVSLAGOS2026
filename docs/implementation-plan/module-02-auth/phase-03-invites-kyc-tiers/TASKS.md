## Phase 2.3 Task List: Invites, Referrals, KYC, Tiers

### Invite System
[ ] 1.  Create `packages/auth/src/invites.ts`
[ ] 2.  Implement `generateInvite(userId)` — creates invite code with tier-based limit check
[ ] 3.  Tier limits: Free = 1 invite, Verified = 3 invites, Pro = 10 invites
[ ] 4.  Invite limits are read from platform settings (configurable), not hardcoded
[ ] 5.  Implement `listInvites(userId)` — returns all codes with usage status
[ ] 6.  Implement `validateInvite(code)` — check validity without consuming
[ ] 7.  Test: member at tier limit cannot generate more invites
[ ] 8.  Test: generating invite within limit creates code in DB
[ ] 9.  Test: invite limits use platform settings (mock settings to change limits)

### Referral Accountability
[ ] 10. Create `packages/auth/src/referrals.ts`
[ ] 11. Implement `getReferralChain(userId)` — walks up the tree
[ ] 12. Implement `getReferralsByInviter(userId)` — list of who this member has referred
[ ] 13. Implement `checkAccountability(inviterId)` — counts banned/suspended referrals
[ ] 14. If count >= 3: auto-reduce invite allocation (halve, minimum 1)
[ ] 15. If count >= 5: flag inviter for admin review
[ ] 16. Implement `handleReferralBanned(inviteeId)` — triggered when referree is banned
[ ] 17. Test: inviter with 3 banned referees has invite limit halved
[ ] 18. Test: inviter with 5 banned referees is flagged for review

### Admin Approval Queue
[ ] 19. Create `packages/auth/src/approval.ts`
[ ] 20. Implement `getPendingApprovals()` — list of users awaiting approval
[ ] 21. Implement `approveUser(userId, adminId, grantProvisional?)` — approves registration
[ ] 22. On approval: set user status to active, optionally grant provisional verification
[ ] 23. Implement `rejectUser(userId, adminId, reason)` — rejects registration
[ ] 24. On rejection: set user status to rejected, write notification event to outbox
[ ] 25. Write `auth.referral.approved` event to outbox on approval
[ ] 26. Test: admin can approve/reject; outbox event written on approval

### KYC / Identity Verification
[ ] 27. Create `packages/auth/src/verification.ts`
[ ] 28. Implement `submitVerification(userId, docs)` — stores document references (S3 URLs), creates pending verification
[ ] 29. Implement `grantProvisionalVerification(userId, adminId)` — creates provisional verification with 90-day expiry
[ ] 30. Implement `checkExpiredProvisional()` — BullMQ job finds expired provisional, downgrades tier, queues notification
[ ] 31. Implement `verifyIdentity(userId, providerResult)` — processes third-party KYC result
[ ] 32. On success: create verified verification record, upgrade tier to Verified
[ ] 33. On failure: store failure reason, notify user with retry guidance
[ ] 34. Test: provisional verification expires after 90 days (use mock clock)
[ ] 35. Test: successful KYC upgrades tier to Verified

### Tier Management
[ ] 36. Create `packages/auth/src/tiers.ts`
[ ] 37. Implement `getTier(userId)` — returns current MemberTier
[ ] 38. Implement `checkProUpgrade(userId)` — checks if member meets Pro criteria (5+ transactions, 4.2+ rating)
[ ] 39. Pro criteria are read from platform settings (configurable thresholds)
[ ] 40. Implement `upgradeTierToProIfEligible(userId)` — atomically upgrades if criteria met
[ ] 41. Implement `setTier(userId, tier, adminId, reason)` — admin override
[ ] 42. Write `finance.threshold.reached` event to outbox when Pro threshold crossed
[ ] 43. Test: member with 5 transactions and 4.2 rating is upgraded to Pro
[ ] 44. Test: member with 4 transactions is NOT upgraded (threshold not met)
[ ] 45. Test: tier upgrade is idempotent (calling twice doesn't create duplicate log entries)

### Badges
[ ] 46. Create `packages/auth/src/badges.ts`
[ ] 47. Implement `issueBadge(userId, badgeType, adminId)` — creates badge record
[ ] 48. Implement `revokeBadge(userId, badgeType, adminId)` — soft-deletes badge
[ ] 49. Implement `getBadges(userId)` — returns active badges
[ ] 50. Test: issue and revoke badge; revoked badge not returned by getBadges

### Public Interface Implementation
[ ] 51. Create `packages/auth/src/interfaces.ts` implementing IAuthService, IReferralService, IIdentityService from contracts
[ ] 52. Each interface method calls the appropriate internal function
[ ] 53. Create `packages/auth/src/index.ts` re-exporting public surface only
[ ] 54. Register auth routes and services in `apps/api/src/container.ts`
