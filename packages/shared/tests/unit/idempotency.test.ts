import { describe, expect, it } from "vitest";
import { generateIdempotencyKey } from "../../src/idempotency/index.js";

describe("Idempotency", () => {
    it("generateIdempotencyKey produces deterministic output", () => {
        const key1 = generateIdempotencyKey("order", "abc", "123");
        const key2 = generateIdempotencyKey("order", "abc", "123");
        expect(key1).toBe(key2);
    });

    it("different inputs produce different keys", () => {
        const key1 = generateIdempotencyKey("order", "abc");
        const key2 = generateIdempotencyKey("order", "def");
        expect(key1).not.toBe(key2);
    });

    it("key is a hex string", () => {
        const key = generateIdempotencyKey("test", "data");
        expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
});
