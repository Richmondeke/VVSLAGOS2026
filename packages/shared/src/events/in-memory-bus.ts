import type { EventMap, EventType } from "@vvs/contracts";

type Handler<T extends EventType> = (payload: EventMap[T]) => void | Promise<void>;

/**
 * In-memory event bus for use in Vitest tests.
 * No Redis or BullMQ required — events are dispatched synchronously.
 */
export class InMemoryEventBus {
    private handlers = new Map<string, Handler<EventType>[]>();
    private published: { eventType: string; payload: unknown }[] = [];

    on<T extends EventType>(eventType: T, handler: Handler<T>): void {
        const existing = this.handlers.get(eventType) ?? [];
        existing.push(handler as Handler<EventType>);
        this.handlers.set(eventType, existing);
    }

    async emit<T extends EventType>(eventType: T, payload: EventMap[T]): Promise<void> {
        this.published.push({ eventType, payload });
        const handlers = this.handlers.get(eventType) ?? [];
        for (const handler of handlers) {
            await handler(payload);
        }
    }

    getPublished(): { eventType: string; payload: unknown }[] {
        return [...this.published];
    }

    getPublishedByType<T extends EventType>(eventType: T): EventMap[T][] {
        return this.published
            .filter((e) => e.eventType === eventType)
            .map((e) => e.payload as EventMap[T]);
    }

    clear(): void {
        this.published = [];
        this.handlers.clear();
    }
}
