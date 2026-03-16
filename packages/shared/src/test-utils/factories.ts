import type { AuthUser, Order, Wallet } from "@vvs/contracts";

let counter = 0;
function nextId(): string {
    counter++;
    return `00000000-0000-0000-0000-${String(counter).padStart(12, "0")}`;
}

/**
 * Creates a test AuthUser with sensible defaults.
 */
export function createTestUser(overrides?: Partial<AuthUser>): AuthUser {
    const id = nextId();
    return {
        id,
        email: `user-${id}@test.vvs`,
        tier: "free",
        verificationStatus: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Creates a test Wallet with sensible defaults.
 */
export function createTestWallet(overrides?: Partial<Wallet>): Wallet {
    return {
        id: nextId(),
        userId: nextId(),
        availableBalance: 0,
        lockedBalance: 0,
        currency: "NGN",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Creates a test Order with sensible defaults.
 */
export function createTestOrder(overrides?: Partial<Order>): Order {
    return {
        id: nextId(),
        listingId: nextId(),
        clientId: nextId(),
        providerId: nextId(),
        selectedTier: {
            id: nextId(),
            listingId: nextId(),
            name: "basic",
            price: 500000,
            description: "Basic tier",
        },
        totalAmount: 500000,
        status: "draft",
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Resets the counter — call in beforeEach for deterministic IDs.
 */
export function resetFactoryCounter(): void {
    counter = 0;
}
