import {
    closeAllConnections,
    closeAllQueues,
    createScopedClient,
    startRelayLoop,
} from "@vvs/shared";
import { createChildLogger } from "@vvs/shared";
import { startMembersConsumers } from "./jobs/members-consumers.js";
import { startMarketplaceConsumers } from "./jobs/marketplace-consumers.js";

const logger = createChildLogger("workers");

logger.info("Starting VVS Workers...");

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

const db = createScopedClient("outbox", DB_URL);
const membersDb = createScopedClient("members", DB_URL);

// Start the outbox relay worker
const relay = startRelayLoop(db, 1000, 100);
logger.info("Outbox relay worker started (polling every 1s)");

// Start domain event consumers
const marketplaceDb = createScopedClient("marketplace", DB_URL);

const membersConsumers = startMembersConsumers(membersDb);
logger.info("Members event consumers started");

const marketplaceConsumers = startMarketplaceConsumers(marketplaceDb);
logger.info("Marketplace event consumers started");

// Graceful shutdown
const shutdown = async () => {
    logger.info("Shutting down workers...");
    relay.stop();
    await closeAllQueues();
    await closeAllConnections();
    logger.info("Workers stopped");
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
