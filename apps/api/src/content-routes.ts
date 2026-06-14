import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { contentEvents, contentNews, contentOpportunities, rsvps, eq, desc } from "@vvs/shared";

export type ContentApiOpts = {
    db: ScopedClient;
};

export const contentRoutes: FastifyPluginAsync<ContentApiOpts> = async (app, opts) => {
    const { db } = opts;

    // --- Public Events ---
    app.get("/api/content/events", async (request, reply) => {
        const events = await db
            .select()
            .from(contentEvents)
            .where(eq(contentEvents.isPublished, true))
            .orderBy(desc(contentEvents.eventDate));
        return reply.send(events);
    });

    // --- Public Event by Slug ---
    app.get<{ Params: { slug: string } }>("/api/content/events/:slug", async (request, reply) => {
        const [event] = await db
            .select()
            .from(contentEvents)
            .where(eq(contentEvents.customSlug, request.params.slug))
            .limit(1);

        if (!event) return reply.status(404).send({ message: "Event not found" });
        return reply.send(event);
    });

    // --- Public News ---
    app.get("/api/content/news", async (request, reply) => {
        const news = await db
            .select()
            .from(contentNews)
            .where(eq(contentNews.isPublished, true))
            .orderBy(desc(contentNews.createdAt));
        return reply.send(news);
    });

    // --- Public Opportunities ---
    app.get("/api/content/opportunities", async (request, reply) => {
        const opportunities = await db
            .select()
            .from(contentOpportunities)
            .where(eq(contentOpportunities.isPublished, true))
            .orderBy(desc(contentOpportunities.createdAt));
        return reply.send(opportunities);
    });

    // --- Submit RSVP for an Event ---
    app.post<{
        Body: { name: string; email: string; attendance: string; events: string[] };
    }>("/api/content/rsvp", {
        schema: {
            body: {
                type: "object",
                required: ["name", "email", "attendance"],
                properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    attendance: { type: "string" },
                    events: { type: "array", items: { type: "string" } }
                }
            }
        }
    }, async (request, reply) => {
        const { name, email, attendance, events } = request.body;
        const [rsvp] = await db.insert(rsvps).values({
            name,
            email,
            attendance,
            events,
        }).returning();

        return reply.status(201).send(rsvp);
    });
};
