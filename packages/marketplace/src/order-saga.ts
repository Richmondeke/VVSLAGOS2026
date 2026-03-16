import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, ValidationError, ForbiddenError, writeToOutbox } from "@vvs/shared";
import type {
    IWalletService,
    IEscrowService,
    OrderCreateInput,
    DeliverableInput,
    Order,
    OrderStatus,
    PricingTier,
} from "@vvs/contracts";
import { createOrdersRepo, type OrderRow } from "./repositories/orders.js";
import { createListingsRepo } from "./repositories/listings.js";
import { transitionOrder, type OrderState } from "./orders.js";

export type OrderSagaDeps = {
    db: ScopedClient;
    walletService: IWalletService;
    escrowService: IEscrowService;
};

function mapOrderRow(row: OrderRow, tier?: PricingTier): Order {
    return {
        id: row.id,
        listingId: row.listingId,
        clientId: row.clientId,
        providerId: row.providerId,
        selectedTier: tier ?? {
            id: row.selectedTierId,
            listingId: row.listingId,
            name: "basic",
            price: row.amount,
            description: "",
        },
        totalAmount: row.amount,
        status: row.status as OrderStatus,
        milestones: [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export function createOrderSaga(deps: OrderSagaDeps) {
    const { db, walletService, escrowService } = deps;

    return {
        async createOrder(input: OrderCreateInput): Promise<Order> {
            const ordersRepo = createOrdersRepo(db);
            const listingsRepo = createListingsRepo(db);

            const listing = await listingsRepo.findById(input.listingId);
            if (!listing) throw new NotFoundError("Listing", input.listingId);

            const tier = await listingsRepo.findPricingTierById(input.selectedTierId);
            if (!tier) throw new NotFoundError("PricingTier", input.selectedTierId);

            const order = await ordersRepo.create({
                listingId: input.listingId,
                clientId: input.clientId,
                providerId: listing.providerId,
                selectedTierId: input.selectedTierId,
                amount: tier.price,
            });

            // Log initial state
            await ordersRepo.logTransition({
                orderId: order.id,
                fromStatus: "none",
                toStatus: "draft",
                actorId: input.clientId,
            });

            return mapOrderRow(order);
        },

        async acceptOrder(orderId: string, providerId: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.providerId !== providerId) throw new ForbiddenError("Only the provider can accept this order");

            await transitionOrder(db, orderId, "accepted", providerId);
            await transitionOrder(db, orderId, "pending_funding", providerId);
        },

        async declineOrder(orderId: string, providerId: string, reason?: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.providerId !== providerId) throw new ForbiddenError("Only the provider can decline this order");

            await transitionOrder(db, orderId, "declined", providerId, reason);
        },

        async fund(orderId: string, paymentSource: "wallet_debit" | "direct_paystack"): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);

            if (order.status !== "pending_funding") {
                throw new ValidationError(`Order must be in 'pending_funding' state to fund, currently '${order.status}'`);
            }

            // Step 1: Create escrow
            let escrowAgreement;
            try {
                escrowAgreement = await escrowService.create({
                    orderId: order.id,
                    clientId: order.clientId,
                    providerId: order.providerId,
                    totalAmount: order.amount,
                    milestones: [],
                });
            } catch (err) {
                await transitionOrder(db, orderId, "cancelled", order.clientId, "Escrow creation failed");
                throw err;
            }

            // Step 2: Debit client wallet
            try {
                await walletService.debit(
                    order.clientId,
                    order.amount,
                    `order-fund-${orderId}`,
                );
            } catch (err) {
                await escrowService.cancel(escrowAgreement.id, "Wallet debit failed");
                await transitionOrder(db, orderId, "cancelled", order.clientId, "Wallet debit failed");
                throw err;
            }

            // Step 3: Mark escrow as funded
            try {
                await escrowService.markFunded(escrowAgreement.id);
            } catch (err) {
                // Compensate: credit wallet back
                await walletService.credit(order.clientId, order.amount, `order-fund-refund-${orderId}`);
                await transitionOrder(db, orderId, "cancelled", order.clientId, "Escrow funding failed");
                throw err;
            }

            // Step 4: Transition order to funded
            await transitionOrder(db, orderId, "funded", order.clientId);

            // Step 5: Write event
            await writeToOutbox(
                db,
                "marketplace.order.funded",
                {
                    orderId: order.id,
                    clientId: order.clientId,
                    providerId: order.providerId,
                    escrowId: escrowAgreement.id,
                    totalAmount: order.amount,
                    timestamp: new Date(),
                },
                `order-funded-${orderId}`,
            );
        },

        async startWork(orderId: string, providerId: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.providerId !== providerId) throw new ForbiddenError("Only the provider can start work");

            await transitionOrder(db, orderId, "in_progress", providerId);
        },

        async submitDeliverable(orderId: string, providerId: string, input: DeliverableInput): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.providerId !== providerId) throw new ForbiddenError("Only the provider can submit deliverables");

            // Add deliverable files
            for (const url of input.attachmentUrls) {
                await ordersRepo.addDeliverable({
                    orderId,
                    uploadedBy: providerId,
                    fileUrl: url,
                    fileName: url.split("/").pop() ?? "file",
                    notes: input.description,
                });
            }

            await transitionOrder(db, orderId, "delivered", providerId);
        },

        async requestRevision(orderId: string, clientId: string, notes: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.clientId !== clientId) throw new ForbiddenError("Only the client can request revisions");

            if (order.status !== "delivered") {
                throw new ValidationError("Can only request revision on delivered orders");
            }

            await ordersRepo.addRevisionRequest({
                orderId,
                requestedBy: clientId,
                notes,
            });

            // Transition back to in_progress for provider to address
            // Need delivered → pending_approval first, then back — or we allow delivered → in_progress
            // The state machine doesn't have delivered → in_progress, so we use a log entry
            // and keep status as delivered until provider resubmits
            await ordersRepo.logTransition({
                orderId,
                fromStatus: order.status,
                toStatus: "delivered",
                actorId: clientId,
                reason: `Revision requested: ${notes}`,
            });
        },

        async approveDeliverable(orderId: string, clientId: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.clientId !== clientId) throw new ForbiddenError("Only the client can approve deliverables");

            await transitionOrder(db, orderId, "pending_approval", clientId);

            // Release escrow
            const idempotencyKey = `release-${orderId}`;
            // Note: escrowId would be tracked on the order in a full implementation
            // For now we transition to completed after approval
            await transitionOrder(db, orderId, "completed", clientId);

            await writeToOutbox(
                db,
                "marketplace.order.completed",
                {
                    orderId: order.id,
                    clientId: order.clientId,
                    providerId: order.providerId,
                    totalAmount: order.amount,
                    timestamp: new Date(),
                },
                `order-completed-${orderId}`,
            );
        },

        async raiseDispute(orderId: string, raisedBy: string, reason: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);

            await transitionOrder(db, orderId, "disputed", raisedBy, reason);

            await writeToOutbox(
                db,
                "marketplace.order.disputed",
                {
                    orderId: order.id,
                    clientId: order.clientId,
                    providerId: order.providerId,
                    reason,
                    timestamp: new Date(),
                },
                `order-disputed-${orderId}`,
            );
        },

        async cancelOrder(orderId: string, clientId: string): Promise<void> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            if (order.clientId !== clientId) throw new ForbiddenError("Only the client can cancel this order");

            await transitionOrder(db, orderId, "cancelled", clientId, "Client cancelled");
        },

        async getOrder(orderId: string): Promise<Order> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            return mapOrderRow(order);
        },

        async getOrderStatus(orderId: string): Promise<OrderStatus> {
            const ordersRepo = createOrdersRepo(db);
            const order = await ordersRepo.findById(orderId);
            if (!order) throw new NotFoundError("Order", orderId);
            return order.status as OrderStatus;
        },
    };
}
