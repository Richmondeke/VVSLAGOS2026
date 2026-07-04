// @vvs/shared — Infrastructure primitives: DB client, BullMQ, logger, errors, test utils

// Database
export { createScopedClient, closeAllConnections } from "./db/client.js";
export type { ScopedClient } from "./db/client.js";
export { runMigrations } from "./db/migration-runner.js";
export { outboxSchema, events, deadLetters, consumerOffsets, contentEvents, contentNews, contentOpportunities, rsvps, communityMembers, futureLabsApplications } from "./schema.js";
export { eq, desc, and, or, sql } from "drizzle-orm";

// Events
export { getQueue, createWorker, closeAllQueues } from "./events/queue-factory.js";
export { writeToOutbox } from "./events/outbox-writer.js";
export { relayOutboxEvents, startRelayLoop } from "./events/relay-worker.js";
export { InMemoryEventBus } from "./events/in-memory-bus.js";

// Logger
export {
    createChildLogger,
    withCorrelationId,
    getCorrelationId,
    getLogger,
    rootLogger,
} from "./logger/index.js";

// Errors
export {
    AppError,
    NotFoundError,
    ForbiddenError,
    ValidationError,
    ConflictError,
    InsufficientFundsError,
    UnauthorizedError,
    mapErrorToHttp,
} from "./errors/index.js";

// Idempotency
export {
    generateIdempotencyKey,
    checkIdempotency,
    recordIdempotency,
} from "./idempotency/index.js";

// Config
export { loadEnv } from "./config/env.js";
export type { Env } from "./config/env.js";

// Test Utils
export {
    createTestUser,
    createTestWallet,
    createTestOrder,
    resetFactoryCounter,
    withTestTransaction,
    seedTestDb,
} from "./test-utils/index.js";
