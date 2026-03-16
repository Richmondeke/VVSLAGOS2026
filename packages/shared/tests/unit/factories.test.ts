import { beforeEach, describe, expect, it } from "vitest";
import {
    createTestOrder,
    createTestUser,
    createTestWallet,
    resetFactoryCounter,
} from "../../src/test-utils/factories.js";

describe("Test factories", () => {
    beforeEach(() => {
        resetFactoryCounter();
    });

    it("createTestUser returns valid AuthUser with defaults", () => {
        const user = createTestUser();
        expect(user.id).toBeDefined();
        expect(user.email).toContain("@test.vvs");
        expect(user.tier).toBe("free");
        expect(user.verificationStatus).toBe("pending");
    });

    it("createTestUser accepts overrides", () => {
        const user = createTestUser({ tier: "pro", email: "custom@test.vvs" });
        expect(user.tier).toBe("pro");
        expect(user.email).toBe("custom@test.vvs");
    });

    it("createTestWallet returns valid Wallet with defaults", () => {
        const wallet = createTestWallet();
        expect(wallet.availableBalance).toBe(0);
        expect(wallet.currency).toBe("NGN");
    });

    it("createTestOrder returns valid Order with defaults", () => {
        const order = createTestOrder();
        expect(order.status).toBe("draft");
        expect(order.totalAmount).toBe(500000);
        expect(order.milestones).toEqual([]);
    });

    it("generates unique IDs across calls", () => {
        const user1 = createTestUser();
        const user2 = createTestUser();
        expect(user1.id).not.toBe(user2.id);
    });
});
