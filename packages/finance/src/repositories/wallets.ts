import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { InsufficientFundsError, NotFoundError } from "@vvs/shared";
import { wallets } from "../schema.js";

export type WalletRow = typeof wallets.$inferSelect;

export function createWalletsRepo(db: ScopedClient) {
    return {
        async create(userId: string): Promise<WalletRow> {
            const rows = await db
                .insert(wallets)
                .values({ userId })
                .returning();
            return rows[0]!;
        },

        async findByUserId(userId: string): Promise<WalletRow> {
            const rows = await db.select().from(wallets).where(eq(wallets.userId, userId));
            if (!rows[0]) {
                throw new NotFoundError("Wallet", userId);
            }
            return rows[0];
        },

        async findById(id: string): Promise<WalletRow> {
            const rows = await db.select().from(wallets).where(eq(wallets.id, id));
            if (!rows[0]) {
                throw new NotFoundError("Wallet", id);
            }
            return rows[0];
        },

        async getBalance(userId: string): Promise<{ available: number; locked: number }> {
            const wallet = await this.findByUserId(userId);
            return { available: wallet.availableBalance, locked: wallet.lockedBalance };
        },

        /**
         * Atomically debits available_balance. Returns 0 rows if insufficient funds.
         * Uses conditional UPDATE to prevent double-spend.
         */
        async atomicDebit(walletId: string, amount: number, _idempotencyKey: string): Promise<number> {
            const result = await db.execute(
                sql`UPDATE finance.wallets
                    SET available_balance = available_balance - ${amount},
                        updated_at = NOW()
                    WHERE id = ${walletId}
                      AND available_balance >= ${amount}
                    RETURNING available_balance`,
            );
            if (result.length === 0) {
                throw new InsufficientFundsError(walletId, amount);
            }
            return Number(result[0].available_balance);
        },

        /**
         * Atomically credits available_balance.
         */
        async atomicCredit(walletId: string, amount: number, _idempotencyKey: string): Promise<number> {
            const result = await db.execute(
                sql`UPDATE finance.wallets
                    SET available_balance = available_balance + ${amount},
                        updated_at = NOW()
                    WHERE id = ${walletId}
                    RETURNING available_balance`,
            );
            if (result.length === 0) {
                throw new NotFoundError("Wallet", walletId);
            }
            return Number(result[0].available_balance);
        },

        /**
         * Moves funds from available to locked (for escrow funding).
         */
        async lockFunds(walletId: string, amount: number): Promise<void> {
            const result = await db.execute(
                sql`UPDATE finance.wallets
                    SET available_balance = available_balance - ${amount},
                        locked_balance = locked_balance + ${amount},
                        updated_at = NOW()
                    WHERE id = ${walletId}
                      AND available_balance >= ${amount}
                    RETURNING id`,
            );
            if (result.length === 0) {
                throw new InsufficientFundsError(walletId, amount);
            }
        },

        /**
         * Moves funds from locked back to available (for refund).
         */
        async unlockFunds(walletId: string, amount: number): Promise<void> {
            const result = await db.execute(
                sql`UPDATE finance.wallets
                    SET locked_balance = locked_balance - ${amount},
                        available_balance = available_balance + ${amount},
                        updated_at = NOW()
                    WHERE id = ${walletId}
                      AND locked_balance >= ${amount}
                    RETURNING id`,
            );
            if (result.length === 0) {
                throw new NotFoundError("Wallet", walletId);
            }
        },

        /**
         * Deducts from locked balance (for escrow release to provider).
         */
        async deductLocked(walletId: string, amount: number): Promise<void> {
            const result = await db.execute(
                sql`UPDATE finance.wallets
                    SET locked_balance = locked_balance - ${amount},
                        updated_at = NOW()
                    WHERE id = ${walletId}
                      AND locked_balance >= ${amount}
                    RETURNING id`,
            );
            if (result.length === 0) {
                throw new NotFoundError("Wallet", walletId);
            }
        },
    };
}
