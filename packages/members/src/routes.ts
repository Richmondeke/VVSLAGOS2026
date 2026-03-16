import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import { createProfile, updateProfile, getProfile, getPublicProfile, searchProfiles } from "./profiles.js";
import { createItem, publishItem, getItems } from "./portfolio.js";
import { generateUploadUrl, type IS3Adapter } from "./media.js";

export type MembersRoutesOpts = {
    db: ScopedClient;
    s3: IS3Adapter;
};

export const membersRoutes: FastifyPluginAsync<MembersRoutesOpts> = async (app, opts) => {
    const { db, s3 } = opts;

    // GET /members/me — own profile
    app.get("/members/me", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const profile = await getProfile(db, userId);
        return reply.send(profile);
    });

    // PATCH /members/me — update own profile
    app.patch<{
        Body: {
            bio?: string;
            profession?: string;
            category?: string;
            skills?: string[];
            availability?: "available" | "unavailable" | "limited";
            location?: string;
            visibility?: "public" | "private" | "verified_only";
            avatarUrl?: string;
        };
    }>(
        "/members/me",
        {
            schema: {
                body: {
                    type: "object",
                    properties: {
                        bio: { type: "string" },
                        profession: { type: "string" },
                        category: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        availability: { type: "string", enum: ["available", "unavailable", "limited"] },
                        location: { type: "string" },
                        visibility: { type: "string", enum: ["public", "private", "verified_only"] },
                        avatarUrl: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const profile = await updateProfile(db, userId, request.body);
            return reply.send(profile);
        },
    );

    // GET /members/:userId — public profile (read-only)
    app.get<{
        Params: { userId: string };
    }>("/members/:userId", async (request, reply) => {
        const profile = await getPublicProfile(db, request.params.userId);
        return reply.send(profile);
    });

    // GET /members/search — full-text search
    app.get<{
        Querystring: {
            q?: string;
            category?: string;
            skills?: string;
            availability?: "available" | "unavailable" | "limited";
            page?: string;
            pageSize?: string;
        };
    }>("/members/search", async (request, reply) => {
        const result = await searchProfiles(db, {
            query: request.query.q,
            category: request.query.category,
            skills: request.query.skills?.split(","),
            availability: request.query.availability,
            page: Number.parseInt(request.query.page ?? "1", 10),
            pageSize: Number.parseInt(request.query.pageSize ?? "20", 10),
        });
        return reply.send(result);
    });

    // POST /members/portfolio — create portfolio item
    app.post<{
        Body: {
            title: string;
            description: string;
            tags: string[];
            mediaUrls: string[];
            caseStudy?: {
                challenge: string;
                approach: string;
                outcome: string;
                metrics: Record<string, string | number>;
            };
            collaborators?: string[];
        };
    }>(
        "/members/portfolio",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["title", "description", "tags", "mediaUrls"],
                    properties: {
                        title: { type: "string", minLength: 1 },
                        description: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        mediaUrls: { type: "array", items: { type: "string" } },
                        caseStudy: {
                            type: "object",
                            properties: {
                                challenge: { type: "string" },
                                approach: { type: "string" },
                                outcome: { type: "string" },
                                metrics: { type: "object" },
                            },
                        },
                        collaborators: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const item = await createItem(db, userId, request.body);
            return reply.status(201).send(item);
        },
    );

    // GET /members/:userId/portfolio — list portfolio items
    app.get<{
        Params: { userId: string };
        Querystring: { page?: string };
    }>("/members/:userId/portfolio", async (request, reply) => {
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const result = await getItems(db, request.params.userId, page);
        return reply.send(result);
    });

    // POST /members/portfolio/:itemId/publish — publish portfolio item
    app.post<{
        Params: { itemId: string };
    }>("/members/portfolio/:itemId/publish", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const item = await publishItem(db, request.params.itemId, userId);
        return reply.send(item);
    });

    // POST /members/media/upload-url — get pre-signed upload URL
    app.post<{
        Body: { filename: string; mimeType: string };
    }>(
        "/members/media/upload-url",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["filename", "mimeType"],
                    properties: {
                        filename: { type: "string", minLength: 1 },
                        mimeType: { type: "string", minLength: 1 },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const result = await generateUploadUrl(s3, userId, request.body.filename, request.body.mimeType);
            return reply.send(result);
        },
    );
};
