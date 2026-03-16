import {
    closeAllConnections,
    closeAllQueues,
    createScopedClient,
    startRelayLoop,
} from "@vvs/shared";
import { createChildLogger } from "@vvs/shared";

const logger = createChildLogger("workers");

logger.info("Starting VVS Workers...");

const db = createScopedClient(
    "outbox",
    process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev",
);

// Start the outbox relay worker
const relay = startRelayLoop(db, 1000, 100);
logger.info("Outbox relay worker started (polling every 1s)");

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
