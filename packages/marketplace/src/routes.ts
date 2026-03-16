import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import type { IIdentityService, IWalletService, IEscrowService } from "@vvs/contracts";
import { createListing, updateListing, pauseListing, deleteListing } from "./listings.js";
import { searchListings } from "./discovery.js";
import { createListingsRepo } from "./repositories/listings.js";
import { createOrderSaga } from "./order-saga.js";

export type MarketplaceRoutesOpts = {
    db: ScopedClient;
    identityService: IIdentityService;
    walletService: IWalletService;
    escrowService: IEscrowService;
};

export const marketplaceRoutes: FastifyPluginAsync<MarketplaceRoutesOpts> = async (app, opts) => {
    const { db, identityService, walletService, escrowService } = opts;
    const saga = createOrderSaga({ db, walletService, escrowService });

    // --- Listings ---

    // POST /marketplace/listings — create listing
    app.post<{
        Body: {
            title: string;
            description: string;
            category: string;
            pricingModel: "fixed" | "hourly" | "project";
            deliverables: string[];
            tiers: { name: "basic" | "standard" | "premium"; price: number; description: string }[];
        };
    }>(
        "/marketplace/listings",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["title", "description", "category", "pricingModel", "tiers"],
                    properties: {
                        title: { type: "string", minLength: 1 },
                        description: { type: "string" },
                        category: { type: "string", minLength: 1 },
                        pricingModel: { type: "string", enum: ["fixed", "hourly", "project"] },
                        deliverables: { type: "array", items: { type: "string" } },
                        tiers: {
                            type: "array",
                            minItems: 1,
                            items: {
                                type: "object",
                                required: ["name", "price", "description"],
                                properties: {
                                    name: { type: "string", enum: ["basic", "standard", "premium"] },
                                    price: { type: "number", minimum: 1 },
                                    description: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const listing = await createListing(db, identityService, userId, request.body);
            return reply.status(201).send(listing);
        },
    );

    // GET /marketplace/listings — search/discover
    app.get<{
        Querystring: {
            q?: string;
            category?: string;
            minPrice?: string;
            maxPrice?: string;
            sort?: "relevance" | "rating" | "price_asc" | "price_desc" | "newest";
            page?: string;
            pageSize?: string;
        };
    }>("/marketplace/listings", async (request, reply) => {
        const result = await searchListings(db, {
            query: request.query.q,
            category: request.query.category,
            minPrice: request.query.minPrice ? Number(request.query.minPrice) : undefined,
            maxPrice: request.query.maxPrice ? Number(request.query.maxPrice) : undefined,
            sort: request.query.sort,
            page: Number.parseInt(request.query.page ?? "1", 10),
            pageSize: Number.parseInt(request.query.pageSize ?? "20", 10),
        });
        return reply.send(result);
    });

    // GET /marketplace/listings/:id — listing detail
    app.get<{
        Params: { id: string };
    }>("/marketplace/listings/:id", async (request, reply) => {
        const repo = createListingsRepo(db);
        const listing = await repo.findById(request.params.id);
        if (!listing) return reply.status(404).send({ error: "Listing not found" });
        const tiers = await repo.getPricingTiers(request.params.id);
        return reply.send({ ...listing, tiers });
    });

    // --- Orders ---

    // POST /marketplace/orders — create order (client)
    app.post<{
        Body: {
            listingId: string;
            selectedTierId: string;
        };
    }>(
        "/marketplace/orders",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["listingId", "selectedTierId"],
                    properties: {
                        listingId: { type: "string", format: "uuid" },
                        selectedTierId: { type: "string", format: "uuid" },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const order = await saga.createOrder({
                listingId: request.body.listingId,
                clientId: userId,
                selectedTierId: request.body.selectedTierId,
                milestones: [],
            });
            return reply.status(201).send(order);
        },
    );

    // POST /marketplace/orders/:id/accept — provider accepts
    app.post<{
        Params: { id: string };
    }>("/marketplace/orders/:id/accept", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await saga.acceptOrder(request.params.id, userId);
        return reply.send({ status: "accepted" });
    });

    // POST /marketplace/orders/:id/decline — provider declines
    app.post<{
        Params: { id: string };
        Body: { reason?: string };
    }>("/marketplace/orders/:id/decline", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await saga.declineOrder(request.params.id, userId, request.body?.reason);
        return reply.send({ status: "declined" });
    });

    // POST /marketplace/orders/:id/fund — client funds
    app.post<{
        Params: { id: string };
        Body: { paymentSource?: "wallet_debit" | "direct_paystack" };
    }>("/marketplace/orders/:id/fund", async (request, reply) => {
        await saga.fund(request.params.id, request.body?.paymentSource ?? "wallet_debit");
        return reply.send({ status: "funded" });
    });

    // POST /marketplace/orders/:id/deliver — provider submits deliverables
    app.post<{
        Params: { id: string };
        Body: {
            description: string;
            attachmentUrls: string[];
        };
    }>(
        "/marketplace/orders/:id/deliver",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["description", "attachmentUrls"],
                    properties: {
                        description: { type: "string" },
                        attachmentUrls: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            await saga.submitDeliverable(request.params.id, userId, {
                milestoneId: "",
                description: request.body.description,
                attachmentUrls: request.body.attachmentUrls,
            });
            return reply.send({ status: "delivered" });
        },
    );

    // POST /marketplace/orders/:id/revise — client requests revision
    app.post<{
        Params: { id: string };
        Body: { notes: string };
    }>(
        "/marketplace/orders/:id/revise",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["notes"],
                    properties: {
                        notes: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            await saga.requestRevision(request.params.id, userId, request.body.notes);
            return reply.send({ status: "revision_requested" });
        },
    );

    // POST /marketplace/orders/:id/approve — client approves deliverables
    app.post<{
        Params: { id: string };
    }>("/marketplace/orders/:id/approve", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await saga.approveDeliverable(request.params.id, userId);
        return reply.send({ status: "completed" });
    });

    // POST /marketplace/orders/:id/dispute — either party raises dispute
    app.post<{
        Params: { id: string };
        Body: { reason: string };
    }>(
        "/marketplace/orders/:id/dispute",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["reason"],
                    properties: {
                        reason: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            await saga.raiseDispute(request.params.id, userId, request.body.reason);
            return reply.send({ status: "disputed" });
        },
    );

    // POST /marketplace/orders/:id/cancel — client cancels
    app.post<{
        Params: { id: string };
    }>("/marketplace/orders/:id/cancel", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await saga.cancelOrder(request.params.id, userId);
        return reply.send({ status: "cancelled" });
    });

    // GET /marketplace/orders/:id — order detail
    app.get<{
        Params: { id: string };
    }>("/marketplace/orders/:id", async (request, reply) => {
        const order = await saga.getOrder(request.params.id);
        return reply.send(order);
    });

    // GET /marketplace/orders — list own orders
    app.get<{
        Querystring: {
            role?: "client" | "provider";
            page?: string;
            pageSize?: string;
        };
    }>("/marketplace/orders", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const { createOrdersRepo } = await import("./repositories/orders.js");
        const ordersRepo = createOrdersRepo(db);
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const pageSize = Number.parseInt(request.query.pageSize ?? "20", 10);
        const orders = await ordersRepo.listByUser(userId, request.query.role, page, pageSize);
        return reply.send(orders);
    });
};
