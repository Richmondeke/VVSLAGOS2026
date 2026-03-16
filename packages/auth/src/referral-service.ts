import { eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { createReferralsRepo, type ReferralRow } from "./repositories/referrals.js";
import { createUsersRepo } from "./repositories/users.js";
import { referrals as referralsTable } from "./schema.js";

export type ReferralChainEntry = {
    userId: string;
    email: string;
    depth: number;
};

export async function getReferralChain(
    db: ScopedClient,
    userId: string,
): Promise<ReferralChainEntry[]> {
    const referralsRepo = createReferralsRepo(db);
    const usersRepo = createUsersRepo(db);
    const chain: ReferralChainEntry[] = [];
    let currentUserId = userId;
    let depth = 0;

    while (depth < 10) {
        const referral = await referralsRepo.findByInvitee(currentUserId);
        if (!referral) break;

        const inviter = await usersRepo.findById(referral.inviterId);
        if (!inviter) break;

        depth++;
        chain.push({ userId: inviter.id, email: inviter.email, depth });
        currentUserId = inviter.id;
    }

    return chain;
}

export async function getReferralsByInviter(
    db: ScopedClient,
    userId: string,
): Promise<ReferralRow[]> {
    return db.select().from(referralsTable).where(eq(referralsTable.inviterId, userId));
}

const ACCOUNTABILITY_HALVE_THRESHOLD = 3;
const ACCOUNTABILITY_FLAG_THRESHOLD = 5;

export type AccountabilityResult = {
    bannedCount: number;
    inviteLimitReduced: boolean;
    flaggedForReview: boolean;
};

export async function checkAccountability(
    db: ScopedClient,
    inviterId: string,
): Promise<AccountabilityResult> {
    const referralsRepo = createReferralsRepo(db);
    const bannedCount = await referralsRepo.countBannedReferrals(inviterId);

    return {
        bannedCount,
        inviteLimitReduced: bannedCount >= ACCOUNTABILITY_HALVE_THRESHOLD,
        flaggedForReview: bannedCount >= ACCOUNTABILITY_FLAG_THRESHOLD,
    };
}

export async function handleReferralBanned(
    db: ScopedClient,
    inviteeId: string,
): Promise<AccountabilityResult | null> {
    const referralsRepo = createReferralsRepo(db);
    const referral = await referralsRepo.findByInvitee(inviteeId);
    if (!referral) return null;

    return checkAccountability(db, referral.inviterId);
}
