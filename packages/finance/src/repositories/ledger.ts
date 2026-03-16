import { eq, sql, desc, count } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { ledgerEntries } from "../schema.js";

export type LedgerEntryRow = typeof ledgerEntries.$inferSelect;

export type NewLedgerEntry = {
    walletId: string;
    entryType: "credit" | "debit";
    amount: number;
    balanceAfter: number;
    reference?: string;
    idempotencyKey: string;
};

export function createLedgerRepo(db: ScopedClient) {
    return {
        async recordEntry(data: NewLedgerEntry): Promise<LedgerEntryRow> {
            const rows = await db
                .insert(ledgerEntries)
                .values({
                    walletId: data.walletId,
                    entryType: data.entryType,
                    amount: data.amount,
                    balanceAfter: data.balanceAfter,
                    reference: data.reference ?? null,
                    idempotencyKey: data.idempotencyKey,
                })
                .returning();
            return rows[0]!;
        },

        async getEntriesForWallet(
            walletId: string,
            page = 1,
            pageSize = 20,
        ): Promise<{ items: LedgerEntryRow[]; total: number; page: number; pageSize: number }> {
            const offset = (page - 1) * pageSize;

            const [items, totalResult] = await Promise.all([
                db
                    .select()
                    .from(ledgerEntries)
                    .where(eq(ledgerEntries.walletId, walletId))
                    .orderBy(desc(ledgerEntries.id))
                    .limit(pageSize)
                    .offset(offset),
                db
                    .select({ count: count() })
                    .from(ledgerEntries)
                    .where(eq(ledgerEntries.walletId, walletId)),
            ]);

            return {
                items,
                total: totalResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        /**
         * Recalculates balance from ledger entries and compares to stored wallet balance.
         * Used by reconciliation job.
         */
        async verifyBalance(
            walletId: string,
            storedBalance: number,
        ): Promise<{ calculated: number; stored: number; drift: number; isConsistent: boolean }> {
            const result = await db.execute(
                sql`SELECT
                    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) AS total_credits,
                    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) AS total_debits
                FROM finance.ledger_entries
                WHERE wallet_id = ${walletId}`,
            );

            const totalCredits = Number(result[0]?.total_credits ?? 0);
            const totalDebits = Number(result[0]?.total_debits ?? 0);
            const calculated = totalCredits - totalDebits;
            const drift = Math.abs(calculated - storedBalance);

            return {
                calculated,
                stored: storedBalance,
                drift,
                isConsistent: drift === 0,
            };
        },
    };
}
