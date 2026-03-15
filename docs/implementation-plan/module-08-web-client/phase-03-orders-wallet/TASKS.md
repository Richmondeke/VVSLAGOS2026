## Phase 8.3 Task List: Orders, Wallet, Notifications

### Orders List Page (P0)
[ ] 1.  Build /orders page with "As Client" / "As Provider" tabs
[ ] 2.  Order cards: listing title, counterparty, status badge, amount, last activity
[ ] 3.  "Requires Action" indicator (orange) on orders needing input
[ ] 4.  Filter: status, date range
[ ] 5.  Empty state per tab: client → "Browse services"; provider → "Make sure your listings are active"

### Order Detail Page (P0)
[ ] 6.  Build /orders/:id page (renders differently for client vs provider)
[ ] 7.  Status timeline: horizontal (desktop) / vertical (mobile)
[ ] 8.  Listing summary, counterparty card, message thread, audit trail
[ ] 9.  Client actions by state:
[ ] 10.   draft → "Waiting for provider" / Cancel
[ ] 11.   accepted → "Pay Now" (Paystack) / "Pay from Wallet (₦X balance)"
[ ] 12.   delivered → "Approve & Release" / "Request Revision" / "Raise Dispute"
[ ] 13.   completed → "Rate this experience"
[ ] 14. Provider actions by state:
[ ] 15.   draft → "Accept Order" (with fee breakdown) / "Decline"
[ ] 16.   in_progress → "Submit Deliverables"
[ ] 17. Provider acceptance modal: MKT-M02 (fee breakdown: gross → 7.5% → net payout)
[ ] 18. Payment modal: MKT-M04 (Paystack or wallet; insufficient balance → "Top up or pay with card")
[ ] 19. Approve modal: MKT-M05 (confirmation with amount; feels weighty — money moves)
[ ] 20. Dispute modal: MKT-M06 (category, description, file attachments)
[ ] 21. Deliverable upload modal: MKT-M07 (multi-file, per-file progress)
[ ] 22. Rating modal: MKT-M08 (1-5 stars, optional review)
[ ] 23. Revision request modal: MKT-M13 (structured notes, specific files, revision count displayed)
[ ] 24. 14-day inactivity modal: MKT-M10 ("Provider hasn't responded in 14 days. Cancel or keep waiting?")
[ ] 25. Error state: Paystack failure → FIN-M05 dialog with retry

### Wallet Page (P0)
[ ] 26. Build /wallet page
[ ] 27. Balance display: "Available: ₦X" and "In Active Orders: ₦Y" (NOT "Locked in Escrow")
[ ] 28. Tooltip on "In Active Orders": "Held safely until work is approved"
[ ] 29. Transaction history: date, description, amount (+/-), running balance
[ ] 30. Filter: type (all/funded/earned/withdrawn/orders), date range
[ ] 31. "Add Funds" → FIN-M01 → Paystack checkout → FIN-M04 success
[ ] 32. "Withdraw" → FIN-M02 → bank account selector → FIN-M03 (add bank) → processing
[ ] 33. Paystack timeout state: "Payment is being processed. We'll update your balance shortly."
[ ] 34. Network loss mid-checkout: "Payment may still be processing. Check your balance in a few minutes."

### Notifications (P0)
[ ] 35. Build /notifications page: chronological, grouped (today/this week/earlier)
[ ] 36. Notification bell with unread count badge in header
[ ] 37. Bell dropdown: last 5-10 notifications + "View All"
[ ] 38. Each notification links to the relevant page
[ ] 39. Mark individual and "mark all as read"
[ ] 40. In-app notification delivery via WebSocket (same connection as messages)

### Account Settings (P0)
[ ] 41. Build /settings page
[ ] 42. Sections: security, payment methods, identity verification status, tier progress, privacy
[ ] 43. Change password modal: PLT-M02
[ ] 44. Tier progress card: current tier badge + "X more transactions to reach Pro"
[ ] 45. Tier upgrade celebration modal: PLT-M06
[ ] 46. Save bank account modal: FIN-M03 with Paystack account verification

### Messaging (P0)
[ ] 47. Build /messages page: conversation list, search
[ ] 48. Build /messages/:conversationId page: real-time thread
[ ] 49. WebSocket connection for real-time delivery
[ ] 50. Order context card at top of conversation (shows active order status between these two users)
[ ] 51. Message rate limit hit modal: SOC-M05
[ ] 52. Context-gate modal for Free tier: SOC-M06
[ ] 53. File attachment in message: SOC-M07 with upload progress
[ ] 54. "Connection lost. Reconnecting..." banner on WebSocket disconnect
[ ] 55. Messages queued locally and sent on reconnection

### Exit Criteria
- Full order flow testable in browser: create → accept → pay → deliver → approve → rate
- Wallet shows correct Available vs "In Active Orders" balances
- Paystack checkout timeout handled gracefully (user not left hanging)
- WebSocket messages delivered in real-time; reconnection works correctly
- All P0 modals (MKT-M01 through MKT-M13, FIN-M01 through FIN-M05) implemented
