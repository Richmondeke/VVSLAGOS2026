import { SignJWT, jwtVerify } from "jose";
import type { ScopedClient } from "@vvs/shared";
import { UnauthorizedError } from "@vvs/shared";
import type { MemberTier } from "@vvs/contracts";
import { createSessionsRepo } from "./repositories/sessions.js";
import { createTokensRepo } from "./repositories/tokens.js";

export type AccessClaims = {
    sub: string; // userId
    tier: MemberTier;
};

export type RefreshClaims = {
    sessionId: string;
};

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    return new TextEncoder().encode(secret);
}

export async function issueAccessToken(userId: string, tier: MemberTier): Promise<string> {
    return new SignJWT({ tier })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(getSecret());
}

export async function issueRefreshToken(sessionId: string): Promise<string> {
    return new SignJWT({ sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return {
            sub: payload.sub!,
            tier: payload.tier as MemberTier,
        };
    } catch {
        throw new UnauthorizedError("Invalid or expired access token");
    }
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return {
            sessionId: payload.sessionId as string,
        };
    } catch {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }
}

export async function refreshSession(
    db: ScopedClient,
    refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
    const { sessionId } = await verifyRefreshToken(refreshToken);

    const sessionsRepo = createSessionsRepo(db);
    const session = await sessionsRepo.findById(sessionId);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedError("Session expired or revoked");
    }

    // We need the user's tier — look it up from tiers repo
    const { createTiersRepo } = await import("./repositories/tiers.js");
    const tiersRepo = createTiersRepo(db);
    const tierRow = await tiersRepo.getCurrentTier(session.userId);
    const tier: MemberTier = tierRow?.tier ?? "free";

    const newAccessToken = await issueAccessToken(session.userId, tier);
    const newRefreshToken = await issueRefreshToken(sessionId);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function revokeSession(db: ScopedClient, sessionId: string): Promise<void> {
    const sessionsRepo = createSessionsRepo(db);
    await sessionsRepo.revokeById(sessionId);
}
