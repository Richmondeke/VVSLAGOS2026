import type { ScopedClient } from "@vvs/shared";
import { createChildLogger } from "@vvs/shared";
import type { UserRegisteredPayload, IdentityVerifiedPayload } from "@vvs/contracts";
import { createProfile } from "./profiles.js";
import { createProfilesRepo } from "./repositories/profiles.js";

const logger = createChildLogger("members-consumers");

/**
 * Handles `auth.user.registered` — scaffolds an empty profile for the new user.
 */
export async function handleUserRegistered(
    db: ScopedClient,
    payload: UserRegisteredPayload,
): Promise<void> {
    logger.info({ userId: payload.userId }, "Creating profile for new user");
    await createProfile(db, payload.userId);
}

/**
 * Handles `auth.identity.verified` — updates badge display on profile.
 * When identity is verified, the profile availability is kept as-is,
 * but we could update display-related flags in future iterations.
 */
export async function handleIdentityVerified(
    db: ScopedClient,
    payload: IdentityVerifiedPayload,
): Promise<void> {
    logger.info(
        { userId: payload.userId, newTier: payload.newTier },
        "Identity verified, updating profile",
    );

    const repo = createProfilesRepo(db);
    const profile = await repo.findByUserId(payload.userId);

    if (!profile) {
        logger.warn({ userId: payload.userId }, "Profile not found for identity verification");
        return;
    }

    // Profile exists — tier/badge info is resolved at read time from auth,
    // but we trigger an update to bump updatedAt for cache invalidation
    await repo.update(payload.userId, {});
}
