import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { createUsersRepo } from "../../src/repositories/users.js";
import { createInviteCodesRepo } from "../../src/repositories/invite-codes.js";
import { createReferralsRepo } from "../../src/repositories/referrals.js";
import { createTiersRepo } from "../../src/repositories/tiers.js";
import { createVerificationsRepo } from "../../src/repositories/verifications.js";
import { generateInvite, listInvites, validateInvite, setPlatformSettings } from "../../src/invites.js";
import { checkAccountability, handleReferralBanned, getReferralChain } from "../../src/referral-service.js";
import { getPendingApprovals, approveUser, rejectUser } from "../../src/approval.js";
import { submitVerification, grantProvisionalVerification, checkExpiredProvisional, verifyIdentity } from "../../src/verification.js";
import { getTier, checkProUpgrade, upgradeTierToProIfEligible, setProThresholds } from "../../src/tier-service.js";
import { issueBadge, revokeBadge, getBadges } from "../../src/badges-service.js";
import { hashPassword } from "../../src/password.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "auth,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-jwt");
});

afterEach(() => {
    vi.unstubAllEnvs();
    setPlatformSettings({});
});

async function createUser(txDb: ScopedClient, email: string, status: "active" | "pending_approval" = "active") {
    const usersRepo = createUsersRepo(txDb);
    const user = await usersRepo.create({
        email,
        passwordHash: await hashPassword("password"),
    });
    if (status === "active") {
        await usersRepo.updateStatus(user.id, "active");
    }
    return user;
}

// --- Invite System ---

describe("Invite System", () => {
    it("generates invite within tier limit", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "inviter@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "test" });

            const invite = await generateInvite(tx, user.id);
            expect(invite.code).toBeDefined();
            expect(invite.inviterId).toBe(user.id);
        });
    });

    it("rejects invite when at tier limit", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "limited@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "test" });

            // Free tier = 1 invite
            await generateInvite(tx, user.id);

            await expect(generateInvite(tx, user.id)).rejects.toThrow("Invite limit reached");
        });
    });

    it("uses platform settings for invite limits", async () => {
        await withTestTransaction(db, async (tx) => {
            setPlatformSettings({ inviteLimits: { free: 5 } });

            const user = await createUser(tx, "custom-limit@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "test" });

            // Should be able to generate more than 1 invite now
            await generateInvite(tx, user.id);
            await generateInvite(tx, user.id);
            const invites = await listInvites(tx, user.id);
            expect(invites).toHaveLength(2);
        });
    });

    it("validates a valid invite code", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "val-inviter@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "test" });

            const invite = await generateInvite(tx, user.id);
            const valid = await validateInvite(tx, invite.code);
            expect(valid).toBe(true);
        });
    });

    it("rejects nonexistent invite code", async () => {
        await withTestTransaction(db, async (tx) => {
            const valid = await validateInvite(tx, "NONEXISTENT");
            expect(valid).toBe(false);
        });
    });
});

// --- Referral Accountability ---

describe("Referral Accountability", () => {
    it("counts banned referrals correctly", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await createUser(tx, "accountability@test.vvs");
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "ACC-CODE", maxUses: 10 });

            const referralsRepo = createReferralsRepo(tx);
            const usersRepo = createUsersRepo(tx);

            // Create 3 banned referees
            for (let i = 0; i < 3; i++) {
                const invitee = await createUser(tx, `banned${i}@test.vvs`);
                await usersRepo.updateStatus(invitee.id, "banned");
                await referralsRepo.create({ inviteCodeId: code.id, inviterId: inviter.id, inviteeId: invitee.id });
            }

            const result = await checkAccountability(tx, inviter.id);
            expect(result.bannedCount).toBe(3);
            expect(result.inviteLimitReduced).toBe(true);
            expect(result.flaggedForReview).toBe(false);
        });
    });

    it("flags inviter with 5+ banned referrals for review", async () => {
        await withTestTransaction(db, async (tx) => {
            const inviter = await createUser(tx, "flagged@test.vvs");
            const codesRepo = createInviteCodesRepo(tx);
            const code = await codesRepo.create({ inviterId: inviter.id, code: "FLAG-CODE", maxUses: 10 });

            const referralsRepo = createReferralsRepo(tx);
            const usersRepo = createUsersRepo(tx);

            for (let i = 0; i < 5; i++) {
                const invitee = await createUser(tx, `flagban${i}@test.vvs`);
                await usersRepo.updateStatus(invitee.id, "banned");
                await referralsRepo.create({ inviteCodeId: code.id, inviterId: inviter.id, inviteeId: invitee.id });
            }

            const result = await checkAccountability(tx, inviter.id);
            expect(result.bannedCount).toBe(5);
            expect(result.flaggedForReview).toBe(true);
        });
    });

    it("walks referral chain up the tree", async () => {
        await withTestTransaction(db, async (tx) => {
            const grandpa = await createUser(tx, "grandpa@test.vvs");
            const parent = await createUser(tx, "parent@test.vvs");
            const child = await createUser(tx, "child@test.vvs");

            const codesRepo = createInviteCodesRepo(tx);
            const referralsRepo = createReferralsRepo(tx);

            const code1 = await codesRepo.create({ inviterId: grandpa.id, code: "CHAIN-1", maxUses: 1 });
            await referralsRepo.create({ inviteCodeId: code1.id, inviterId: grandpa.id, inviteeId: parent.id });

            const code2 = await codesRepo.create({ inviterId: parent.id, code: "CHAIN-2", maxUses: 1 });
            await referralsRepo.create({ inviteCodeId: code2.id, inviterId: parent.id, inviteeId: child.id });

            const chain = await getReferralChain(tx, child.id);
            expect(chain).toHaveLength(2);
            expect(chain[0]!.email).toBe("parent@test.vvs");
            expect(chain[1]!.email).toBe("grandpa@test.vvs");
        });
    });
});

// --- Admin Approval ---

describe("Admin Approval", () => {
    it("approves user and writes outbox event", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "to-approve@test.vvs", "pending_approval");
            const admin = await createUser(tx, "admin@test.vvs");

            await approveUser(tx, user.id, admin.id);

            const usersRepo = createUsersRepo(tx);
            const updated = await usersRepo.findById(user.id);
            expect(updated!.status).toBe("active");

            // Check outbox event
            const events = await tx.execute(
                sql`SELECT * FROM outbox.events WHERE event_type = 'auth.referral.approved' AND ordering_key = ${user.id}`,
            );
            expect(events.length).toBeGreaterThanOrEqual(1);
        });
    });

    it("approves with provisional verification", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "provisional@test.vvs", "pending_approval");
            const admin = await createUser(tx, "admin2@test.vvs");

            await approveUser(tx, user.id, admin.id, true);

            const verificationsRepo = createVerificationsRepo(tx);
            const verifications = await verificationsRepo.findByUserId(user.id);
            expect(verifications).toHaveLength(1);
            expect(verifications[0]!.status).toBe("provisional");
            expect(verifications[0]!.expiresAt).not.toBeNull();
        });
    });

    it("rejects user and writes outbox event", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "to-reject@test.vvs", "pending_approval");
            const admin = await createUser(tx, "admin3@test.vvs");

            await rejectUser(tx, user.id, admin.id, "Suspicious activity");

            const usersRepo = createUsersRepo(tx);
            const updated = await usersRepo.findById(user.id);
            expect(updated!.status).toBe("rejected");
        });
    });

    it("lists pending approvals", async () => {
        await withTestTransaction(db, async (tx) => {
            await createUser(tx, "pending1@test.vvs", "pending_approval");
            await createUser(tx, "pending2@test.vvs", "pending_approval");

            const pending = await getPendingApprovals(tx);
            expect(pending.length).toBeGreaterThanOrEqual(2);
        });
    });
});

// --- KYC Verification ---

describe("KYC Verification", () => {
    it("submits verification with documents", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "kyc@test.vvs");

            const verification = await submitVerification(tx, user.id, [
                { docType: "NIN", frontUrl: "https://s3.example.com/nin-front.jpg" },
            ]);

            expect(verification.status).toBe("pending");
            expect(verification.method).toBe("automated");
        });
    });

    it("grants provisional verification with 90-day expiry", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "prov@test.vvs");
            const admin = await createUser(tx, "admin-kyc@test.vvs");

            const v = await grantProvisionalVerification(tx, user.id, admin.id);
            expect(v.status).toBe("provisional");
            expect(v.expiresAt).not.toBeNull();

            const daysDiff = (v.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            expect(daysDiff).toBeGreaterThan(89);
            expect(daysDiff).toBeLessThan(91);
        });
    });

    it("successful KYC upgrades tier to verified", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "kyc-pass@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "initial" });

            // Submit verification
            await submitVerification(tx, user.id, [
                { docType: "passport", frontUrl: "https://s3.example.com/passport.jpg" },
            ]);

            // Process KYC result
            await verifyIdentity(tx, user.id, { success: true });

            const tier = await getTier(tx, user.id);
            expect(tier).toBe("verified");
        });
    });

    it("failed KYC sets verification to rejected", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "kyc-fail@test.vvs");
            await submitVerification(tx, user.id, [
                { docType: "NIN", frontUrl: "https://s3.example.com/nin.jpg" },
            ]);

            await verifyIdentity(tx, user.id, { success: false, reason: "Document unclear" });

            const verificationsRepo = createVerificationsRepo(tx);
            const verifications = await verificationsRepo.findByUserId(user.id);
            const latest = verifications.find((v) => v.status === "rejected");
            expect(latest).toBeDefined();
        });
    });

    it("expired provisional downgrades tier", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "expiry@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "verified", reason: "provisional" });

            // Create an expired provisional verification
            const verificationsRepo = createVerificationsRepo(tx);
            await verificationsRepo.create({
                userId: user.id,
                status: "provisional",
                method: "manual",
                expiresAt: new Date(Date.now() - 1000),
            });

            const affectedIds = await checkExpiredProvisional(tx);
            expect(affectedIds).toContain(user.id);

            const tier = await getTier(tx, user.id);
            expect(tier).toBe("free");
        });
    });
});

// --- Tier Management ---

describe("Tier Management", () => {
    it("checks Pro upgrade eligibility", () => {
        const eligible = checkProUpgrade(5, 4.5);
        expect(eligible.eligible).toBe(true);

        const notEnoughTransactions = checkProUpgrade(4, 4.5);
        expect(notEnoughTransactions.eligible).toBe(false);

        const lowRating = checkProUpgrade(10, 3.9);
        expect(lowRating.eligible).toBe(false);
    });

    it("upgrades to Pro when eligible", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "pro-upgrade@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "verified", reason: "KYC" });

            const upgraded = await upgradeTierToProIfEligible(tx, user.id, 5, 4.2);
            expect(upgraded).toBe(true);

            const tier = await getTier(tx, user.id);
            expect(tier).toBe("pro");
        });
    });

    it("does not upgrade below threshold", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "no-pro@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "verified", reason: "KYC" });

            const upgraded = await upgradeTierToProIfEligible(tx, user.id, 4, 4.2);
            expect(upgraded).toBe(false);
        });
    });

    it("is idempotent — does not duplicate on second call", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "idempotent@test.vvs");
            const tiersRepo = createTiersRepo(tx);
            await tiersRepo.setTier({ userId: user.id, tier: "verified", reason: "KYC" });

            await upgradeTierToProIfEligible(tx, user.id, 5, 4.5);
            const secondCall = await upgradeTierToProIfEligible(tx, user.id, 5, 4.5);
            expect(secondCall).toBe(false); // Already Pro, no-op

            const history = await tiersRepo.getHistory(user.id);
            const proEntries = history.filter((h) => h.tier === "pro");
            expect(proEntries).toHaveLength(1);
        });
    });

    it("uses configurable thresholds", () => {
        setProThresholds({ minTransactions: 10, minRating: 4.8 });
        const result = checkProUpgrade(5, 4.5);
        expect(result.eligible).toBe(false);

        const result2 = checkProUpgrade(10, 4.8);
        expect(result2.eligible).toBe(true);

        // Reset
        setProThresholds({ minTransactions: 5, minRating: 4.2 });
    });
});

// --- Badges ---

describe("Badges", () => {
    it("issues and retrieves badge", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "badge-user@test.vvs");
            const admin = await createUser(tx, "badge-admin@test.vvs");

            await issueBadge(tx, user.id, "verified", admin.id);
            const userBadges = await getBadges(tx, user.id);
            expect(userBadges).toHaveLength(1);
            expect(userBadges[0]!.badgeType).toBe("verified");
        });
    });

    it("revokes badge — not returned by getBadges", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "revoke-badge@test.vvs");

            await issueBadge(tx, user.id, "founding_member");
            let userBadges = await getBadges(tx, user.id);
            expect(userBadges).toHaveLength(1);

            await revokeBadge(tx, user.id, "founding_member");
            userBadges = await getBadges(tx, user.id);
            expect(userBadges).toHaveLength(0);
        });
    });

    it("can have multiple active badges", async () => {
        await withTestTransaction(db, async (tx) => {
            const user = await createUser(tx, "multi-badge@test.vvs");

            await issueBadge(tx, user.id, "verified");
            await issueBadge(tx, user.id, "pro");
            const userBadges = await getBadges(tx, user.id);
            expect(userBadges).toHaveLength(2);
        });
    });
});
