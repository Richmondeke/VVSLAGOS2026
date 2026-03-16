import { eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { inviteCodes } from "../schema.js";

export type NewInviteCode = {
    inviterId: string;
    code: string;
    maxUses: number;
    expiresAt?: Date;
};

export type InviteCodeRow = typeof inviteCodes.$inferSelect;

export function createInviteCodesRepo(db: ScopedClient) {
    return {
        async create(data: NewInviteCode): Promise<InviteCodeRow> {
            const rows = await db
                .insert(inviteCodes)
                .values({
                    inviterId: data.inviterId,
                    code: data.code,
                    maxUses: data.maxUses,
                    expiresAt: data.expiresAt ?? null,
                })
                .returning();
            return rows[0]!;
        },

        async findByCode(code: string): Promise<InviteCodeRow | undefined> {
            const rows = await db
                .select()
                .from(inviteCodes)
                .where(eq(inviteCodes.code, code));
            return rows[0];
        },

        async incrementUsage(id: string): Promise<void> {
            await db
                .update(inviteCodes)
                .set({ usedCount: sql`${inviteCodes.usedCount} + 1` })
                .where(eq(inviteCodes.id, id));
        },

        async getByInviter(inviterId: string): Promise<InviteCodeRow[]> {
            return db
                .select()
                .from(inviteCodes)
                .where(eq(inviteCodes.inviterId, inviterId));
        },
    };
}
