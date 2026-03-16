import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createWalletsRepo } from "../../src/repositories/wallets.js";
import { createLedgerRepo } from "../../src/repositories/ledger.js";

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

describe("Wallet Repository", () => {
    it("creates a zero-balance wallet", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();

            const wallet = await repo.create(userId);

            expect(wallet.userId).toBe(userId);
            expect(wallet.availableBalance).toBe(0);
            expect(wallet.lockedBalance).toBe(0);
            expect(wallet.currency).toBe("NGN");
        });
    });

    it("finds wallet by userId", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();

            const created = await repo.create(userId);
            const found = await repo.findByUserId(userId);

            expect(found.id).toBe(created.id);
        });
    });

    it("throws NotFoundError for missing wallet", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            await expect(repo.findByUserId(crypto.randomUUID())).rejects.toThrow("not found");
        });
    });

    it("returns balance in kobo", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            await repo.create(userId);

            const balance = await repo.getBalance(userId);
            expect(balance).toEqual({ available: 0, locked: 0 });
        });
    });

    it("atomicCredit increases available balance", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await repo.create(userId);

            const newBalance = await repo.atomicCredit(wallet.id, 100000, "credit-1");
            expect(newBalance).toBe(100000);

            const balance = await repo.getBalance(userId);
            expect(balance.available).toBe(100000);
        });
    });

    it("atomicDebit decreases available balance", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await repo.create(userId);

            await repo.atomicCredit(wallet.id, 100000, "credit-1");
            const newBalance = await repo.atomicDebit(wallet.id, 30000, "debit-1");
            expect(newBalance).toBe(70000);
        });
    });

    it("atomicDebit throws InsufficientFundsError when balance too low", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await repo.create(userId);

            await repo.atomicCredit(wallet.id, 5000, "credit-1");
            await expect(repo.atomicDebit(wallet.id, 10000, "debit-1")).rejects.toThrow(
                "Insufficient funds",
            );
        });
    });

    it("lockFunds moves from available to locked", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await repo.create(userId);

            await repo.atomicCredit(wallet.id, 100000, "credit-1");
            await repo.lockFunds(wallet.id, 40000);

            const balance = await repo.getBalance(userId);
            expect(balance.available).toBe(60000);
            expect(balance.locked).toBe(40000);
        });
    });

    it("unlockFunds moves from locked back to available", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await repo.create(userId);

            await repo.atomicCredit(wallet.id, 100000, "credit-1");
            await repo.lockFunds(wallet.id, 40000);
            await repo.unlockFunds(wallet.id, 40000);

            const balance = await repo.getBalance(userId);
            expect(balance.available).toBe(100000);
            expect(balance.locked).toBe(0);
        });
    });
});

describe("Ledger Repository", () => {
    it("records a credit entry", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const ledgerRepo = createLedgerRepo(tx);
            const wallet = await walletsRepo.create(crypto.randomUUID());

            const entry = await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "credit",
                amount: 50000,
                balanceAfter: 50000,
                reference: "fund-001",
                idempotencyKey: "idem-credit-1",
            });

            expect(entry.entryType).toBe("credit");
            expect(entry.amount).toBe(50000);
            expect(entry.balanceAfter).toBe(50000);
        });
    });

    it("records credit and debit, verifies balance consistency", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const ledgerRepo = createLedgerRepo(tx);
            const wallet = await walletsRepo.create(crypto.randomUUID());

            // Credit 100000
            await walletsRepo.atomicCredit(wallet.id, 100000, "c1");
            await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "credit",
                amount: 100000,
                balanceAfter: 100000,
                idempotencyKey: "idem-c1",
            });

            // Debit 30000
            await walletsRepo.atomicDebit(wallet.id, 30000, "d1");
            await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "debit",
                amount: 30000,
                balanceAfter: 70000,
                idempotencyKey: "idem-d1",
            });

            // Verify balance = credits - debits = 70000
            const verification = await ledgerRepo.verifyBalance(wallet.id, 70000);
            expect(verification.calculated).toBe(70000);
            expect(verification.isConsistent).toBe(true);
            expect(verification.drift).toBe(0);
        });
    });

    it("paginates ledger entries", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const ledgerRepo = createLedgerRepo(tx);
            const wallet = await walletsRepo.create(crypto.randomUUID());

            // Create 5 entries
            for (let i = 1; i <= 5; i++) {
                await ledgerRepo.recordEntry({
                    walletId: wallet.id,
                    entryType: "credit",
                    amount: 10000,
                    balanceAfter: 10000 * i,
                    idempotencyKey: `idem-page-${i}`,
                });
            }

            const page1 = await ledgerRepo.getEntriesForWallet(wallet.id, 1, 2);
            expect(page1.items.length).toBe(2);
            expect(page1.total).toBe(5);
            expect(page1.page).toBe(1);
            expect(page1.pageSize).toBe(2);

            const page3 = await ledgerRepo.getEntriesForWallet(wallet.id, 3, 2);
            expect(page3.items.length).toBe(1);
        });
    });

    it("detects drift when stored balance diverges from ledger", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const ledgerRepo = createLedgerRepo(tx);
            const wallet = await walletsRepo.create(crypto.randomUUID());

            await ledgerRepo.recordEntry({
                walletId: wallet.id,
                entryType: "credit",
                amount: 100000,
                balanceAfter: 100000,
                idempotencyKey: "idem-drift-1",
            });

            // Stored balance is 0 (we didn't actually credit the wallet), ledger says 100000
            const verification = await ledgerRepo.verifyBalance(wallet.id, 0);
            expect(verification.calculated).toBe(100000);
            expect(verification.stored).toBe(0);
            expect(verification.drift).toBe(100000);
            expect(verification.isConsistent).toBe(false);
        });
    });
});

describe("Concurrency", () => {
    it("50 concurrent debits from ₦4,000 wallet: exactly 40 succeed", async () => {
        await withTestTransaction(db, async (tx) => {
            const walletsRepo = createWalletsRepo(tx);
            const userId = crypto.randomUUID();
            const wallet = await walletsRepo.create(userId);

            // Fund with ₦4,000 = 400,000 kobo
            await walletsRepo.atomicCredit(wallet.id, 400000, "seed");

            // 50 concurrent debits of ₦100 = 10,000 kobo
            const results = await Promise.allSettled(
                Array.from({ length: 50 }, (_, i) =>
                    walletsRepo.atomicDebit(wallet.id, 10000, `debit-${i}`),
                ),
            );

            const successes = results.filter((r) => r.status === "fulfilled");
            const failures = results.filter((r) => r.status === "rejected");

            expect(successes.length).toBe(40);
            expect(failures.length).toBe(10);

            // Final balance should be exactly 0
            const balance = await walletsRepo.getBalance(userId);
            expect(balance.available).toBe(0);
        });
    });
});
