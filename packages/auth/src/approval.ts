import { eq } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, writeToOutbox } from "@vvs/shared";
import { createUsersRepo, type UserRow } from "./repositories/users.js";
import { createVerificationsRepo } from "./repositories/verifications.js";
import { createReferralsRepo } from "./repositories/referrals.js";
import { users } from "./schema.js";

export async function getPendingApprovals(db: ScopedClient): Promise<UserRow[]> {
    return db.select().from(users).where(eq(users.status, "pending_approval"));
}

export async function approveUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    grantProvisional = false,
): Promise<void> {
    const usersRepo = createUsersRepo(db);
    const user = await usersRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await usersRepo.updateStatus(userId, "active");

    if (grantProvisional) {
        const verificationsRepo = createVerificationsRepo(db);
        const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        await verificationsRepo.create({
            userId,
            status: "provisional",
            method: "manual",
            grantedBy: adminId,
            expiresAt: ninetyDays,
        });
    }

    // Update referral status to approved
    const referralsRepo = createReferralsRepo(db);
    const referral = await referralsRepo.findByInvitee(userId);
    if (referral) {
        await referralsRepo.updateStatus(referral.id, "approved");
    }

    await writeToOutbox(
        db,
        "auth.referral.approved",
        {
            referralId: referral?.id ?? "",
            inviteeId: userId,
            inviterId: referral?.inviterId ?? "",
            timestamp: new Date(),
        },
        `referral-approved:${userId}`,
        userId,
    );
}

export async function rejectUser(
    db: ScopedClient,
    userId: string,
    adminId: string,
    reason: string,
): Promise<void> {
    const usersRepo = createUsersRepo(db);
    const user = await usersRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await usersRepo.updateStatus(userId, "rejected");

    // Update referral status to rejected
    const referralsRepo = createReferralsRepo(db);
    const referral = await referralsRepo.findByInvitee(userId);
    if (referral) {
        await referralsRepo.updateStatus(referral.id, "rejected");
    }

    await writeToOutbox(
        db,
        "auth.user.deactivated",
        {
            userId,
            reason,
            timestamp: new Date(),
        },
        `user-rejected:${userId}`,
        userId,
    );
}
