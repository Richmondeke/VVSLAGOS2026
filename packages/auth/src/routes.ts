import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { register } from "./registration.js";
import { login } from "./login.js";
import { refreshSession, revokeSession } from "./session.js";
import { getOAuthRedirectUrl, handleOAuthCallback, type OAuthProvider, type OAuthState } from "./oauth.js";

export type AuthRoutesOpts = {
    db: ScopedClient;
};

export const authRoutes: FastifyPluginAsync<AuthRoutesOpts> = async (app, opts) => {
    const { db } = opts;

    // POST /auth/register
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
            return reply.status(201).send(result);
        },
    );

    // POST /auth/login
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
            return reply.send(result);
        },
    );

    // POST /auth/refresh
    app.post<{
        Body: { refreshToken: string };
    }>(
        "/auth/refresh",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const result = await refreshSession(db, request.body.refreshToken);
            return reply.send(result);
        },
    );

    // POST /auth/logout
    app.post<{
        Body: { sessionId: string };
    }>(
        "/auth/logout",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["sessionId"],
                    properties: {
                        sessionId: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            await revokeSession(db, request.body.sessionId);
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
