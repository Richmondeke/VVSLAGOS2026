import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withTestTransaction } from "@vvs/shared";
import type { ScopedClient } from "@vvs/shared";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createItem, publishItem, unpublishItem, getItems, deleteItem } from "../../src/portfolio.js";
import { createMockS3Adapter, generateUploadUrl, confirmUpload, deleteMedia } from "../../src/media.js";

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

describe("Portfolio Service", () => {
    it("creates a portfolio item with media", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "My Project",
                description: "A cool project",
                tags: ["react", "typescript"],
                mediaUrls: ["https://example.com/img1.png", "https://example.com/img2.jpg"],
            });

            expect(item.title).toBe("My Project");
            expect(item.description).toBe("A cool project");
            expect(item.tags).toEqual(["react", "typescript"]);
            expect(item.mediaUrls).toHaveLength(2);
        });
    });

    it("creates a portfolio item with a case study", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "Case Study Project",
                description: "Deep dive",
                tags: ["design"],
                mediaUrls: [],
                caseStudy: {
                    challenge: "Client needed a new brand",
                    approach: "User research and iteration",
                    outcome: "50% increase in engagement",
                    metrics: { engagement: "50%", satisfaction: 4.8 },
                },
            });

            expect(item.caseStudy).toBeDefined();
            expect(item.caseStudy!.challenge).toBe("Client needed a new brand");
            expect(item.caseStudy!.metrics).toEqual({ engagement: "50%", satisfaction: 4.8 });
        });
    });

    it("creates a portfolio item with collaborators", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();
            const collaboratorId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "Collab Project",
                description: "Team effort",
                tags: [],
                mediaUrls: [],
                collaborators: [collaboratorId],
            });

            expect(item.collaborators).toContain(collaboratorId);
        });
    });

    it("publishes a portfolio item", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "Publish Test",
                description: "",
                tags: [],
                mediaUrls: [],
            });

            const published = await publishItem(tx, item.id, userId);
            expect(published.id).toBe(item.id);
        });
    });

    it("unpublishes a portfolio item", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "Unpublish Test",
                description: "",
                tags: [],
                mediaUrls: [],
            });

            await publishItem(tx, item.id, userId);
            const unpublished = await unpublishItem(tx, item.id, userId);
            expect(unpublished.id).toBe(item.id);
        });
    });

    it("gets paginated portfolio items", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            for (let i = 0; i < 3; i++) {
                await createItem(tx, userId, {
                    title: `Item ${i}`,
                    description: "",
                    tags: [],
                    mediaUrls: [],
                });
            }

            const result = await getItems(tx, userId, 1);
            expect(result.items).toHaveLength(3);
            expect(result.total).toBe(3);
            expect(result.page).toBe(1);
        });
    });

    it("soft-deletes a portfolio item", async () => {
        await withTestTransaction(db, async (tx) => {
            const userId = crypto.randomUUID();

            const item = await createItem(tx, userId, {
                title: "Delete Me",
                description: "",
                tags: [],
                mediaUrls: [],
            });

            await deleteItem(tx, item.id, userId);
            // Item still exists but is unpublished
            const result = await getItems(tx, userId, 1);
            expect(result.total).toBe(1);
        });
    });

    it("throws NotFoundError for publish on non-existent item", async () => {
        await withTestTransaction(db, async (tx) => {
            await expect(
                publishItem(tx, crypto.randomUUID(), crypto.randomUUID()),
            ).rejects.toThrow("not found");
        });
    });
});

describe("Media Service (Mock S3)", () => {
    it("generates upload URL and confirms upload", async () => {
        const s3 = createMockS3Adapter();
        const userId = crypto.randomUUID();

        const { uploadUrl, key } = await generateUploadUrl(s3, userId, "photo.jpg", "image/jpeg");
        expect(uploadUrl).toContain("mock-s3");
        expect(key).toContain(userId);
        expect(key).toMatch(/\.jpg$/);

        const { confirmed } = await confirmUpload(s3, userId, key);
        expect(confirmed).toBe(true);
    });

    it("deleteMedia removes from store", async () => {
        const s3 = createMockS3Adapter();
        const userId = crypto.randomUUID();

        const { key } = await generateUploadUrl(s3, userId, "video.mp4", "video/mp4");
        await deleteMedia(s3, key);

        const { confirmed } = await confirmUpload(s3, userId, key);
        expect(confirmed).toBe(false);
    });
});
