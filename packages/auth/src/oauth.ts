import { Google } from "arctic";
import type { ScopedClient } from "@vvs/shared";
import { UnauthorizedError, ValidationError } from "@vvs/shared";
import { createUsersRepo } from "./repositories/users.js";
import { login, type LoginResult } from "./login.js";
import { register } from "./registration.js";

export type OAuthProvider = "google";

type OAuthUserInfo = {
    email: string;
    name?: string;
    picture?: string;
};

function getGoogleClient(): Google {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/auth/oauth/google/callback";
    if (!clientId || !clientSecret) {
        throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
    }
    return new Google(clientId, clientSecret, redirectUri);
}

export function getOAuthRedirectUrl(
    provider: OAuthProvider,
    state: string,
): { url: string; codeVerifier: string } {
    if (provider !== "google") {
        throw new ValidationError(`Unsupported OAuth provider: ${provider}`);
    }

    const google = getGoogleClient();
    const codeVerifier = crypto.randomUUID();
    const scopes = ["openid", "email", "profile"];
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);
    return { url: url.toString(), codeVerifier };
}

async function fetchGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        throw new UnauthorizedError("Failed to fetch user info from Google");
    }
    const data = (await response.json()) as { email: string; name?: string; picture?: string };
    return { email: data.email, name: data.name, picture: data.picture };
}

export type OAuthState = {
    inviteCode?: string;
    codeVerifier: string;
};

export async function handleOAuthCallback(
    db: ScopedClient,
    provider: OAuthProvider,
    code: string,
    state: OAuthState,
): Promise<LoginResult> {
    if (provider !== "google") {
        throw new ValidationError(`Unsupported OAuth provider: ${provider}`);
    }

    const google = getGoogleClient();
    const tokens = await google.validateAuthorizationCode(code, state.codeVerifier);
    const accessToken = tokens.accessToken();
    const userInfo = await fetchGoogleUserInfo(accessToken);

    const usersRepo = createUsersRepo(db);
    const existingUser = await usersRepo.findByEmail(userInfo.email);

    if (existingUser) {
        // Existing user — skip password check, create session directly
        if (existingUser.status === "suspended" || existingUser.status === "banned") {
            throw new UnauthorizedError("Account is suspended or banned");
        }
        if (existingUser.status === "pending_approval" || existingUser.status === "rejected") {
            throw new UnauthorizedError("Account is not yet approved");
        }

        // Create session directly (imported inline to avoid circular dep)
        const { createSessionsRepo } = await import("./repositories/sessions.js");
        const { createTiersRepo } = await import("./repositories/tiers.js");
        const { issueAccessToken, issueRefreshToken } = await import("./session.js");

        const sessionsRepo = createSessionsRepo(db);
        const tiersRepo = createTiersRepo(db);
        const tierRow = await tiersRepo.getCurrentTier(existingUser.id);
        const tier = tierRow?.tier ?? "free";

        const session = await sessionsRepo.create({
            userId: existingUser.id,
            deviceInfo: { provider: "google" },
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        const accessJwt = await issueAccessToken(existingUser.id, tier);
        const refreshJwt = await issueRefreshToken(session.id);

        return {
            accessToken: accessJwt,
            refreshToken: refreshJwt,
            sessionId: session.id,
            userId: existingUser.id,
        };
    }

    // New user — invite code required
    if (!state.inviteCode) {
        throw new ValidationError("Invite code is required for new users signing up via OAuth");
    }

    // Register with a generated password (user can set one later, or always use OAuth)
    const tempPassword = crypto.randomUUID();
    const result = await register(db, {
        inviteCode: state.inviteCode,
        email: userInfo.email,
        password: tempPassword,
    });

    return {
        accessToken: "",
        refreshToken: "",
        sessionId: "",
        userId: result.userId,
    };
}
