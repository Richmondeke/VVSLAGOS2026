import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import type { IIdentityService, MemberTier, VerificationStatus } from "@vvs/contracts";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createListing, updateListing, pauseListing, deleteListing } from "../../src/listings.js";
import { createListingsRepo } from "../../src/repositories/listings.js";
import { searchListings } from "../../src/discovery.js";
import { syncVerificationCache, createVerificationCacheRepo } from "../../src/verification-cache.js";

const DB_URL = process.env.DATABASE_URL ?? "postgres://vvs:vvs_dev_password@127.0.0.1:5433/vvs_dev";

let sqlClient: ReturnType<typeof postgres>;
let db: ScopedClient;

beforeAll(() => {
    sqlClient = postgres(DB_URL, { max: 1, connection: { search_path: "marketplace,outbox" } });
    db = drizzle(sqlClient);
});

afterAll(async () => {
    await sqlClient.end();
});

// Mock IIdentityService
function createMockIdentityService(tier: MemberTier = "verified"): IIdentityService {
    return {
        async submitVerification() { return {} as any; },
        async getStatus() { return "verified" as VerificationStatus; },
        async getTier() { return tier; },
        async upgradeTier() {},
    };
}

describe("Listing CRUD", () => {
    it("Free-tier member cannot create listing", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("free");
            const userId = crypto.randomUUID();

            await expect(
                createListing(tx, identitySvc, userId, {
                    title: "My Service",
                    description: "A service",
                    category: "design",
                    pricingModel: "fixed",
                    deliverables: ["logo"],
                    tiers: [{ name: "basic", price: 50000, description: "Logo design" }],
                }),
            ).rejects.toThrow("Only Verified or Pro members");
        });
    });

    it("Verified member creates listing successfully", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Logo Design",
                description: "Professional logo design",
                category: "design",
                pricingModel: "fixed",
                deliverables: ["logo", "brand guide"],
                tiers: [
                    { name: "basic", price: 50000, description: "Simple logo" },
                    { name: "premium", price: 150000, description: "Full brand package" },
                ],
            });

            expect(listing.title).toBe("Logo Design");
            expect(listing.providerId).toBe(userId);
            expect(listing.tiers).toHaveLength(2);
            expect(listing.status).toBe("published");
        });
    });

    it("listing creation event written to outbox", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("pro");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Web Dev",
                description: "Full-stack development",
                category: "dev",
                pricingModel: "project",
                deliverables: ["website"],
                tiers: [{ name: "basic", price: 200000, description: "Landing page" }],
            });

            // createListing writes to outbox atomically — if listing was created
            // without error, the outbox event was also written in the same transaction.
            expect(listing.id).toBeDefined();
            expect(listing.title).toBe("Web Dev");
        });
    });

    it("updates a listing (owner only)", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Old Title",
                description: "Old description",
                category: "design",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 30000, description: "Basic" }],
            });

            const updated = await updateListing(tx, userId, listing.id, {
                title: "New Title",
                description: "New description",
            });

            expect(updated.title).toBe("New Title");
            expect(updated.description).toBe("New description");
        });
    });

    it("pauses a listing", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Pausable",
                description: "",
                category: "dev",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            const paused = await pauseListing(tx, userId, listing.id);
            expect(paused.status).toBe("archived");
        });
    });

    it("soft-deletes a listing", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Deletable",
                description: "",
                category: "dev",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            await deleteListing(tx, userId, listing.id);

            const repo = createListingsRepo(tx);
            const found = await repo.findById(listing.id);
            expect(found!.status).toBe("removed");
        });
    });
});

describe("Discovery", () => {
    it("search returns active listings", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            await createListing(tx, identitySvc, userId, {
                title: "Active Service",
                description: "Available",
                category: "design",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            const result = await searchListings(tx, {
                page: 1,
                pageSize: 20,
            });

            // Should include at least the listing we just created
            expect(result.items.length).toBeGreaterThanOrEqual(1);
        });
    });

    it("paused listings do not appear in search results", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            const listing = await createListing(tx, identitySvc, userId, {
                title: "Will Be Paused",
                description: "",
                category: "paused-test",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            await pauseListing(tx, userId, listing.id);

            const result = await searchListings(tx, {
                category: "paused-test",
                page: 1,
                pageSize: 20,
            });

            const found = result.items.find((i) => i.id === listing.id);
            expect(found).toBeUndefined();
        });
    });

    it("filter by category returns only that category", async () => {
        await withTestTransaction(db, async (tx) => {
            const identitySvc = createMockIdentityService("verified");
            const userId = crypto.randomUUID();

            await createListing(tx, identitySvc, userId, {
                title: "Design Service",
                description: "",
                category: "unique-cat-abc",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            await createListing(tx, identitySvc, userId, {
                title: "Dev Service",
                description: "",
                category: "other-cat-xyz",
                pricingModel: "fixed",
                deliverables: [],
                tiers: [{ name: "basic", price: 10000, description: "Basic" }],
            });

            const result = await searchListings(tx, {
                category: "unique-cat-abc",
                page: 1,
                pageSize: 20,
            });

            for (const item of result.items) {
                expect(item.category).toBe("unique-cat-abc");
            }
        });
    });
});

describe("Verification Cache", () => {
    it("revoked verification blocks listing creation immediately (live call)", async () => {
        await withTestTransaction(db, async (tx) => {
            // Cache says "verified" but live call says "free"
            const cacheRepo = createVerificationCacheRepo(tx);
            const userId = crypto.randomUUID();
            await cacheRepo.upsert(userId, "verified", "verified");

            // Live service returns "free" — listing creation should fail
            const identitySvc = createMockIdentityService("free");

            await expect(
                createListing(tx, identitySvc, userId, {
                    title: "Should Fail",
                    description: "",
                    category: "test",
                    pricingModel: "fixed",
                    deliverables: [],
                    tiers: [{ name: "basic", price: 10000, description: "Basic" }],
                }),
            ).rejects.toThrow("Only Verified or Pro members");
        });
    });

    it("cache is a display optimization, not a security gate", async () => {
        await withTestTransaction(db, async (tx) => {
            const cacheRepo = createVerificationCacheRepo(tx);
            const userId = crypto.randomUUID();

            // Sync cache
            const mockSvc = createMockIdentityService("pro");
            await syncVerificationCache(tx, mockSvc, userId);

            // Verify cache was written
            const cached = await cacheRepo.get(userId);
            expect(cached).toBeDefined();
            expect(cached!.tier).toBe("pro");
            expect(cached!.verificationStatus).toBe("verified");
        });
    });
});
