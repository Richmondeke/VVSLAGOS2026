import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError, ValidationError, writeToOutbox } from "@vvs/shared";
import type { Message, MessageInput, MemberTier } from "@vvs/contracts";
import { createConversationsRepo } from "./repositories/conversations.js";
import { createMessagesRepo, type MessageRow } from "./repositories/messages.js";
import { createBlocksRepo } from "./repositories/blocks.js";

/** Rate limits per tier (messages per 24-hour window). */
const RATE_LIMITS: Record<MemberTier, number> = {
    free: 20,
    verified: 100,
    pro: Number.MAX_SAFE_INTEGER, // unlimited
};

function mapMessageRow(row: MessageRow): Message {
    return {
        id: row.id,
        conversationId: row.conversationId,
        senderId: row.senderId,
        content: row.body,
        createdAt: row.createdAt,
    };
}

export type MessageRateLimitCheck = {
    getTier(userId: string): Promise<MemberTier>;
    getMessageCountLast24h(userId: string): Promise<number>;
};

/**
 * Send a message in a conversation.
 * Validates: participation, blocking, tier rate limits.
 */
export async function sendMessage(
    db: ScopedClient,
    conversationId: string,
    senderId: string,
    input: MessageInput,
    rateLimiter: MessageRateLimitCheck,
): Promise<Message> {
    const convRepo = createConversationsRepo(db);
    const blocksRepo = createBlocksRepo(db);
    const messagesRepo = createMessagesRepo(db);

    // Verify conversation exists and sender is participant
    const conv = await convRepo.findById(conversationId);
    if (!conv) throw new ValidationError("Conversation not found");
    if (!convRepo.isParticipant(conv, senderId)) {
        throw new ForbiddenError("Not a participant in this conversation");
    }

    // Check blocking
    const recipientId = convRepo.getOtherParticipant(conv, senderId);
    const blocked = await blocksRepo.isBlocked(senderId, recipientId);
    if (blocked) {
        throw new ForbiddenError("Cannot send messages to this user");
    }

    // Check rate limit
    const tier = await rateLimiter.getTier(senderId);
    const limit = RATE_LIMITS[tier];
    const count = await rateLimiter.getMessageCountLast24h(senderId);
    if (count >= limit) {
        throw new ValidationError(`Message rate limit exceeded (${limit}/day for ${tier} tier)`);
    }

    // Create message
    const message = await messagesRepo.create({
        conversationId,
        senderId,
        body: input.content,
    });

    // Add attachments if any
    if (input.attachmentUrls && input.attachmentUrls.length > 0) {
        await messagesRepo.addAttachments(
            message.id,
            input.attachmentUrls.map((url) => ({
                fileUrl: url,
                fileName: url.split("/").pop() ?? "file",
            })),
        );
    }

    // Update conversation lastMessageAt
    await convRepo.updateLastMessageAt(conversationId);

    // Write outbox event
    await writeToOutbox(
        db,
        "social.message.sent",
        {
            messageId: message.id,
            conversationId,
            senderId,
            recipientId,
            timestamp: new Date(),
        },
        `msg-sent-${message.id}`,
    );

    return mapMessageRow(message);
}

/**
 * Get message thread for a conversation.
 */
export async function getThread(
    db: ScopedClient,
    conversationId: string,
    userId: string,
    page = 1,
    pageSize = 50,
) {
    const convRepo = createConversationsRepo(db);
    const conv = await convRepo.findById(conversationId);
    if (!conv) throw new ValidationError("Conversation not found");
    if (!convRepo.isParticipant(conv, userId)) {
        throw new ForbiddenError("Not a participant in this conversation");
    }

    const messagesRepo = createMessagesRepo(db);
    const result = await messagesRepo.getThread(conversationId, page, pageSize);

    return {
        items: result.items.map(mapMessageRow),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    };
}

/**
 * Mark a message as read.
 */
export async function markRead(
    db: ScopedClient,
    conversationId: string,
    userId: string,
    messageId: string,
): Promise<void> {
    const convRepo = createConversationsRepo(db);
    const conv = await convRepo.findById(conversationId);
    if (!conv) throw new ValidationError("Conversation not found");
    if (!convRepo.isParticipant(conv, userId)) {
        throw new ForbiddenError("Not a participant in this conversation");
    }

    const messagesRepo = createMessagesRepo(db);
    await messagesRepo.markRead(messageId, userId);
}
