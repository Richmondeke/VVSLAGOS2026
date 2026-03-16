import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/health",
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.status).toBe("ok");
        expect(body.timestamp).toBeDefined();

        await app.close();
    });

    it("includes correlation ID in response header", async () => {
        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/health",
            headers: {
                "x-correlation-id": "test-corr-id",
            },
        });

        expect(response.headers["x-correlation-id"]).toBe("test-corr-id");

        await app.close();
    });

    it("generates correlation ID when not provided", async () => {
        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/health",
        });

        expect(response.headers["x-correlation-id"]).toBeDefined();
        expect(response.headers["x-correlation-id"]).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );

        await app.close();
    });
});
