import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { requireAdmin, requireRole } from "./admin/auth.js";
import { getSettings, setSetting } from "./admin/settings.js";
import { fileReport, getPendingReports, assignReport, resolveReport } from "./moderation/reporting.js";
import { warnUser, suspendUser, banUser, reinstateUser } from "./moderation/actions.js";

export type PlatformRoutesOpts = {
    db: ScopedClient;
};

export const platformRoutes: FastifyPluginAsync<PlatformRoutesOpts> = async (app, opts) => {
    const { db } = opts;

    // --- Admin middleware helper ---
    async function checkAdmin(request: any): Promise<string> {
        const userId = (request as { userId: string }).userId;
        await requireAdmin(db, userId);
        return userId;
    }

    // --- Admin Dashboard ---

    // GET /admin/dashboard
    app.get("/admin/dashboard", async (request, reply) => {
        await checkAdmin(request);
        // TODO: aggregate analytics
        return reply.send({ status: "ok", message: "Dashboard analytics not yet implemented" });
    });

    // --- Admin Settings ---

    // GET /admin/settings
    app.get("/admin/settings", async (request, reply) => {
        await checkAdmin(request);
        const settings = await getSettings(db);
        return reply.send(settings);
    });

    // PATCH /admin/settings/:key
    app.patch<{
        Params: { key: string };
        Body: { value: unknown };
    }>(
        "/admin/settings/:key",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["value"],
                    properties: { value: {} },
                },
            },
        },
        async (request, reply) => {
            const adminId = await checkAdmin(request);
            await requireRole(db, adminId, "super_admin");
            await setSetting(db, request.params.key, request.body.value, adminId);
            return reply.send({ status: "updated" });
        },
    );

    // --- Moderation ---

    // POST /admin/reports — file report (any user)
    app.post<{
        Body: {
            reportedUserId?: string;
            reportedContentId?: string;
            category: string;
            description: string;
        };
    }>(
        "/admin/reports",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["category", "description"],
                    properties: {
                        reportedUserId: { type: "string" },
                        reportedContentId: { type: "string" },
                        category: { type: "string", enum: ["spam", "inappropriate", "fraud", "harassment"] },
                        description: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const report = await fileReport(db, userId, request.body as any);
            return reply.status(201).send(report);
        },
    );

    // GET /admin/reports — pending reports (admin only)
    app.get<{
        Querystring: { page?: string };
    }>("/admin/reports", async (request, reply) => {
        await checkAdmin(request);
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const reports = await getPendingReports(db, page);
        return reply.send(reports);
    });

    // POST /admin/reports/:id/assign
    app.post<{
        Params: { id: string };
    }>("/admin/reports/:id/assign", async (request, reply) => {
        const adminId = await checkAdmin(request);
        const report = await assignReport(db, request.params.id, adminId);
        return reply.send(report);
    });

    // POST /admin/reports/:id/resolve
    app.post<{
        Params: { id: string };
        Body: { action: string; reason: string };
    }>(
        "/admin/reports/:id/resolve",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["action", "reason"],
                    properties: {
                        action: { type: "string" },
                        reason: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const adminId = await checkAdmin(request);
            const report = await resolveReport(db, request.params.id, adminId, request.body.action, request.body.reason);
            return reply.send(report);
        },
    );

    // --- Member Moderation Actions ---

    // POST /admin/members/:id/suspend
    app.post<{
        Params: { id: string };
        Body: { reason: string; durationDays?: number };
    }>(
        "/admin/members/:id/suspend",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["reason"],
                    properties: {
                        reason: { type: "string", minLength: 1 },
                        durationDays: { type: "number" },
                    },
                },
            },
        },
        async (request, reply) => {
            const adminId = await checkAdmin(request);
            await requireRole(db, adminId, "moderator");
            await suspendUser(db, request.params.id, adminId, request.body.reason, request.body.durationDays);
            return reply.send({ status: "suspended" });
        },
    );

    // POST /admin/members/:id/ban
    app.post<{
        Params: { id: string };
        Body: { reason: string };
    }>(
        "/admin/members/:id/ban",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["reason"],
                    properties: { reason: { type: "string", minLength: 1 } },
                },
            },
        },
        async (request, reply) => {
            const adminId = await checkAdmin(request);
            await requireRole(db, adminId, "super_admin");
            await banUser(db, request.params.id, adminId, request.body.reason);
            return reply.send({ status: "banned" });
        },
    );

    // POST /admin/members/:id/reinstate
    app.post<{
        Params: { id: string };
        Body: { reason: string };
    }>(
        "/admin/members/:id/reinstate",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["reason"],
                    properties: { reason: { type: "string", minLength: 1 } },
                },
            },
        },
        async (request, reply) => {
            const adminId = await checkAdmin(request);
            await requireRole(db, adminId, "moderator");
            await reinstateUser(db, request.params.id, adminId, request.body.reason);
            return reply.send({ status: "reinstated" });
        },
    );
};
