import type { EventMap, EventType } from "@vvs/contracts";
import { Queue, Worker } from "bullmq";
import type { ConnectionOptions, Processor } from "bullmq";

const DEFAULT_CONNECTION: ConnectionOptions = {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
};

const queues = new Map<string, Queue>();

/**
 * Gets or creates a typed BullMQ queue for a specific event type.
 */
export function getQueue<T extends EventType>(
    eventType: T,
    connection?: ConnectionOptions,
): Queue<EventMap[T]> {
    const existing = queues.get(eventType);
    if (existing) {
        return existing as Queue<EventMap[T]>;
    }

    const queue = new Queue<EventMap[T]>(eventType, {
        connection: connection ?? DEFAULT_CONNECTION,
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: 1000,
            removeOnFail: 5000,
        },
    });

    queues.set(eventType, queue as unknown as Queue);
    return queue;
}

/**
 * Creates a typed BullMQ worker for a specific event type.
 */
export function createWorker<T extends EventType>(
    eventType: T,
    processor: Processor<EventMap[T]>,
    connection?: ConnectionOptions,
): Worker<EventMap[T]> {
    return new Worker<EventMap[T]>(eventType, processor, {
        connection: connection ?? DEFAULT_CONNECTION,
        concurrency: 5,
    });
}

/**
 * Closes all queues. Call during graceful shutdown.
 */
export async function closeAllQueues(): Promise<void> {
    const entries = [...queues.values()];
    queues.clear();
    await Promise.all(entries.map((q) => q.close()));
}
