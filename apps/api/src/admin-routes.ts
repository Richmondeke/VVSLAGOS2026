import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { requireAdmin, requireRole, getAdminRole } from "@vvs/platform";
import { createUsersRepo, getPendingApprovals, approveUser, rejectUser } from "@vvs/auth";
import { createOrdersRepo } from "@vvs/marketplace";

export type AdminApiOpts = {
    authDb: ScopedClient;
    marketplaceDb: ScopedClient;
    platformDb: ScopedClient;
};

export const adminApiRoutes: FastifyPluginAsync<AdminApiOpts> = async (app, opts) => {
    const { authDb, marketplaceDb, platformDb } = opts;
    const usersRepo = createUsersRepo(authDb);
    const ordersRepo = createOrdersRepo(marketplaceDb);

    async function checkAdmin(request: any): Promise<string> {
        const userId = request.headers["x-admin-user-id"] as string;
        if (!userId) throw Object.assign(new Error("Missing admin user ID"), { statusCode: 401 });
        await requireAdmin(platformDb, userId);
        return userId;
    }

    // --- Dashboard Stats ---
    app.get("/admin/api/stats", async (request, reply) => {
        await checkAdmin(request);
        const [userCounts, orderCounts] = await Promise.all([
            usersRepo.countByStatus(),
            ordersRepo.countByStatus(),
        ]);

        const totalMembers = Object.values(userCounts).reduce((a, b) => a + b, 0);
        const pendingApprovals = userCounts.pending_approval ?? 0;
        const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);
        const disputedOrders = orderCounts.disputed ?? 0;
        const fundedOrders = (orderCounts.funded ?? 0) + (orderCounts.in_progress ?? 0) +
            (orderCounts.delivered ?? 0) + (orderCounts.pending_approval ?? 0);

        return reply.send({
            totalMembers,
            pendingApprovals,
            totalOrders,
            disputedOrders,
            activeOrders: fundedOrders,
            disputeRate: totalOrders > 0 ? ((disputedOrders / totalOrders) * 100).toFixed(1) : "0.0",
            ordersByStatus: orderCounts,
            membersByStatus: userCounts,
        });
    });

    // --- Members List ---
    app.get<{
        Querystring: { page?: string; status?: string; search?: string };
    }>("/admin/api/members", async (request, reply) => {
        await checkAdmin(request);
        const { page, status, search } = request.query;
        const result = await usersRepo.listUsers({
            page: page ? Number.parseInt(page, 10) : 1,
            status: status || undefined,
            search: search || undefined,
        });
        return reply.send(result);
    });

    // --- Member Detail ---
    app.get<{ Params: { id: string } }>("/admin/api/members/:id", async (request, reply) => {
        await checkAdmin(request);
        const user = await usersRepo.findById(request.params.id);
        if (!user) return reply.status(404).send({ message: "User not found" });
        return reply.send(user);
    });

    // --- Approval Queue ---
    app.get("/admin/api/members/approvals", async (request, reply) => {
        await checkAdmin(request);
        const approvals = await getPendingApprovals(authDb);
        return reply.send(approvals);
    });

    // --- Approve Member ---
    app.post<{
        Params: { id: string };
        Body: { provisionalVerification?: boolean };
    }>("/admin/api/members/:id/approve", {
        schema: {
            body: {
                type: "object",
                properties: { provisionalVerification: { type: "boolean" } },
            },
        },
    }, async (request, reply) => {
        const adminId = await checkAdmin(request);
        await approveUser(authDb, request.params.id, adminId);
        return reply.send({ status: "approved" });
    });

    // --- Reject Member ---
    app.post<{
        Params: { id: string };
        Body: { reason: string };
    }>("/admin/api/members/:id/reject", {
        schema: {
            body: {
                type: "object",
                required: ["reason"],
                properties: { reason: { type: "string", minLength: 1 } },
            },
        },
    }, async (request, reply) => {
        const adminId = await checkAdmin(request);
        await rejectUser(authDb, request.params.id, adminId, request.body.reason);
        return reply.send({ status: "rejected" });
    });

    // --- Orders List ---
    app.get<{
        Querystring: { page?: string; status?: string };
    }>("/admin/api/orders", async (request, reply) => {
        await checkAdmin(request);
        const { page, status } = request.query;
        const result = await ordersRepo.listAll(
            page ? Number.parseInt(page, 10) : 1,
            20,
            status || undefined,
        );
        return reply.send(result);
    });

    // --- Order Detail ---
    app.get<{ Params: { id: string } }>("/admin/api/orders/:id", async (request, reply) => {
        await checkAdmin(request);
        const order = await ordersRepo.findById(request.params.id);
        if (!order) return reply.status(404).send({ message: "Order not found" });
        const stateLog = await ordersRepo.getStateLog(request.params.id);
        return reply.send({ ...order, stateLog });
    });

    // --- Disputes (orders with disputed status) ---
    app.get<{
        Querystring: { page?: string };
    }>("/admin/api/disputes", async (request, reply) => {
        await checkAdmin(request);
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const result = await ordersRepo.listAll(page, 20, "disputed");
        return reply.send(result);
    });

    // --- Admin role check ---
    app.get("/admin/api/me", async (request, reply) => {
        const userId = request.headers["x-admin-user-id"] as string;
        if (!userId) return reply.status(401).send({ message: "Not authenticated" });
        const role = await getAdminRole(platformDb, userId);
        return reply.send({ userId, role });
    });
};
