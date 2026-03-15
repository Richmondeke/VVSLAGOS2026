# VVS Members — Product Requirements Document

**Version:** 1.0  
**Date:** March 2026  
**Author:** RateMe Ltd  
**Status:** Draft

---

## 1. Problem Statement

Nigeria's creative and professional services economy runs on personal networks. Finding trusted talent — designers, developers, photographers, stylists, consultants — means asking around, hoping for referrals, and managing payments through informal channels with no recourse when things go wrong.

Existing platforms fail this market in specific ways:

- **Freelance marketplaces** (Fiverr, Upwork) optimise for volume and global arbitrage, not for trust within a local professional community. Reputation is gamed through fake reviews and race-to-the-bottom pricing.
- **Social platforms** (Instagram, Twitter/X, LinkedIn) let people showcase work but offer no native way to transact, no escrow, no structured deliverables, and no accountability when a job goes sideways.
- **Word-of-mouth referrals** work but don't scale. They're limited by who you personally know, and there's no shared record of someone's transaction history or reliability.

VVS Members solves this by creating a referral-only professional network where reputation is earned through completed, paid transactions — not follower counts or self-reported credentials.

---

## 2. Product Vision

A members-only creative services marketplace where every member was referred by someone who vouches for them, every transaction is protected by escrow, and reputation scores are derived from real paid work — making it the most trusted place to hire and offer professional services in Nigeria.

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Description |
|------|-------------|
| **G1 — Trusted talent marketplace** | Become the default platform for hiring verified creative and professional talent within Nigeria's urban professional class. |
| **G2 — Transaction volume** | Drive real economic activity through the platform, not just profiles and browsing. |
| **G3 — Community quality** | Maintain a high-signal, low-noise environment through referral gating and active moderation. |
| **G4 — Revenue generation** | Generate revenue through transaction fees on escrow-protected deals. |

### Success Metrics (Launch + 6 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Registered members | 1,000 | Auth system count |
| Members with completed profiles | 70% of registered | Profile completeness score |
| Active listings | 500+ | Marketplace listing count |
| Transactions completed through escrow | 200+ | Order state: `completed` |
| Dispute rate | < 5% of funded orders | Orders reaching `disputed` state |
| Average reputation score (scored members) | ≥ 4.0 | Finance package scoring engine |
| Member retention (monthly active) | 40%+ | Login + meaningful action within 30 days |
| Referral conversion rate | 30%+ invite redemptions | Redeemed invites / generated invites |

---

## 4. Target Users & Personas

### Persona 1 — The Provider (Creative Professional)

**Name:** Adaeze, 28  
**Role:** Brand identity designer based in Lagos  
**Context:** Has a strong portfolio, gets clients through Instagram DMs and referrals from friends. Regularly deals with late payments, scope creep, and clients who disappear after receiving deliverables.

**Needs:**
- A place to showcase work that's connected to her transaction history, not just pretty pictures
- Payment protection — clients pay into escrow before work starts
- A reputation score that reflects actual completed work, giving her leverage with new clients
- Referral-based community so she's working with vetted people, not random internet strangers

**Frustrations:**
- Instagram followers ≠ reliable clients
- No payment protection on informal gigs
- Portfolio sites don't convey trustworthiness

---

### Persona 2 — The Client (Hiring Professional)

**Name:** Tunde, 34  
**Role:** Marketing lead at a mid-size Lagos company  
**Context:** Regularly hires freelancers for design, photography, and content. Has been burned by unreliable talent found on social media. Wants a shortlist of people someone he trusts has already worked with.

**Needs:**
- Browse verified professionals filtered by skill, category, availability, and reputation
- Structured ordering with clear deliverables and milestones
- Escrow so he doesn't pay upfront with no recourse
- Transaction-based ratings to distinguish real quality from self-promotion

**Frustrations:**
- No way to verify claims on LinkedIn or Instagram
- Informal payments leave no audit trail
- Previous bad experiences with unvetted freelancers

---

### Persona 3 — The Community Builder (Power Referrer)

**Name:** Kemi, 31  
**Role:** Creative director, well-connected across Lagos creative scene  
**Context:** People constantly ask her to recommend talent. She wants a way to formalise her referrals and build a network she's proud of — where her name on an invite actually means something.

**Needs:**
- Invite codes she can share selectively
- Visibility into the performance of people she's referred
- Recognition for building the community (badges, tier upgrades)
- A network that reflects her taste and standards

---

## 5. Membership & Access

### 5.1 Referral-Only Entry

VVS Members is not open registration. Every new member must:

1. Receive an invite code or link from an existing member
2. Complete registration (email/phone + password, or social login)
3. Pass admin approval (manual review at launch, automated criteria later)

Invite limits are tier-based — higher-tier members can invite more people.

### 5.2 Membership Tiers

| Tier | Entry Criteria | Capabilities |
|------|---------------|--------------|
| **Free** | Invite redeemed + admin approved | Browse, basic profile, limited messaging (20/day), cannot list services |
| **Verified** | KYC identity verification completed | Full profile, portfolio, list services, 100 messages/day, escrow transactions |
| **VVS Circle / Pro** | Transaction history + reputation threshold | Unlimited messaging, priority in search, increased invite allocation, badge |

Tier transitions are driven by a combination of identity verification (Verified) and transaction-based reputation thresholds (Pro).

### 5.3 Identity Verification (KYC)

Members seeking Verified status must:
- Upload government-issued ID
- Pass third-party identity verification (pluggable provider)
- Optionally undergo manual admin review

Verification status is a prerequisite for listing services and transacting through escrow.

---

## 6. Feature Requirements

### 6.1 Profiles & Portfolios

**Epic: Member Presence**

Members create and maintain a professional profile that serves as their storefront within the network.

**Requirements:**

- **FR-PROF-01:** Members can create and edit a profile including bio, profession, primary category, skills, and availability status.
- **FR-PROF-02:** Profiles display the member's tier, badges (Verified, Founding Member, Pro), and aggregate reputation score (visible after 3+ reviews).
- **FR-PROF-03:** Members can upload portfolio items with title, description, media (images/video), and tags.
- **FR-PROF-04:** Members can create structured case studies: challenge → approach → outcome → metrics.
- **FR-PROF-05:** Members can tag collaborators on portfolio pieces. Tagged members must confirm before the tag is visible.
- **FR-PROF-06:** Profile search supports full-text queries across profession, category, skills, and location, with filters for availability, tier, and minimum reputation score.
- **FR-PROF-07:** Profile and portfolio content is subject to content policy enforcement — work-related content only.
- **FR-PROF-08:** Members can export all their data (GDPR-style data portability).

**User Stories:**

- As a provider, I want to showcase my best work with structured case studies so potential clients see the impact of my work, not just screenshots.
- As a client, I want to search for designers in Lagos who are available this month and have a reputation score above 4.0 so I can quickly find reliable talent.
- As a member, I want to tag my collaborator on a project we did together so both our profiles reflect the work.

---

### 6.2 Service Listings & Discovery

**Epic: Marketplace**

Verified members list services with structured pricing. Clients browse, filter, and initiate orders.

**Requirements:**

- **FR-LIST-01:** Verified+ members can create service listings with title, description, category, pricing model (fixed / hourly / project-based), deliverables, and estimated timeline.
- **FR-LIST-02:** Each listing supports up to three pricing tiers (Basic / Standard / Premium) with different deliverables and prices per tier.
- **FR-LIST-03:** Discovery supports search and filtering by category, price range, provider reputation score, and availability.
- **FR-LIST-04:** Listing creation requires real-time verification of the member's tier (Verified or above). A revoked verification blocks new listings immediately.
- **FR-LIST-05:** Listings display the provider's aggregate rating and number of completed transactions.

**User Stories:**

- As a verified member, I want to create a service listing with three pricing tiers so clients can choose the level of service that fits their budget.
- As a client, I want to filter listings by category and minimum provider rating so I only see services from people with proven track records.

---

### 6.3 Orders, Escrow & Payments

**Epic: Transactional Core**

The order lifecycle from engagement to payment, protected by escrow at every step.

**Requirements:**

- **FR-ORD-01:** A client initiates an order by selecting a listing and pricing tier. The order enters `draft` state.
- **FR-ORD-02:** The client funds the order. The system debits the client's wallet and locks funds in escrow. Order moves to `funded`.
- **FR-ORD-03:** The provider works and submits deliverables (file uploads with versioning). Order moves to `in_progress` → `delivered`.
- **FR-ORD-04:** The client reviews deliverables and approves milestones. Upon final approval, escrow releases funds to the provider's wallet. Order moves to `completed`.
- **FR-ORD-05:** Orders support milestone-based delivery — escrow funds can be split across milestones, released incrementally as each is approved.
- **FR-ORD-06:** Either party can raise a dispute at any point after funding. Disputed orders freeze the relevant escrow funds and enter a moderation queue.
- **FR-ORD-07:** Orders before `in_progress` can be cancelled. Cancellation triggers an escrow refund to the client's wallet.
- **FR-ORD-08:** Every state transition is logged in an immutable audit trail with timestamp, actor, reason, and correlation ID.

**Order State Machine:**

```
draft → pending_funding → funded → in_progress → delivered →
pending_approval → completed → rated

Any state → disputed → resolved_released | resolved_refunded
Any state before in_progress → cancelled → refunded
```

**User Stories:**

- As a client, I want my payment held in escrow until I approve the deliverables so I'm protected if the work isn't delivered.
- As a provider, I want milestone-based payments so I get paid incrementally as I complete portions of a larger project.
- As a client, I want to dispute an order if deliverables don't match what was agreed, and have a moderator review the case.

---

### 6.4 Wallet & Financial Operations

**Epic: Money Movement**

Every member has a wallet. All platform transactions flow through wallets. Real money enters and exits through Paystack.

**Requirements:**

- **FR-WAL-01:** Every member gets a wallet upon registration (zero balance, NGN currency).
- **FR-WAL-02:** Members can fund their wallet via Paystack (card, bank transfer, USSD).
- **FR-WAL-03:** Members can withdraw from their wallet to a bank account via Paystack Transfers.
- **FR-WAL-04:** All wallet operations (credits, debits, holds, releases) are recorded in an immutable double-entry ledger. The invariant `sum(credits) - sum(debits) = balance` is enforced.
- **FR-WAL-05:** Concurrent wallet operations must be safe — two simultaneous debits on the same wallet must never result in a negative balance or double-spend.
- **FR-WAL-06:** Paystack webhook processing is idempotent — replaying the same webhook produces the same result (single credit).

**User Stories:**

- As a member, I want to fund my wallet so I can pay for services on the platform.
- As a provider, I want to withdraw my earnings to my bank account after completing a job.

---

### 6.5 Ratings & Reputation

**Epic: Trust Engine**

Reputation is the core differentiator. Scores are derived exclusively from real, paid transactions.

**Requirements:**

- **FR-REP-01:** After an order completes, both client and provider have a 14-day window to submit a rating (1–5 stars) and written review.
- **FR-REP-02:** Reputation scores are calculated using a weighted formula that factors in: the rating itself, the reviewer's own reputation (reviewer weight), recency of the review (exponential decay), and transaction value (log-scaled, capped).
- **FR-REP-03:** A minimum of 3 reviews is required before a reputation score becomes visible on a member's profile.
- **FR-REP-04:** Reputation thresholds unlock capabilities (e.g., tier upgrades, increased invite allocation, priority search placement).
- **FR-REP-05:** Scores are recalculated incrementally on each new review submission.

**User Stories:**

- As a client, I want to rate a provider after a completed job so future clients benefit from my experience.
- As a provider, I want my reputation score to reflect the quality and value of my completed work, not just the number of reviews.
- As a member, I want to see a provider's reputation score before hiring them so I can make an informed decision.

---

### 6.6 Feed & Social

**Epic: Professional Social Layer**

A curated feed of work-related content. Not a general social network.

**Requirements:**

- **FR-SOC-01:** Members can post to the feed. Allowed post types: completed project, case study, work-in-progress, collaborator call, service announcement.
- **FR-SOC-02:** Non-work content is detected and rejected (content policy enforcement).
- **FR-SOC-03:** The feed is ranked by work quality signals, verified-user engagement, transaction history, and recency — not chronological.
- **FR-SOC-04:** Members can like, bookmark, and comment on posts.
- **FR-SOC-05:** New portfolio publications and completed marketplace listings can automatically surface as feed posts.

**User Stories:**

- As a member, I want to share a completed project on the feed so other members can see my latest work.
- As a member, I want my feed to prioritise high-quality work from active, transacting members — not spam or self-promotion.

---

### 6.7 Messaging

**Epic: Direct Communication**

1:1 conversations between members, gated by tier.

**Requirements:**

- **FR-MSG-01:** Members can start 1:1 conversations with other members.
- **FR-MSG-02:** Messaging is rate-limited by tier: Free (20 messages/day), Verified (100/day), Pro (unlimited).
- **FR-MSG-03:** Messages support text and file attachments.
- **FR-MSG-04:** Read receipts are tracked per message.
- **FR-MSG-05:** Real-time message delivery via WebSocket connection.
- **FR-MSG-06:** Members can block other members, preventing further messages.

**User Stories:**

- As a client, I want to message a provider directly to discuss project details before placing an order.
- As a member, I want to block someone who sends me unwanted messages.

---

### 6.8 Notifications

**Epic: Member Communication**

Multi-channel notifications driven by platform events.

**Requirements:**

- **FR-NOT-01:** Notifications are delivered across four channels: push (mobile), email, SMS, and in-app.
- **FR-NOT-02:** Members can configure per-channel preferences (enable/disable specific channels).
- **FR-NOT-03:** Notification routing is config-driven — adding notifications for a new event type requires a database configuration change, not a code deployment.
- **FR-NOT-04:** Notifications are rate-limited per type per member to prevent spam (e.g., max 5 engagement notifications per hour).
- **FR-NOT-05:** Key notification triggers include: order funded, order completed, new message, dispute opened, wallet funded, withdrawal completed, referral approved, identity verified.

---

### 6.9 Moderation & Safety

**Epic: Community Integrity**

Active moderation to maintain the quality and safety of the network.

**Requirements:**

- **FR-MOD-01:** Members can report content or other members with categorised reasons (spam, inappropriate, fraud).
- **FR-MOD-02:** Reports enter a moderation queue with assignment, prioritisation, and resolution workflow.
- **FR-MOD-03:** Moderator actions include: warn, remove content, suspend account, ban account.
- **FR-MOD-04:** Suspended/banned members have their content hidden and listings paused.
- **FR-MOD-05:** Members can appeal moderation decisions.
- **FR-MOD-06:** Automated content scanning detects policy violations proactively.
- **FR-MOD-07:** All moderation actions are recorded in an immutable audit log.

---

### 6.10 Admin Operations

**Epic: Platform Management**

Administrative tools for managing the platform, members, and business configuration.

**Requirements:**

- **FR-ADM-01:** Role-based admin access: Super Admin, Moderator, Support.
- **FR-ADM-02:** Admin dashboard displays key analytics: member growth, transaction volume, active listings, dispute rate, revenue.
- **FR-ADM-03:** Admins can manage platform settings: invite limits per tier, transaction fee percentages, reputation thresholds, feature flags.
- **FR-ADM-04:** Admins can perform bulk operations: mass invite, mass badge assignment, mass notifications.
- **FR-ADM-05:** Admins can review and resolve disputes, with resolution options: release to provider or refund to client.
- **FR-ADM-06:** Admins can approve or reject new member registrations.
- **FR-ADM-07:** All admin actions are immutably logged for audit.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|-------------|--------|
| API response time (p95) | < 300ms for reads, < 500ms for writes |
| Search latency | < 200ms (PostgreSQL full-text, up to 10K members) |
| WebSocket message delivery | < 100ms (real-time messaging) |
| Concurrent wallet operations | Safe under 50+ simultaneous debits on a single wallet |

### 7.2 Security

| Requirement | Detail |
|-------------|--------|
| Password storage | Argon2 with adaptive cost |
| Session management | JWT with refresh tokens, device tracking, revocation |
| Payment webhooks | Signature verification on every Paystack callback |
| Rate limiting | Per-IP and per-user sliding windows; stricter limits on auth and financial endpoints |
| Data isolation | Each business domain operates on its own database schema with dedicated access credentials |

### 7.3 Reliability

| Requirement | Detail |
|-------------|--------|
| Financial consistency | Transactional outbox ensures no event is lost, even during infrastructure failures |
| Idempotency | All payment processing and event handlers are safely re-executable |
| Reconciliation | Automated daily reconciliation of wallet balances against ledger entries |
| Dead-letter handling | Failed events are captured, surfaced to admins, and resolvable |

### 7.4 Scalability

| Requirement | Detail |
|-------------|--------|
| Launch target | Supports up to 10,000 active members on a single deployment |
| Architecture | Modular monolith with clean domain boundaries; decomposable into independent services when needed |
| Data growth | Append-only tables use declarative partitioning with defined retention policies |

### 7.5 Availability

| Requirement | Detail |
|-------------|--------|
| Target uptime | 99.5% (allows ~3.6 hours downtime/month) |
| Deployment | Zero-downtime deploys via rolling updates on managed container platform |

---

## 8. Platform & Client Requirements

| Platform | Technology | Notes |
|----------|-----------|-------|
| **Web** | Next.js (App Router) | SSR for SEO on public profiles and listings; React Server Components for performance |
| **Mobile (iOS + Android)** | Expo (React Native) | Cross-platform; OTA updates bypass app store review for rapid bug fixes |
| **Admin Dashboard** | Next.js (separate app) | Shared type contracts with API; accessible to internal team only |

---

## 9. Assumptions & Constraints

### Assumptions

- The initial user base will be seeded from the existing VVS Lagos creative community and their extended networks.
- Paystack will remain the primary payment gateway for Nigerian Naira transactions.
- Members are willing to complete KYC to access marketplace features.
- The referral-only model will create sufficient demand without traditional marketing.

### Constraints

- **Currency:** NGN only at launch. Multi-currency is a future consideration.
- **Geography:** Nigeria-focused. No international payment routing at launch.
- **Team size:** 1–3 engineers. Technology choices reflect this constraint.
- **Infrastructure budget:** Single VPS or managed container platform. No Kubernetes, no dedicated message broker, no search engine cluster.

---

## 10. Out of Scope (v1)

| Feature | Rationale |
|---------|-----------|
| Multi-currency support | Adds payment routing complexity; defer until international expansion |
| AI-powered matching / recommendations | Start with manual search and category browsing; add ML later based on transaction data |
| Video calls / built-in conferencing | Members can use existing tools (Google Meet, Zoom); not a differentiator |
| Public API for third-party integrations | Focus on first-party clients (web, mobile, admin) |
| Subscription-based pricing for providers | Transaction fees only at launch; recurring billing is a future revenue model |
| Automated dispute resolution | All disputes are human-reviewed at launch |
| Group messaging / channels | 1:1 only at launch to keep moderation manageable |
| Elasticsearch / advanced search | PostgreSQL full-text search is sufficient for 1–10K members |

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low referral conversion — members don't invite enough people | Slow growth, empty marketplace | Medium | Gamify invites (leaderboard, badges). Seed aggressively from VVS Lagos community. |
| Payment gateway issues (Paystack downtime) | Transactions blocked | Low | Flutterwave as secondary gateway behind adapter interface. Queue failed funding attempts for retry. |
| Escrow disputes overwhelm small team | Admin bottleneck, user frustration | Medium | Clear deliverable requirements at order creation. Milestone-based payments reduce all-or-nothing disputes. |
| Content quality degrades | Platform feels like another social media feed | Medium | Strict content policy enforcement (automated + manual). Work-only posting types. Algorithmic ranking rewards transactions over engagement. |
| Financial integrity failure (double-spend, lost funds) | Catastrophic trust loss | Low | Atomic conditional updates. Immutable ledger. Daily reconciliation. Comprehensive stress testing (50 concurrent debits). |
| Single engineer dependency | Bus factor = 1 | High | Comprehensive documentation (this PRD + architecture spec). Standard technology stack with deep Nigerian talent pool. Clean module boundaries enable onboarding. |

---

## 12. Release Phases

### Phase 1 — Foundation (Weeks 1–4)

Shared infrastructure, auth, and finance packages. Members can register (via invite), verify identity, fund wallets, and withdraw.

**Deliverables:** Registration flow, invite system, KYC upload, wallet funding via Paystack, withdrawal to bank.

### Phase 2 — Profiles & Marketplace (Weeks 5–8)

Members create profiles and portfolios. Verified members list services. Clients can browse and search.

**Deliverables:** Profile CRUD, portfolio with media upload, service listings with pricing tiers, search and discovery.

### Phase 3 — Transactional Core (Weeks 9–12)

Orders, escrow, milestone-based delivery, and ratings. The full order lifecycle is live.

**Deliverables:** Order saga (fund → deliver → approve → release), escrow, milestone payments, post-transaction ratings, reputation scoring.

### Phase 4 — Social & Notifications (Weeks 13–16)

Feed, messaging, and multi-channel notifications. The community layer is live.

**Deliverables:** Feed with content policy, 1:1 messaging with WebSocket, push/email/SMS/in-app notifications.

### Phase 5 — Moderation & Admin (Weeks 17–18)

Moderation tools, admin dashboard, analytics. The platform is operationally complete.

**Deliverables:** Reporting and moderation queue, admin dashboard with analytics, bulk operations, platform settings management.

### Phase 6 — Mobile & Launch Prep (Weeks 19–22)

Expo mobile app, cross-platform testing, performance optimisation, launch readiness.

**Deliverables:** iOS + Android app via Expo, OTA update pipeline, load testing, security audit, soft launch to seed community.

---

## 13. Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Paystack merchant account + API keys | RateMe Ltd / VVS Lagos | Required before Phase 1 wallet work |
| KYC verification provider selection | RateMe Ltd | Required before Phase 1 identity verification |
| S3-compatible object storage (Cloudflare R2 or AWS S3) | RateMe Ltd | Required before Phase 2 media uploads |
| Transactional email provider (Resend or Postmark) | RateMe Ltd | Required before Phase 4 notifications |
| SMS provider (Termii or Africa's Talking) | RateMe Ltd | Required before Phase 4 SMS notifications |
| Apple Developer + Google Play accounts | VVS Lagos | Required before Phase 6 mobile deployment |
| Seed community (initial invite holders) | VVS Lagos | Required for soft launch |

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Member** | A registered user of VVS Members |
| **Provider** | A member who lists and delivers services |
| **Client** | A member who hires providers and pays for services |
| **Escrow** | Funds held by the platform on behalf of a transaction, released upon deliverable approval |
| **Milestone** | A discrete deliverable within an order, with its own approval and payment release |
| **Reputation Score** | A weighted average (1.0–5.0) derived from post-transaction reviews, factoring reviewer credibility, recency, and transaction value |
| **Tier** | Membership level (Free → Verified → Pro) that gates access to features |
| **Invite Code** | A unique code generated by an existing member, required for new member registration |
| **Outbox** | Infrastructure pattern ensuring events are never lost during processing |
| **KYC** | Know Your Customer — identity verification process |

---

*This PRD is derived from the VVS Members Architecture & Technology Specification v3.0. For implementation details, database schemas, and code-level specifications, refer to the architecture document.*