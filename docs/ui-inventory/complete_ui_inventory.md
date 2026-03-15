# VVS Members — UI Screen & Component Inventory

**Version:** 2.0
**Date:** March 2026
**Author:** RateMe Ltd
**Status:** Working Draft

---

## Purpose

This document maps every page, screen, modal, dialog, and overlay across the VVS Members platform — both the member-facing client (web PWA) and the admin dashboard. It serves as the canonical reference for designing the full UI surface, identifying shared components, describing user experience flows, and avoiding redundancy.

### What Changed in v2

v2 incorporates two rounds of architectural review. Key changes:

- **Every surface is priority-tagged** — P0 (launch), P1 (fast-follow, within 4 weeks post-launch), P2 (later). Launch scope is reduced from 100 to ~55 surfaces (~28 pages + ~27 modals).
- **Missing critical flows added** — post-approval onboarding, revision workflow, member-side dispute evidence submission, provider onboarding nudge, and "orders at risk" admin widget.
- **Structural fixes applied** — messaging model (one conversation per user pair), wallet language ("In Active Orders" not "Locked in Escrow"), discover page liquidity signal ("Recently Completed"), search ranking specification, and reputation transparency metrics.
- **Error and degraded states** are called out per screen where network-dependent interactions occur.
- **Admin scope is right-sized** — only 6 admin pages are P0; the rest are P1/P2.

### Priority Definitions

| Priority | Meaning | Scope |
|---|---|---|
| **P0** | Required for soft launch. Without it, the core transaction loop (discover → hire → pay → deliver → approve → rate) cannot complete, or admin cannot operate the platform at minimum viability. | ~28 pages, ~27 modals |
| **P1** | Fast-follow. Adds significant value within the first 4 weeks post-launch. Addresses known friction or enables secondary workflows. | ~10 pages, ~14 modals |
| **P2** | Later. Validated by observed user behaviour or operational need post-launch. | ~9 pages, ~12 modals |

---

## Navigation Architecture

### Member Client (Web PWA)

Five primary destinations. Discovery is the default landing page.

| Tab/Nav Item | Route | Purpose | Priority |
|---|---|---|---|
| **Discover** (default) | `/discover` | Search and browse listings and providers | P0 |
| **Orders** | `/orders` | Active and past orders (client + provider) | P0 |
| **Messages** | `/messages` | 1:1 conversations | P0 |
| **Feed** | `/feed` | Work-related content feed | P1 |
| **Profile** | `/profile` | Own profile, portfolio, settings | P0 |

Persistent **notification bell** in the header with unread count badge.

### Admin Dashboard

| Nav Item | Route | Priority |
|---|---|---|
| **Dashboard** | `/admin` | P0 |
| **Members** | `/admin/members` | P0 |
| **Orders** | `/admin/orders` | P0 |
| **Disputes** | `/admin/disputes` | P0 |
| **Finance** | `/admin/finance` | P0 |
| **Moderation** | `/admin/moderation` | P1 |
| **Settings** | `/admin/settings` | P0 |
| **Audit Log** | `/admin/audit` | P2 |

---

## Module 1: Auth (Registration, Login, Identity)

### Pages / Screens

#### 1.1 Landing / Marketing Page — P0
- **Route:** `/` (unauthenticated)
- **Content:** Value proposition, how it works, "Have an invite code?" CTA, social proof from VVS Lagos community
- **Error States:** N/A (static page)

#### 1.2 Registration Page — P0
- **Route:** `/register` or `/join?code={inviteCode}`
- **Steps:**
  1. **Enter Invite Code** — single input, validation on submit. Pre-filled and skipped if arrived via invite link
  2. **Create Account** — email/phone + password, or social login (Google/Apple). Displays "Invited by [Name]"
  3. **Pending Approval** — confirmation screen: "You'll be notified when your account is approved"
- **Error States:** Invalid/exhausted invite code → AUTH-M04. Social login failure → inline error with retry. Network failure on submit → retry prompt with entered data preserved
- **Key UX:** Social login should be prominent — reduces friction on mobile with poor keyboards

#### 1.3 Login Page — P0
- **Route:** `/login`
- **Content:** Email/phone + password, social login options, "Forgot password?"
- **Error States:** Wrong credentials → inline error (generic "Invalid email or password" — no enumeration). Rate-limited after 5 attempts → cooldown message. Network failure → retry prompt
- **Key UX:** Remember last login method and surface it first on return

#### 1.4 Forgot Password Page — P0
- **Route:** `/forgot-password`
- **Content:** Email/phone input → sends reset link/code
- **Error States:** Unrecognised email → same success message as recognised (prevents enumeration)

#### 1.5 Reset Password Page — P0
- **Route:** `/reset-password?token={token}`
- **Content:** New password + confirmation
- **Error States:** Expired/invalid token → "This link has expired. Request a new one."

#### 1.6 Post-Approval Onboarding Flow — P0 (NEW)
- **Route:** `/welcome` (shown once after first login post-approval)
- **Content:** Guided first-run experience. 3–4 steps:
  1. **Welcome** — "You're in! [Referrer Name] vouched for you." Brief explanation of the platform
  2. **Complete Your Profile** — inline form: bio, profession, primary category, skills. Profile photo upload. Skippable but strongly encouraged
  3. **What brings you here?** — "I'm looking to hire talent" / "I want to offer services" / "Both". Routes the final step:
     - If hiring: "Browse services" CTA → Discover page
     - If offering: "Get verified to list services" CTA → Verification page, with a note: "While you wait, explore what others are offering"
     - If both: Both CTAs
  4. **Done** — redirect to Discover
- **Error States:** Photo upload failure → skip with option to add later. Network failure → retry with data preserved
- **Key UX:** This is the critical conversion moment. A member who completes their profile and understands next steps is 3–5× more likely to transact than one who lands on a blank profile page. Keep it fast — under 2 minutes

#### 1.7 Identity Verification Page — P0
- **Route:** `/verify-identity`
- **Steps:**
  1. **Instructions** — what's needed, why, and that provisional verification exists
  2. **Document Upload** — ID type selector (NIN, driver's licence, passport, voter's card), front image upload, optional back
  3. **Processing** — status indicator during third-party check
  4. **Result** — success (Verified badge) or failure (retry guidance + admin review option)
- **Error States:** Upload failure → retry with progress preservation. KYC provider timeout (common in Nigeria) → "Verification is taking longer than usual. We'll notify you when it's complete. You can continue browsing." NIN/BVN mismatch → specific retry guidance ("Check that your name matches exactly as it appears on your NIN slip")
- **Key UX:** The failure path must feel supportive. Nigerian KYC infrastructure is unreliable — design for it, don't apologise for it

#### 1.8 Invite Management Page — P1
- **Route:** `/invites`
- **Content:** Available invite codes/links, generate new ones (up to tier limit), referral chain status
- **Key Elements:** Code list with copy/share buttons, referral tree showing invitee status (pending, approved, verified, pro)
- **Error States:** Invite generation at limit → "You've used all X invites for your tier. Reach Pro for more."

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **AUTH-M01** | P1 | "Generate Invite" on Invite page | Confirmation: "Generate a new invite code? You have X remaining." Generate / Cancel |
| **AUTH-M02** | P1 | "Share Invite" on an invite code | Share sheet: Copy link, WhatsApp, Twitter/X, Email. Pre-filled message |
| **AUTH-M03** | P0 | Login with unverified email | "Please verify your email. We sent a code to [email]. [Resend]" |
| **AUTH-M04** | P0 | Invalid/exhausted invite code during registration | "This invite code is no longer valid. Ask the person who shared it to generate a new one." |
| **AUTH-M05** | P0 | Provisional verification 14-day expiry warning | Banner/dialog: "Your provisional verification expires in X days. Complete full verification to keep your listings active." CTA → Verification page |

---

## Module 2: Members (Profiles & Portfolios)

### Pages / Screens

#### 2.1 Own Profile Page — P0
- **Route:** `/profile`
- **Content:** Member's own profile — editable. Bio, profession, category, skills, availability status, tier badge, reputation score (or "New member" if < 3 reviews), completed transaction count, "Referred by [Name]"
- **Key Elements:**
  - Availability toggle (available / busy / not taking work) — extremely prominent
  - Portfolio gallery (images + descriptions at launch — no collaborator tagging)
  - Reputation metrics: rating, transaction count. **Post-launch (P1):** response time, completion rate
  - Tier progress indicator: "2 more transactions and 4.2+ rating to reach Pro" (when applicable)
  - "Referred by [Name]" near the top
  - Reviews section (after 3+ completed transactions)
- **Error States:** Profile save failure → inline retry, data preserved

#### 2.2 Edit Profile Page/Mode — P0
- **Route:** `/profile/edit` or inline edit
- **Content:** Form: bio, profession, primary category (dropdown from taxonomy), skills (tag input), location, profile photo
- **Error States:** Photo upload failure on slow connection → retry with progress indicator

#### 2.3 Public Profile Page (Other Member) — P0
- **Route:** `/members/{username}`
- **Content:** Read-only view. Same layout minus edit controls. "Contact" and "Hire" CTAs
- **Key Elements:** Portfolio gallery, reviews, referral context, reputation metrics, active listings preview
- **Error States:** Member not found → 404 with "Browse other providers" CTA
- **Key UX:** If viewer is Free-tier, "Contact" is context-gated — must have viewed a listing or have existing order. If gated, show soft explanation with path to upgrade

#### 2.4 Portfolio Item Detail Page — P2
- **Route:** `/members/{id}/portfolio/{itemId}`
- **Content:** Full-size media, title, description, tags
- **Rationale for P2:** At launch, portfolio items are viewable in the gallery on the profile page. Full detail page with collaborator tags and case studies adds complexity without driving transactions

#### 2.5 Case Study Detail Page — P2
- **Route:** `/members/{id}/case-studies/{caseStudyId}`
- **Content:** Structured: challenge → approach → outcome → metrics
- **Rationale for P2:** Case studies are valuable but not required for the first transaction loop

#### 2.6 Provider Setup Checklist Page — P0 (NEW)
- **Route:** `/provider-setup` (or a persistent card on the profile page)
- **Content:** Guided checklist for members who indicated they want to offer services
- **Checklist Items:**
  - ☐ Complete your profile (bio, profession, photo)
  - ☐ Verify your identity (or get provisional verification)
  - ☐ Create your first service listing
  - ☐ Set your availability to "Available"
- **Key UX:** This is the provider activation funnel. Each unchecked item links directly to the relevant action. The checklist persists until all items are complete, then converts to a "You're live!" confirmation. Show it as a banner or card on the profile page, not as a separate destination that members need to discover

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **MEM-M01** | P0 | "Add Portfolio Item" | Modal: title, description, upload media (drag-and-drop, multi-file), tags. Upload progress indicator. Error state: upload failure → retry per file |
| **MEM-M02** | P1 | "Edit Portfolio Item" | Same as MEM-M01, pre-populated. Replace/remove media |
| **MEM-M03** | P1 | "Delete Portfolio Item" | Confirmation: "Delete this portfolio item? This cannot be undone." |
| **MEM-M04** | P2 | "Create Case Study" | Structured form: challenge, approach, outcome, metrics. Rich text. Link portfolio items |
| **MEM-M05** | P2 | "Tag Collaborator" | Search members, send confirmation request |
| **MEM-M06** | P2 | Collaborator tag confirmation (received) | "[Name] tagged you as a collaborator. Approve / Decline?" |
| **MEM-M07** | P0 | "Change Availability" | Bottom sheet (mobile) / dropdown (desktop): Available / Busy / Not Taking Work |

---

## Module 3: Marketplace (Listings, Discovery, Orders)

### Pages / Screens

#### 3.1 Discover Page (Default Landing) — P0
- **Route:** `/discover`
- **Content:** Primary interface — search and browse
- **Key Elements:**
  - Search bar (full-text across listings and members)
  - Category filter chips (Design, Photography/Videography, etc.)
  - Filter panel: price range, minimum reputation, availability
  - Sort: relevance (default), rating, price low→high, price high→low, newest
  - Listing cards: title, provider name + avatar, price (from ₦X), rating, transaction count, response time badge
  - Toggle: "Services" (default) / "People" (member search)
  - **"Recently Completed" section** (NEW) — carousel/row at the top showing recently completed projects (pulled from completed orders where the provider opted to showcase). Shows: project title, provider name, category, completion date. This is the liquidity signal for early marketplace — proves real work is happening
- **Search Ranking Specification** (NEW):
  1. **Text relevance** — match against title, description, category, skills (PostgreSQL ts_rank)
  2. **Availability** — available providers ranked above busy/unavailable
  3. **Reputation score** — higher scores rank higher (log-scaled to avoid cliff effects)
  4. **Response time** — faster average response ranks higher (measured from first message after enquiry)
  5. **Recent transaction activity** — providers with a completed transaction in the last 30 days get a boost
  6. **Tier** — Pro > Verified > Free (tie-breaker, not primary signal)
  7. **Seed category boost** — Design and Photography/Videography get a temporary ranking boost during launch period (configurable, removable via admin settings)
- **Empty State:** "No services found for [query]. Know someone who offers this? Invite them." + CTA to browse other categories
- **Error States:** Search timeout → "Search is taking longer than usual. Try again." + cached/stale results if available. Network offline → show cached listings from last session if PWA service worker has them

#### 3.2 Listing Detail Page — P0
- **Route:** `/listings/{listingId}`
- **Content:** Full listing with provider info, pricing tiers, deliverables, reviews
- **Key Elements:**
  - Provider card: avatar, name, tier badge, reputation score, transaction count, response time, "Referred by [Name]"
  - Pricing tier selector (Basic / Standard / Premium) — each showing price, deliverables, timeline. Comparison must be crystal clear
  - "Order This Service" CTA (sticky on mobile scroll)
  - "Contact Provider" secondary CTA
  - Description (rich text)
  - Portfolio samples from provider
  - Reviews (rating + written review + reviewer name)
- **Error States:** Listing not found → 404 with "Browse similar services" CTA. Provider became unverified since listing was cached → "This listing is currently unavailable"

#### 3.3 Create/Edit Listing Page — P0
- **Route:** `/listings/new` or `/listings/{listingId}/edit`
- **Sections:**
  1. **Basics** — title, category, description
  2. **Pricing** — model (fixed/hourly/project), up to 3 tiers each with: name, price, deliverables, timeline
  3. **Portfolio Samples** — link existing items or upload new
  4. **Preview** — see listing as client would
- **Gate:** Verified+ tier required. If not verified → prompt to verify with direct link
- **Error States:** Save failure → retry with data preserved. Category taxonomy load failure → retry or fallback to free-text input

#### 3.4 My Listings Page — P0
- **Route:** `/listings/mine`
- **Content:** Provider's own listings with status (active, paused, draft), quick stats (views, orders, rating)
- **Quick Actions:** edit, pause/unpause, delete
- **Error States:** Load failure → retry. Empty state: "You haven't created any listings yet. Create your first." (links to 3.3)

#### 3.5 Order Detail Page — P0
- **Route:** `/orders/{orderId}`
- **Content:** Full order lifecycle view. Renders differently based on whether the member is the client or provider on this order
- **Shared Elements (both roles):**
  - Status timeline: draft → accepted → funded → in_progress → delivered → completed → rated
  - Listing summary: what was ordered, pricing tier, agreed deliverables
  - Counterparty info card
  - Contextual message thread for this order
  - Full audit trail of state transitions with timestamps
- **Client-Specific Elements:**
  - Payment status: pending / funded (₦X in active order)
  - Deliverables section: files from provider, version history
  - **Actions by state:**
    - `draft`: "Waiting for provider to accept" / Cancel
    - `accepted`: "Pay Now" (Paystack) or "Pay from Wallet (Balance: ₦X)"
    - `funded` / `in_progress`: status indicator
    - `delivered`: review deliverables → "Approve & Release Payment" / "Request Revision" / "Raise Dispute"
    - `completed`: "Rate this experience"
    - `disputed`: dispute status, evidence submission
- **Provider-Specific Elements:**
  - Fee breakdown: order amount, platform fee (7.5%), net payout — visible from order creation
  - **Actions by state:**
    - `draft`: "Accept Order" (with fee breakdown confirmation) / "Decline" (with optional reason)
    - `accepted`: waiting for client payment
    - `funded`: "Start Working"
    - `in_progress`: "Submit Deliverables"
    - `delivered`: waiting for client approval. Shows revision requests if any
    - `completed`: "Rate this client"
    - `disputed`: dispute status, evidence submission
- **Error States:** Paystack payment failure → FIN-M05 dialog. File upload failure during deliverable submission → retry per file. WebSocket disconnect for real-time updates → fallback to polling with "Connection lost. Refreshing..." banner. Order not found → 404

#### 3.6 Revision Request Flow — P0 (NEW)
- **Trigger:** Client clicks "Request Revision" on delivered order
- **Content:** Modal (MKT-M13) where client specifies what needs to change. Once submitted:
  - Order moves back to `in_progress`
  - Provider sees revision request with client's notes on their order detail page
  - Revision count is tracked and displayed (visible to both parties)
  - No limit on revisions at launch — but admin can see revision count for dispute context
- **Key UX:** Revisions are the pressure valve that prevents disputes. Making them easy and structured (specific notes, not just "this isn't right") reduces friction for both parties

#### 3.7 Member-Side Dispute Evidence Submission — P0 (NEW)
- **Trigger:** Either party clicks "Submit Evidence" on a disputed order
- **Content:** Evidence submission panel within the order detail page (not a separate page). Shows:
  - What evidence has already been submitted (by both parties — transparency)
  - Upload area: file attachments (screenshots, emails, contracts)
  - Platform-pulled evidence: message history and deliverable version history are auto-attached (no manual work needed)
  - Text description of the member's position
  - 72-hour deadline indicator: "Evidence must be submitted within 72 hours of the dispute being filed"
- **Error States:** Upload failure → retry. Deadline passed → "The evidence window has closed. The admin will review based on submitted materials."

#### 3.8 Orders List Page — P0
- **Route:** `/orders`
- **Tabs:** "As Client" / "As Provider"
- **Filters:** status (active, completed, disputed, cancelled), date range
- **Key Elements:** Order cards: listing title, counterparty, status badge, amount, last activity. **"Requires Action" indicator** on orders needing input (accept, pay, approve, submit, rate, submit evidence)
- **Empty State:** "No orders yet. Browse services to get started." (client tab) / "No orders yet. Make sure your listings are active and you're set to Available." (provider tab)
- **Error States:** Load failure → retry

#### 3.9 Place Order Flow — P0
- **Route:** Modal flow from listing detail (not a separate page)
- **Steps:**
  1. Confirm selected pricing tier, deliverables, price. Editable notes/requirements field
  2. Submit → order enters `draft`
- **Key UX:** Client does NOT pay here. Provider accepts first. Make this unambiguous: "The provider will review your request. You'll only pay after they accept."

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **MKT-M01** | P0 | "Order This Service" | Tier confirmation, deliverables, price, notes field. "Submit Order" / Cancel |
| **MKT-M02** | P0 | Provider "Accept Order" | Order summary, fee breakdown (gross → 7.5% fee → net). "By accepting, you commit to delivering by [date]." Accept / Decline |
| **MKT-M03** | P0 | Provider "Decline Order" | Optional reason dropdown (too busy, out of scope, pricing mismatch, other) + message. Decline / Cancel |
| **MKT-M04** | P0 | Client "Pay Now" | Payment method: "Pay with Card/Bank" (Paystack) or "Pay from Wallet (Balance: ₦X)". Error state: insufficient wallet balance → "Top up your wallet or pay with card." Confirm / Cancel |
| **MKT-M05** | P0 | Client "Approve & Release Payment" | Confirmation: "Approving releases ₦X to the provider. This cannot be undone. Are the deliverables as agreed?" Approve / Cancel. This must feel weighty — it moves money |
| **MKT-M06** | P0 | Client "Raise Dispute" | Category (deliverables not as described, non-delivery, scope disagreement, quality issue, other), description, file attachments. Submit / Cancel |
| **MKT-M07** | P0 | Provider "Submit Deliverables" | File upload (drag-and-drop, multi-file), notes per file, version label. Upload progress per file. Error state: upload failure → retry per file. Submit / Cancel |
| **MKT-M08** | P0 | "Rate" (post-completion, both parties) | 1–5 star selector, optional written review. Submit / Skip (reminder in 7 days if skipped) |
| **MKT-M09** | P0 | Client "Cancel Order" (before in_progress) | "Cancel this order? Your funds (₦X) will be refunded to your wallet." Confirm / Keep Order |
| **MKT-M10** | P0 | 14-day provider inactivity → client offered cancel | "The provider hasn't responded in 14 days. Cancel for a full refund or keep waiting." Cancel & Refund / Keep Waiting |
| **MKT-M11** | P1 | "Pause/Unpause Listing" | Toggle confirmation. "Pause this listing? It won't appear in search." Pause / Cancel |
| **MKT-M12** | P1 | "Delete Listing" | "Delete this listing permanently? Active orders are not affected." Delete / Cancel |
| **MKT-M13** | P0 | Client "Request Revision" (NEW) | Revision request form: "What needs to change?" (structured text area — encourage specifics). Optional: reference specific deliverable files. Revision count displayed: "This will be revision #X." Submit / Cancel |

---

## Module 4: Finance (Wallet, Escrow, Payments)

### Pages / Screens

#### 4.1 Wallet Page — P0
- **Route:** `/wallet`
- **Key Elements:**
  - Balance display: **Available Balance** (₦X), **In Active Orders** (₦X) — NOT "Locked in Escrow" (user-friendly language)
  - Quick actions: "Add Funds" / "Withdraw"
  - Transaction history: chronological list — date, description, amount (+/-), running balance, reference. Each entry links to associated order where relevant
  - Filters: type (all, funded, earned, withdrawn, orders), date range
- **Error States:** Balance load failure → "Unable to load your balance. Pull to refresh." Transaction history load failure → partial page with retry
- **Key UX:** "Available" vs "In Active Orders" must be immediately clear. Tooltip or help icon: "In Active Orders = money held safely until work is approved"

#### 4.2 Add Funds Flow — P0
- **Route:** Modal from wallet page
- **Steps:** Enter amount → Paystack checkout (card, bank transfer, USSD) → confirmation
- **Error States:** Paystack timeout → "Payment is being processed. We'll update your balance shortly." Paystack failure → retry or different method. Network loss mid-checkout → "Payment may still be processing. Check your balance in a few minutes."
- **Key UX:** Optional flow — clients can pay directly to escrow. Position as convenience for repeat users

#### 4.3 Withdraw Flow — P0
- **Route:** Modal from wallet page
- **Steps:** Enter amount → select/add bank account → confirm (with any fees shown) → processing status
- **Error States:** Withdrawal initiation failure → retry. Bank account verification failure (Paystack name check) → "Account name doesn't match. Please check details." Processing failure → notification + admin flag
- **Key UX:** Show estimated arrival: "Transfers typically arrive within 24 hours." Status updates via notification when completed

#### 4.4 Transaction Detail Page — P2
- **Route:** `/wallet/transactions/{transactionId}`
- **Content:** Full ledger detail for a single transaction
- **Rationale for P2:** Transaction list on wallet page provides enough detail for most users. Full detail is an audit/dispute tool

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **FIN-M01** | P0 | "Add Funds" | Amount input, proceeds to Paystack. Confirm / Cancel |
| **FIN-M02** | P0 | "Withdraw" | Amount input, bank account selector (or "Add Bank Account"), fee display. Withdraw / Cancel |
| **FIN-M03** | P0 | "Add Bank Account" | Bank name dropdown, account number, auto-verified account name. Save / Cancel. Error state: verification failure → "Check details and try again" |
| **FIN-M04** | P0 | Paystack success callback | "₦X has been added to your wallet." Done |
| **FIN-M05** | P0 | Paystack failure callback | "Payment failed. [Reason]. Try again or use a different method." Retry / Cancel |
| **FIN-M06** | P1 | Withdrawal completed notification | In-app: "Your withdrawal of ₦X to [Bank] ****1234 has been completed." |

---

## Module 5: Social (Feed & Messaging)

### Messaging — P0

Messaging is P0. Feed is P1. They're in the same module architecturally but have different launch priorities.

#### 5.1 Messages Inbox Page — P0
- **Route:** `/messages`
- **Content:** List of 1:1 conversations
- **Architecture (REVISED):** One conversation per user pair. All messages between two members live in a single thread, regardless of how many orders they have. Orders are referenced within messages via inline order cards/links — not separate conversations
- **Key Elements:** Conversation list: counterparty name + avatar, last message preview, timestamp, unread indicator. Search conversations
- **Error States:** Load failure → retry. Empty state: "No conversations yet. Start one by contacting a provider from their listing."

#### 5.2 Conversation Detail Page — P0
- **Route:** `/messages/{conversationId}`
- **Content:** Real-time 1:1 thread
- **Key Elements:**
  - Message bubbles with timestamps and read receipts
  - File attachment support with upload progress
  - Text input + send button
  - Header: counterparty name, avatar, link to profile
  - **Order context cards** (NEW): when an order exists between these two members, a compact card appears at the top (or is pinnable) showing: order status, listing title, amount. Tappable → navigates to order detail. Multiple order cards if multiple orders exist
- **Error States:** WebSocket disconnect → banner: "Reconnecting..." + automatic fallback to polling every 5 seconds. Messages queued locally and sent on reconnection. File upload failure → retry per file with progress indicator. Send failure → message shows "Failed to send. Tap to retry." with red indicator
- **Key UX:** Must feel instant. Queued messages on poor connection should be clearly marked as "sending..." not silently lost

### Feed — P1

#### 5.3 Feed Page — P1
- **Route:** `/feed`
- **Content:** Curated feed of work-related posts
- **Launch Post Types (P1):** Two types only (reduced from five):
  1. **Completed Project** — showcase finished work with media
  2. **Service Announcement** — new listing, availability update, or service offering
- **Deferred Post Types (P2):** Case study, work-in-progress, collaborator call
- **Key Elements:** Post cards (author info, post type label, content, likes/comments), "Create Post" FAB
- **Rationale for reduction:** Five post types require five creation form variants, five sets of content policy rules, and five ranking signal interpretations. Two types cover the core feed value (social proof of work + commercial signal) without the complexity
- **Error States:** Feed load failure → retry. Post creation failure → retry with content preserved

#### 5.4 Post Detail Page — P1
- **Route:** `/feed/{postId}`
- **Content:** Full post + comments thread, engagement actions

#### 5.5 Create Post Flow — P1
- **Route:** Modal from feed page
- **Content:** Post type selector (Completed Project / Service Announcement), text content, media upload, optional link to listing
- **Key UX:** Post type is mandatory — enforces "work content only" at creation step

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **SOC-M01** | P1 | "Create Post" FAB | Post creation form. Type selector + content + media |
| **SOC-M02** | P1 | "Delete Post" | "Delete this post? Cannot be undone." |
| **SOC-M03** | P0 | "Report" on post/profile/message | Report form: category (spam, inappropriate, fraud, harassment), description. Submit / Cancel |
| **SOC-M04** | P0 | "Block Member" | "Block [Name]? They can't message you." Block / Cancel |
| **SOC-M05** | P0 | Message rate-limit hit (Free tier) | "You've reached your daily limit (20 messages). Upgrade to Verified for more." |
| **SOC-M06** | P0 | Context-gated message attempt (Free tier) | "To message this member, first view their listing." View Listings / OK |
| **SOC-M07** | P0 | File attachment in message | File picker + upload progress. Error: upload failure → retry per file |

---

## Module 6: Platform (Notifications & Settings)

### Pages / Screens

#### 6.1 Notifications Page — P0
- **Route:** `/notifications`
- **Content:** All in-app notifications, chronological. Grouped: today / this week / earlier
- **Key Elements:** Notification cards (icon, title, description, timestamp, read/unread), mark all as read. Each links to relevant page
- **Error States:** Load failure → retry

#### 6.2 Notification Preferences Page — P1
- **Route:** `/settings/notifications`
- **Content:** Per-notification-type channel toggles (push, email, SMS, in-app)
- **Key UX:** Sensible defaults — all financial on all channels, social on push + in-app only. Defaults active from registration; this page lets members opt down

#### 6.3 Account Settings Page — P0
- **Route:** `/settings`
- **Sections:**
  - Account security (change password, manage sessions)
  - Payment methods (saved cards, bank accounts)
  - Identity verification status + link
  - Tier status with progress indicator
  - Notification preferences (link to 6.2)
  - Privacy (data export request, account deletion)
- **Error States:** Settings load failure → retry. Password change failure → inline error

#### 6.4 Tier Progress Display — P0 (NEW, embedded component)
- **Location:** Account Settings page + Profile page (as a card/banner)
- **Content:** Current tier badge. For non-Pro members: progress bar or checklist showing requirements for next tier. Example: "Pro requires: 5+ completed transactions (you have 3) and 4.2+ rating (yours is 4.4) ✓"
- **Key UX:** This is a retention tool. Members who can see they're close to Pro are motivated to complete more transactions

### Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **PLT-M01** | P0 | Notification bell icon | Dropdown panel: recent 5–10 notifications, "View All" link. Mark individual as read |
| **PLT-M02** | P0 | "Change Password" | Current password, new password, confirm. Save / Cancel |
| **PLT-M03** | P1 | "Manage Sessions" | Active sessions list (device, browser, last active). "Revoke" per session |
| **PLT-M04** | P2 | "Delete Account" | Multi-step: warning about wallet balance forfeiture, type DELETE to confirm |
| **PLT-M05** | P2 | "Request Data Export" | "We'll prepare your data and email within 48 hours." Request / Cancel |
| **PLT-M06** | P0 | Tier upgrade triggered | Celebratory: "You've reached Pro! Unlimited messaging, priority ranking, 10 invite codes." |

---

## Module 7: Admin Dashboard

### Pages / Screens

#### 7.1 Admin Dashboard Home — P0
- **Route:** `/admin`
- **Content:** Operational overview — "what needs my attention?"
- **Key Elements:**
  - GMV (total + simple trend)
  - Transaction volume + average order value
  - Member count (total, new this period)
  - Active listings by category
  - Dispute rate
  - **Action items section** (prominent):
    - Pending member approvals (count + link)
    - Open disputes (count + link, with SLA indicator)
    - **Orders at risk** (NEW): orders with no provider response >48h, and orders approaching 14-day inactivity threshold. Count + link to filtered admin orders view
    - Flagged moderation reports (count + link, P1)
- **Error States:** Analytics load failure → show available metrics, "Some data is temporarily unavailable"

#### 7.2 Members Management Page — P0
- **Route:** `/admin/members`
- **Content:** Searchable, filterable member table
- **Columns:** name, email, tier, verification status, registration date, referrer, transactions, reputation, status
- **Filters:** tier, verification, status, date range
- **Actions:** Click row → member detail. Inline quick actions: approve, suspend
- **Empty/Error States:** No results → "No members match these filters." Load failure → retry

#### 7.3 Member Detail Page (Admin) — P0
- **Route:** `/admin/members/{memberId}`
- **Content:** Complete admin view of a member
- **Sections:**
  - Profile info (admin-editable)
  - Tier: current, override controls, grant/revoke badges
  - Verification: status, documents (viewable), grant provisional, approve/reject
  - Referral tree: who they invited, invitee status, accountability metrics
  - Orders summary: as client and provider (links to admin order view)
  - Wallet: balance overview (read-only)
  - Moderation history
- **Admin Actions:** Warn, suspend (with duration), ban, adjust tier, grant provisional verification

#### 7.4 Pending Approvals Page — P0
- **Route:** `/admin/members/approvals`
- **Content:** New registration approval queue
- **Key Elements:** Applicant cards: name, email, invite code, referrer name + referrer tier/reputation, registration date. Actions: Approve (with optional provisional verification) / Reject (with reason). Bulk approve
- **Key UX:** Referrer context is critical for the decision

#### 7.5 Orders Overview Page (Admin) — P0
- **Route:** `/admin/orders`
- **Content:** All platform orders
- **Columns:** order ID, client, provider, listing, amount, status, created, last activity
- **Filters:** status, date range, amount, flagged (inactivity, disputed)
- **NEW — "At Risk" filter/tab:** Pre-filtered view showing orders with provider inactivity >48h. This is the early-warning system that prevents disputes

#### 7.6 Dispute Resolution Page — P0
- **Route:** `/admin/disputes`
- **Content:** Prioritised dispute queue
- **Key Elements:** Dispute cards: order summary, filing party, category, date, SLA timer (48h first response, 7 business day target). Status: new → acknowledged → evidence collection → under review → resolved → appealed

#### 7.7 Dispute Detail Page (Admin) — P0
- **Route:** `/admin/disputes/{disputeId}`
- **Content:** Everything needed to decide, on one page
- **Sections:**
  - Order context: listing, deliverables, tier, timeline
  - Payment: escrow amount, funding date
  - Dispute: category, description, filing party
  - Evidence (both parties): files, screenshots, platform-pulled message history, deliverable files + version history. All inline — no extra clicks
  - **Resolution panel:** three outcomes (full release / full refund / partial split with percentage input), written explanation field
  - Appeal status: if appealed, shows reason, assigns to different admin
  - Revision history: how many revisions were requested before the dispute, and what was requested (context for evaluating reasonableness)
  - Full audit trail

#### 7.8 Finance Overview Page (Admin) — P0
- **Route:** `/admin/finance`
- **Content:** Platform financial health
- **Key Elements:** Platform fee revenue collected, GMV summary, active escrow total, failed/stuck transactions, reconciliation status (last run, drift alerts)
- **Key UX:** Simple and operational. Not a BI dashboard — just "is the money flowing correctly?"

#### 7.9 Platform Settings Page — P0
- **Route:** `/admin/settings`
- **Sections:**
  - Fee: platform fee % (default 7.5%), minimum fee (₦500)
  - Tiers: invite limits per tier, Pro thresholds (transaction count, min reputation)
  - Verification: provisional duration (90 days)
  - Feature flags: enable/disable feed, specific post types
  - Search: seed category boost toggle
- **Key UX:** Changes logged in audit trail

#### 7.10 Moderation Queue Page — P1
- **Route:** `/admin/moderation`
- **Content:** Reports from members
- **Key Elements:** Report cards: reported content/member, reporter, category, date, priority. Click → report detail with context and action panel (warn, remove, suspend, ban)
- **Rationale for P1:** At launch scale, disputes (P0) are higher priority than content moderation. Content reports can be handled via a simpler "flagged items" view within member detail until this is built

#### 7.11 Audit Log Page — P2
- **Route:** `/admin/audit`
- **Content:** Immutable log of all admin actions
- **Rationale for P2:** Admin actions are logged from day one (backend), but a dedicated UI for browsing them is not launch-critical. Admins can query by correlation ID in the database during launch phase

#### 7.12 Dead-Letter Queue Page — P2
- **Route:** `/admin/dead-letters`
- **Content:** Failed events past retry limit
- **Rationale for P2:** Dead-letter events are visible as an alert count on the dashboard (P0). A dedicated management UI is an engineering operational tool, not launch-critical

#### 7.13 Bulk Operations Page — P2
- **Route:** `/admin/bulk-ops`
- **Content:** Mass invite distribution, mass badge assignment, mass notification
- **Rationale for P2:** Launch community is 200–500 members. Bulk ops are manual/scripted at that scale

### Admin Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **ADM-M01** | P0 | "Approve Member" | Confirmation with details. Option to grant provisional verification. Approve / Cancel |
| **ADM-M02** | P0 | "Reject Member" | Reason (dropdown + free text). Reject / Cancel |
| **ADM-M03** | P0 | "Suspend Member" | Duration (7/30/90 days/custom), reason. Active orders flagged. Suspend / Cancel |
| **ADM-M04** | P0 | "Ban Member" | Reason, impact summary. Confirm Ban / Cancel |
| **ADM-M05** | P0 | "Resolve Dispute" | Outcome selector (release/refund/split), percentages for split, written explanation. Resolve / Cancel |
| **ADM-M06** | P0 | "Override Tier" | Tier selector, reason. Save / Cancel |
| **ADM-M07** | P0 | "Grant Provisional Verification" | Confirmation with 90-day note. Grant / Cancel |
| **ADM-M08** | P0 | "Update Settings" | "This change takes effect immediately." Confirm / Cancel |
| **ADM-M09** | P2 | "Bulk Invite Distribution" | Count per member, member selection. Distribute / Cancel |
| **ADM-M10** | P2 | "Retry Dead Letter" | "Retry this event?" Retry / Cancel |

---

## Shared Components & Patterns

These components appear across modules. Design once, reuse everywhere.

| Component | Used In | States | Notes |
|---|---|---|---|
| **Member Card** | Discovery, search, orders, admin | Default, loading skeleton, error (avatar load fail → initials fallback) | Compact variant for search results vs expanded for admin dispute view |
| **Listing Card** | Discovery, feed, profile | Default, loading skeleton, unavailable (listing paused/removed) | Shows "from ₦X" pricing, not full tier breakdown |
| **Order Card** | Orders list, admin | Default, requires-action (orange indicator), loading | "Requires Action" variant is key — draws attention to orders needing input |
| **Status Timeline** | Order detail (both views), admin | Each step: completed / active / upcoming / error | Horizontal on desktop, vertical on mobile. Error state shows failed step in red |
| **Rating Display** | Profiles, listings, reviews | Score visible (≥3 reviews) / "New member" (< 3) / loading | Star display (read) + star selector (write) are separate sub-components |
| **Tier Badge** | Profiles, cards, listings, messages | Free (grey), Verified (blue ✓), Pro (gold ★) | Small (inline with name) and large (profile header) variants |
| **Availability Indicator** | Profile, member card, listings | Available (green), Busy (yellow), Not Taking Work (grey) | Dot + label. Label hidden in compact contexts |
| **Price Display** | Listings, orders, wallet | Formatted ₦ amount | Handles kobo precision (₦150,000 not ₦150,000.00 unless sub-naira amounts) |
| **Empty State** | All list/search views | Per-context message + CTA | Must never be a blank page. Always explains what's happening and what to do next |
| **Paystack Checkout** | Order funding, wallet funding | Loading, success (FIN-M04), failure (FIN-M05), timeout | Handles Paystack redirect flow and inline modal. Timeout state critical for Nigeria |
| **File Upload** | Portfolio, deliverables, disputes, messages | Idle, uploading (per-file progress), success, failure (per-file retry) | Drag-and-drop + file picker. Progressive upload on slow connections |
| **Search Bar** | Discovery, admin tables | Idle, focused, loading results, no results | Type-ahead only if latency is < 200ms; otherwise search on submit |
| **Filter Panel** | Discovery, orders, admin | Bottom sheet (mobile) / sidebar (desktop). Active filter count badge | Collapsible. "Clear all filters" action |
| **Notification Item** | Bell dropdown, notifications page | Unread (bold), read, loading | Tap navigates to source. Icon varies by notification type |
| **Confirmation Dialog** | All destructive/financial actions | Default. Danger-styled (red primary) for destructive. Money-styled (with amount) for financial | Title, description, primary action, cancel. Never auto-dismiss |
| **Toast/Snackbar** | Success/error feedback | Success (green), error (red), info (neutral) | Auto-dismiss after 4s except for errors. Action button optional ("Undo") |
| **Connection Status Banner** | All screens | Hidden (normal), visible (offline/reconnecting) | "You're offline. Some features may be unavailable." / "Reconnecting..." |
| **Order Context Card** | Conversation detail | Compact card: status badge, listing title, amount | Tappable → navigates to order detail. Multiple cards if multiple orders between users |

### Navigation Patterns

| Pattern | Context | Behaviour |
|---|---|---|
| **Bottom Tab Bar** | Mobile — all screens | 5 tabs: Discover, Orders, Messages, Feed (P1), Profile. Badges on Orders + Messages |
| **Top Header** | All screens | Logo (left), notification bell + badge (right), avatar/menu (right) |
| **Back Navigation** | Detail pages, sub-flows | Standard back arrow. Preserves scroll position and filter state on list pages |
| **Bottom Sheet** | Mobile — filters, quick actions, confirmations | Slides up, dimmable backdrop, swipe to dismiss. Used for all modals on mobile |
| **Side Panel** | Desktop — filters, settings sub-nav | Fixed sidebar on wide viewports |

---

## Screen Count Summary

| Module | P0 Pages | P1 Pages | P2 Pages | P0 Modals | P1 Modals | P2 Modals | Total |
|---|---|---|---|---|---|---|---|
| **Auth** | 7 | 1 | 0 | 3 | 2 | 0 | 13 |
| **Members** | 4 | 0 | 2 | 2 | 2 | 3 | 13 |
| **Marketplace** | 7 | 0 | 0 | 11 | 2 | 0 | 20 |
| **Finance** | 3 | 0 | 1 | 5 | 1 | 0 | 10 |
| **Social** | 2 | 3 | 0 | 5 | 2 | 0 | 12 |
| **Platform** | 2 | 1 | 0 | 3 | 1 | 2 | 9 |
| **Admin** | 9 | 1 | 3 | 8 | 0 | 2 | 23 |
| **Totals** | **34** | **6** | **6** | **37** | **10** | **7** | **100** |

**Launch scope (P0): 34 pages + 37 modals = 71 surfaces**
**Fast-follow (P1): +6 pages + 10 modals = +16 surfaces**
**Later (P2): +6 pages + 7 modals = +13 surfaces**

---

## Cross-Reference: Modal → Shared Component Dependencies

| Modal | Depends On |
|---|---|
| MKT-M01 (Order Service) | Price Display, Listing Card (compact) |
| MKT-M04 (Pay Now) | Paystack Checkout, Price Display |
| MKT-M05 (Approve Deliverables) | Confirmation Dialog (money variant), Price Display |
| MKT-M07 (Submit Deliverables) | File Upload |
| MKT-M08 (Rate) | Rating Display (write mode) |
| MKT-M13 (Request Revision) | File reference component (links to uploaded deliverables) |
| MKT-M06 (Raise Dispute) | File Upload |
| FIN-M01 (Add Funds) | Paystack Checkout, Price Display |
| FIN-M02 (Withdraw) | Price Display, Confirmation Dialog (money variant) |
| SOC-M07 (Message Attachment) | File Upload |
| MEM-M01 (Add Portfolio) | File Upload |
| All destructive actions | Confirmation Dialog (danger variant) |
| All financial actions | Confirmation Dialog (money variant), Price Display |

---

## Key UX Principles (Cross-Cutting)

1. **Discovery is home.** Logged-in landing = search/browse. Not feed, not dashboard, not welcome (except first-ever login → onboarding flow).

2. **Money states are unambiguous.** "In Active Orders" not "Locked in Escrow." Explicit amounts everywhere. Confirmation before any money moves. Status labels + colour, never colour alone.

3. **Mobile-first, low-bandwidth tolerant.** Every screen designed for mobile first. Progressive image loading. Core flows (browse, order, message) functional on 2G/3G. Desktop is an enhancement. Connection status banner when offline.

4. **Provider and client are one person.** Orders page has "As Client" / "As Provider" tabs. Wallet is shared. Profile is shared. No separate dashboards.

5. **Confirmation before money moves.** Fund escrow, approve deliverables (releases escrow), withdraw — all require explicit confirmation with clear description and amount.

6. **Empty states are invitations.** No blank pages. Always: what happened, what to do next, one clear CTA.

7. **Referral context is always visible.** "Referred by [Name]" on profiles and admin views. Trust graph is a core differentiator.

8. **Tier progression is a motivator.** Show progress toward next tier on profile and settings. Celebrate upgrades.

9. **Errors are expected, not exceptional.** Nigerian infrastructure means Paystack timeouts, KYC failures, and WebSocket drops are normal operating conditions. Every network-dependent interaction has an explicit degraded state. Never show a generic "Something went wrong" — always explain what happened and what to do.

10. **One conversation per relationship.** Two members share a single message thread regardless of how many orders they have. Order context is surfaced via inline cards within the conversation, not fragmented across separate threads.