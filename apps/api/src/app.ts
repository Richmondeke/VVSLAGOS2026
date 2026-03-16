import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { type AppError, createScopedClient, getLogger, mapErrorToHttp, withCorrelationId } from "@vvs/shared";
import { membersRoutes, createMockS3Adapter } from "@vvs/members";
import { marketplaceRoutes } from "@vvs/marketplace";
import { socialRoutes } from "@vvs/social";
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
    await app.register(cors, { origin: true });

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

    // Health check
    app.get("/health", async () => {
        return { status: "ok", timestamp: new Date().toISOString() };
    });

    // Domain routes
    const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";
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

    return app;
}
