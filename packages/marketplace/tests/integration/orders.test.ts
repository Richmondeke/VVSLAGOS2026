import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createListingsRepo } from "../../src/repositories/listings.js";
import { createOrdersRepo } from "../../src/repositories/orders.js";
import { transitionOrder, isValidTransition, getValidTransitions } from "../../src/orders.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "marketplace,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

// Helper: create a listing + tier + order in a transaction
async function createTestOrder(tx: ScopedClient) {
    const listingsRepo = createListingsRepo(tx);
    const ordersRepo = createOrdersRepo(tx);

    const listing = await listingsRepo.create({
        providerId: crypto.randomUUID(),
        title: "Test Service",
        pricingModel: "fixed",
    });

    const tier = await listingsRepo.addPricingTier({
        listingId: listing.id,
        tierName: "basic",
        price: 50000,
    });

    const order = await ordersRepo.create({
        listingId: listing.id,
        clientId: crypto.randomUUID(),
        providerId: listing.providerId,
        selectedTierId: tier.id,
        amount: 50000,
    });

    return { listing, tier, order };
}

describe("Order State Machine — valid transitions", () => {
    it("isValidTransition returns true for valid transitions", () => {
        expect(isValidTransition("draft", "accepted")).toBe(true);
        expect(isValidTransition("draft", "declined")).toBe(true);
        expect(isValidTransition("draft", "cancelled")).toBe(true);
        expect(isValidTransition("accepted", "pending_funding")).toBe(true);
        expect(isValidTransition("pending_funding", "funded")).toBe(true);
        expect(isValidTransition("funded", "in_progress")).toBe(true);
        expect(isValidTransition("in_progress", "delivered")).toBe(true);
        expect(isValidTransition("delivered", "pending_approval")).toBe(true);
        expect(isValidTransition("pending_approval", "completed")).toBe(true);
        expect(isValidTransition("completed", "rated")).toBe(true);
    });

    it("isValidTransition returns true for dispute transitions", () => {
        expect(isValidTransition("funded", "disputed")).toBe(true);
        expect(isValidTransition("in_progress", "disputed")).toBe(true);
        expect(isValidTransition("delivered", "disputed")).toBe(true);
        expect(isValidTransition("pending_approval", "disputed")).toBe(true);
    });

    it("isValidTransition returns true for dispute resolutions", () => {
        expect(isValidTransition("disputed", "resolved_released")).toBe(true);
        expect(isValidTransition("disputed", "resolved_refunded")).toBe(true);
        expect(isValidTransition("disputed", "resolved_partial")).toBe(true);
    });

    it("isValidTransition returns true for cancellation branch", () => {
        expect(isValidTransition("draft", "cancelled")).toBe(true);
        expect(isValidTransition("accepted", "cancelled")).toBe(true);
        expect(isValidTransition("pending_funding", "cancelled")).toBe(true);
        expect(isValidTransition("funded", "cancelled")).toBe(true);
        expect(isValidTransition("cancelled", "refunded")).toBe(true);
    });

    it("getValidTransitions returns correct targets", () => {
        expect(getValidTransitions("draft")).toEqual(["accepted", "declined", "cancelled"]);
        expect(getValidTransitions("completed")).toEqual(["rated"]);
        expect(getValidTransitions("rated")).toEqual([]);
    });
});

describe("Order State Machine — invalid transitions", () => {
    it("rejects invalid transitions", () => {
        expect(isValidTransition("draft", "funded")).toBe(false);
        expect(isValidTransition("draft", "completed")).toBe(false);
        expect(isValidTransition("rated", "draft")).toBe(false);
        expect(isValidTransition("completed", "in_progress")).toBe(false);
        expect(isValidTransition("declined", "accepted")).toBe(false);
    });

    it("rejects cancellation after in_progress", () => {
        expect(isValidTransition("in_progress", "cancelled")).toBe(false);
        expect(isValidTransition("delivered", "cancelled")).toBe(false);
        expect(isValidTransition("completed", "cancelled")).toBe(false);
    });
});

describe("Order State Machine — DB transitions", () => {
    it("draft → accepted → pending_funding → funded → in_progress → delivered → pending_approval → completed → rated", async () => {
        await withTestTransaction(db, async (tx) => {
            const { order } = await createTestOrder(tx);
            const actorId = crypto.randomUUID();

            const transitions: Array<[string, string]> = [
                ["draft", "accepted"],
                ["accepted", "pending_funding"],
                ["pending_funding", "funded"],
                ["funded", "in_progress"],
                ["in_progress", "delivered"],
                ["delivered", "pending_approval"],
                ["pending_approval", "completed"],
                ["completed", "rated"],
            ];

            for (const [_from, to] of transitions) {
                await transitionOrder(tx, order.id, to as any, actorId);
            }

            // Verify final state
            const repo = createOrdersRepo(tx);
            const final = await repo.findById(order.id);
            expect(final!.status).toBe("rated");

            // Verify log has all entries
            const log = await repo.getStateLog(order.id);
            expect(log).toHaveLength(8);
            expect(log[0]!.fromStatus).toBe("draft");
            expect(log[0]!.toStatus).toBe("accepted");
            expect(log[7]!.fromStatus).toBe("completed");
            expect(log[7]!.toStatus).toBe("rated");
        });
    });

    it("dispute branch: funded → disputed → resolved_released", async () => {
        await withTestTransaction(db, async (tx) => {
            const { order } = await createTestOrder(tx);
            const actorId = crypto.randomUUID();

            await transitionOrder(tx, order.id, "accepted", actorId);
            await transitionOrder(tx, order.id, "pending_funding", actorId);
            await transitionOrder(tx, order.id, "funded", actorId);
            await transitionOrder(tx, order.id, "disputed", actorId, "Quality issue");
            await transitionOrder(tx, order.id, "resolved_released", actorId, "Resolved in provider favor");

            const repo = createOrdersRepo(tx);
            const final = await repo.findById(order.id);
            expect(final!.status).toBe("resolved_released");
        });
    });

    it("cancellation branch: accepted → cancelled → refunded", async () => {
        await withTestTransaction(db, async (tx) => {
            const { order } = await createTestOrder(tx);
            const actorId = crypto.randomUUID();

            await transitionOrder(tx, order.id, "accepted", actorId);
            await transitionOrder(tx, order.id, "cancelled", actorId, "Client changed mind");
            await transitionOrder(tx, order.id, "refunded", actorId);

            const repo = createOrdersRepo(tx);
            const final = await repo.findById(order.id);
            expect(final!.status).toBe("refunded");
        });
    });

    it("throws ValidationError for invalid transition", async () => {
        await withTestTransaction(db, async (tx) => {
            const { order } = await createTestOrder(tx);

            await expect(
                transitionOrder(tx, order.id, "funded"),
            ).rejects.toThrow("Invalid transition");
        });
    });

    it("transition log has correct entry after each state change", async () => {
        await withTestTransaction(db, async (tx) => {
            const { order } = await createTestOrder(tx);
            const actorId = crypto.randomUUID();

            await transitionOrder(tx, order.id, "accepted", actorId, "Provider accepted");

            const repo = createOrdersRepo(tx);
            const log = await repo.getStateLog(order.id);
            expect(log).toHaveLength(1);
            expect(log[0]!.fromStatus).toBe("draft");
            expect(log[0]!.toStatus).toBe("accepted");
            expect(log[0]!.actorId).toBe(actorId);
            expect(log[0]!.reason).toBe("Provider accepted");
        });
    });
});
