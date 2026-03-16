import { randomBytes } from "node:crypto";
import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError, ValidationError } from "@vvs/shared";
import type { MemberTier } from "@vvs/contracts";
import { createInviteCodesRepo, type InviteCodeRow } from "./repositories/invite-codes.js";
import { createTiersRepo } from "./repositories/tiers.js";

// Default invite limits by tier — can be overridden via getPlatformSettings
const DEFAULT_INVITE_LIMITS: Record<MemberTier, number> = {
    free: 1,
    verified: 3,
    pro: 10,
};

export type PlatformSettings = {
    inviteLimits?: Partial<Record<MemberTier, number>>;
};

let platformSettings: PlatformSettings = {};

export function setPlatformSettings(settings: PlatformSettings): void {
    platformSettings = settings;
}

function getInviteLimit(tier: MemberTier): number {
    return platformSettings.inviteLimits?.[tier] ?? DEFAULT_INVITE_LIMITS[tier];
}

export async function generateInvite(
    db: ScopedClient,
    userId: string,
): Promise<InviteCodeRow> {
    const tiersRepo = createTiersRepo(db);
    const codesRepo = createInviteCodesRepo(db);

    const tierRow = await tiersRepo.getCurrentTier(userId);
    const tier: MemberTier = tierRow?.tier ?? "free";
    const limit = getInviteLimit(tier);

    const existingCodes = await codesRepo.getByInviter(userId);
    if (existingCodes.length >= limit) {
        throw new ForbiddenError(`Invite limit reached for ${tier} tier (max ${limit})`);
    }

    const code = randomBytes(6).toString("hex").toUpperCase();
    return codesRepo.create({
        inviterId: userId,
        code,
        maxUses: 1,
    });
}

export async function listInvites(
    db: ScopedClient,
    userId: string,
): Promise<InviteCodeRow[]> {
    const codesRepo = createInviteCodesRepo(db);
    return codesRepo.getByInviter(userId);
}

export async function validateInvite(
    db: ScopedClient,
    code: string,
): Promise<boolean> {
    const codesRepo = createInviteCodesRepo(db);
    const inviteCode = await codesRepo.findByCode(code);
    if (!inviteCode) return false;
    if (inviteCode.usedCount >= inviteCode.maxUses) return false;
    if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) return false;
    return true;
}
