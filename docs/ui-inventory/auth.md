# Module 1: Auth (Registration, Login, Identity)

## Pages / Screens

### 1.1 Landing / Marketing Page — P0
- **Route:** `/` (unauthenticated)
- **Content:** Value proposition, how it works, "Have an invite code?" CTA, social proof from VVS Lagos community
- **Error States:** N/A (static page)

### 1.2 Registration Page — P0
- **Route:** `/register` or `/join?code={inviteCode}`
- **Steps:**
  1. **Enter Invite Code** — single input, validation on submit. Pre-filled and skipped if arrived via invite link
  2. **Create Account** — email/phone + password, or social login (Google/Apple). Displays "Invited by [Name]"
  3. **Pending Approval** — confirmation screen: "You'll be notified when your account is approved"
- **Error States:** Invalid/exhausted invite code → AUTH-M04. Social login failure → inline error with retry. Network failure on submit → retry prompt with entered data preserved
- **Key UX:** Social login should be prominent — reduces friction on mobile with poor keyboards

### 1.3 Login Page — P0
- **Route:** `/login`
- **Content:** Email/phone + password, social login options, "Forgot password?"
- **Error States:** Wrong credentials → inline error (generic "Invalid email or password" — no enumeration). Rate-limited after 5 attempts → cooldown message. Network failure → retry prompt
- **Key UX:** Remember last login method and surface it first on return

### 1.4 Forgot Password Page — P0
- **Route:** `/forgot-password`
- **Content:** Email/phone input → sends reset link/code
- **Error States:** Unrecognised email → same success message as recognised (prevents enumeration)

### 1.5 Reset Password Page — P0
- **Route:** `/reset-password?token={token}`
- **Content:** New password + confirmation
- **Error States:** Expired/invalid token → "This link has expired. Request a new one."

### 1.6 Post-Approval Onboarding Flow — P0 (NEW)
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

### 1.7 Identity Verification Page — P0
- **Route:** `/verify-identity`
- **Steps:**
  1. **Instructions** — what's needed, why, and that provisional verification exists
  2. **Document Upload** — ID type selector (NIN, driver's licence, passport, voter's card), front image upload, optional back
  3. **Processing** — status indicator during third-party check
  4. **Result** — success (Verified badge) or failure (retry guidance + admin review option)
- **Error States:** Upload failure → retry with progress preservation. KYC provider timeout (common in Nigeria) → "Verification is taking longer than usual. We'll notify you when it's complete. You can continue browsing." NIN/BVN mismatch → specific retry guidance ("Check that your name matches exactly as it appears on your NIN slip")
- **Key UX:** The failure path must feel supportive. Nigerian KYC infrastructure is unreliable — design for it, don't apologise for it

### 1.8 Invite Management Page — P1
- **Route:** `/invites`
- **Content:** Available invite codes/links, generate new ones (up to tier limit), referral chain status
- **Key Elements:** Code list with copy/share buttons, referral tree showing invitee status (pending, approved, verified, pro)
- **Error States:** Invite generation at limit → "You've used all X invites for your tier. Reach Pro for more."

## Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **AUTH-M01** | P1 | "Generate Invite" on Invite page | Confirmation: "Generate a new invite code? You have X remaining." Generate / Cancel |
| **AUTH-M02** | P1 | "Share Invite" on an invite code | Share sheet: Copy link, WhatsApp, Twitter/X, Email. Pre-filled message |
| **AUTH-M03** | P0 | Login with unverified email | "Please verify your email. We sent a code to [email]. [Resend]" |
| **AUTH-M04** | P0 | Invalid/exhausted invite code during registration | "This invite code is no longer valid. Ask the person who shared it to generate a new one." |
| **AUTH-M05** | P0 | Provisional verification 14-day expiry warning | Banner/dialog: "Your provisional verification expires in X days. Complete full verification to keep your listings active." CTA → Verification page |
