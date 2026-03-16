## Phase 2.3 Task List: Invites, Referrals, KYC, Tiers

### Invite System
[x] 1.  Create `packages/auth/src/invites.ts`
[x] 2.  Implement `generateInvite(userId)` — creates invite code with tier-based limit check
[x] 3.  Tier limits: Free = 1 invite, Verified = 3 invites, Pro = 10 invites
[x] 4.  Invite limits are read from platform settings (configurable), not hardcoded
[x] 5.  Implement `listInvites(userId)` — returns all codes with usage status
[x] 6.  Implement `validateInvite(code)` — check validity without consuming
[x] 7.  Test: member at tier limit cannot generate more invites
[x] 8.  Test: generating invite within limit creates code in DB
[x] 9.  Test: invite limits use platform settings (mock settings to change limits)

### Referral Accountability
[x] 10. Create `packages/auth/src/referral-service.ts`
[x] 11. Implement `getReferralChain(userId)` — walks up the tree
[x] 12. Implement `getReferralsByInviter(userId)` — list of who this member has referred
[x] 13. Implement `checkAccountability(inviterId)` — counts banned/suspended referrals
[x] 14. If count >= 3: auto-reduce invite allocation (halve, minimum 1)
[x] 15. If count >= 5: flag inviter for admin review
[x] 16. Implement `handleReferralBanned(inviteeId)` — triggered when referree is banned
[x] 17. Test: inviter with 3 banned referees has invite limit halved
[x] 18. Test: inviter with 5 banned referees is flagged for review

### Admin Approval Queue
[x] 19. Create `packages/auth/src/approval.ts`
[x] 20. Implement `getPendingApprovals()` — list of users awaiting approval
[x] 21. Implement `approveUser(userId, adminId, grantProvisional?)` — approves registration
[x] 22. On approval: set user status to active, optionally grant provisional verification
[x] 23. Implement `rejectUser(userId, adminId, reason)` — rejects registration
[x] 24. On rejection: set user status to rejected, write notification event to outbox
[x] 25. Write `auth.referral.approved` event to outbox on approval
[x] 26. Test: admin can approve/reject; outbox event written on approval

### KYC / Identity Verification
[x] 27. Create `packages/auth/src/verification.ts`
[x] 28. Implement `submitVerification(userId, docs)` — stores document references (S3 URLs), creates pending verification
[x] 29. Implement `grantProvisionalVerification(userId, adminId)` — creates provisional verification with 90-day expiry
[x] 30. Implement `checkExpiredProvisional()` — finds expired provisional, downgrades tier
[x] 31. Implement `verifyIdentity(userId, providerResult)` — processes third-party KYC result
[x] 32. On success: create verified verification record, upgrade tier to Verified
[x] 33. On failure: store failure reason
[x] 34. Test: provisional verification expires after 90 days
[x] 35. Test: successful KYC upgrades tier to Verified

### Tier Management
[x] 36. Create `packages/auth/src/tier-service.ts`
[x] 37. Implement `getTier(userId)` — returns current MemberTier
[x] 38. Implement `checkProUpgrade(userId)` — checks if member meets Pro criteria (5+ transactions, 4.2+ rating)
[x] 39. Pro criteria are read from platform settings (configurable thresholds)
[x] 40. Implement `upgradeTierToProIfEligible(userId)` — atomically upgrades if criteria met
[x] 41. Implement `setTier(userId, tier, adminId, reason)` — admin override
[x] 42. Write `finance.threshold.reached` event to outbox when Pro threshold crossed
[x] 43. Test: member with 5 transactions and 4.2 rating is upgraded to Pro
[x] 44. Test: member with 4 transactions is NOT upgraded (threshold not met)
[x] 45. Test: tier upgrade is idempotent (calling twice doesn't create duplicate log entries)

### Badges
[x] 46. Create `packages/auth/src/badges-service.ts`
[x] 47. Implement `issueBadge(userId, badgeType, adminId)` — creates badge record
[x] 48. Implement `revokeBadge(userId, badgeType, adminId)` — soft-deletes badge
[x] 49. Implement `getBadges(userId)` — returns active badges
[x] 50. Test: issue and revoke badge; revoked badge not returned by getBadges

### Public Interface Implementation
[x] 51. Create `packages/auth/src/interfaces.ts` implementing IAuthService, IReferralService, IIdentityService from contracts
[x] 52. Each interface method calls the appropriate internal function
[x] 53. Update `packages/auth/src/index.ts` re-exporting public surface
[ ] 54. Register auth routes and services in `apps/api/src/container.ts` — deferred: will wire when API connects to auth DB
