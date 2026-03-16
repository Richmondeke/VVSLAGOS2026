import { sql } from "drizzle-orm";
import {
    boolean,
    customType,
    index,
    integer,
    jsonb,
    pgSchema,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const membersSchema = pgSchema("members");

// Custom type for tsvector
const tsvector = customType<{ data: string }>({
    dataType() {
        return "tsvector";
    },
});

// --- profiles ---

export const profiles = membersSchema.table(
    "profiles",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        displayName: text("display_name"),
        bio: text("bio"),
        profession: text("profession"),
        primaryCategoryId: uuid("primary_category_id"),
        skills: text("skills").array(),
        locationCity: text("location_city"),
        locationCountry: text("location_country"),
        profilePhotoUrl: text("profile_photo_url"),
        availabilityStatus: text("availability_status", {
            enum: ["available", "busy", "not_taking_work"],
        })
            .default("available")
            .notNull(),
        isPublic: boolean("is_public").default(true).notNull(),
        searchVector: tsvector("search_vector"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_members_profiles_user_id").on(table.userId),
        index("idx_members_profiles_availability").on(table.availabilityStatus),
        index("idx_members_profiles_is_public").on(table.isPublic),
        index("idx_members_profiles_search_vector").using("gin", table.searchVector),
    ],
);

// --- profile_categories ---

export const profileCategories = membersSchema.table(
    "profile_categories",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        name: text("name").notNull(),
        slug: text("slug").notNull(),
        parentCategoryId: uuid("parent_category_id"),
        isActive: boolean("is_active").default(true).notNull(),
    },
    (table) => [
        uniqueIndex("idx_members_categories_slug").on(table.slug),
        index("idx_members_categories_parent").on(table.parentCategoryId),
    ],
);

// --- profile_availability ---

export const profileAvailability = membersSchema.table(
    "profile_availability",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        status: text("status", {
            enum: ["available", "busy", "not_taking_work"],
        }).notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("idx_members_availability_user_id").on(table.userId),
    ],
);

// --- portfolio_items ---

export const portfolioItems = membersSchema.table(
    "portfolio_items",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        tags: text("tags").array(),
        isPublished: boolean("is_published").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_members_portfolio_user_id").on(table.userId),
        index("idx_members_portfolio_published").on(table.userId).where(sql`is_published = true`),
    ],
);

// --- portfolio_media ---

export const portfolioMedia = membersSchema.table(
    "portfolio_media",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        portfolioItemId: uuid("portfolio_item_id")
            .notNull()
            .references(() => portfolioItems.id),
        url: text("url").notNull(),
        thumbnailUrl: text("thumbnail_url"),
        mediaType: text("media_type", { enum: ["image", "video"] }).notNull(),
        displayOrder: integer("display_order").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_members_media_portfolio_item_id").on(table.portfolioItemId),
    ],
);

// --- case_studies ---

export const caseStudies = membersSchema.table(
    "case_studies",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        portfolioItemId: uuid("portfolio_item_id").references(() => portfolioItems.id),
        userId: uuid("user_id").notNull(),
        challenge: text("challenge"),
        approach: text("approach"),
        outcome: text("outcome"),
        metrics: text("metrics"),
        isPublished: boolean("is_published").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_members_case_studies_user_id").on(table.userId),
        index("idx_members_case_studies_portfolio_item_id").on(table.portfolioItemId),
    ],
);

// --- collaborators ---

export const collaborators = membersSchema.table(
    "collaborators",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        portfolioItemId: uuid("portfolio_item_id")
            .notNull()
            .references(() => portfolioItems.id),
        collaboratorUserId: uuid("collaborator_user_id").notNull(),
        confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
        rejectedAt: timestamp("rejected_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index("idx_members_collaborators_portfolio_item_id").on(table.portfolioItemId),
        index("idx_members_collaborators_user_id").on(table.collaboratorUserId),
    ],
);
