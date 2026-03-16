import type { ScopedClient } from "@vvs/shared";
import { createWorker, createChildLogger } from "@vvs/shared";
import type { UserRegisteredPayload, IdentityVerifiedPayload } from "@vvs/contracts";
import { handleUserRegistered, handleIdentityVerified } from "@vvs/members";

const logger = createChildLogger("members-consumers");

/**
 * Starts BullMQ workers that consume auth events relevant to the members domain.
 */
export function startMembersConsumers(membersDb: ScopedClient): { registeredWorker: unknown; verifiedWorker: unknown } {
    // auth.user.registered → scaffold empty profile
    const registeredWorker = createWorker(
        "auth.user.registered",
        async (job) => {
            const payload = job.data as UserRegisteredPayload;
            logger.info({ userId: payload.userId }, "Processing auth.user.registered");
            await handleUserRegistered(membersDb, payload);
        },
    );

    // auth.identity.verified → update badge display
    const verifiedWorker = createWorker(
        "auth.identity.verified",
        async (job) => {
            const payload = job.data as IdentityVerifiedPayload;
            logger.info({ userId: payload.userId }, "Processing auth.identity.verified");
            await handleIdentityVerified(membersDb, payload);
        },
    );

    logger.info("Members event consumers started");

    return { registeredWorker, verifiedWorker };
}
