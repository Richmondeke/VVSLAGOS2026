import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import Fastify from "fastify";
import { authRoutes } from "../../src/routes.js";
import { createUsersRepo } from "../../src/repositories/users.js";
import { createInviteCodesRepo } from "../../src/repositories/invite-codes.js";
import { hashPassword } from "../../src/password.js";
import { createTiersRepo } from "../../src/repositories/tiers.js";

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

async function buildTestApp(testDb: ScopedClient) {
    const app = Fastify();
    await app.register(authRoutes, { db: testDb });
    return app;
}

describe("POST /auth/login", () => {
    it("returns 200 with tokens for valid credentials", async () => {
        // Seed a user directly (not via transaction wrapper since Fastify inject is separate)
        const usersRepo = createUsersRepo(db);
        const tiersRepo = createTiersRepo(db);
        const passwordHash = await hashPassword("test-password");
        const user = await usersRepo.create({
            email: `route-test-${Date.now()}@test.vvs`,
            passwordHash,
        });
        await usersRepo.updateStatus(user.id, "active");
        await tiersRepo.setTier({ userId: user.id, tier: "free", reason: "test" });

        try {
            const app = await buildTestApp(db);

            const response = await app.inject({
                method: "POST",
                url: "/auth/login",
                payload: {
                    email: user.email,
                    password: "test-password",
                },
            });

            expect(response.statusCode).toBe(200);
            const body = response.json();
            expect(body.accessToken).toBeDefined();
            expect(body.refreshToken).toBeDefined();
            expect(body.userId).toBe(user.id);

            await app.close();
        } finally {
            // Cleanup: remove test data
            const { sql } = await import("drizzle-orm");
            await db.execute(sql.raw(`DELETE FROM auth.member_tiers WHERE user_id = '${user.id}'`));
            await db.execute(sql.raw(`DELETE FROM auth.sessions WHERE user_id = '${user.id}'`));
            await db.execute(sql.raw(`DELETE FROM auth.users WHERE id = '${user.id}'`));
        }
    });

    it("returns 401 for invalid credentials", async () => {
        const app = await buildTestApp(db);

        const response = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: {
                email: "nonexistent@test.vvs",
                password: "wrong-password",
            },
        });

        expect(response.statusCode).toBe(401);
        await app.close();
    });

    it("returns 400 for missing fields", async () => {
        const app = await buildTestApp(db);

        const response = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: { email: "test@test.vvs" },
        });

        expect(response.statusCode).toBe(400);
        await app.close();
    });
});
