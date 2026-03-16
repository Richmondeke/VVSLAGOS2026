// @vvs/marketplace

// Schema
export { marketplaceSchema } from "./schema.js";
export * from "./schema.js";

// Repositories
export * from "./repositories/index.js";

// Order state machine
export {
    transitionOrder,
    isValidTransition,
    getValidTransitions,
    type OrderState,
} from "./orders.js";

// Listings
export { createListing, updateListing, pauseListing, deleteListing } from "./listings.js";

// Discovery
export { searchListings } from "./discovery.js";

// Verification cache
export {
    syncVerificationCache,
    createVerificationCacheRepo,
    type VerificationCacheRow,
} from "./verification-cache.js";

// Order saga
export { createOrderSaga, type OrderSagaDeps } from "./order-saga.js";

// Routes
export { marketplaceRoutes, type MarketplaceRoutesOpts } from "./routes.js";
