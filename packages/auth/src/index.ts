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

// Routes
export { authRoutes, type AuthRoutesOpts } from "./routes.js";
