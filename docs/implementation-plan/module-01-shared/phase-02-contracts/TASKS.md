## Phase 1.2 Task List: Contracts Package

### Foundation Types
[ ] 1.  Define `Money` type: `{ amount: number; currency: 'NGN' }`
[ ] 2.  Define `Paginated<T>` type: `{ items: T[]; total: number; page: number; pageSize: number }`
[ ] 3.  Define `MemberTier` enum: Free | Verified | Pro
[ ] 4.  Define `VerificationStatus` enum: Pending | Provisional | Verified | Rejected | Expired
[ ] 5.  Define `OrderStatus` enum with all states from spec (draft → rated + disputed branch)
[ ] 6.  Define `EntryType` enum: credit | debit
[ ] 7.  Define `NotificationChannel` enum: push | email | sms | in_app

### Auth Interfaces
[ ] 8.  Define `IAuthService` interface: register, login, refreshSession, revokeSession
[ ] 9.  Define `IReferralService` interface: generateInvite, redeemInvite, approve, reject
[ ] 10. Define `IIdentityService` interface: submitVerification, getStatus, getTier, upgradeTier
[ ] 11. Define `AuthUser`, `Session`, `InviteCode`, `Referral`, `Verification` types

### Finance Interfaces
[ ] 12. Define `IWalletService` interface: create, getBalance, debit, credit, withdraw
[ ] 13. Define `IEscrowService` interface: create, markFunded, approveMilestone, releaseMilestone, cancel, dispute
[ ] 14. Define `IRatingsService` interface: submit, getUserRating, getListingRating
[ ] 15. Define `Wallet`, `DebitResult`, `CreditResult`, `EscrowAgreement`, `AggregateRating` types

### Members Interfaces
[ ] 16. Define `IProfileService` interface: create, update, get, search
[ ] 17. Define `IPortfolioService` interface: createItem, getItems
[ ] 18. Define `Profile`, `ProfileSummary`, `PortfolioItem` types

### Marketplace Interfaces
[ ] 19. Define `IListingService` interface: create, search, getWithRating
[ ] 20. Define `IOrderService` interface: create, fund, submitDeliverable, approveMilestone, dispute, status
[ ] 21. Define `Listing`, `ListingSummary`, `ListingWithRating`, `Order`, `OrderStatus` types

### Social Interfaces
[ ] 22. Define `IFeedService` interface: post, timeline, engage
[ ] 23. Define `IMessagingService` interface: startConversation, send, inbox
[ ] 24. Define `FeedPost`, `Conversation`, `Message` types

### Platform Interfaces
[ ] 25. Define `IModerationService` interface: report, suspend, ban, resolveDispute
[ ] 26. Define `IAdminService` interface: getSettings, updateSettings, analytics
[ ] 27. Define `PlatformSettings`, `AnalyticsResult` types

### Event Payload Types
[ ] 28. Define auth event payloads: UserRegisteredPayload, ReferralApprovedPayload, IdentityVerifiedPayload, UserDeactivatedPayload
[ ] 29. Define members event payloads: ProfileCreatedPayload, ProfileUpdatedPayload, PortfolioPublishedPayload
[ ] 30. Define marketplace event payloads: ListingCreatedPayload, OrderFundedPayload, OrderCompletedPayload, OrderDisputedPayload
[ ] 31. Define finance event payloads: WalletFundedPayload, WithdrawalCompletedPayload, ReviewSubmittedPayload, ThresholdReachedPayload
[ ] 32. Define social event payloads: MessageSentPayload, PostFlaggedPayload, EngagementReceivedPayload
[ ] 33. Define platform event payloads: UserSuspendedPayload, UserBannedPayload, SettingsUpdatedPayload

### Sub-exports Setup
[ ] 34. Create `packages/contracts/src/auth.ts` and export auth types/interfaces
[ ] 35. Create `packages/contracts/src/finance.ts` and export finance types/interfaces
[ ] 36. Create `packages/contracts/src/members.ts` and export members types/interfaces
[ ] 37. Create `packages/contracts/src/marketplace.ts` and export marketplace types/interfaces
[ ] 38. Create `packages/contracts/src/social.ts` and export social types/interfaces
[ ] 39. Create `packages/contracts/src/platform.ts` and export platform types/interfaces
[ ] 40. Create `packages/contracts/src/events.ts` and export all event payload types
[ ] 41. Update `packages/contracts/package.json` exports map with sub-path exports

### Validation
[ ] 42. Verify contracts package has ZERO runtime dependencies (types only)
[ ] 43. Run `pnpm tsc --noEmit` — zero errors
[ ] 44. Import a type from each sub-export in a test file and verify resolution
