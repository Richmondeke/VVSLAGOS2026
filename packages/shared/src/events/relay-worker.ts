import type { EventMap, EventType } from "@vvs/contracts";
import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "../db/client.js";
import { createChildLogger } from "../logger/index.js";
import { events } from "../schema.js";
import { getQueue } from "./queue-factory.js";

const logger = createChildLogger("relay-worker");

/**
 * Polls the outbox for unpublished events and enqueues them to BullMQ.
 * Uses SELECT ... FOR UPDATE SKIP LOCKED to avoid double-processing
 * in multi-instance deployments.
 */
export async function relayOutboxEvents(db: ScopedClient, batchSize = 100): Promise<number> {
    const unpublished = await db.execute<{
        id: number;
        event_type: string;
        payload: unknown;
        ordering_key: string | null;
    }>(
        sql`SELECT id, event_type, payload, ordering_key
            FROM outbox.events
            WHERE published_at IS NULL
            ORDER BY created_at ASC
            LIMIT ${batchSize}
            FOR UPDATE SKIP LOCKED`,
    );

    if (unpublished.length === 0) {
        return 0;
    }

    let published = 0;

    for (const row of unpublished) {
        try {
            const queue = getQueue(row.event_type as EventType);
            await queue.add(row.event_type, row.payload as EventMap[EventType], {
                jobId: `outbox-${row.id}`,
                ...(row.ordering_key ? { group: { id: row.ordering_key } } : {}),
            });

            await db.update(events).set({ publishedAt: sql`NOW()` }).where(eq(events.id, row.id));

            published++;
        } catch (error) {
            logger.error(
                { eventId: row.id, eventType: row.event_type, error },
                "Failed to relay event",
            );
        }
    }

    logger.info({ published, total: unpublished.length }, "Relay cycle complete");
    return published;
}

/**
 * Starts a polling loop that relays outbox events at a fixed interval.
 */
export function startRelayLoop(
    db: ScopedClient,
    intervalMs = 1000,
    batchSize = 100,
): { stop: () => void } {
    let running = true;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
        if (!running) return;
        try {
            await relayOutboxEvents(db, batchSize);
        } catch (error) {
            logger.error({ error }, "Relay loop error");
        }
        if (running) {
            timeout = setTimeout(poll, intervalMs);
        }
    };

    poll();

    return {
        stop: () => {
            running = false;
            clearTimeout(timeout);
        },
    };
}
