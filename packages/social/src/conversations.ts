import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError } from "@vvs/shared";
import type { Conversation, Paginated } from "@vvs/contracts";
import { createConversationsRepo, type ConversationRow } from "./repositories/conversations.js";
import { createBlocksRepo } from "./repositories/blocks.js";

function mapConversationRow(row: ConversationRow): Conversation {
    return {
        id: row.id,
        participantIds: [row.member1Id, row.member2Id],
        lastMessageAt: row.lastMessageAt,
        createdAt: row.createdAt,
    };
}

/**
 * Get or create a conversation between two users.
 * Checks blocking — if either user has blocked the other, throws ForbiddenError.
 */
export async function getOrCreateConversation(
    db: ScopedClient,
    userId1: string,
    userId2: string,
): Promise<Conversation> {
    const blocksRepo = createBlocksRepo(db);

    // Check blocking (bidirectional)
    const blocked = await blocksRepo.isBlocked(userId1, userId2);
    if (blocked) {
        throw new ForbiddenError("Cannot start conversation with this user");
    }

    const convRepo = createConversationsRepo(db);
    const conv = await convRepo.getOrCreate(userId1, userId2);
    return mapConversationRow(conv);
}

/**
 * Get inbox (list of conversations) for a user, sorted by last message time.
 */
export async function getInbox(
    db: ScopedClient,
    userId: string,
    page = 1,
    pageSize = 20,
): Promise<Paginated<Conversation>> {
    const convRepo = createConversationsRepo(db);
    const result = await convRepo.getInbox(userId, page, pageSize);

    return {
        items: result.items.map(mapConversationRow),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    };
}
