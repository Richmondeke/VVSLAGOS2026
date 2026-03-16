import { describe, expect, it } from "vitest";
import { createChildLogger, getCorrelationId, withCorrelationId } from "../../src/logger/index.js";

describe("Logger", () => {
    it("createChildLogger returns a logger with packageName", () => {
        const logger = createChildLogger("auth");
        expect(logger).toBeDefined();
    });

    it("withCorrelationId sets and retrieves correlation ID", () => {
        withCorrelationId("test-corr-123", () => {
            expect(getCorrelationId()).toBe("test-corr-123");
        });
    });

    it("correlation ID is undefined outside of context", () => {
        expect(getCorrelationId()).toBeUndefined();
    });

    it("correlation ID threads through async hops", async () => {
        await withCorrelationId("async-corr-456", async () => {
            expect(getCorrelationId()).toBe("async-corr-456");

            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(getCorrelationId()).toBe("async-corr-456");

            await Promise.resolve().then(() => {
                expect(getCorrelationId()).toBe("async-corr-456");
            });
        });
    });
});
