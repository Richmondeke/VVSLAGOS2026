import { eq, or, sql, desc } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { orders, orderStateLog, deliverables, revisionRequests } from "../schema.js";

export type OrderRow = typeof orders.$inferSelect;
export type OrderStateLogRow = typeof orderStateLog.$inferSelect;
export type DeliverableRow = typeof deliverables.$inferSelect;
export type RevisionRequestRow = typeof revisionRequests.$inferSelect;

export type NewOrder = {
    listingId: string;
    clientId: string;
    providerId: string;
    selectedTierId: string;
    amount: number;
    correlationId?: string;
};

export function createOrdersRepo(db: ScopedClient) {
    return {
        async create(data: NewOrder): Promise<OrderRow> {
            const rows = await db
                .insert(orders)
                .values({
                    listingId: data.listingId,
                    clientId: data.clientId,
                    providerId: data.providerId,
                    selectedTierId: data.selectedTierId,
                    amount: data.amount,
                    correlationId: data.correlationId ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findById(id: string): Promise<OrderRow | undefined> {
            const rows = await db.select().from(orders).where(eq(orders.id, id));
            return rows[0];
        },

        async updateStatus(id: string, status: OrderRow["status"]): Promise<OrderRow | undefined> {
            const rows = await db
                .update(orders)
                .set({ status, updatedAt: sql`NOW()` })
                .where(eq(orders.id, id))
                .returning();
            return rows[0];
        },

        async logTransition(data: {
            orderId: string;
            fromStatus: string;
            toStatus: string;
            actorId?: string;
            reason?: string;
            metadata?: unknown;
            correlationId?: string;
        }): Promise<OrderStateLogRow> {
            const rows = await db
                .insert(orderStateLog)
                .values({
                    orderId: data.orderId,
                    fromStatus: data.fromStatus,
                    toStatus: data.toStatus,
                    actorId: data.actorId ?? null,
                    reason: data.reason ?? null,
                    metadata: data.metadata ?? null,
                    correlationId: data.correlationId ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getStateLog(orderId: string): Promise<OrderStateLogRow[]> {
            return db
                .select()
                .from(orderStateLog)
                .where(eq(orderStateLog.orderId, orderId))
                .orderBy(orderStateLog.createdAt);
        },

        // --- Deliverables ---

        async addDeliverable(data: {
            orderId: string;
            uploadedBy: string;
            fileUrl: string;
            fileName: string;
            fileSize?: number;
            version?: number;
            notes?: string;
        }): Promise<DeliverableRow> {
            const rows = await db
                .insert(deliverables)
                .values({
                    orderId: data.orderId,
                    uploadedBy: data.uploadedBy,
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileSize: data.fileSize ?? null,
                    version: data.version ?? 1,
                    notes: data.notes ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async getDeliverables(orderId: string): Promise<DeliverableRow[]> {
            return db
                .select()
                .from(deliverables)
                .where(eq(deliverables.orderId, orderId))
                .orderBy(deliverables.uploadedAt);
        },

        // --- Revision Requests ---

        async listByUser(
            userId: string,
            role?: "client" | "provider",
            page = 1,
            pageSize = 20,
        ): Promise<{ items: OrderRow[]; total: number; page: number; pageSize: number }> {
            const condition =
                role === "client"
                    ? eq(orders.clientId, userId)
                    : role === "provider"
                      ? eq(orders.providerId, userId)
                      : or(eq(orders.clientId, userId), eq(orders.providerId, userId));

            const [countResult, items] = await Promise.all([
                db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(orders)
                    .where(condition),
                db
                    .select()
                    .from(orders)
                    .where(condition)
                    .orderBy(desc(orders.createdAt))
                    .limit(pageSize)
                    .offset((page - 1) * pageSize),
            ]);

            return {
                items,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        async addRevisionRequest(data: {
            orderId: string;
            requestedBy: string;
            notes?: string;
            specificFiles?: string[];
        }): Promise<RevisionRequestRow> {
            const rows = await db
                .insert(revisionRequests)
                .values({
                    orderId: data.orderId,
                    requestedBy: data.requestedBy,
                    notes: data.notes ?? null,
                    specificFiles: data.specificFiles ?? null,
                })
                .returning();
            return rows[0]!;
        },
    };
}
