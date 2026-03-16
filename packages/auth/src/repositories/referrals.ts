import { and, eq, sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { referrals } from "../schema.js";
import { users } from "../schema.js";

export type NewReferral = {
    inviteCodeId: string;
    inviterId: string;
    inviteeId: string;
};

export type ReferralRow = typeof referrals.$inferSelect;

export function createReferralsRepo(db: ScopedClient) {
    return {
        async create(data: NewReferral): Promise<ReferralRow> {
            const rows = await db.insert(referrals).values(data).returning();
            return rows[0]!;
        },

        async findById(id: string): Promise<ReferralRow | undefined> {
            const rows = await db.select().from(referrals).where(eq(referrals.id, id));
            return rows[0];
        },

        async findByInvitee(inviteeId: string): Promise<ReferralRow | undefined> {
            const rows = await db
                .select()
                .from(referrals)
                .where(eq(referrals.inviteeId, inviteeId));
            return rows[0];
        },

        async updateStatus(id: string, status: ReferralRow["status"]): Promise<ReferralRow | undefined> {
            const rows = await db
                .update(referrals)
                .set({ status })
                .where(eq(referrals.id, id))
                .returning();
            return rows[0];
        },

        async countBannedReferrals(inviterId: string): Promise<number> {
            const rows = await db
                .select({ count: sql<number>`COUNT(*)::int` })
                .from(referrals)
                .innerJoin(users, eq(referrals.inviteeId, users.id))
                .where(
                    and(
                        eq(referrals.inviterId, inviterId),
                        eq(users.status, "banned"),
                    ),
                );
            return rows[0]?.count ?? 0;
        },
    };
}
