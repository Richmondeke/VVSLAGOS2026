// @vvs/social

// Schema
export { socialSchema } from "./schema.js";
export * from "./schema.js";

// Repositories
export * from "./repositories/index.js";

// Conversations
export { getOrCreateConversation, getInbox } from "./conversations.js";

// Messages
export { sendMessage, getThread, markRead, type MessageRateLimitCheck } from "./messages.js";

// Blocking
export { blockUser, unblockUser, isBlocked } from "./blocking.js";

// Posting & Feed
export { createPost, deletePost, flagPost } from "./posting.js";
export { getTimeline, engage } from "./timeline.js";
export { calculateRankScore } from "./ranking.js";

// Event consumers
export { handlePortfolioPublished, handleListingCreated, handleUserSuspended } from "./consumers.js";

// Interface implementations
export { createFeedService, createMessagingService } from "./interfaces.js";

// Routes
export { socialRoutes, type SocialRoutesOpts } from "./routes.js";
