# Architecture Summary

## Architecture

| Package | Domain Files | Tables | Interfaces Exposed | Events Out |
|---|---|---|---|---|
| contracts | types only | 0 | — | — |
| shared | 6 dirs | 2 | — | — |
| auth | 11 | 10 | IAuthService, IReferralService, IIdentityService | 4 |
| members | 7 | 7 | IProfileService, IPortfolioService | 3 |
| marketplace | 6 | 6 | IListingService, IOrderService | 5 |
| finance | 11 | 11 | IWalletService, IEscrowService, IRatingsService | 4 |
| social | 8 | 8 | IFeedService, IMessagingService | 3 |
| platform | 17 | 12 | IModerationService, IAdminService | 3 |
| **Total** | **66 + types** | **56** | **10** | **22** |

## Technology

| Category | Count | Components |
|---|---|---|
| **Core Runtime** | 3 | TypeScript, Node.js, Fastify |
| **Data** | 3 | PostgreSQL, Drizzle ORM, Redis |
| **Async** | 1 | BullMQ |
| **Clients** | 2 | Next.js (web + admin), Expo (mobile) |
| **Toolchain** | 5 | pnpm, Turborepo, Vitest, Biome, tsx |
| **External Services** | 4 | Paystack, R2/S3, Resend/Postmark, Expo Push |
| **Infrastructure** | 3 | Managed PostgreSQL, Managed Redis, Managed container platform |

**14 dependencies that matter.** One language, one database, one cache/queue, and frameworks that stay out of the architecture's way. The spec is well-designed. The tech stack honours it.
