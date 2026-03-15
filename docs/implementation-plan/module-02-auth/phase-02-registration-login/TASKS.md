## Phase 2.2 Task List: Registration, Login, Sessions

### Password Hashing
[ ] 1.  Install `argon2` in `packages/auth`
[ ] 2.  Create `packages/auth/src/password.ts`
[ ] 3.  Implement `hashPassword(plaintext)` using argon2 with adaptive cost config
[ ] 4.  Implement `verifyPassword(plaintext, hash)` returning boolean
[ ] 5.  Test: same plaintext produces different hashes (salt); correct password verifies; wrong password rejects

### JWT + Sessions
[ ] 6.  Install `jose` in `packages/auth`
[ ] 7.  Create `packages/auth/src/session.ts`
[ ] 8.  Implement `issueAccessToken(userId, tier)` — short-lived JWT (15 min)
[ ] 9.  Implement `issueRefreshToken(sessionId)` — long-lived JWT (30 days)
[ ] 10. Implement `verifyAccessToken(token)` — validates signature + expiry, returns claims
[ ] 11. Implement `verifyRefreshToken(token)` — validates signature + expiry, returns sessionId
[ ] 12. Implement `refreshSession(refreshToken)` — issues new access token, rotates refresh token
[ ] 13. Implement `revokeSession(sessionId)` — marks session as revoked in DB
[ ] 14. Test: issued token is valid; expired token is rejected; revoked session cannot refresh

### Registration Flow
[ ] 15. Create `packages/auth/src/registration.ts`
[ ] 16. Implement `register({ inviteCode, email, password })` function
[ ] 17. Step 1: Validate invite code exists, is not exhausted, is not expired
[ ] 18. Step 2: Check email is not already registered
[ ] 19. Step 3: Hash password with argon2
[ ] 20. Step 4: Create user record (status = pending_approval)
[ ] 21. Step 5: Increment invite code usage count
[ ] 22. Step 6: Create referral record linking invitee to inviter
[ ] 23. Step 7: Write `auth.user.registered` event to outbox (same transaction as user creation)
[ ] 24. Return: user ID and confirmation that approval is pending
[ ] 25. Test: successful registration creates user + referral + outbox event atomically
[ ] 26. Test: invalid invite code rejected
[ ] 27. Test: duplicate email rejected
[ ] 28. Test: outbox event is NOT written if user creation fails (atomicity)

### Login Flow
[ ] 29. Create `packages/auth/src/login.ts`
[ ] 30. Implement `login({ email, password, deviceInfo })` function
[ ] 31. Validate: user exists, is not suspended/banned
[ ] 32. Validate: user's email is verified OR admin has approved
[ ] 33. Verify: password with argon2
[ ] 34. On success: create session, issue access + refresh tokens
[ ] 35. On failure: DO NOT enumerate which field was wrong (return generic error)
[ ] 36. Test: correct credentials return tokens
[ ] 37. Test: wrong password returns same error as wrong email (no enumeration)
[ ] 38. Test: suspended user cannot login
[ ] 39. Test: account with 5 failed attempts is rate-limited (test with the mock clock)

### OAuth (Social Login)
[ ] 40. Install `arctic` in `packages/auth`
[ ] 41. Create `packages/auth/src/oauth.ts` with Google adapter
[ ] 42. Implement `getOAuthRedirectUrl(provider, state)` — returns provider auth URL
[ ] 43. Implement `handleOAuthCallback(provider, code, state)` — exchanges code for user info
[ ] 44. If user exists (email match): log in and return tokens
[ ] 45. If user is new: require invite code in state parameter (social + invite required)
[ ] 46. Test: OAuth callback with known email logs in; unknown email without invite code rejects

### Fastify Routes
[ ] 47. Create `packages/auth/src/routes.ts` — Fastify plugin
[ ] 48. POST /auth/register — schema-validated, calls registration.ts
[ ] 49. POST /auth/login — schema-validated, calls login.ts
[ ] 50. POST /auth/refresh — validates refresh token, issues new access token
[ ] 51. POST /auth/logout — revokes session
[ ] 52. GET /auth/oauth/:provider — redirect to provider
[ ] 53. GET /auth/oauth/:provider/callback — handle callback
[ ] 54. Register routes plugin in `apps/api/src/container.ts`
[ ] 55. Integration test: POST /auth/login with Fastify inject() returns tokens
