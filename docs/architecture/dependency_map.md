# Dependency Map

Below is the high-level dependency graph between packages.

```
                    @vvs/contracts (TypeScript types only)
                         │
                    @vvs/shared (Drizzle, BullMQ, Pino, errors)
                         │
        ┌────────┬───────┼───────┬──────────┬──────────┐
        │        │       │       │          │          │
    @vvs/auth  @vvs/   @vvs/  @vvs/     @vvs/     @vvs/
               members market  finance   social   platform
                       place
        │        │       │       │          │         │
        │        │       ├──IF──►│          │         │
        │        │       │       │          │         │
        ├──IF───►│       │       │          │         │
        │        │       │       │          │         │
        ├─event─►├─event►├event─►├──event──►├─event──►│
        │        │       │       │          │         │

    ──IF──►  = interface call (synchronous, DI-injected)
    ─event►  = async event via transactional outbox → BullMQ
```

### Notes
- The only cross-package interface call on the critical transactional path is marketplace → finance.
- Marketplace also calls auth's `IIdentityService` for tier verification — this is on the listing-creation path, not the payment path.

For a detailed package-by-package breakdown, see `docs/architecture/package_specs.md` and `docs/architecture/complete_architecture.md`.
