// @vvs/members

// Schema
export { membersSchema } from "./schema.js";
export * from "./schema.js";

// Repositories
export * from "./repositories/index.js";

// Profile service
export { createProfile, updateProfile, getProfile, getPublicProfile, searchProfiles } from "./profiles.js";

// Portfolio service
export { createItem, publishItem, unpublishItem, getItems, deleteItem } from "./portfolio.js";

// Media (S3)
export {
    generateUploadUrl,
    confirmUpload,
    deleteMedia,
    createS3Adapter,
    createMockS3Adapter,
    type IS3Adapter,
} from "./media.js";

// Event consumers
export { handleUserRegistered, handleIdentityVerified } from "./consumers.js";

// Public interfaces (IProfileService, IPortfolioService)
export { createProfileService, createPortfolioService } from "./interfaces.js";

// Routes
export { membersRoutes, type MembersRoutesOpts } from "./routes.js";
