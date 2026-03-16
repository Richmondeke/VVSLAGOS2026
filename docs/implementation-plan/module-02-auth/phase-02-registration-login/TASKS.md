## Phase 2.2 Task List: Registration, Login, Sessions

### Password Hashing
[x] 1.  Install `argon2` in `packages/auth`
[x] 2.  Create `packages/auth/src/password.ts`
[x] 3.  Implement `hashPassword(plaintext)` using argon2 with adaptive cost config
[x] 4.  Implement `verifyPassword(plaintext, hash)` returning boolean
[x] 5.  Test: same plaintext produces different hashes (salt); correct password verifies; wrong password rejects

### JWT + Sessions
[x] 6.  Install `jose` in `packages/auth`
[x] 7.  Create `packages/auth/src/session.ts`
[x] 8.  Implement `issueAccessToken(userId, tier)` — short-lived JWT (15 min)
[x] 9.  Implement `issueRefreshToken(sessionId)` — long-lived JWT (30 days)
[x] 10. Implement `verifyAccessToken(token)` — validates signature + expiry, returns claims
[x] 11. Implement `verifyRefreshToken(token)` — validates signature + expiry, returns sessionId
[x] 12. Implement `refreshSession(refreshToken)` — issues new access token, rotates refresh token
[x] 13. Implement `revokeSession(sessionId)` — marks session as revoked in DB
[x] 14. Test: issued token is valid; expired token is rejected; revoked session cannot refresh

### Registration Flow
[x] 15. Create `packages/auth/src/registration.ts`
[x] 16. Implement `register({ inviteCode, email, password })` function
[x] 17. Step 1: Validate invite code exists, is not exhausted, is not expired
[x] 18. Step 2: Check email is not already registered
[x] 19. Step 3: Hash password with argon2
[x] 20. Step 4: Create user record (status = pending_approval)
[x] 21. Step 5: Increment invite code usage count
[x] 22. Step 6: Create referral record linking invitee to inviter
[x] 23. Step 7: Write `auth.user.registered` event to outbox (same transaction as user creation)
[x] 24. Return: user ID and confirmation that approval is pending
[x] 25. Test: successful registration creates user + referral + outbox event atomically
[x] 26. Test: invalid invite code rejected
[x] 27. Test: duplicate email rejected
[x] 28. Test: outbox event is NOT written if user creation fails (atomicity)

### Login Flow
[x] 29. Create `packages/auth/src/login.ts`
[x] 30. Implement `login({ email, password, deviceInfo })` function
[x] 31. Validate: user exists, is not suspended/banned
[x] 32. Validate: user's email is verified OR admin has approved
[x] 33. Verify: password with argon2
[x] 34. On success: create session, issue access + refresh tokens
[x] 35. On failure: DO NOT enumerate which field was wrong (return generic error)
[x] 36. Test: correct credentials return tokens
[x] 37. Test: wrong password returns same error as wrong email (no enumeration)
[x] 38. Test: suspended user cannot login
[ ] 39. Test: account with 5 failed attempts is rate-limited (test with the mock clock) — deferred: rate limiting is per-route in Fastify, not in auth service layer

### OAuth (Social Login)
[x] 40. Install `arctic` in `packages/auth`
[x] 41. Create `packages/auth/src/oauth.ts` with Google adapter
[x] 42. Implement `getOAuthRedirectUrl(provider, state)` — returns provider auth URL
[x] 43. Implement `handleOAuthCallback(provider, code, state)` — exchanges code for user info
[x] 44. If user exists (email match): log in and return tokens
[x] 45. If user is new: require invite code in state parameter (social + invite required)
[ ] 46. Test: OAuth callback with known email logs in; unknown email without invite code rejects — deferred: requires mocking Google OAuth API

### Fastify Routes
[x] 47. Create `packages/auth/src/routes.ts` — Fastify plugin
[x] 48. POST /auth/register — schema-validated, calls registration.ts
[x] 49. POST /auth/login — schema-validated, calls login.ts
[x] 50. POST /auth/refresh — validates refresh token, issues new access token
[x] 51. POST /auth/logout — revokes session
[x] 52. GET /auth/oauth/:provider — redirect to provider
[x] 53. GET /auth/oauth/:provider/callback — handle callback
[ ] 54. Register routes plugin in `apps/api/src/container.ts` — deferred: will wire when API shell connects to auth DB
[x] 55. Integration test: POST /auth/login with Fastify inject() returns tokens
