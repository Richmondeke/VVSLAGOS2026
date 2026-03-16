import type { Paginated } from "./common.js";

// --- Types ---

export type FeedPost = {
    id: string;
    userId: string;
    type: "project" | "case_study" | "wip" | "collaboration_call" | "service_announcement";
    title: string;
    content: string;
    mediaUrls: string[];
    engagementMetrics: {
        likes: number;
        bookmarks: number;
        comments: number;
    };
    createdAt: Date;
    updatedAt: Date;
};

export type Conversation = {
    id: string;
    participantIds: [string, string];
    lastMessageAt: Date;
    createdAt: Date;
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    attachmentUrls?: string[];
    readAt?: Date;
    createdAt: Date;
};

export type FeedPostInput = {
    type: FeedPost["type"];
    title: string;
    content: string;
    mediaUrls?: string[];
};

export type MessageInput = {
    content: string;
    attachmentUrls?: string[];
};

// --- Interfaces ---

export interface IFeedService {
    post(userId: string, input: FeedPostInput): Promise<FeedPost>;
    timeline(userId: string, page: number): Promise<Paginated<FeedPost>>;
    engage(userId: string, postId: string, type: "like" | "bookmark" | "comment"): Promise<void>;
}

export interface IMessagingService {
    startConversation(senderId: string, recipientId: string): Promise<Conversation>;
    send(conversationId: string, senderId: string, input: MessageInput): Promise<Message>;
    inbox(userId: string, page: number): Promise<Paginated<Conversation>>;
}
