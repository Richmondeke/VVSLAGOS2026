import type { ScopedClient } from "@vvs/shared";
import { createWorker, createChildLogger, writeToOutbox, getQueue } from "@vvs/shared";
import { Worker } from "bullmq";
import { createOrdersRepo } from "@vvs/marketplace";

const logger = createChildLogger("marketplace-consumers");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Starts BullMQ workers for marketplace domain events.
 */
export function startMarketplaceConsumers(marketplaceDb: ScopedClient): { fundedWorker: unknown; inactivityWorker: unknown } {
    // When an order is funded, schedule inactivity check jobs
    const fundedWorker = createWorker(
        "marketplace.order.funded",
        async (job) => {
            const { orderId, providerId } = job.data as {
                orderId: string;
                providerId: string;
            };
            logger.info({ orderId }, "Processing marketplace.order.funded — scheduling inactivity checks");

            const queue = getQueue("marketplace.order.funded");

            // Schedule 7-day nudge
            await queue.add(
                `inactivity-nudge-${orderId}`,
                { orderId, providerId, type: "nudge" } as any,
                { delay: SEVEN_DAYS_MS, jobId: `nudge-${orderId}` },
            );

            // Schedule 14-day escalation
            await queue.add(
                `inactivity-escalation-${orderId}`,
                { orderId, providerId, type: "escalation" } as any,
                { delay: FOURTEEN_DAYS_MS, jobId: `escalation-${orderId}` },
            );
        },
    );

    // Process inactivity delayed jobs
    const connection = {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
    };

    const inactivityWorker = new Worker(
        "marketplace.order.inactivity",
        async (job) => {
            const { orderId, providerId, type } = job.data as {
                orderId: string;
                providerId: string;
                type: "nudge" | "escalation";
            };

            const ordersRepo = createOrdersRepo(marketplaceDb);
            const order = await ordersRepo.findById(orderId);
            if (!order) return;

            // Only act if order is still in funded state (provider hasn't started)
            if (order.status !== "funded") {
                logger.info({ orderId, status: order.status }, "Order no longer funded, skipping inactivity action");
                return;
            }

            if (type === "nudge") {
                logger.info({ orderId, providerId }, "7-day inactivity nudge");
                await writeToOutbox(
                    marketplaceDb,
                    "marketplace.order.inactivity_nudge" as any,
                    { orderId, providerId, daysInactive: 7, timestamp: new Date() },
                    `inactivity-nudge-${orderId}`,
                );
            } else {
                logger.info({ orderId, providerId }, "14-day inactivity escalation");
                await writeToOutbox(
                    marketplaceDb,
                    "marketplace.order.inactivity_escalation" as any,
                    { orderId, providerId, daysInactive: 14, timestamp: new Date() },
                    `inactivity-escalation-${orderId}`,
                );
            }
        },
        { connection, concurrency: 5 },
    );

    logger.info("Marketplace event consumers started");

    return { fundedWorker, inactivityWorker };
}
