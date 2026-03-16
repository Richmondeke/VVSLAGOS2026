import type { ScopedClient } from "@vvs/shared";
import { createBlocksRepo } from "./repositories/blocks.js";

/**
 * Block a user. Prevents messaging and conversation access.
 */
export async function blockUser(db: ScopedClient, blockerId: string, blockedId: string): Promise<void> {
    const repo = createBlocksRepo(db);
    await repo.block(blockerId, blockedId);
}

/**
 * Unblock a user.
 */
export async function unblockUser(db: ScopedClient, blockerId: string, blockedId: string): Promise<void> {
    const repo = createBlocksRepo(db);
    await repo.unblock(blockerId, blockedId);
}

/**
 * Bidirectional block check. Returns true if either user has blocked the other.
 */
export async function isBlocked(db: ScopedClient, userA: string, userB: string): Promise<boolean> {
    const repo = createBlocksRepo(db);
    return repo.isBlocked(userA, userB);
}
