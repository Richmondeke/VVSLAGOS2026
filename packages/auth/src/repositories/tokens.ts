import { and, eq, isNull, lt, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { tokens } from "../schema.js";

export type NewToken = {
    userId: string;
    type: "email_verify" | "password_reset" | "refresh";
    token: string;
    expiresAt: Date;
};

export type TokenRow = typeof tokens.$inferSelect;

export function createTokensRepo(db: ScopedClient) {
    return {
        async create(data: NewToken): Promise<TokenRow> {
            const rows = await db.insert(tokens).values(data).returning();
            return rows[0]!;
        },

        async findByToken(token: string): Promise<TokenRow | undefined> {
            const rows = await db
                .select()
                .from(tokens)
                .where(and(eq(tokens.token, token), isNull(tokens.usedAt)));
            return rows[0];
        },

        async markUsed(id: string): Promise<void> {
            await db
                .update(tokens)
                .set({ usedAt: sql`NOW()` })
                .where(eq(tokens.id, id));
        },

        async deleteExpired(): Promise<number> {
            const rows = await db
                .delete(tokens)
                .where(lt(tokens.expiresAt, sql`NOW()`))
                .returning({ id: tokens.id });
            return rows.length;
        },
    };
}
