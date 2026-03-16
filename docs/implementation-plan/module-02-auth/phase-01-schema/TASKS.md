## Phase 2.1 Task List: Auth Schema & Database Layer

### Schema Definition
[x] 1.  Create `packages/auth/src/schema.ts`
[x] 2.  Define `auth.users` table: id (UUID PK), email (unique), phone (unique, nullable), passwordHash, emailVerified, phoneVerified, status (active/suspended/banned), createdAt, updatedAt
[x] 3.  Define `auth.sessions` table: id (UUID PK), userId (FK), deviceInfo (JSON), expiresAt, revokedAt, createdAt
[x] 4.  Define `auth.tokens` table: id (UUID PK), userId (FK), type (email_verify/password_reset/refresh), token (unique), expiresAt, usedAt, createdAt
[x] 5.  Define `auth.invite_codes` table: id (UUID PK), inviterId (FK → users), code (unique), maxUses, usedCount, expiresAt, createdAt
[x] 6.  Define `auth.referrals` table: id (UUID PK), inviteCodeId (FK), inviterId (FK → users), inviteeId (FK → users), status (pending/approved/rejected), createdAt
[x] 7.  Define `auth.referral_approvals` table: id (UUID PK), referralId (FK), adminId (FK → users), action (approved/rejected), reason, createdAt
[x] 8.  Define `auth.kyc_documents` table: id (UUID PK), userId (FK), docType (NIN/drivers_license/passport/voters_card), frontUrl, backUrl (nullable), status, submittedAt, reviewedAt
[x] 9.  Define `auth.verifications` table: id (UUID PK), userId (FK), status (pending/provisional/verified/rejected/expired), method (automated/manual), grantedBy (FK → users, nullable), expiresAt (nullable for provisional), createdAt, updatedAt
[x] 10. Define `auth.member_tiers` table: id, userId (FK), tier (free/verified/pro), changedBy, reason, createdAt
[x] 11. Define `auth.badges` table: id, userId (FK), badgeType (verified/founding_member/pro), issuedBy (FK → users), revokedAt, createdAt
[x] 12. Add all necessary indexes: userId lookups, code lookups, status filters
[x] 13. Generate Drizzle migration for auth schema
[x] 14. Run migration and verify tables in PostgreSQL

### Repository Layer
[x] 15. Create `packages/auth/src/repositories/users.ts`
[x] 16. Implement: findById, findByEmail, findByPhone, create, updateStatus, updatePassword
[x] 17. Create `packages/auth/src/repositories/sessions.ts`
[x] 18. Implement: create, findById, revokeById, revokeAllForUser, findActiveByUser
[x] 19. Create `packages/auth/src/repositories/tokens.ts`
[x] 20. Implement: create, findByToken, markUsed, deleteExpired
[x] 21. Create `packages/auth/src/repositories/invite-codes.ts`
[x] 22. Implement: create, findByCode, incrementUsage, getByInviter
[x] 23. Create `packages/auth/src/repositories/referrals.ts`
[x] 24. Implement: create, findById, findByInvitee, updateStatus, countBannedReferrals
[x] 25. Create `packages/auth/src/repositories/verifications.ts`
[x] 26. Implement: create, findByUserId, updateStatus, findExpiredProvisional
[x] 27. Create `packages/auth/src/repositories/tiers.ts`
[x] 28. Implement: getCurrentTier, setTier, getHistory
