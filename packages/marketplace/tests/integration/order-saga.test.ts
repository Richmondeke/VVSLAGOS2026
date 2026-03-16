import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import type { IWalletService, IEscrowService, EscrowAgreement } from "@vvs/contracts";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createOrderSaga, type OrderSagaDeps } from "../../src/order-saga.js";
import { createListingsRepo } from "../../src/repositories/listings.js";
import { createOrdersRepo } from "../../src/repositories/orders.js";

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

// Mock wallet service
function createMockWalletService(opts?: { debitFails?: boolean }): IWalletService {
    return {
        async create() { return {} as any; },
        async getBalance() { return { amount: 1000000, currency: "NGN" } as any; },
        async debit(_userId: string, _amount: number, _ref: string) {
            if (opts?.debitFails) throw new Error("Insufficient funds");
            return { success: true } as any;
        },
        async credit(_userId: string, _amount: number, _ref: string) {
            return { success: true } as any;
        },
        async withdraw() { return {} as any; },
    };
}

// Mock escrow service
function createMockEscrowService(opts?: {
    createFails?: boolean;
    markFundedFails?: boolean;
}): IEscrowService & { lastCreatedId: string | null } {
    let lastCreatedId: string | null = null;
    return {
        get lastCreatedId() { return lastCreatedId; },
        async create(input: any): Promise<EscrowAgreement> {
            if (opts?.createFails) throw new Error("Escrow creation failed");
            lastCreatedId = crypto.randomUUID();
            return {
                id: lastCreatedId,
                orderId: input.orderId,
                clientId: input.clientId,
                providerId: input.providerId,
                totalAmount: input.totalAmount,
                status: "created",
                milestones: [],
                createdAt: new Date(),
            } as EscrowAgreement;
        },
        async markFunded(_agreementId: string) {
            if (opts?.markFundedFails) throw new Error("Mark funded failed");
        },
        async approveMilestone() {},
        async releaseMilestone() { return { success: true } as any; },
        async cancel() {},
        async dispute() {},
    };
}

// Helper: create a listing + tier for order creation
async function createTestListingAndTier(tx: ScopedClient) {
    const listingsRepo = createListingsRepo(tx);
    const providerId = crypto.randomUUID();

    const listing = await listingsRepo.create({
        providerId,
        title: "Test Service",
        pricingModel: "fixed",
    });

    const tier = await listingsRepo.addPricingTier({
        listingId: listing.id,
        tierName: "basic",
        price: 50000,
    });

    return { listing, tier, providerId };
}

describe("Order Saga — Happy Path", () => {
    it("full lifecycle: create → accept → fund → start → deliver → approve", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const walletService = createMockWalletService();
            const escrowService = createMockEscrowService();
            const saga = createOrderSaga({ db: tx, walletService, escrowService });

            // Create order
            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });
            expect(order.status).toBe("draft");
            expect(order.clientId).toBe(clientId);
            expect(order.providerId).toBe(providerId);

            // Accept
            await saga.acceptOrder(order.id, providerId);
            let status = await saga.getOrderStatus(order.id);
            expect(status).toBe("pending_funding");

            // Fund
            await saga.fund(order.id, "wallet_debit");
            status = await saga.getOrderStatus(order.id);
            expect(status).toBe("funded");

            // Start work
            await saga.startWork(order.id, providerId);
            status = await saga.getOrderStatus(order.id);
            expect(status).toBe("in_progress");

            // Submit deliverable
            await saga.submitDeliverable(order.id, providerId, {
                milestoneId: "",
                description: "Final delivery",
                attachmentUrls: ["https://files.example.com/output.zip"],
            });
            status = await saga.getOrderStatus(order.id);
            expect(status).toBe("delivered");

            // Approve
            await saga.approveDeliverable(order.id, clientId);
            status = await saga.getOrderStatus(order.id);
            expect(status).toBe("completed");
        });
    });
});

describe("Order Saga — Compensation", () => {
    it("escrow creation fails → order transitions to cancelled, no wallet debit", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const walletDebit = vi.fn();
            const walletService = createMockWalletService();
            walletService.debit = walletDebit;
            const escrowService = createMockEscrowService({ createFails: true });
            const saga = createOrderSaga({ db: tx, walletService, escrowService });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);

            await expect(saga.fund(order.id, "wallet_debit")).rejects.toThrow("Escrow creation failed");

            // Wallet debit should never have been called
            expect(walletDebit).not.toHaveBeenCalled();

            // Order should be cancelled
            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("cancelled");
        });
    });

    it("wallet debit fails → escrow cancelled, order cancelled", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const escrowCancel = vi.fn();
            const walletService = createMockWalletService({ debitFails: true });
            const escrowService = createMockEscrowService();
            escrowService.cancel = escrowCancel;
            const saga = createOrderSaga({ db: tx, walletService, escrowService });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);

            await expect(saga.fund(order.id, "wallet_debit")).rejects.toThrow("Insufficient funds");

            // Escrow cancel should have been called
            expect(escrowCancel).toHaveBeenCalled();

            // Order should be cancelled
            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("cancelled");
        });
    });

    it("escrow markFunded fails → wallet credit restored, order cancelled", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const walletCredit = vi.fn().mockResolvedValue({ success: true });
            const walletService = createMockWalletService();
            walletService.credit = walletCredit;
            const escrowService = createMockEscrowService({ markFundedFails: true });
            const saga = createOrderSaga({ db: tx, walletService, escrowService });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);

            await expect(saga.fund(order.id, "wallet_debit")).rejects.toThrow("Mark funded failed");

            // Wallet credit (refund) should have been called
            expect(walletCredit).toHaveBeenCalledWith(clientId, 50000, expect.stringContaining("refund"));

            // Order should be cancelled
            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("cancelled");
        });
    });
});

describe("Order Saga — Dispute Path", () => {
    it("fund → dispute → order in disputed state", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);
            await saga.fund(order.id, "wallet_debit");
            await saga.startWork(order.id, providerId);
            await saga.raiseDispute(order.id, clientId, "Quality issue");

            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("disputed");
        });
    });
});

describe("Order Saga — Cancellation Path", () => {
    it("client cancels before work starts", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.cancelOrder(order.id, clientId);

            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("cancelled");
        });
    });

    it("non-client cannot cancel", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await expect(
                saga.cancelOrder(order.id, crypto.randomUUID()),
            ).rejects.toThrow("Only the client");
        });
    });
});

describe("Order Saga — Revision Request", () => {
    it("client can request revision on delivered order", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);
            await saga.fund(order.id, "wallet_debit");
            await saga.startWork(order.id, providerId);
            await saga.submitDeliverable(order.id, providerId, {
                milestoneId: "",
                description: "First attempt",
                attachmentUrls: ["https://files.example.com/v1.zip"],
            });

            await saga.requestRevision(order.id, clientId, "Need changes to colors");

            // Order stays in delivered state (per the saga logic)
            const status = await saga.getOrderStatus(order.id);
            expect(status).toBe("delivered");

            // Verify revision was logged
            const ordersRepo = createOrdersRepo(tx);
            const log = await ordersRepo.getStateLog(order.id);
            const revisionLog = log.find((l) => l.reason?.includes("Revision requested"));
            expect(revisionLog).toBeDefined();
        });
    });
});

describe("Order Saga — Authorization", () => {
    it("non-provider cannot accept order", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await expect(
                saga.acceptOrder(order.id, crypto.randomUUID()),
            ).rejects.toThrow("Only the provider");
        });
    });

    it("non-provider cannot start work", async () => {
        await withTestTransaction(db, async (tx) => {
            const { listing, tier, providerId } = await createTestListingAndTier(tx);
            const clientId = crypto.randomUUID();
            const saga = createOrderSaga({
                db: tx,
                walletService: createMockWalletService(),
                escrowService: createMockEscrowService(),
            });

            const order = await saga.createOrder({
                listingId: listing.id,
                clientId,
                selectedTierId: tier.id,
                milestones: [],
            });

            await saga.acceptOrder(order.id, providerId);
            await saga.fund(order.id, "wallet_debit");

            await expect(
                saga.startWork(order.id, crypto.randomUUID()),
            ).rejects.toThrow("Only the provider");
        });
    });
});
