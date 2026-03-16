import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { issueAccessToken, issueRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../src/session.js";

describe("JWT session", () => {
    beforeEach(() => {
        vi.stubEnv("JWT_SECRET", "test-secret-that-is-long-enough-for-jwt");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("issues and verifies an access token", async () => {
        const token = await issueAccessToken("user-123", "verified");
        expect(token).toBeDefined();

        const claims = await verifyAccessToken(token);
        expect(claims.sub).toBe("user-123");
        expect(claims.tier).toBe("verified");
    });

    it("issues and verifies a refresh token", async () => {
        const token = await issueRefreshToken("session-456");
        expect(token).toBeDefined();

        const claims = await verifyRefreshToken(token);
        expect(claims.sessionId).toBe("session-456");
    });

    it("rejects a tampered access token", async () => {
        const token = await issueAccessToken("user-123", "free");
        const tampered = `${token}x`;

        await expect(verifyAccessToken(tampered)).rejects.toThrow("Invalid or expired access token");
    });

    it("rejects a tampered refresh token", async () => {
        const token = await issueRefreshToken("session-789");
        const tampered = `${token}x`;

        await expect(verifyRefreshToken(tampered)).rejects.toThrow("Invalid or expired refresh token");
    });
});
