# Module 2: Members (Profiles & Portfolios)

## Pages / Screens

### 2.1 Own Profile Page — P0
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

### 2.2 Edit Profile Page/Mode — P0
- **Route:** `/profile/edit` or inline edit
- **Content:** Form: bio, profession, primary category (dropdown from taxonomy), skills (tag input), location, profile photo
- **Error States:** Photo upload failure on slow connection → retry with progress indicator

### 2.3 Public Profile Page (Other Member) — P0
- **Route:** `/members/{username}`
- **Content:** Read-only view. Same layout minus edit controls. "Contact" and "Hire" CTAs
- **Key Elements:** Portfolio gallery, reviews, referral context, reputation metrics, active listings preview
- **Error States:** Member not found → 404 with "Browse other providers" CTA
- **Key UX:** If viewer is Free-tier, "Contact" is context-gated — must have viewed a listing or have existing order. If gated, show soft explanation with path to upgrade

### 2.4 Portfolio Item Detail Page — P2
- **Route:** `/members/{id}/portfolio/{itemId}`
- **Content:** Full-size media, title, description, tags
- **Rationale for P2:** At launch, portfolio items are viewable in the gallery on the profile page. Full detail page with collaborator tags and case studies adds complexity without driving transactions

### 2.5 Case Study Detail Page — P2
- **Route:** `/members/{id}/case-studies/{caseStudyId}`
- **Content:** Structured: challenge → approach → outcome → metrics
- **Rationale for P2:** Case studies are valuable but not required for the first transaction loop

### 2.6 Provider Setup Checklist Page — P0 (NEW)
- **Route:** `/provider-setup` (or a persistent card on the profile page)
- **Content:** Guided checklist for members who indicated they want to offer services
- **Checklist Items:**
  - ☐ Complete your profile (bio, profession, photo)
  - ☐ Verify your identity (or get provisional verification)
  - ☐ Create your first service listing
  - ☐ Set your availability to "Available"
- **Key UX:** This is the provider activation funnel. Each unchecked item links directly to the relevant action. The checklist persists until all items are complete, then converts to a "You're live!" confirmation. Show it as a banner or card on the profile page, not as a separate destination that members need to discover

## Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **MEM-M01** | P0 | "Add Portfolio Item" | Modal: title, description, upload media (drag-and-drop, multi-file), tags. Upload progress indicator. Error state: upload failure → retry per file |
| **MEM-M02** | P1 | "Edit Portfolio Item" | Same as MEM-M01, pre-populated. Replace/remove media |
| **MEM-M03** | P1 | "Delete Portfolio Item" | Confirmation: "Delete this portfolio item? This cannot be undone." |
| **MEM-M04** | P2 | "Create Case Study" | Structured form: challenge, approach, outcome, metrics. Rich text. Link portfolio items |
| **MEM-M05** | P2 | "Tag Collaborator" | Search members, send confirmation request |
| **MEM-M06** | P2 | Collaborator tag confirmation (received) | "[Name] tagged you as a collaborator. Approve / Decline?" |
| **MEM-M07** | P0 | "Change Availability" | Bottom sheet (mobile) / dropdown (desktop): Available / Busy / Not Taking Work |
