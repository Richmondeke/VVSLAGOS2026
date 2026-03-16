import { AsyncLocalStorage } from "node:async_hooks";
import pino from "pino";

const correlationStore = new AsyncLocalStorage<{ correlationId: string }>();

const rootLogger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    transport:
        process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
});

/**
 * Creates a child logger namespaced to a specific package.
 */
export function createChildLogger(packageName: string): pino.Logger {
    return rootLogger.child({ packageName });
}

/**
 * Runs a function within a correlation ID context.
 * All logs within the callback will include the correlationId.
 */
export function withCorrelationId<T>(correlationId: string, fn: () => T): T {
    return correlationStore.run({ correlationId }, fn);
}

/**
 * Gets the current correlation ID from AsyncLocalStorage, if available.
 */
export function getCorrelationId(): string | undefined {
    return correlationStore.getStore()?.correlationId;
}

/**
 * Returns a Pino logger that automatically includes the correlation ID.
 */
export function getLogger(packageName?: string): pino.Logger {
    const base = packageName ? rootLogger.child({ packageName }) : rootLogger;
    const store = correlationStore.getStore();
    if (store) {
        return base.child({ correlationId: store.correlationId });
    }
    return base;
}

export { rootLogger, correlationStore };
