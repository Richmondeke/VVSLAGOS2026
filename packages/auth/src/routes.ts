import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { UnauthorizedError } from "@vvs/shared";
import { register } from "./registration.js";
import { login } from "./login.js";
import { refreshSession, revokeSession, verifyRefreshToken } from "./session.js";
import { createUsersRepo } from "./repositories/users.js";
import { getOAuthRedirectUrl, handleOAuthCallback, type OAuthProvider, type OAuthState } from "./oauth.js";

export type AuthRoutesOpts = {
    db: ScopedClient;
};

const REFRESH_COOKIE = "vvs_refresh";
const SESSION_COOKIE = "vvs_session";
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export const authRoutes: FastifyPluginAsync<AuthRoutesOpts> = async (app, opts) => {
    const { db } = opts;
    const usersRepo = createUsersRepo(db);

    // POST /auth/register
    // Returns { user: { id, email, status } } — no accessToken since user is pending_approval
    app.post<{
        Body: { inviteCode: string; email: string; password: string };
    }>(
        "/auth/register",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["inviteCode", "email", "password"],
                    properties: {
                        inviteCode: { type: "string", minLength: 1 },
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 8 },
                    },
                },
            },
        },
        async (request, reply) => {
            const result = await register(db, request.body);
            return reply.status(201).send({
                user: {
                    id: result.userId,
                    email: request.body.email,
                    status: result.status,
                },
            });
        },
    );

    // POST /auth/login
    // Returns { user: { id, email, status }, accessToken } + sets refresh/session cookies
    app.post<{
        Body: { email: string; password: string; deviceInfo?: unknown };
    }>(
        "/auth/login",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 1 },
                        deviceInfo: {},
                    },
                },
            },
        },
        async (request, reply) => {
            const result = await login(db, request.body);

            // Set httpOnly cookies for refresh token and session ID
            reply.header("set-cookie", [
                `${REFRESH_COOKIE}=${result.refreshToken}; HttpOnly; ${COOKIE_OPTS.secure ? "Secure; " : ""}SameSite=${COOKIE_OPTS.sameSite}; Path=${COOKIE_OPTS.path}; Max-Age=${COOKIE_OPTS.maxAge}`,
                `${SESSION_COOKIE}=${result.sessionId}; HttpOnly; ${COOKIE_OPTS.secure ? "Secure; " : ""}SameSite=${COOKIE_OPTS.sameSite}; Path=${COOKIE_OPTS.path}; Max-Age=${COOKIE_OPTS.maxAge}`,
            ]);

            // Fetch user info for the response
            const user = await usersRepo.findById(result.userId);

            return reply.send({
                user: {
                    id: result.userId,
                    email: user?.email ?? request.body.email,
                    status: user?.status ?? "active",
                },
                accessToken: result.accessToken,
            });
        },
    );

    // POST /auth/refresh
    // Reads refresh token from cookie, returns { user, accessToken }, sets new cookie
    app.post(
        "/auth/refresh",
        async (request, reply) => {
            const cookieHeader = request.headers.cookie ?? "";
            const refreshToken = parseCookie(cookieHeader, REFRESH_COOKIE);

            if (!refreshToken) {
                throw new UnauthorizedError("No refresh token");
            }

            // Extract userId from the old refresh token to fetch user info
            const { sessionId } = await verifyRefreshToken(refreshToken);
            const sessionsRepo = (await import("./repositories/sessions.js")).createSessionsRepo(db);
            const session = await sessionsRepo.findById(sessionId);
            const user = session ? await usersRepo.findById(session.userId) : null;

            const result = await refreshSession(db, refreshToken);

            // Set new refresh cookie
            reply.header("set-cookie",
                `${REFRESH_COOKIE}=${result.refreshToken}; HttpOnly; ${COOKIE_OPTS.secure ? "Secure; " : ""}SameSite=${COOKIE_OPTS.sameSite}; Path=${COOKIE_OPTS.path}; Max-Age=${COOKIE_OPTS.maxAge}`,
            );

            return reply.send({
                user: user ? { id: user.id, email: user.email, status: user.status } : null,
                accessToken: result.accessToken,
            });
        },
    );

    // POST /auth/logout
    // Reads session ID from cookie, revokes session, clears cookies
    app.post(
        "/auth/logout",
        async (request, reply) => {
            const cookieHeader = request.headers.cookie ?? "";
            const sessionId = parseCookie(cookieHeader, SESSION_COOKIE);

            if (sessionId) {
                await revokeSession(db, sessionId);
            }

            // Clear cookies
            reply.header("set-cookie", [
                `${REFRESH_COOKIE}=; HttpOnly; Path=/; Max-Age=0`,
                `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0`,
            ]);

            return reply.status(204).send();
        },
    );

    // GET /auth/oauth/:provider
    app.get<{
        Params: { provider: string };
        Querystring: { inviteCode?: string };
    }>(
        "/auth/oauth/:provider",
        async (request, reply) => {
            const provider = request.params.provider as OAuthProvider;
            const { url, codeVerifier } = getOAuthRedirectUrl(provider, "oauth");

            // Encode codeVerifier + inviteCode in state (stateless approach)
            const statePayload = JSON.stringify({
                inviteCode: request.query.inviteCode,
                codeVerifier,
            });
            const stateEncoded = Buffer.from(statePayload).toString("base64url");
            const redirectUrl = new URL(url);
            redirectUrl.searchParams.set("state", stateEncoded);

            return reply.redirect(redirectUrl.toString());
        },
    );

    // GET /auth/oauth/:provider/callback
    app.get<{
        Params: { provider: string };
        Querystring: { code: string; state: string };
    }>(
        "/auth/oauth/:provider/callback",
        async (request, reply) => {
            const provider = request.params.provider as OAuthProvider;
            const { code, state: stateEncoded } = request.query;
            const parsedState = JSON.parse(
                Buffer.from(stateEncoded, "base64url").toString(),
            ) as { inviteCode?: string; codeVerifier: string };

            const oauthState: OAuthState = {
                inviteCode: parsedState.inviteCode,
                codeVerifier: parsedState.codeVerifier,
            };

            const result = await handleOAuthCallback(db, provider, code, oauthState);
            return reply.send(result);
        },
    );
};

function parseCookie(header: string, name: string): string | undefined {
    const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match?.[1];
}
