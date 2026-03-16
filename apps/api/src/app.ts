import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { type AppError, getLogger, mapErrorToHttp, withCorrelationId } from "@vvs/shared";
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

    return app;
}
