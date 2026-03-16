import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createProfilesRepo } from "../../src/repositories/profiles.js";
import { createProfile, updateProfile, getProfile, searchProfiles } from "../../src/profiles.js";
import { handleUserRegistered, handleIdentityVerified } from "../../src/consumers.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "members,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

describe("Profiles Repository", () => {
    it("creates and retrieves a profile", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createProfilesRepo(tx);
            const userId = crypto.randomUUID();

            const profile = await repo.create({ userId });
            expect(profile.id).toBeDefined();
            expect(profile.userId).toBe(userId);
            expect(profile.availabilityStatus).toBe("available");
            expect(profile.isPublic).toBe(true);

            const found = await repo.findByUserId(userId);
            expect(found).toBeDefined();
            expect(found!.id).toBe(profile.id);
        });
    });

    it("updates profile fields", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createProfilesRepo(tx);
            const userId = crypto.randomUUID();

            await repo.create({ userId });
            const updated = await repo.update(userId, {
                bio: "Full-stack developer",
                profession: "Software Engineer",
                skills: ["TypeScript", "React", "Node.js"],
                availabilityStatus: "busy",
            });

            expect(updated).toBeDefined();
            expect(updated!.bio).toBe("Full-stack developer");
            expect(updated!.profession).toBe("Software Engineer");
            expect(updated!.skills).toEqual(["TypeScript", "React", "Node.js"]);
            expect(updated!.availabilityStatus).toBe("busy");
        });
    });

    it("returns undefined for non-existent profile", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createProfilesRepo(tx);
            const found = await repo.findByUserId(crypto.randomUUID());
            expect(found).toBeUndefined();
        });
    });

    it("findPublicByUserId returns only public profiles", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createProfilesRepo(tx);
            const userId = crypto.randomUUID();

            await repo.create({ userId, isPublic: false });
            const found = await repo.findPublicByUserId(userId);
            expect(found).toBeUndefined();
        });
    });

    it("filters by availability in search", async () => {
        await withTestTransaction(db, async (tx) => {
            const repo = createProfilesRepo(tx);

            const user1 = crypto.randomUUID();
            const user2 = crypto.randomUUID();
            const user3 = crypto.randomUUID();

            await repo.create({ userId: user1, availabilityStatus: "available" });
            await repo.create({ userId: user2, availabilityStatus: "busy" });
            await repo.create({ userId: user3, availabilityStatus: "not_taking_work" });

            const result = await repo.search({
                availability: "available",
                page: 1,
                pageSize: 20,
            });

            // All returned results should be available
            for (const item of result.items) {
                expect(item.availabilityStatus).toBe("available");
            }
        });
    });
});

describe("Profile Service", () => {
    it("creates a profile via createProfile", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const profile = await createProfile(tx, userId);

            expect(profile.userId).toBe(userId);
            expect(profile.availability).toBe("available");
            expect(profile.visibility).toBe("public");
        });
    });

    it("createProfile is idempotent", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const first = await createProfile(tx, userId);
            const second = await createProfile(tx, userId);

            expect(first.id).toBe(second.id);
        });
    });

    it("updates profile via updateProfile", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await createProfile(tx, userId);

            const updated = await updateProfile(tx, userId, {
                bio: "Hello world",
                profession: "Designer",
                availability: "limited",
                visibility: "private",
            });

            expect(updated.bio).toBe("Hello world");
            expect(updated.profession).toBe("Designer");
            expect(updated.availability).toBe("limited");
            expect(updated.visibility).toBe("private");
        });
    });

    it("getProfile throws NotFoundError for missing user", async () => {
        await withTestTransaction(db, async (tx) => {
            await expect(getProfile(tx, crypto.randomUUID())).rejects.toThrow("not found");
        });
    });

    it("searchProfiles returns paginated results", async () => {
        await withTestTransaction(db, async (tx) => {
            // Create a few profiles
            for (let i = 0; i < 3; i++) {
                await createProfile(tx, crypto.randomUUID());
            }

            const result = await searchProfiles(tx, {
                page: 1,
                pageSize: 2,
            });

            expect(result.pageSize).toBe(2);
            expect(result.page).toBe(1);
            expect(result.items.length).toBeLessThanOrEqual(2);
        });
    });
});

describe("Event Consumers", () => {
    it("auth.user.registered creates a profile", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            await handleUserRegistered(tx, {
                userId,
                email: "test@vvs.ng",
                tier: "free",
                timestamp: new Date(),
            });

            const profile = await getProfile(tx, userId);
            expect(profile.userId).toBe(userId);
        });
    });

    it("auth.identity.verified updates profile", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            await createProfile(tx, userId);

            // Should not throw
            await handleIdentityVerified(tx, {
                userId,
                verificationId: crypto.randomUUID(),
                newTier: "verified",
                previousTier: "free",
                timestamp: new Date(),
            });

            const profile = await getProfile(tx, userId);
            expect(profile).toBeDefined();
        });
    });

    it("auth.identity.verified handles missing profile gracefully", async () => {
        await withTestTransaction(db, async (tx) => {
            // Should not throw for a user without a profile
            await handleIdentityVerified(tx, {
                userId: crypto.randomUUID(),
                verificationId: crypto.randomUUID(),
                newTier: "verified",
                previousTier: "free",
                timestamp: new Date(),
            });
        });
    });
});
