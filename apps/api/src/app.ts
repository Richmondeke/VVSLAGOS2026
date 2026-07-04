import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { type AppError, createScopedClient, getLogger, mapErrorToHttp, withCorrelationId, rsvps, sql } from "@vvs/shared";
import { authRoutes } from "@vvs/auth";
import { membersRoutes, createMockS3Adapter } from "@vvs/members";
import { marketplaceRoutes } from "@vvs/marketplace";
import { socialRoutes } from "@vvs/social";
import { platformRoutes } from "@vvs/platform";
import { adminApiRoutes } from "./admin-routes.js";
import { contentRoutes } from "./content-routes.js";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
    interface FastifyRequest {
        correlationId: string;
    }
}

export async function buildApp() {
    const app = Fastify({
        logger: false,
        ajv: {
            customOptions: {
                removeAdditional: false,
                allErrors: true,
            },
        },
    });

    // Decorate request with correlationId
    app.decorateRequest("correlationId", "");

    // CORS
    await app.register(cors, { origin: true, credentials: true });

    // Rate limiting
    await app.register(rateLimit, {
        max: 200,
        timeWindow: "1 minute",
        keyGenerator: (request) => request.ip,
    });

    // Correlation ID hook
    app.addHook("onRequest", (request, _reply, done) => {
        request.correlationId = (request.headers["x-correlation-id"] as string) ?? randomUUID();
        done();
    });

    // Request logging hook
    app.addHook("onRequest", (request, _reply, done) => {
        withCorrelationId(request.correlationId, () => {
            const logger = getLogger("api");
            logger.info(
                { method: request.method, path: request.url, correlationId: request.correlationId },
                "Request received",
            );
        });
        done();
    });

    app.addHook("onResponse", (request, reply, done) => {
        withCorrelationId(request.correlationId, () => {
            const logger = getLogger("api");
            logger.info(
                {
                    method: request.method,
                    path: request.url,
                    statusCode: reply.statusCode,
                    correlationId: request.correlationId,
                    responseTime: reply.elapsedTime,
                },
                "Response sent",
            );
        });
        done();
    });

    // Correlation ID in response header
    app.addHook("onSend", (request, reply, _payload, done) => {
        if (request.correlationId) {
            reply.header("x-correlation-id", request.correlationId);
        }
        done();
    });

    // Global error handler
    app.setErrorHandler((error, _request, reply) => {
        const { statusCode, body } = mapErrorToHttp(error as AppError);
        reply.status(statusCode).send(body);
    });

    // Domain routes
    const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

    // Health check
    app.get("/health", async () => {
        return { status: "ok", timestamp: new Date().toISOString() };
    });

    app.get("/health/db", async () => {
        try {
            // Safe parse DB URL
            const url = DB_URL.replace(/[\r\n]/g, "").trim();
            const parsed = new URL(url);
            return {
                status: "ok",
                host: parsed.host,
                username: parsed.username,
                database: parsed.pathname,
                protocol: parsed.protocol
            };
        } catch (err: any) {
            return {
                status: "error",
                message: err.message,
                dbUrlLength: DB_URL?.length ?? 0
            };
        }
    });

    app.get("/health/rsvps", async () => {
        try {
            const allRows = await publicDb.select().from(rsvps);
            return {
                status: "ok",
                count: allRows.length,
                sample: allRows.slice(0, 3)
            };
        } catch (err: any) {
            return {
                status: "error",
                message: err.message
            };
        }
    });


    // Debug endpoint to test admin auth flow
    app.get("/health/admin-check", async (request) => {
        const results: Record<string, any> = {};
        const email = (request.headers["x-admin-email"] as string) || "test@example.com";
        const userId = request.headers["x-admin-user-id"] as string;

        results.receivedHeaders = { userId, email };

        // Step 1: Check if auth.users table has this email
        try {
            const authDb = createScopedClient("auth", DB_URL);
            const usersRepo = (await import("@vvs/auth")).createUsersRepo(authDb);
            const user = await usersRepo.findByEmail(email);
            results.authUser = user ? { id: user.id, email: user.email, status: user.status } : null;
        } catch (err: any) {
            results.authUserError = err.message;
        }

        // Step 2: Check platform.admin_users table
        try {
            const platformDb = createScopedClient("platform", DB_URL);
            const { createAdminRepo } = await import("@vvs/platform");
            const adminRepo = createAdminRepo(platformDb);
            const admins = await adminRepo.listAdmins();
            results.adminUsers = admins.map((a: any) => ({ id: a.id, userId: a.userId, role: a.role, isActive: a.isActive }));
            results.adminCount = admins.length;
        } catch (err: any) {
            results.adminUsersError = err.message;
        }

        return results;
    });

    // Auth routes
    const authDb = createScopedClient("auth", DB_URL);
    await app.register(authRoutes, { db: authDb });

    const membersDb = createScopedClient("members", DB_URL);
    const s3 = createMockS3Adapter(); // TODO: replace with real S3 adapter
    await app.register(membersRoutes, { db: membersDb, s3 });

    // Marketplace routes
    const marketplaceDb = createScopedClient("marketplace", DB_URL);

    // TODO: replace with real implementations from @vvs/finance
    const mockWalletService = {
        async create() { return {} as any; },
        async getBalance() { return { amount: 0, currency: "NGN" } as any; },
        async debit(_userId: string, _amount: number, _ref: string) { return { success: true } as any; },
        async credit(_userId: string, _amount: number, _ref: string) { return { success: true } as any; },
        async withdraw() { return {} as any; },
    };
    const mockEscrowService = {
        async create(input: any) { return { id: crypto.randomUUID(), ...input, status: "created" } as any; },
        async markFunded() {},
        async approveMilestone() {},
        async releaseMilestone() { return { success: true } as any; },
        async cancel() {},
        async dispute() {},
    };
    const mockIdentityService = {
        async submitVerification() { return {} as any; },
        async getStatus() { return "verified" as any; },
        async getTier() { return "verified" as any; },
        async upgradeTier() {},
    };

    await app.register(marketplaceRoutes, {
        db: marketplaceDb,
        identityService: mockIdentityService,
        walletService: mockWalletService,
        escrowService: mockEscrowService,
    });

    // Social routes
    const socialDb = createScopedClient("social", DB_URL);
    const mockRateLimiter = {
        async getTier() { return "verified" as any; },
        async getMessageCountLast24h() { return 0; },
    };
    await app.register(socialRoutes, { db: socialDb, rateLimiter: mockRateLimiter });

    // Platform routes
    const platformDb = createScopedClient("platform", DB_URL);
    await app.register(platformRoutes, { db: platformDb });

    const publicDb = createScopedClient("public", DB_URL);

    // Admin API routes (cross-domain queries for admin dashboard)
    await app.register(adminApiRoutes, { authDb, marketplaceDb, platformDb, publicDb });

    // Public CMS routes
    await app.register(contentRoutes, { db: platformDb });

    return app;
}
