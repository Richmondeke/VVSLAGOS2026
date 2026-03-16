import { eq, sql, and, ilike, or } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import type { Paginated } from "@vvs/contracts";
import { profiles } from "../schema.js";

export type ProfileRow = typeof profiles.$inferSelect;

export type NewProfile = {
    userId: string;
    displayName?: string;
    bio?: string;
    profession?: string;
    primaryCategoryId?: string;
    skills?: string[];
    locationCity?: string;
    locationCountry?: string;
    profilePhotoUrl?: string;
    availabilityStatus?: "available" | "busy" | "not_taking_work";
    isPublic?: boolean;
};

export type UpdateProfile = {
    displayName?: string;
    bio?: string;
    profession?: string;
    primaryCategoryId?: string;
    skills?: string[];
    locationCity?: string;
    locationCountry?: string;
    profilePhotoUrl?: string;
    availabilityStatus?: "available" | "busy" | "not_taking_work";
    isPublic?: boolean;
};

export type SearchFilters = {
    query?: string;
    category?: string;
    availability?: string;
    page: number;
    pageSize: number;
};

export function createProfilesRepo(db: ScopedClient) {
    return {
        async create(data: NewProfile): Promise<ProfileRow> {
            const rows = await db
                .insert(profiles)
                .values({
                    userId: data.userId,
                    displayName: data.displayName ?? null,
                    bio: data.bio ?? null,
                    profession: data.profession ?? null,
                    primaryCategoryId: data.primaryCategoryId ?? null,
                    skills: data.skills ?? null,
                    locationCity: data.locationCity ?? null,
                    locationCountry: data.locationCountry ?? null,
                    profilePhotoUrl: data.profilePhotoUrl ?? null,
                    availabilityStatus: data.availabilityStatus ?? "available",
                    isPublic: data.isPublic ?? true,
                })
                .returning();
            return rows[0]!;
        },

        async update(userId: string, data: UpdateProfile): Promise<ProfileRow | undefined> {
            // Build update set, only including defined fields
            const updateSet: Record<string, unknown> = { updatedAt: sql`NOW()` };
            if (data.displayName !== undefined) updateSet.displayName = data.displayName;
            if (data.bio !== undefined) updateSet.bio = data.bio;
            if (data.profession !== undefined) updateSet.profession = data.profession;
            if (data.primaryCategoryId !== undefined) updateSet.primaryCategoryId = data.primaryCategoryId;
            if (data.skills !== undefined) updateSet.skills = data.skills;
            if (data.locationCity !== undefined) updateSet.locationCity = data.locationCity;
            if (data.locationCountry !== undefined) updateSet.locationCountry = data.locationCountry;
            if (data.profilePhotoUrl !== undefined) updateSet.profilePhotoUrl = data.profilePhotoUrl;
            if (data.availabilityStatus !== undefined) updateSet.availabilityStatus = data.availabilityStatus;
            if (data.isPublic !== undefined) updateSet.isPublic = data.isPublic;

            const rows = await db
                .update(profiles)
                .set(updateSet)
                .where(eq(profiles.userId, userId))
                .returning();
            return rows[0];
        },

        async findByUserId(userId: string): Promise<ProfileRow | undefined> {
            const rows = await db.select().from(profiles).where(eq(profiles.userId, userId));
            return rows[0];
        },

        async findPublicByUserId(userId: string): Promise<ProfileRow | undefined> {
            const rows = await db
                .select()
                .from(profiles)
                .where(and(eq(profiles.userId, userId), eq(profiles.isPublic, true)));
            return rows[0];
        },

        async search(filters: SearchFilters): Promise<Paginated<ProfileRow>> {
            const { query, category, availability, page, pageSize } = filters;
            const offset = (page - 1) * pageSize;

            const conditions = [eq(profiles.isPublic, true)];

            if (availability) {
                conditions.push(
                    eq(profiles.availabilityStatus, availability as "available" | "busy" | "not_taking_work"),
                );
            }

            const where = conditions.length > 0 ? and(...conditions) : undefined;

            // Full-text search uses the tsvector column when query is provided
            if (query) {
                const searchCondition = sql`${profiles.searchVector} @@ plainto_tsquery('english', ${query})`;
                const fullWhere = where ? and(where, searchCondition) : searchCondition;

                const countResult = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(profiles)
                    .where(fullWhere);

                const rows = await db
                    .select()
                    .from(profiles)
                    .where(fullWhere)
                    .orderBy(
                        sql`ts_rank(${profiles.searchVector}, plainto_tsquery('english', ${query})) DESC`,
                        profiles.availabilityStatus,
                    )
                    .limit(pageSize)
                    .offset(offset);

                return {
                    items: rows,
                    total: countResult[0]?.count ?? 0,
                    page,
                    pageSize,
                };
            }

            const countResult = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(profiles)
                .where(where);

            const rows = await db
                .select()
                .from(profiles)
                .where(where)
                .orderBy(profiles.availabilityStatus, profiles.createdAt)
                .limit(pageSize)
                .offset(offset);

            return {
                items: rows,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },
    };
}
