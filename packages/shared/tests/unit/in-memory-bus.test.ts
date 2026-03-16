import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryEventBus } from "../../src/events/in-memory-bus.js";

describe("InMemoryEventBus", () => {
    let bus: InMemoryEventBus;

    beforeEach(() => {
        bus = new InMemoryEventBus();
    });

    it("emits events and calls handlers", async () => {
        const received: unknown[] = [];
        bus.on("auth.user.registered", (payload) => {
            received.push(payload);
        });

        const payload = {
            userId: "user-1",
            email: "test@test.com",
            tier: "free" as const,
            timestamp: new Date(),
        };

        await bus.emit("auth.user.registered", payload);
        expect(received).toHaveLength(1);
        expect(received[0]).toEqual(payload);
    });

    it("tracks all published events", async () => {
        await bus.emit("auth.user.registered", {
            userId: "u1",
            tier: "free",
            timestamp: new Date(),
        });
        await bus.emit("auth.user.deactivated", {
            userId: "u2",
            timestamp: new Date(),
        });

        expect(bus.getPublished()).toHaveLength(2);
    });

    it("filters events by type", async () => {
        await bus.emit("auth.user.registered", {
            userId: "u1",
            tier: "free",
            timestamp: new Date(),
        });
        await bus.emit("auth.user.deactivated", {
            userId: "u2",
            timestamp: new Date(),
        });

        const registered = bus.getPublishedByType("auth.user.registered");
        expect(registered).toHaveLength(1);
        expect(registered[0].userId).toBe("u1");
    });

    it("clear resets state", async () => {
        await bus.emit("auth.user.registered", {
            userId: "u1",
            tier: "free",
            timestamp: new Date(),
        });
        bus.clear();
        expect(bus.getPublished()).toHaveLength(0);
    });
});
