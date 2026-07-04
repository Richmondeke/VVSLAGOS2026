import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { contentEvents, contentNews, contentOpportunities, rsvps, communityMembers, futureLabsApplications, eq, desc, and, or, sql } from "@vvs/shared";
import { requireAdmin, requireRole, getAdminRole, createAdminRepo } from "@vvs/platform";
import { createUsersRepo, getPendingApprovals, approveUser, rejectUser } from "@vvs/auth";
import { createOrdersRepo } from "@vvs/marketplace";

export type AdminApiOpts = {
    authDb: ScopedClient;
    marketplaceDb: ScopedClient;
    platformDb: ScopedClient;
    publicDb?: ScopedClient;
};

export const adminApiRoutes: FastifyPluginAsync<AdminApiOpts> = async (app, opts) => {
    const { authDb, marketplaceDb, platformDb, publicDb } = opts;
    const rsvpsDb = publicDb || platformDb;
    const usersRepo = createUsersRepo(authDb);
    const ordersRepo = createOrdersRepo(marketplaceDb);
    const adminRepo = createAdminRepo(platformDb);

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    async function checkAdmin(request: any): Promise<string> {
        const userId = request.headers["x-admin-user-id"] as string;
        const adminEmail = request.headers["x-admin-email"] as string;

        if (!userId && !adminEmail) {
            throw Object.assign(new Error("Missing admin user ID"), { statusCode: 401 });
        }

        // Path 1: If userId is a valid UUID, try the normal admin lookup
        if (userId && UUID_RE.test(userId)) {
            try {
                await requireAdmin(platformDb, userId);
                return userId;
            } catch {
                // Fall through to email-based lookup
            }
        }

        // Path 2: Email-based lookup — find or create admin access
        if (adminEmail) {
            // Try to find the user in auth.users by email
            const authUser = await usersRepo.findByEmail(adminEmail).catch(() => undefined);
            
            if (authUser) {
                // User exists in auth — check if they're already an admin
                try {
                    await requireAdmin(platformDb, authUser.id);
                    return authUser.id;
                } catch {
                    // Not yet an admin — auto-provision below
                }
            }
            
            // Check existing admins
            const existingAdmins = await adminRepo.listAdmins();
            
            if (existingAdmins.length === 0) {
                // No admins at all — bootstrap first admin
                const newId = authUser?.id ?? crypto.randomUUID();
                await adminRepo.createAdmin({ userId: newId, role: "super_admin" });
                return newId;
            }
        }
        throw Object.assign(new Error("Admin access required"), { statusCode: 403 });
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

    // --- Future Labs Applications ---
    app.get("/admin/api/future-labs-applications", async (request, reply) => {
        await checkAdmin(request);
        // Query the future_labs_applications table using platformDb ScopedClient
        const appsList = await platformDb.select().from(futureLabsApplications).orderBy(desc(futureLabsApplications.createdAt));
        return reply.send(appsList);
    });

    // --- Admin role check ---
    app.get("/admin/api/me", async (request, reply) => {
        const userId = request.headers["x-admin-user-id"] as string;
        if (!userId) return reply.status(401).send({ message: "Not authenticated" });
        const role = await getAdminRole(platformDb, userId);
        return reply.send({ userId, role });
    });

    // --- Manage Admins ---
    app.get("/admin/api/admins", async (request, reply) => {
        const adminId = await checkAdmin(request);
        await requireRole(platformDb, adminId, "super_admin");
        const admins = await adminRepo.listAdmins();
        
        // Resolve email/name from authDb for each admin user
        const resolvedAdmins = await Promise.all(
            admins.map(async (admin) => {
                const user = await usersRepo.findById(admin.userId).catch(() => null);
                return {
                    id: admin.id,
                    userId: admin.userId,
                    role: admin.role,
                    isActive: admin.isActive,
                    email: user?.email || "Unknown Email",
                    createdAt: admin.createdAt,
                };
            })
        );
        return reply.send(resolvedAdmins);
    });

    app.post<{
        Body: { userId: string; role: string };
    }>("/admin/api/admins", {
        schema: {
            body: {
                type: "object",
                required: ["userId", "role"],
                properties: {
                    userId: { type: "string" },
                    role: { type: "string" },
                },
            },
        },
    }, async (request, reply) => {
        const adminId = await checkAdmin(request);
        await requireRole(platformDb, adminId, "super_admin");
        
        let targetUserId = request.body.userId;
        
        // If they provided an email address instead of a UUID, resolve it
        if (targetUserId.includes("@")) {
            const resolvedUser = await usersRepo.findByEmail(targetUserId.trim().toLowerCase());
            if (!resolvedUser) {
                return reply.status(404).send({ message: "No registered user found with that email address. Only existing registered users can be made admins." });
            }
            targetUserId = resolvedUser.id;
        }

        const newAdmin = await adminRepo.createAdmin({ userId: targetUserId, role: request.body.role });
        return reply.status(201).send(newAdmin);
    });

    app.delete<{ Params: { id: string } }>("/admin/api/admins/:id", async (request, reply) => {
        const adminId = await checkAdmin(request);
        await requireRole(platformDb, adminId, "super_admin");
        // Prevent removing yourself if you are the last super admin (optional, for now just allow deletion)
        await adminRepo.removeAdmin(request.params.id);
        return reply.status(204).send();
    });

    // --- CMS Events ---
    app.get("/admin/api/content/events", async (request, reply) => {
        await checkAdmin(request);
        const events = await platformDb.select().from(contentEvents).orderBy(desc(contentEvents.createdAt));
        return reply.send(events);
    });

    app.post<{ Body: any }>("/admin/api/content/events", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [event] = await platformDb.insert(contentEvents).values(data as any).returning();
        return reply.status(201).send(event);
    });

    app.put<{ Params: { id: string }, Body: any }>("/admin/api/content/events/:id", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [event] = await platformDb.update(contentEvents)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentEvents.id, request.params.id))
            .returning();
        return reply.send(event);
    });

    app.delete<{ Params: { id: string } }>("/admin/api/content/events/:id", async (request, reply) => {
        await checkAdmin(request);
        await platformDb.delete(contentEvents).where(eq(contentEvents.id, request.params.id));
        return reply.status(204).send();
    });

    // --- CMS News ---
    app.get("/admin/api/content/news", async (request, reply) => {
        await checkAdmin(request);
        const news = await platformDb.select().from(contentNews).orderBy(desc(contentNews.createdAt));
        return reply.send(news);
    });

    app.post<{ Body: any }>("/admin/api/content/news", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [newsItem] = await platformDb.insert(contentNews).values(data as any).returning();
        return reply.status(201).send(newsItem);
    });

    app.put<{ Params: { id: string }, Body: any }>("/admin/api/content/news/:id", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [newsItem] = await platformDb.update(contentNews)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentNews.id, request.params.id))
            .returning();
        return reply.send(newsItem);
    });

    app.delete<{ Params: { id: string } }>("/admin/api/content/news/:id", async (request, reply) => {
        await checkAdmin(request);
        await platformDb.delete(contentNews).where(eq(contentNews.id, request.params.id));
        return reply.status(204).send();
    });

    // --- CMS Opportunities ---
    app.get("/admin/api/content/opportunities", async (request, reply) => {
        await checkAdmin(request);
        const opps = await platformDb.select().from(contentOpportunities).orderBy(desc(contentOpportunities.createdAt));
        return reply.send(opps);
    });

    app.post<{ Body: any }>("/admin/api/content/opportunities", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [opp] = await platformDb.insert(contentOpportunities).values(data as any).returning();
        return reply.status(201).send(opp);
    });

    app.put<{ Params: { id: string }, Body: any }>("/admin/api/content/opportunities/:id", async (request, reply) => {
        await checkAdmin(request);
        const data = request.body as Record<string, any>;
        const [opp] = await platformDb.update(contentOpportunities)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentOpportunities.id, request.params.id))
            .returning();
        return reply.send(opp);
    });

    app.delete<{ Params: { id: string } }>("/admin/api/content/opportunities/:id", async (request, reply) => {
        await checkAdmin(request);
        await platformDb.delete(contentOpportunities).where(eq(contentOpportunities.id, request.params.id));
        return reply.status(204).send();
    });

    // --- RSVPs List ---
    app.get("/admin/api/rsvps", async (request, reply) => {
        await checkAdmin(request);
        const allRsvps = await rsvpsDb.select().from(rsvps).orderBy(desc(rsvps.createdAt));
        return reply.send(allRsvps);
    });

    // --- Community Members List ---
    app.get<{
        Querystring: { page?: string; search?: string; city?: string; gender?: string };
    }>("/admin/api/community-members", async (request, reply) => {
        await checkAdmin(request);
        const page = request.query.page ? Number.parseInt(request.query.page, 10) : 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const { search, city, gender } = request.query;

        // Build query using Drizzle
        let conditions = [];
        if (search) {
            conditions.push(sql`name ILIKE ${`%${search}%`}`);
        }
        if (city) {
            conditions.push(eq(communityMembers.city, city));
        }
        if (gender) {
            conditions.push(eq(communityMembers.gender, gender));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [items, [totalResult]] = await Promise.all([
            rsvpsDb.select()
                .from(communityMembers)
                .where(whereClause)
                .orderBy(desc(communityMembers.createdAt))
                .limit(limit)
                .offset(offset),
            rsvpsDb.select({ count: sql<number>`count(*)::int` })
                .from(communityMembers)
                .where(whereClause)
        ]);

        return reply.send({
            items,
            total: totalResult?.count ?? 0
        });
    });

    // --- Temporary Database Migrations Route ---
    app.post("/admin/api/run-migrations", async (request, reply) => {
        const { secret } = request.query as { secret?: string };
        if (secret !== "vvs_migration_secret_2026") {
            return reply.status(403).send({ message: "Forbidden" });
        }

        let renamed = false;
        let columnsAdded = false;

        try {
            await platformDb.execute(sql`
                ALTER TABLE "content_opportunities" RENAME COLUMN "company" TO "brand";
            `);
            renamed = true;
        } catch (e: any) {
            request.log.warn(`Rename column company to brand failed/already done: ${e.message}`);
        }

        try {
            await platformDb.execute(sql`
                ALTER TABLE "content_opportunities" ADD COLUMN "brand_logo" text;
                ALTER TABLE "content_opportunities" ADD COLUMN "is_verified_brand" boolean DEFAULT false NOT NULL;
                ALTER TABLE "content_opportunities" ADD COLUMN "category" text DEFAULT 'Other' NOT NULL;
                ALTER TABLE "content_opportunities" ADD COLUMN "location" text;
                ALTER TABLE "content_opportunities" ADD COLUMN "deadline" timestamp with time zone;
                ALTER TABLE "content_opportunities" ADD COLUMN "budget" text;
                ALTER TABLE "content_opportunities" ADD COLUMN "xp_reward" integer DEFAULT 0;
            `);
            columnsAdded = true;
        } catch (e: any) {
            request.log.warn(`Adding columns failed/already done: ${e.message}`);
        }

        return reply.send({
            message: "Migrations process finished",
            renamed,
            columnsAdded,
            success: true
        });
    });
};
