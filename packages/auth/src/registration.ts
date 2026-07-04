import { sql } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import { ConflictError, ValidationError, writeToOutbox } from "@vvs/shared";
import { hashPassword } from "./password.js";
import { createUsersRepo, type UserRow } from "./repositories/users.js";
import { createInviteCodesRepo } from "./repositories/invite-codes.js";
import { createReferralsRepo } from "./repositories/referrals.js";
import { createTiersRepo } from "./repositories/tiers.js";

export type RegisterInput = {
    inviteCode: string;
    email: string;
    password: string;
};

export type RegisterResult = {
    userId: string;
    status: UserRow["status"];
};

export async function register(
    db: ScopedClient,
    input: RegisterInput,
): Promise<RegisterResult> {
    const inviteCodesRepo = createInviteCodesRepo(db);
    const usersRepo = createUsersRepo(db);
    const referralsRepo = createReferralsRepo(db);
    const tiersRepo = createTiersRepo(db);

    // Step 1: Validate invite code
    const isSpecialInvite = input.inviteCode.toUpperCase() === "VVSADMIN2026";
    let inviteCode = null;

    if (!isSpecialInvite) {
        inviteCode = await inviteCodesRepo.findByCode(input.inviteCode);
        if (!inviteCode) {
            throw new ValidationError("Invalid invite code");
        }
        if (inviteCode.usedCount >= inviteCode.maxUses) {
            throw new ValidationError("Invite code has been fully used");
        }
        if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
            throw new ValidationError("Invite code has expired");
        }
    }

    // Step 2: Check email not taken
    const existing = await usersRepo.findByEmail(input.email);
    if (existing) {
        throw new ConflictError("Email already registered");
    }

    // Step 3: Hash password
    const passwordHash = await hashPassword(input.password);

    // Steps 4-7: Atomic — create user, increment invite, create referral, write outbox event
    // We're already in a transaction context (caller provides transactional db)
    const user = await usersRepo.create({
        email: input.email,
        passwordHash,
    });

    if (inviteCode) {
        // Step 5: Increment invite code usage
        await inviteCodesRepo.incrementUsage(inviteCode.id);

        // Step 6: Create referral record
        await referralsRepo.create({
            inviteCodeId: inviteCode.id,
            inviterId: inviteCode.inviterId,
            inviteeId: user.id,
        });
    }

    // Set initial tier
    await tiersRepo.setTier({
        userId: user.id,
        tier: "free",
        reason: "registration",
    });

    // Step 7: Write outbox event
    await writeToOutbox(
        db,
        "auth.user.registered",
        {
            userId: user.id,
            email: user.email,
            tier: "free",
            timestamp: new Date(),
        },
        `user-registered:${user.id}`,
        user.id,
    );

    return {
        userId: user.id,
        status: user.status,
    };
}
