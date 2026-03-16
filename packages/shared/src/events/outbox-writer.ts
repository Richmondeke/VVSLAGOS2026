import type { EventMap, EventType } from "@vvs/contracts";
import type { ScopedClient } from "../db/client.js";
import { events } from "../schema.js";

/**
 * Writes an event to the outbox table within an existing Drizzle transaction.
 * The event will be picked up by the relay worker and published to BullMQ.
 */
export async function writeToOutbox<T extends EventType>(
    db: ScopedClient,
    eventType: T,
    payload: EventMap[T],
    idempotencyKey: string,
    orderingKey?: string,
): Promise<void> {
    await db.insert(events).values({
        eventType,
        eventVersion: 1,
        payload,
        idempotencyKey,
        orderingKey,
    });
}
