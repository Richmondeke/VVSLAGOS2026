import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/password.js";

describe("password hashing", () => {
    it("hashes and verifies a correct password", async () => {
        const hash = await hashPassword("my-secret-password");
        expect(hash).toBeDefined();
        expect(hash).not.toBe("my-secret-password");

        const valid = await verifyPassword("my-secret-password", hash);
        expect(valid).toBe(true);
    });

    it("rejects an incorrect password", async () => {
        const hash = await hashPassword("correct-password");
        const valid = await verifyPassword("wrong-password", hash);
        expect(valid).toBe(false);
    });

    it("produces different hashes for the same plaintext (salting)", async () => {
        const hash1 = await hashPassword("same-password");
        const hash2 = await hashPassword("same-password");
        expect(hash1).not.toBe(hash2);
    });
});
