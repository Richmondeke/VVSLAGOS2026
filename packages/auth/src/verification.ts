import type { ScopedClient } from "@vvs/shared";
import { NotFoundError, writeToOutbox } from "@vvs/shared";
import type { MemberTier, VerificationStatus } from "@vvs/contracts";
import { createVerificationsRepo, type VerificationRow } from "./repositories/verifications.js";
import { createTiersRepo } from "./repositories/tiers.js";
import { createUsersRepo } from "./repositories/users.js";
import { createKycDocumentsRepo } from "./repositories/kyc-documents.js";

export type DocumentInput = {
    docType: "NIN" | "drivers_license" | "passport" | "voters_card";
    frontUrl: string;
    backUrl?: string;
};

export async function submitVerification(
    db: ScopedClient,
    userId: string,
    docs: DocumentInput[],
): Promise<VerificationRow> {
    const kycRepo = createKycDocumentsRepo(db);
    const verificationsRepo = createVerificationsRepo(db);

    // Store document references
    for (const doc of docs) {
        await kycRepo.create({
            userId,
            docType: doc.docType,
            frontUrl: doc.frontUrl,
            backUrl: doc.backUrl,
        });
    }

    // Create pending verification record
    return verificationsRepo.create({
        userId,
        status: "pending",
        method: "automated",
    });
}

export async function grantProvisionalVerification(
    db: ScopedClient,
    userId: string,
    adminId: string,
): Promise<VerificationRow> {
    const verificationsRepo = createVerificationsRepo(db);
    const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    return verificationsRepo.create({
        userId,
        status: "provisional",
        method: "manual",
        grantedBy: adminId,
        expiresAt: ninetyDays,
    });
}

export async function checkExpiredProvisional(
    db: ScopedClient,
): Promise<string[]> {
    const verificationsRepo = createVerificationsRepo(db);
    const tiersRepo = createTiersRepo(db);

    const expired = await verificationsRepo.findExpiredProvisional();
    const affectedUserIds: string[] = [];

    for (const v of expired) {
        await verificationsRepo.updateStatus(v.id, "expired");

        // Downgrade tier to free
        const currentTier = await tiersRepo.getCurrentTier(v.userId);
        if (currentTier && currentTier.tier !== "free") {
            await tiersRepo.setTier({
                userId: v.userId,
                tier: "free",
                reason: "provisional verification expired",
            });
        }

        affectedUserIds.push(v.userId);
    }

    return affectedUserIds;
}

export type KycProviderResult = {
    success: boolean;
    reason?: string;
};

export async function verifyIdentity(
    db: ScopedClient,
    userId: string,
    providerResult: KycProviderResult,
): Promise<void> {
    const verificationsRepo = createVerificationsRepo(db);
    const tiersRepo = createTiersRepo(db);

    // Find the user's latest pending verification
    const verifications = await verificationsRepo.findByUserId(userId);
    const pending = verifications.find((v) => v.status === "pending");
    if (!pending) {
        throw new NotFoundError("No pending verification found");
    }

    if (providerResult.success) {
        await verificationsRepo.updateStatus(pending.id, "verified");

        // Upgrade to verified tier
        const currentTier = await tiersRepo.getCurrentTier(userId);
        const previousTier: MemberTier = currentTier?.tier ?? "free";

        if (previousTier !== "verified" && previousTier !== "pro") {
            await tiersRepo.setTier({
                userId,
                tier: "verified",
                reason: "KYC verification passed",
            });
        }

        await writeToOutbox(
            db,
            "auth.identity.verified",
            {
                userId,
                verificationId: pending.id,
                newTier: "verified",
                previousTier,
                timestamp: new Date(),
            },
            `identity-verified:${pending.id}`,
            userId,
        );
    } else {
        await verificationsRepo.updateStatus(pending.id, "rejected");
    }
}
