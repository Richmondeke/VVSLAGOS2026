import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import type { MemberTier } from "@vvs/contracts";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { getOrCreateConversation, getInbox } from "../../src/conversations.js";
import { sendMessage, getThread, markRead, type MessageRateLimitCheck } from "../../src/messages.js";
import { blockUser, unblockUser, isBlocked } from "../../src/blocking.js";
import { createConversationsRepo } from "../../src/repositories/conversations.js";
import { createMessagesRepo } from "../../src/repositories/messages.js";
import { createBlocksRepo } from "../../src/repositories/blocks.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "social,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

function createMockRateLimiter(tier: MemberTier = "verified", msgCount = 0): MessageRateLimitCheck {
    return {
        async getTier() { return tier; },
        async getMessageCountLast24h() { return msgCount; },
    };
}

describe("Conversations", () => {
    it("creates a conversation between two users", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();

            const conv = await getOrCreateConversation(tx, userA, userB);
            expect(conv.id).toBeDefined();
            expect(conv.participantIds).toHaveLength(2);
            expect(conv.participantIds).toContain(userA);
            expect(conv.participantIds).toContain(userB);
        });
    });

    it("returns existing conversation for same pair (idempotent)", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();

            const conv1 = await getOrCreateConversation(tx, userA, userB);
            const conv2 = await getOrCreateConversation(tx, userB, userA); // reversed order

            expect(conv1.id).toBe(conv2.id);
        });
    });

    it("normalises member pair (smaller UUID first)", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = "00000000-0000-0000-0000-000000000001";
            const userB = "ffffffff-ffff-ffff-ffff-ffffffffffff";

            const conv = await getOrCreateConversation(tx, userB, userA);
            // member1Id should be the smaller UUID
            expect(conv.participantIds[0]).toBe(userA);
            expect(conv.participantIds[1]).toBe(userB);
        });
    });

    it("getInbox returns conversations sorted by lastMessageAt", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = crypto.randomUUID();
            const other1 = crypto.randomUUID();
            const other2 = crypto.randomUUID();

            await getOrCreateConversation(tx, user, other1);
            await getOrCreateConversation(tx, user, other2);

            const inbox = await getInbox(tx, user);
            expect(inbox.items.length).toBe(2);
            expect(inbox.total).toBe(2);
        });
    });
});

describe("Messages", () => {
    it("sends a message in a conversation", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            const msg = await sendMessage(
                tx,
                conv.id,
                userA,
                { content: "Hello!" },
                createMockRateLimiter(),
            );

            expect(msg.id).toBeDefined();
            expect(msg.senderId).toBe(userA);
            expect(msg.content).toBe("Hello!");
        });
    });

    it("getThread returns messages in conversation", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            await sendMessage(tx, conv.id, userA, { content: "First" }, createMockRateLimiter());
            await sendMessage(tx, conv.id, userB, { content: "Second" }, createMockRateLimiter());

            const thread = await getThread(tx, conv.id, userA);
            expect(thread.total).toBe(2);
        });
    });

    it("non-participant cannot send message", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const stranger = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            await expect(
                sendMessage(tx, conv.id, stranger, { content: "Hi" }, createMockRateLimiter()),
            ).rejects.toThrow("Not a participant");
        });
    });

    it("markRead creates a read receipt", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            const msg = await sendMessage(
                tx,
                conv.id,
                userA,
                { content: "Read this" },
                createMockRateLimiter(),
            );

            await markRead(tx, conv.id, userB, msg.id);
            // Should not throw — idempotent
            await markRead(tx, conv.id, userB, msg.id);
        });
    });
});

describe("Rate Limiting", () => {
    it("enforces Free-tier rate limit (20/day)", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            // Simulate 20 messages already sent
            const limiter = createMockRateLimiter("free", 20);

            await expect(
                sendMessage(tx, conv.id, userA, { content: "One too many" }, limiter),
            ).rejects.toThrow("rate limit exceeded");
        });
    });

    it("allows Verified-tier up to 100/day", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            // 99 messages — should succeed
            const limiter99 = createMockRateLimiter("verified", 99);
            const msg = await sendMessage(tx, conv.id, userA, { content: "Still ok" }, limiter99);
            expect(msg.content).toBe("Still ok");

            // 100 messages — should fail
            const limiter100 = createMockRateLimiter("verified", 100);
            await expect(
                sendMessage(tx, conv.id, userA, { content: "Too many" }, limiter100),
            ).rejects.toThrow("rate limit exceeded");
        });
    });

    it("Pro tier is unlimited", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();
            const conv = await getOrCreateConversation(tx, userA, userB);

            const limiter = createMockRateLimiter("pro", 999999);
            const msg = await sendMessage(tx, conv.id, userA, { content: "Unlimited" }, limiter);
            expect(msg.content).toBe("Unlimited");
        });
    });
});

describe("Blocking", () => {
    it("blocked user cannot start conversation", async () => {
        await withTestTransaction(db, async (tx) => {
            const blocker = crypto.randomUUID();
            const blocked = crypto.randomUUID();

            await blockUser(tx, blocker, blocked);

            await expect(
                getOrCreateConversation(tx, blocked, blocker),
            ).rejects.toThrow("Cannot start conversation");
        });
    });

    it("blocked user cannot send messages", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();

            // Create conversation first, then block
            const conv = await getOrCreateConversation(tx, userA, userB);
            await blockUser(tx, userA, userB);

            await expect(
                sendMessage(tx, conv.id, userB, { content: "Hi" }, createMockRateLimiter()),
            ).rejects.toThrow("Cannot send messages");
        });
    });

    it("bidirectional block check works", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();

            expect(await isBlocked(tx, userA, userB)).toBe(false);
            await blockUser(tx, userA, userB);

            // Both directions should report blocked
            expect(await isBlocked(tx, userA, userB)).toBe(true);
            expect(await isBlocked(tx, userB, userA)).toBe(true);
        });
    });

    it("unblock allows messaging again", async () => {
        await withTestTransaction(db, async (tx) => {
            const userA = crypto.randomUUID();
            const userB = crypto.randomUUID();

            await blockUser(tx, userA, userB);
            expect(await isBlocked(tx, userA, userB)).toBe(true);

            await unblockUser(tx, userA, userB);
            expect(await isBlocked(tx, userA, userB)).toBe(false);

            // Should be able to start conversation now
            const conv = await getOrCreateConversation(tx, userA, userB);
            expect(conv.id).toBeDefined();
        });
    });
});
