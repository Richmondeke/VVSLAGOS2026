# UI Inventory — Overview & Purpose

This document maps every page, screen, modal, dialog, and overlay across the VVS Members platform — both the member-facing client (web PWA) and the admin dashboard. It serves as the canonical reference for designing the full UI surface, identifying shared components, describing user experience flows, and avoiding redundancy.

## What Changed in v2

- **Every surface is priority-tagged** — P0 (launch), P1 (fast-follow, within 4 weeks post-launch), P2 (later). Launch scope is reduced from 100 to ~55 surfaces (~28 pages + ~27 modals).
- **Missing critical flows added** — post-approval onboarding, revision workflow, member-side dispute evidence submission, provider onboarding nudge, and "orders at risk" admin widget.
- **Structural fixes applied** — messaging model (one conversation per user pair), wallet language ("In Active Orders" not "Locked in Escrow"), discover page liquidity signal ("Recently Completed"), search ranking specification, and reputation transparency metrics.
- **Error and degraded states** are called out per screen where network-dependent interactions occur.
- **Admin scope is right-sized** — only 6 admin pages are P0; the rest are P1/P2.
