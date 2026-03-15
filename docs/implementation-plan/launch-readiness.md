# Launch Readiness Checklist

Complete this before inviting the seed community.

---

## Pre-Launch Verification

### Security
[ ] HTTPS enforced (no HTTP in production)
[ ] JWT secret is a cryptographically random 256-bit value (not "secret123")
[ ] Paystack webhook signature verification enabled in production
[ ] All environment variables in production secrets manager (not .env file)
[ ] Database roles have minimal permissions (no superuser access to app roles)
[ ] Rate limiting active on all endpoints

### Financial Integrity
[ ] Wallet reconciliation job scheduled and verified running
[ ] Dead-letter queue alerts configured (email when count > 0)
[ ] Paystack marketplace approval confirmed (required for escrow release with fee deduction)
[ ] Test Paystack webhook in production (send test payload, verify wallet credit)

### Infrastructure
[ ] Managed PostgreSQL backups enabled (daily minimum)
[ ] Managed Redis persistence enabled (AOF or RDB)
[ ] Object storage (R2/S3) bucket configured with CDN
[ ] Zero-downtime deploy pipeline tested
[ ] Health check endpoint monitored externally

### Data
[ ] Category taxonomy seeded (Design, Photography/Videography for launch)
[ ] Notification route configs seeded (all 10 initial routes)
[ ] Platform settings seeded with correct defaults (7.5% fee, tier limits, etc.)
[ ] First admin user created (Super Admin role)

### Operational
[ ] Admin dashboard accessible and showing live data
[ ] Admin can approve test member end-to-end
[ ] Dispute resolution tested with real admin account
[ ] Content moderation policy document completed (required before feed launch)

### Performance
[ ] p95 API response time < 300ms on load test with 100 concurrent users
[ ] Search latency < 200ms on test dataset of 500 profiles
[ ] WebSocket handles 200 concurrent connections without degradation

### Mobile
[ ] PWA installable on Android (test with Chrome)
[ ] PWA installable on iOS (test with Safari)
[ ] Service worker caches critical routes for offline browse
[ ] Core flows tested on 3G throttled connection (< 10s to place an order)
