## Phase 2.1 Task List: Auth Schema & Database Layer

### Schema Definition
[ ] 1.  Create `packages/auth/src/schema.ts`
[ ] 2.  Define `auth.users` table: id (UUID PK), email (unique), phone (unique, nullable), passwordHash, emailVerified, phoneVerified, status (active/suspended/banned), createdAt, updatedAt
[ ] 3.  Define `auth.sessions` table: id (UUID PK), userId (FK), deviceInfo (JSON), expiresAt, revokedAt, createdAt
[ ] 4.  Define `auth.tokens` table: id (UUID PK), userId (FK), type (email_verify/password_reset/refresh), token (unique), expiresAt, usedAt, createdAt
[ ] 5.  Define `auth.invite_codes` table: id (UUID PK), inviterId (FK → users), code (unique), maxUses, usedCount, expiresAt, createdAt
[ ] 6.  Define `auth.referrals` table: id (UUID PK), inviteCodeId (FK), inviterId (FK → users), inviteeId (FK → users), status (pending/approved/rejected), createdAt
[ ] 7.  Define `auth.referral_approvals` table: id (UUID PK), referralId (FK), adminId (FK → users), action (approved/rejected), reason, createdAt
[ ] 8.  Define `auth.kyc_documents` table: id (UUID PK), userId (FK), docType (NIN/drivers_license/passport/voters_card), frontUrl, backUrl (nullable), status, submittedAt, reviewedAt
[ ] 9.  Define `auth.verifications` table: id (UUID PK), userId (FK), status (pending/provisional/verified/rejected/expired), method (automated/manual), grantedBy (FK → users, nullable), expiresAt (nullable for provisional), createdAt, updatedAt
[ ] 10. Define `auth.member_tiers` table: id, userId (FK), tier (free/verified/pro), changedBy, reason, createdAt
[ ] 11. Define `auth.badges` table: id, userId (FK), badgeType (verified/founding_member/pro), issuedBy (FK → users), revokedAt, createdAt
[ ] 12. Add all necessary indexes: userId lookups, code lookups, status filters
[ ] 13. Generate Drizzle migration for auth schema
[ ] 14. Run migration and verify tables in PostgreSQL

### Repository Layer
[ ] 15. Create `packages/auth/src/repositories/users.ts`
[ ] 16. Implement: findById, findByEmail, findByPhone, create, updateStatus, updatePassword
[ ] 17. Create `packages/auth/src/repositories/sessions.ts`
[ ] 18. Implement: create, findById, revokeById, revokeAllForUser, findActiveByUser
[ ] 19. Create `packages/auth/src/repositories/tokens.ts`
[ ] 20. Implement: create, findByToken, markUsed, deleteExpired
[ ] 21. Create `packages/auth/src/repositories/invite-codes.ts`
[ ] 22. Implement: create, findByCode, incrementUsage, getByInviter
[ ] 23. Create `packages/auth/src/repositories/referrals.ts`
[ ] 24. Implement: create, findById, findByInvitee, updateStatus, countBannedReferrals
[ ] 25. Create `packages/auth/src/repositories/verifications.ts`
[ ] 26. Implement: create, findByUserId, updateStatus, findExpiredProvisional
[ ] 27. Create `packages/auth/src/repositories/tiers.ts`
[ ] 28. Implement: getCurrentTier, setTier, getHistory
