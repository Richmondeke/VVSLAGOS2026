import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { createWalletsRepo } from "../../src/repositories/wallets.js";
import { createLedgerRepo } from "../../src/repositories/ledger.js";
import { initiateFunding, handlePaystackWebhook } from "../../src/funding.js";
import { requestWithdrawal, handleTransferWebhook } from "../../src/withdrawals.js";
import { createMockPaystackGateway, type IPaystackGateway } from "../../src/gateway.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";
const TEST_SECRET = "test-paystack-secret";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;
let gateway: IPaystackGateway;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "finance,outbox" } });
    db = drizzle(sqlClient);
    gateway = createMockPaystackGateway({
        verifyWebhookSignature(payload, signature) {
            const hash = createHmac("sha512", TEST_SECRET).update(payload).digest("hex");
            return hash === signature;
        },
    });
});

afterAll(async () => {
    await sqlClient.end();
});

function signPayload(payload: string): string {
    return createHmac("sha512", TEST_SECRET).update(payload).digest("hex");
}

describe("Wallet Funding", () => {
    it("initiateFunding creates request and returns checkout URL", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            await walletsRepo.create(userId);

            const mockGw = createMockPaystackGateway();
            const result = await initiateFunding(tx, mockGw, userId, 500000, "user@test.vvs");

            expect(result.checkoutUrl).toContain("checkout.paystack.com");
            expect(result.reference).toContain(`vvs-fund-${userId}`);
        });
    });

    it("webhook credits wallet and writes outbox event atomically", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);

            // Create a funding request first
            const mockGw = createMockPaystackGateway();
            const { reference } = await initiateFunding(tx, mockGw, userId, 500000, "user@test.vvs");

            // Simulate webhook
            const webhookPayload = JSON.stringify({
                event: "charge.success",
                data: { reference, amount: 500000 },
            });
            const signature = signPayload(webhookPayload);

            await handlePaystackWebhook(tx, gateway, webhookPayload, signature);

            // Verify wallet credited
            const balance = await walletsRepo.getBalance(userId);
            expect(balance.available).toBe(500000);

            // Verify ledger entry
            const ledgerRepo = createLedgerRepo(tx);
            const entries = await ledgerRepo.getEntriesForWallet(wallet.id);
            expect(entries.items.length).toBe(1);
            expect(entries.items[0]!.entryType).toBe("credit");
            expect(entries.items[0]!.amount).toBe(500000);

            // Verify outbox event
            const events = await tx.execute(
                sql`SELECT * FROM outbox.events WHERE event_type = 'finance.wallet.funded'`,
            );
            expect(events.length).toBeGreaterThanOrEqual(1);
        });
    });

    it("same webhook processed 10 times → exactly 1 credit", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);

            const mockGw = createMockPaystackGateway();
            const { reference } = await initiateFunding(tx, mockGw, userId, 100000, "user@test.vvs");

            const webhookPayload = JSON.stringify({
                event: "charge.success",
                data: { reference, amount: 100000 },
            });
            const signature = signPayload(webhookPayload);

            // Process 10 times
            for (let i = 0; i < 10; i++) {
                await handlePaystackWebhook(tx, gateway, webhookPayload, signature);
            }

            // Exactly 1 credit
            const balance = await walletsRepo.getBalance(userId);
            expect(balance.available).toBe(100000);

            const ledgerRepo = createLedgerRepo(tx);
            const entries = await ledgerRepo.getEntriesForWallet(wallet.id);
            expect(entries.items.length).toBe(1);
        });
    });

    it("webhook with invalid signature is rejected", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            await walletsRepo.create(userId);

            const mockGw = createMockPaystackGateway();
            const { reference } = await initiateFunding(tx, mockGw, userId, 100000, "user@test.vvs");

            const webhookPayload = JSON.stringify({
                event: "charge.success",
                data: { reference, amount: 100000 },
            });

            await expect(
                handlePaystackWebhook(tx, gateway, webhookPayload, "bad-signature"),
            ).rejects.toThrow("Invalid webhook signature");
        });
    });
});

describe("Withdrawals", () => {
    it("withdrawal deducts from available balance", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);
            await walletsRepo.atomicCredit(wallet.id, 500000, "seed");

            const withdrawal = await requestWithdrawal(tx, userId, 200000, {
                accountNumber: "1234567890",
                accountName: "Test User",
                bankCode: "058",
            });

            expect(withdrawal.amount).toBe(200000);
            expect(withdrawal.status).toBe("pending");

            const balance = await walletsRepo.getBalance(userId);
            expect(balance.available).toBe(300000);
        });
    });

    it("withdrawal exceeding balance throws InsufficientFundsError", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);
            await walletsRepo.atomicCredit(wallet.id, 100000, "seed");

            await expect(
                requestWithdrawal(tx, userId, 200000, {
                    accountNumber: "1234567890",
                    accountName: "Test User",
                    bankCode: "058",
                }),
            ).rejects.toThrow("Insufficient funds");
        });
    });

    it("failed transfer refunds wallet balance", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);
            await walletsRepo.atomicCredit(wallet.id, 500000, "seed");

            const withdrawal = await requestWithdrawal(tx, userId, 200000, {
                accountNumber: "1234567890",
                accountName: "Test User",
                bankCode: "058",
            });

            // Simulate processing
            const { processWithdrawal } = await import("../../src/withdrawals.js");
            const mockGw = createMockPaystackGateway();
            await processWithdrawal(tx, mockGw, withdrawal.id);

            // Simulate transfer failure webhook
            await handleTransferWebhook(tx, "transfer.failed", {
                transfer_code: `TRF_mock_vvs-withdraw-${withdrawal.id}`,
                reference: `vvs-withdraw-${withdrawal.id}`,
                amount: 200000,
            });

            // Balance should be restored
            const balance = await walletsRepo.getBalance(userId);
            expect(balance.available).toBe(500000);
        });
    });
});
