# Module 3: Marketplace (Listings, Discovery, Orders)

## Pages / Screens

### 3.1 Discover Page (Default Landing) — P0
- **Route:** `/discover`
- **Content:** Primary interface — search and browse
- **Key Elements:**
  - Search bar (full-text across listings and members)
  - Category filter chips (Design, Photography/Videography, etc.)
  - Filter panel: price range, minimum reputation, availability
  - Sort: relevance (default), rating, price low→high, price high→low, newest
  - Listing cards: title, provider name + avatar, price (from ₦X), rating, transaction count, response time badge
  - Toggle: "Services" (default) / "People" (member search)
  - **"Recently Completed" section** (NEW) — carousel/row at the top showing recently completed projects (pulled from completed orders where the provider opted to showcase). Shows: project title, provider name, category, completion date.
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

### 3.2 Listing Detail Page — P0
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

### 3.3 Create/Edit Listing Page — P0
- **Route:** `/listings/new` or `/listings/{listingId}/edit`
- **Sections:**
  1. **Basics** — title, category, description
  2. **Pricing** — model (fixed/hourly/project), up to 3 tiers each with: name, price, deliverables, timeline
  3. **Portfolio Samples** — link existing items or upload new
  4. **Preview** — see listing as client would
- **Gate:** Verified+ tier required. If not verified → prompt to verify with direct link
- **Error States:** Save failure → retry with data preserved. Category taxonomy load failure → retry or fallback to free-text input

### 3.4 My Listings Page — P0
- **Route:** `/listings/mine`
- **Content:** Provider's own listings with status (active, paused, draft), quick stats (views, orders, rating)
- **Quick Actions:** edit, pause/unpause, delete
- **Error States:** Load failure → retry. Empty state: "You haven't created any listings yet. Create your first." (links to 3.3)

### 3.5 Order Detail Page — P0
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

### 3.6 Revision Request Flow — P0 (NEW)
- **Trigger:** Client clicks "Request Revision" on delivered order
- **Content:** Modal (MKT-M13) where client specifies what needs to change. Once submitted:
  - Order moves back to `in_progress`
  - Provider sees revision request with client's notes on their order detail page
  - Revision count is tracked and displayed (visible to both parties)
  - No limit on revisions at launch — but admin can see revision count for dispute context
- **Key UX:** Revisions are the pressure valve that prevents disputes. Making them easy and structured (specific notes, not just "this isn't right") reduces friction for both parties

### 3.7 Member-Side Dispute Evidence Submission — P0 (NEW)
- **Trigger:** Either party clicks "Submit Evidence" on a disputed order
- **Content:** Evidence submission panel within the order detail page (not a separate page). Shows:
  - What evidence has already been submitted (by both parties — transparency)
  - Upload area: file attachments (screenshots, emails, contracts)
  - Platform-pulled evidence: message history and deliverable version history are auto-attached (no manual work needed)
  - Text description of the member's position
  - 72-hour deadline indicator: "Evidence must be submitted within 72 hours of the dispute being filed"
- **Error States:** Upload failure → retry. Deadline passed → "The evidence window has closed. The admin will review based on submitted materials."

### 3.8 Orders List Page — P0
- **Route:** `/orders`
- **Tabs:** "As Client" / "As Provider"
- **Filters:** status (active, completed, disputed, cancelled), date range
- **Key Elements:** Order cards: listing title, counterparty, status badge, amount, last activity. **"Requires Action" indicator** on orders needing input (accept, pay, approve, submit, rate, submit evidence)
- **Empty State:** "No orders yet. Browse services to get started." (client tab) / "No orders yet. Make sure your listings are active and you're set to Available." (provider tab)
- **Error States:** Load failure → retry

### 3.9 Place Order Flow — P0
- **Route:** Modal flow from listing detail (not a separate page)
- **Steps:**
  1. Confirm selected pricing tier, deliverables, price. Editable notes/requirements field
  2. Submit → order enters `draft`
- **Key UX:** Client does NOT pay here. Provider accepts first. Make this unambiguous: "The provider will review your request. You'll only pay after they accept."

## Modals & Dialogs

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
