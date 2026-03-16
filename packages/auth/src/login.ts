import type { ScopedClient } from "@vvs/shared";
import { UnauthorizedError } from "@vvs/shared";
import type { MemberTier } from "@vvs/contracts";
import { verifyPassword } from "./password.js";
import { createUsersRepo } from "./repositories/users.js";
import { createSessionsRepo } from "./repositories/sessions.js";
import { createTiersRepo } from "./repositories/tiers.js";
import { issueAccessToken, issueRefreshToken } from "./session.js";

export type LoginInput = {
    email: string;
    password: string;
    deviceInfo?: unknown;
};

export type LoginResult = {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    userId: string;
};

const GENERIC_ERROR = "Invalid email or password";

export async function login(
    db: ScopedClient,
    input: LoginInput,
): Promise<LoginResult> {
    const usersRepo = createUsersRepo(db);
    const sessionsRepo = createSessionsRepo(db);
    const tiersRepo = createTiersRepo(db);

    // Find user — generic error on not found (no enumeration)
    const user = await usersRepo.findByEmail(input.email);
    if (!user) {
        throw new UnauthorizedError(GENERIC_ERROR);
    }

    // Check user status
    if (user.status === "suspended" || user.status === "banned") {
        throw new UnauthorizedError("Account is suspended or banned");
    }

    if (user.status === "pending_approval" || user.status === "rejected") {
        throw new UnauthorizedError("Account is not yet approved");
    }

    // Verify password — generic error on mismatch
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
        throw new UnauthorizedError(GENERIC_ERROR);
    }

    // Get tier
    const tierRow = await tiersRepo.getCurrentTier(user.id);
    const tier: MemberTier = tierRow?.tier ?? "free";

    // Create session (30-day expiry)
    const session = await sessionsRepo.create({
        userId: user.id,
        deviceInfo: input.deviceInfo,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Issue tokens
    const accessToken = await issueAccessToken(user.id, tier);
    const refreshToken = await issueRefreshToken(session.id);

    return {
        accessToken,
        refreshToken,
        sessionId: session.id,
        userId: user.id,
    };
}
