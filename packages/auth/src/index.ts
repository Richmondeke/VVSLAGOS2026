// @vvs/auth

// Schema
export { authSchema } from "./schema.js";
export * from "./schema.js";

// Repositories
export * from "./repositories/index.js";

// Auth logic
export { hashPassword, verifyPassword } from "./password.js";
export {
    issueAccessToken,
    issueRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    refreshSession,
    revokeSession,
    type AccessClaims,
    type RefreshClaims,
} from "./session.js";
export { register, type RegisterInput, type RegisterResult } from "./registration.js";
export { login, type LoginInput, type LoginResult } from "./login.js";
export { getOAuthRedirectUrl, handleOAuthCallback, type OAuthProvider, type OAuthState } from "./oauth.js";

// Invites
export { generateInvite, listInvites, validateInvite, setPlatformSettings } from "./invites.js";

// Referral accountability
export { getReferralChain, getReferralsByInviter, checkAccountability, handleReferralBanned } from "./referral-service.js";

// Admin approval
export { getPendingApprovals, approveUser, rejectUser } from "./approval.js";

// Verification / KYC
export { submitVerification, grantProvisionalVerification, checkExpiredProvisional, verifyIdentity } from "./verification.js";

// Tier management
export { getTier, checkProUpgrade, upgradeTierToProIfEligible, setTier as setTierAdmin, setProThresholds } from "./tier-service.js";

// Badges
export { issueBadge, revokeBadge, getBadges, type BadgeType } from "./badges-service.js";

// Public interfaces (IAuthService, IReferralService, IIdentityService)
export { createAuthService, createReferralService, createIdentityService } from "./interfaces.js";

// Routes
export { authRoutes, type AuthRoutesOpts } from "./routes.js";
