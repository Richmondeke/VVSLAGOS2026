# Module 4: Finance (Wallet, Escrow, Payments)

## Pages / Screens

### 4.1 Wallet Page — P0
- **Route:** `/wallet`
- **Key Elements:**
  - Balance display: **Available Balance** (₦X), **In Active Orders** (₦X) — NOT "Locked in Escrow" (user-friendly language)
  - Quick actions: "Add Funds" / "Withdraw"
  - Transaction history: chronological list — date, description, amount (+/-), running balance, reference. Each entry links to associated order where relevant
  - Filters: type (all, funded, earned, withdrawn, orders), date range
- **Error States:** Balance load failure → "Unable to load your balance. Pull to refresh." Transaction history load failure → partial page with retry
- **Key UX:** "Available" vs "In Active Orders" must be immediately clear. Tooltip or help icon: "In Active Orders = money held safely until work is approved"

### 4.2 Add Funds Flow — P0
- **Route:** Modal from wallet page
- **Steps:** Enter amount → Paystack checkout (card, bank transfer, USSD) → confirmation
- **Error States:** Paystack timeout → "Payment is being processed. We'll update your balance shortly." Paystack failure → retry or different method. Network loss mid-checkout → "Payment may still be processing. Check your balance in a few minutes."
- **Key UX:** Optional flow — clients can pay directly to escrow. Position as convenience for repeat users

### 4.3 Withdraw Flow — P0
- **Route:** Modal from wallet page
- **Steps:** Enter amount → select/add bank account → confirm (with any fees shown) → processing status
- **Error States:** Withdrawal initiation failure → retry. Bank account verification failure (Paystack name check) → "Account name doesn't match. Please check details." Processing failure → notification + admin flag
- **Key UX:** Show estimated arrival: "Transfers typically arrive within 24 hours." Status updates via notification when completed

### 4.4 Transaction Detail Page — P2
- **Route:** `/wallet/transactions/{transactionId}`
- **Content:** Full ledger detail for a single transaction
- **Rationale for P2:** Transaction list on wallet page provides enough detail for most users. Full detail is an audit/dispute tool

## Modals & Dialogs

| ID | Priority | Trigger | Content |
|---|---|---|---|
| **FIN-M01** | P0 | "Add Funds" | Amount input, proceeds to Paystack. Confirm / Cancel |
| **FIN-M02** | P0 | "Withdraw" | Amount input, bank account selector (or "Add Bank Account"), fee display. Withdraw / Cancel |
| **FIN-M03** | P0 | "Add Bank Account" | Bank name dropdown, account number, auto-verified account name. Save / Cancel. Error state: verification failure → "Check details and try again" |
| **FIN-M04** | P0 | Paystack success callback | "₦X has been added to your wallet." Done |
| **FIN-M05** | P0 | Paystack failure callback | "Payment failed. [Reason]. Try again or use a different method." Retry / Cancel |
| **FIN-M06** | P1 | Withdrawal completed notification | In-app: "Your withdrawal of ₦X to [Bank] ****1234 has been completed." |
