import type { FastifyPluginAsync } from "fastify";
import type { ScopedClient } from "@vvs/shared";
import type { MemberTier, FeedPostInput } from "@vvs/contracts";
import { getOrCreateConversation, getInbox } from "./conversations.js";
import { sendMessage, getThread, markRead, type MessageRateLimitCheck } from "./messages.js";
import { blockUser, unblockUser } from "./blocking.js";
import { createPost, deletePost, flagPost } from "./posting.js";
import { getTimeline, engage } from "./timeline.js";

export type SocialRoutesOpts = {
    db: ScopedClient;
    rateLimiter: MessageRateLimitCheck;
};

export const socialRoutes: FastifyPluginAsync<SocialRoutesOpts> = async (app, opts) => {
    const { db, rateLimiter } = opts;

    // GET /social/messages — inbox
    app.get<{
        Querystring: { page?: string; pageSize?: string };
    }>("/social/messages", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const pageSize = Number.parseInt(request.query.pageSize ?? "20", 10);
        const result = await getInbox(db, userId, page, pageSize);
        return reply.send(result);
    });

    // POST /social/conversations/:userId — start conversation (or get existing)
    app.post<{
        Params: { userId: string };
    }>("/social/conversations/:userId", async (request, reply) => {
        const senderId = (request as unknown as { userId: string }).userId;
        const conversation = await getOrCreateConversation(db, senderId, request.params.userId);
        return reply.status(201).send(conversation);
    });

    // GET /social/messages/:conversationId — message thread
    app.get<{
        Params: { conversationId: string };
        Querystring: { page?: string; pageSize?: string };
    }>("/social/messages/:conversationId", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const pageSize = Number.parseInt(request.query.pageSize ?? "50", 10);
        const result = await getThread(db, request.params.conversationId, userId, page, pageSize);
        return reply.send(result);
    });

    // POST /social/messages/:conversationId — send message
    app.post<{
        Params: { conversationId: string };
        Body: { content: string; attachmentUrls?: string[] };
    }>(
        "/social/messages/:conversationId",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["content"],
                    properties: {
                        content: { type: "string", minLength: 1 },
                        attachmentUrls: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const message = await sendMessage(
                db,
                request.params.conversationId,
                userId,
                request.body,
                rateLimiter,
            );
            return reply.status(201).send(message);
        },
    );

    // POST /social/messages/:conversationId/:messageId/read — mark read
    app.post<{
        Params: { conversationId: string; messageId: string };
    }>("/social/messages/:conversationId/:messageId/read", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await markRead(db, request.params.conversationId, userId, request.params.messageId);
        return reply.send({ status: "read" });
    });

    // POST /social/block/:userId — block user
    app.post<{
        Params: { userId: string };
    }>("/social/block/:userId", async (request, reply) => {
        const blockerId = (request as unknown as { userId: string }).userId;
        await blockUser(db, blockerId, request.params.userId);
        return reply.send({ status: "blocked" });
    });

    // DELETE /social/block/:userId — unblock user
    app.delete<{
        Params: { userId: string };
    }>("/social/block/:userId", async (request, reply) => {
        const blockerId = (request as unknown as { userId: string }).userId;
        await unblockUser(db, blockerId, request.params.userId);
        return reply.send({ status: "unblocked" });
    });

    // --- Feed ---

    // GET /social/feed — timeline
    app.get<{
        Querystring: { page?: string; pageSize?: string };
    }>("/social/feed", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        const page = Number.parseInt(request.query.page ?? "1", 10);
        const pageSize = Number.parseInt(request.query.pageSize ?? "20", 10);
        const result = await getTimeline(db, userId, page, pageSize);
        return reply.send(result);
    });

    // POST /social/feed — create post
    app.post<{
        Body: FeedPostInput;
    }>(
        "/social/feed",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["type", "title", "content"],
                    properties: {
                        type: { type: "string", enum: ["project", "service_announcement", "wip", "collaboration_call", "case_study"] },
                        title: { type: "string", minLength: 1 },
                        content: { type: "string", minLength: 1 },
                        mediaUrls: { type: "array", items: { type: "string" } },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            const post = await createPost(db, userId, request.body);
            return reply.status(201).send(post);
        },
    );

    // DELETE /social/feed/:postId — delete post
    app.delete<{
        Params: { postId: string };
    }>("/social/feed/:postId", async (request, reply) => {
        const userId = (request as unknown as { userId: string }).userId;
        await deletePost(db, userId, request.params.postId);
        return reply.send({ status: "deleted" });
    });

    // POST /social/feed/:postId/engage — like/bookmark/comment
    app.post<{
        Params: { postId: string };
        Body: { type: "like" | "bookmark" | "comment"; body?: string };
    }>(
        "/social/feed/:postId/engage",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["type"],
                    properties: {
                        type: { type: "string", enum: ["like", "bookmark", "comment"] },
                        body: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            const userId = (request as unknown as { userId: string }).userId;
            await engage(db, userId, request.params.postId, request.body.type, request.body.body);
            return reply.send({ status: "engaged" });
        },
    );
};
