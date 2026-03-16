import {
    boolean,
    index,
    integer,
    numeric,
    pgSchema,
    serial,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const socialSchema = pgSchema("social");

// --- Conversations ---

export const conversations = socialSchema.table(
    "conversations",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        member1Id: uuid("member1_id").notNull(),
        member2Id: uuid("member2_id").notNull(),
        lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("idx_social_conversations_pair").on(t.member1Id, t.member2Id),
        index("idx_social_conversations_member1").on(t.member1Id),
        index("idx_social_conversations_member2").on(t.member2Id),
    ],
);

// --- Messages ---

export const messages = socialSchema.table(
    "messages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        conversationId: uuid("conversation_id")
            .notNull()
            .references(() => conversations.id),
        senderId: uuid("sender_id").notNull(),
        body: text("body").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_social_messages_conversation").on(t.conversationId),
        index("idx_social_messages_sender").on(t.senderId),
        index("idx_social_messages_created").on(t.createdAt),
    ],
);

// --- Read Receipts ---

export const readReceipts = socialSchema.table(
    "read_receipts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id),
        readerId: uuid("reader_id").notNull(),
        readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("idx_social_read_receipts_unique").on(t.messageId, t.readerId),
    ],
);

// --- Attachments ---

export const attachments = socialSchema.table(
    "attachments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id),
        fileUrl: text("file_url").notNull(),
        fileName: text("file_name").notNull(),
        fileSize: integer("file_size"),
        mimeType: text("mime_type"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_social_attachments_message").on(t.messageId),
    ],
);

// --- Blocks ---

export const blocks = socialSchema.table(
    "blocks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        blockerId: uuid("blocker_id").notNull(),
        blockedId: uuid("blocked_id").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        uniqueIndex("idx_social_blocks_unique").on(t.blockerId, t.blockedId),
        index("idx_social_blocks_blocker").on(t.blockerId),
        index("idx_social_blocks_blocked").on(t.blockedId),
    ],
);

// --- Feed Posts ---

export const feedPosts = socialSchema.table(
    "feed_posts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        authorId: uuid("author_id").notNull(),
        postType: text("post_type").notNull(), // completed_project, service_announcement, wip, collaboration_call, case_study
        body: text("body").notNull(),
        mediaUrls: text("media_urls").array(),
        linkedListingId: uuid("linked_listing_id"),
        isVisible: boolean("is_visible").default(true).notNull(),
        rankScore: numeric("rank_score", { precision: 10, scale: 4 }).default("0"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_social_feed_posts_author").on(t.authorId),
        index("idx_social_feed_posts_type").on(t.postType),
        index("idx_social_feed_posts_visible_rank").on(t.isVisible, t.rankScore),
        index("idx_social_feed_posts_created").on(t.createdAt),
    ],
);

// --- Feed Engagements ---

export const feedEngagements = socialSchema.table(
    "feed_engagements",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        postId: uuid("post_id")
            .notNull()
            .references(() => feedPosts.id),
        userId: uuid("user_id").notNull(),
        type: text("type").notNull(), // like, bookmark, comment
        body: text("body"), // nullable, used for comments
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
        index("idx_social_engagements_post").on(t.postId),
        index("idx_social_engagements_user").on(t.userId),
    ],
);
