import type { ScopedClient } from "@vvs/shared";
import type { IFeedService, IMessagingService, FeedPost, FeedPostInput, Paginated, Conversation, Message, MessageInput } from "@vvs/contracts";
import { createPost, deletePost } from "./posting.js";
import { getTimeline, engage } from "./timeline.js";
import { getOrCreateConversation, getInbox } from "./conversations.js";
import { sendMessage, type MessageRateLimitCheck } from "./messages.js";

/**
 * Creates an IFeedService implementation backed by the social package.
 */
export function createFeedService(db: ScopedClient): IFeedService {
    return {
        async post(userId: string, input: FeedPostInput): Promise<FeedPost> {
            return createPost(db, userId, input);
        },

        async timeline(userId: string, page: number): Promise<Paginated<FeedPost>> {
            return getTimeline(db, userId, page);
        },

        async engage(userId: string, postId: string, type: "like" | "bookmark" | "comment"): Promise<void> {
            return engage(db, userId, postId, type);
        },
    };
}

/**
 * Creates an IMessagingService implementation backed by the social package.
 */
export function createMessagingService(db: ScopedClient, rateLimiter: MessageRateLimitCheck): IMessagingService {
    return {
        async startConversation(senderId: string, recipientId: string): Promise<Conversation> {
            return getOrCreateConversation(db, senderId, recipientId);
        },

        async send(conversationId: string, senderId: string, input: MessageInput): Promise<Message> {
            return sendMessage(db, conversationId, senderId, input, rateLimiter);
        },

        async inbox(userId: string, page: number): Promise<Paginated<Conversation>> {
            return getInbox(db, userId, page);
        },
    };
}
