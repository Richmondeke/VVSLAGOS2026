import type { ScopedClient } from "@vvs/shared";
import type {
    IAuthService,
    IReferralService,
    IIdentityService,
    RegisterInput,
    LoginInput,
    DocumentInput,
    AuthUser,
    Session,
    InviteCode,
    Referral,
    Verification,
} from "@vvs/contracts";
import type { MemberTier, VerificationStatus } from "@vvs/contracts";
import { register } from "./registration.js";
import { login } from "./login.js";
import { refreshSession, revokeSession, issueAccessToken, issueRefreshToken } from "./session.js";
import { generateInvite, validateInvite } from "./invites.js";
import { submitVerification, verifyIdentity } from "./verification.js";
import { getTier, setTier } from "./tier-service.js";
import { createUsersRepo } from "./repositories/users.js";
import { createReferralsRepo } from "./repositories/referrals.js";
import { createSessionsRepo } from "./repositories/sessions.js";

export function createAuthService(db: ScopedClient): IAuthService {
    return {
        async register(input: RegisterInput): Promise<AuthUser> {
            const result = await register(db, {
                inviteCode: input.inviteCode,
                email: input.email ?? "",
                password: input.password,
            });
            const usersRepo = createUsersRepo(db);
            const user = await usersRepo.findById(result.userId);
            const tier = await getTier(db, result.userId);
            return {
                id: user!.id,
                email: user!.email,
                tier,
                verificationStatus: "pending",
                createdAt: user!.createdAt,
                updatedAt: user!.updatedAt,
            };
        },

        async login(input: LoginInput): Promise<Session> {
            const result = await login(db, {
                email: input.email ?? "",
                password: input.password,
                deviceInfo: input.deviceId,
            });
            const sessionsRepo = createSessionsRepo(db);
            const session = await sessionsRepo.findById(result.sessionId);
            return {
                id: session!.id,
                userId: session!.userId,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresAt: session!.expiresAt,
                createdAt: session!.createdAt,
            };
        },

        async refreshSession(token: string): Promise<Session> {
            const result = await refreshSession(db, token);
            return {
                id: "",
                userId: "",
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                createdAt: new Date(),
            };
        },

        async revokeSession(sessionId: string): Promise<void> {
            await revokeSession(db, sessionId);
        },
    };
}

export function createReferralService(db: ScopedClient): IReferralService {
    return {
        async generateInvite(userId: string): Promise<InviteCode> {
            const code = await generateInvite(db, userId);
            return {
                id: code.id,
                code: code.code,
                issuerId: code.inviterId,
                maxUses: code.maxUses,
                usedCount: code.usedCount,
                expiresAt: code.expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                createdAt: code.createdAt,
            };
        },

        async redeemInvite(code: string, userId: string): Promise<Referral> {
            // Redeem is handled in the registration flow
            const referralsRepo = createReferralsRepo(db);
            const referral = await referralsRepo.findByInvitee(userId);
            if (!referral) throw new Error("Referral not found");
            return {
                id: referral.id,
                inviteeId: referral.inviteeId,
                inviterId: referral.inviterId,
                status: referral.status,
                createdAt: referral.createdAt,
            };
        },

        async approve(referralId: string): Promise<void> {
            const referralsRepo = createReferralsRepo(db);
            await referralsRepo.updateStatus(referralId, "approved");
        },

        async reject(referralId: string, reason: string): Promise<void> {
            const referralsRepo = createReferralsRepo(db);
            await referralsRepo.updateStatus(referralId, "rejected");
        },
    };
}

export function createIdentityService(db: ScopedClient): IIdentityService {
    return {
        async submitVerification(userId: string, docs: DocumentInput[]): Promise<Verification> {
            const v = await submitVerification(db, userId, docs.map((d) => ({
                docType: d.type as "NIN" | "drivers_license" | "passport" | "voters_card",
                frontUrl: d.url,
            })));
            return {
                id: v.id,
                userId: v.userId,
                status: v.status as VerificationStatus,
                documentUrls: [],
                submittedAt: v.createdAt,
                updatedAt: v.updatedAt,
            };
        },

        async getStatus(userId: string): Promise<VerificationStatus> {
            const { createVerificationsRepo } = await import("./repositories/verifications.js");
            const repo = createVerificationsRepo(db);
            const verifications = await repo.findByUserId(userId);
            if (verifications.length === 0) return "pending";
            return verifications[0]!.status as VerificationStatus;
        },

        async getTier(userId: string): Promise<MemberTier> {
            return getTier(db, userId);
        },

        async upgradeTier(userId: string, tier: MemberTier): Promise<void> {
            await setTier(db, userId, tier, "", "interface upgrade");
        },
    };
}
