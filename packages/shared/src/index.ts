// @vvs/shared — Infrastructure primitives: DB client, BullMQ, logger, errors, test utils
export { createScopedClient, closeAllConnections } from "./db/client.js";
export type { ScopedClient } from "./db/client.js";
export { runMigrations } from "./db/migration-runner.js";
export { outboxSchema, events, deadLetters, consumerOffsets } from "./schema.js";
