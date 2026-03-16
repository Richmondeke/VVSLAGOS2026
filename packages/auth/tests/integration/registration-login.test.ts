import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { register } from "../../src/registration.js";
import { login } from "../../src/login.js";
import { verifyAccessToken } from "../../src/session.js";
import { createUsersRepo } from "../../src/repositories/users.js";
import { createInviteCodesRepo } from "../../src/repositories/invite-codes.js";
import { createReferralsRepo } from "../../src/repositories/referrals.js";
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
});

// Helper: create an inviter user + invite code
async function seedInviter(txDb: ScopedClient) {
    const usersRepo = createUsersRepo(txDb);
    const inviter = await usersRepo.create({
        email: "inviter@test.vvs",
        passwordHash: await hashPassword("inviter-password"),
    });
    // Activate inviter
    await usersRepo.updateStatus(inviter.id, "active");

    const codesRepo = createInviteCodesRepo(txDb);
    const code = await codesRepo.create({
        inviterId: inviter.id,
        code: "VALID-INVITE-CODE",
        maxUses: 5,
    });
    return { inviter, code };
}

describe("Registration", () => {
    it("creates user + referral + outbox event atomically", async () => {
        await withTestTransaction(db, async (tx) => {
            const { inviter, code } = await seedInviter(tx);

            const result = await register(tx, {
                inviteCode: "VALID-INVITE-CODE",
                email: "newuser@test.vvs",
                password: "strong-password-123",
            });

            expect(result.userId).toBeDefined();
            expect(result.status).toBe("pending_approval");

            // Verify referral was created
            const referralsRepo = createReferralsRepo(tx);
            const referral = await referralsRepo.findByInvitee(result.userId);
            expect(referral).toBeDefined();
            expect(referral!.inviterId).toBe(inviter.id);

            // Verify invite code usage incremented
            const codesRepo = createInviteCodesRepo(tx);
            const updatedCode = await codesRepo.findByCode("VALID-INVITE-CODE");
            expect(updatedCode!.usedCount).toBe(1);

            // Verify outbox event was written
            const events = await tx.execute(
                sql`SELECT * FROM outbox.events WHERE event_type = 'auth.user.registered' AND ordering_key = ${result.userId}`,
            );
            expect(events.length).toBeGreaterThanOrEqual(1);
        });
    });

    it("rejects invalid invite code", async () => {
        await withTestTransaction(db, async (tx) => {
            await expect(
                register(tx, {
                    inviteCode: "NONEXISTENT",
                    email: "user@test.vvs",
                    password: "password-123",
                }),
            ).rejects.toThrow("Invalid invite code");
        });
    });

    it("rejects duplicate email", async () => {
        await withTestTransaction(db, async (tx) => {
            await seedInviter(tx);

            // Register first user
            await register(tx, {
                inviteCode: "VALID-INVITE-CODE",
                email: "dupe@test.vvs",
                password: "password-123",
            });

            // Try same email
            await expect(
                register(tx, {
                    inviteCode: "VALID-INVITE-CODE",
                    email: "dupe@test.vvs",
                    password: "password-456",
                }),
            ).rejects.toThrow("Email already registered");
        });
    });

    it("rejects exhausted invite code", async () => {
        await withTestTransaction(db, async (tx) => {
            const usersRepo = createUsersRepo(tx);
            const inviter = await usersRepo.create({
                email: "inviter-exhaust@test.vvs",
                passwordHash: "hash",
            });
            const codesRepo = createInviteCodesRepo(tx);
            await codesRepo.create({
                inviterId: inviter.id,
                code: "ONE-USE-CODE",
                maxUses: 1,
            });

            // Use the code
            await register(tx, {
                inviteCode: "ONE-USE-CODE",
                email: "first@test.vvs",
                password: "password-123",
            });

            // Try again
            await expect(
                register(tx, {
                    inviteCode: "ONE-USE-CODE",
                    email: "second@test.vvs",
                    password: "password-123",
                }),
            ).rejects.toThrow("Invite code has been fully used");
        });
    });
});

describe("Login", () => {
    it("returns tokens for correct credentials", async () => {
        await withTestTransaction(db, async (tx) => {
            // Create an active user
            const usersRepo = createUsersRepo(tx);
            const passwordHash = await hashPassword("correct-password");
            const user = await usersRepo.create({
                email: "login-test@test.vvs",
                passwordHash,
            });
            await usersRepo.updateStatus(user.id, "active");

            const result = await login(tx, {
                email: "login-test@test.vvs",
                password: "correct-password",
            });

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.sessionId).toBeDefined();
            expect(result.userId).toBe(user.id);

            // Verify the access token is valid
            const claims = await verifyAccessToken(result.accessToken);
            expect(claims.sub).toBe(user.id);
        });
    });

    it("returns same error for wrong email and wrong password (no enumeration)", async () => {
        await withTestTransaction(db, async (tx) => {
            const usersRepo = createUsersRepo(tx);
            const passwordHash = await hashPassword("my-password");
            const user = await usersRepo.create({
                email: "enumtest@test.vvs",
                passwordHash,
            });
            await usersRepo.updateStatus(user.id, "active");

            // Wrong email
            const wrongEmailErr = await login(tx, {
                email: "nonexistent@test.vvs",
                password: "my-password",
            }).catch((e: Error) => e.message);

            // Wrong password
            const wrongPassErr = await login(tx, {
                email: "enumtest@test.vvs",
                password: "wrong-password",
            }).catch((e: Error) => e.message);

            expect(wrongEmailErr).toBe(wrongPassErr);
            expect(wrongEmailErr).toBe("Invalid email or password");
        });
    });

    it("rejects suspended user", async () => {
        await withTestTransaction(db, async (tx) => {
            const usersRepo = createUsersRepo(tx);
            const passwordHash = await hashPassword("password");
            const user = await usersRepo.create({
                email: "suspended@test.vvs",
                passwordHash,
            });
            await usersRepo.updateStatus(user.id, "suspended");

            await expect(
                login(tx, { email: "suspended@test.vvs", password: "password" }),
            ).rejects.toThrow("Account is suspended or banned");
        });
    });

    it("rejects pending_approval user", async () => {
        await withTestTransaction(db, async (tx) => {
            const usersRepo = createUsersRepo(tx);
            const passwordHash = await hashPassword("password");
            await usersRepo.create({
                email: "pending@test.vvs",
                passwordHash,
            });

            await expect(
                login(tx, { email: "pending@test.vvs", password: "password" }),
            ).rejects.toThrow("Account is not yet approved");
        });
    });
});
