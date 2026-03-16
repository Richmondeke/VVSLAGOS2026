## Phase 1.2 Task List: Contracts Package

### Foundation Types
[x] 1.  Define `Money` type: `{ amount: number; currency: 'NGN' }`
[x] 2.  Define `Paginated<T>` type: `{ items: T[]; total: number; page: number; pageSize: number }`
[x] 3.  Define `MemberTier` enum: Free | Verified | Pro
[x] 4.  Define `VerificationStatus` enum: Pending | Provisional | Verified | Rejected | Expired
[x] 5.  Define `OrderStatus` enum with all states from spec (draft → rated + disputed branch)
[x] 6.  Define `EntryType` enum: credit | debit
[x] 7.  Define `NotificationChannel` enum: push | email | sms | in_app

### Auth Interfaces
[x] 8.  Define `IAuthService` interface: register, login, refreshSession, revokeSession
[x] 9.  Define `IReferralService` interface: generateInvite, redeemInvite, approve, reject
[x] 10. Define `IIdentityService` interface: submitVerification, getStatus, getTier, upgradeTier
[x] 11. Define `AuthUser`, `Session`, `InviteCode`, `Referral`, `Verification` types

### Finance Interfaces
[x] 12. Define `IWalletService` interface: create, getBalance, debit, credit, withdraw
[x] 13. Define `IEscrowService` interface: create, markFunded, approveMilestone, releaseMilestone, cancel, dispute
[x] 14. Define `IRatingsService` interface: submit, getUserRating, getListingRating
[x] 15. Define `Wallet`, `DebitResult`, `CreditResult`, `EscrowAgreement`, `AggregateRating` types

### Members Interfaces
[x] 16. Define `IProfileService` interface: create, update, get, search
[x] 17. Define `IPortfolioService` interface: createItem, getItems
[x] 18. Define `Profile`, `ProfileSummary`, `PortfolioItem` types

### Marketplace Interfaces
[x] 19. Define `IListingService` interface: create, search, getWithRating
[x] 20. Define `IOrderService` interface: create, fund, submitDeliverable, approveMilestone, dispute, status
[x] 21. Define `Listing`, `ListingSummary`, `ListingWithRating`, `Order`, `OrderStatus` types

### Social Interfaces
[x] 22. Define `IFeedService` interface: post, timeline, engage
[x] 23. Define `IMessagingService` interface: startConversation, send, inbox
[x] 24. Define `FeedPost`, `Conversation`, `Message` types

### Platform Interfaces
[x] 25. Define `IModerationService` interface: report, suspend, ban, resolveDispute
[x] 26. Define `IAdminService` interface: getSettings, updateSettings, analytics
[x] 27. Define `PlatformSettings`, `AnalyticsResult` types

### Event Payload Types
[x] 28. Define auth event payloads: UserRegisteredPayload, ReferralApprovedPayload, IdentityVerifiedPayload, UserDeactivatedPayload
[x] 29. Define members event payloads: ProfileCreatedPayload, ProfileUpdatedPayload, PortfolioPublishedPayload
[x] 30. Define marketplace event payloads: ListingCreatedPayload, OrderFundedPayload, OrderCompletedPayload, OrderDisputedPayload
[x] 31. Define finance event payloads: WalletFundedPayload, WithdrawalCompletedPayload, ReviewSubmittedPayload, ThresholdReachedPayload
[x] 32. Define social event payloads: MessageSentPayload, PostFlaggedPayload, EngagementReceivedPayload
[x] 33. Define platform event payloads: UserSuspendedPayload, UserBannedPayload, SettingsUpdatedPayload

### Sub-exports Setup
[x] 34. Create `packages/contracts/src/auth.ts` and export auth types/interfaces
[x] 35. Create `packages/contracts/src/finance.ts` and export finance types/interfaces
[x] 36. Create `packages/contracts/src/members.ts` and export members types/interfaces
[x] 37. Create `packages/contracts/src/marketplace.ts` and export marketplace types/interfaces
[x] 38. Create `packages/contracts/src/social.ts` and export social types/interfaces
[x] 39. Create `packages/contracts/src/platform.ts` and export platform types/interfaces
[x] 40. Create `packages/contracts/src/events.ts` and export all event payload types
[x] 41. Update `packages/contracts/package.json` exports map with sub-path exports

### Validation
[x] 42. Verify contracts package has ZERO runtime dependencies (types only)
[x] 43. Run `pnpm tsc --noEmit` — zero errors
[ ] 44. Import a type from each sub-export in a test file and verify resolution
