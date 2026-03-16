import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createWalletsRepo } from "../../src/repositories/wallets.js";
import { createLedgerRepo } from "../../src/repositories/ledger.js";
import {
    createEscrow,
    markFunded,
    releaseFull,
    refundFull,
    refundPartial,
    disputeEscrow,
    cancelEscrow,
} from "../../src/escrow.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "finance,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

async function setupEscrowParties(tx: ScopedClient, clientBalance = 10000000) {
    const walletsRepo = createWalletsRepo(tx);
    const clientId = crypto.randomUUID();
    const providerId = crypto.randomUUID();
    const clientWallet = await walletsRepo.create(clientId);
    const providerWallet = await walletsRepo.create(providerId);

    if (clientBalance > 0) {
        await walletsRepo.atomicCredit(clientWallet.id, clientBalance, `seed-${clientId}`);
    }

    return { clientId, providerId, clientWallet, providerWallet, walletsRepo };
}

describe("Escrow Lifecycle", () => {
    it("create → markFunded → releaseFull: provider receives amount minus fee", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId, walletsRepo } = await setupEscrowParties(tx);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 10000000, // ₦100,000 = 10,000,000 kobo
            });

            expect(escrow.status).toBe("pending");
            // 7.5% of 10,000,000 = 750,000
            expect(escrow.platformFee).toBe(750000);

            // Fund escrow
            await markFunded(tx, escrow.id, "fund-1");

            // Client should be debited
            const clientBal = await walletsRepo.getBalance(clientId);
            expect(clientBal.available).toBe(0);

            // Release to provider
            await releaseFull(tx, escrow.id, "release-1");

            // Provider receives totalAmount - platformFee = 9,250,000
            const providerBal = await walletsRepo.getBalance(providerId);
            expect(providerBal.available).toBe(9250000);
        });
    });

    it("₦100,000 order: provider receives ₦92,500, platform gets ₦7,500", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId, walletsRepo } = await setupEscrowParties(tx);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 10000000, // ₦100,000
            });

            expect(escrow.platformFee).toBe(750000); // ₦7,500

            await markFunded(tx, escrow.id, "fund-fee-test");
            await releaseFull(tx, escrow.id, "release-fee-test");

            const providerBal = await walletsRepo.getBalance(providerId);
            expect(providerBal.available).toBe(9250000); // ₦92,500
        });
    });

    it("minimum fee test: ₦50 order → platform fee is ₦5 (minimum 500 kobo)", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId, walletsRepo } = await setupEscrowParties(tx, 5000);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 5000, // ₦50 = 5,000 kobo → 7.5% = 375 kobo < 500 minimum
            });

            // 7.5% of 5,000 = 375 < 500 minimum → use 500
            expect(escrow.platformFee).toBe(500);

            await markFunded(tx, escrow.id, "fund-min-fee");
            await releaseFull(tx, escrow.id, "release-min-fee");

            // Provider gets 5,000 - 500 = 4,500
            const providerBal = await walletsRepo.getBalance(providerId);
            expect(providerBal.available).toBe(4500);
        });
    });

    it("cancel funded escrow → client balance fully restored", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId, walletsRepo } = await setupEscrowParties(tx, 5000000);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 5000000,
            });

            await markFunded(tx, escrow.id, "fund-cancel");
            expect((await walletsRepo.getBalance(clientId)).available).toBe(0);

            await cancelEscrow(tx, escrow.id, "buyer cancelled", "cancel-1");

            // Full refund
            const clientBal = await walletsRepo.getBalance(clientId);
            expect(clientBal.available).toBe(5000000);
        });
    });

    it("dispute → attempt to release → rejected", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId } = await setupEscrowParties(tx);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 5000000,
            });

            await markFunded(tx, escrow.id, "fund-dispute");
            await disputeEscrow(tx, escrow.id, "quality issue");

            // Attempt to release should fail
            await expect(
                releaseFull(tx, escrow.id, "release-after-dispute"),
            ).rejects.toThrow("Cannot release escrow in 'disputed' state");
        });
    });

    it("dispute → partial resolution (60/40 split)", async () => {
        await withTestTransaction(db, async (tx) => {
            const { clientId, providerId, walletsRepo } = await setupEscrowParties(tx, 1000000);

            const escrow = await createEscrow(tx, {
                orderId: crypto.randomUUID(),
                clientUserId: clientId,
                providerUserId: providerId,
                totalAmount: 1000000, // ₦10,000
            });

            await markFunded(tx, escrow.id, "fund-partial");
            await disputeEscrow(tx, escrow.id, "partial issue");

            // 60% to provider, 40% to client
            await refundPartial(tx, escrow.id, 600000, 400000, "partial-1");

            const providerBal = await walletsRepo.getBalance(providerId);
            expect(providerBal.available).toBe(600000);

            const clientBal = await walletsRepo.getBalance(clientId);
            expect(clientBal.available).toBe(400000);
        });
    });
});
