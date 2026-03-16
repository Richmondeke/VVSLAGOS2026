import { eq, sql, and, ne } from "drizzle-orm";
import type { ScopedClient } from "@vvs/shared";
import type { Paginated } from "@vvs/contracts";
import { listings, pricingTiers } from "../schema.js";

export type ListingRow = typeof listings.$inferSelect;
export type PricingTierRow = typeof pricingTiers.$inferSelect;

export type NewListing = {
    providerId: string;
    title: string;
    description?: string;
    category?: string;
    pricingModel?: "fixed" | "hourly" | "project";
};

export type NewPricingTier = {
    listingId: string;
    tierName: "basic" | "standard" | "premium";
    price: number;
    deliverables?: string;
    estimatedDays?: number;
    displayOrder?: number;
};

export type ListingSearchFilters = {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "relevance" | "rating" | "price_asc" | "price_desc" | "newest";
    page: number;
    pageSize: number;
};

export function createListingsRepo(db: ScopedClient) {
    return {
        async create(data: NewListing): Promise<ListingRow> {
            const rows = await db
                .insert(listings)
                .values({
                    providerId: data.providerId,
                    title: data.title,
                    description: data.description ?? null,
                    category: data.category ?? null,
                    pricingModel: data.pricingModel ?? "fixed",
                })
                .returning();
            return rows[0]!;
        },

        async findById(id: string): Promise<ListingRow | undefined> {
            const rows = await db.select().from(listings).where(eq(listings.id, id));
            return rows[0];
        },

        async findByProviderId(providerId: string): Promise<ListingRow[]> {
            return db.select().from(listings).where(eq(listings.providerId, providerId));
        },

        async update(id: string, providerId: string, data: Partial<Pick<ListingRow, "title" | "description" | "category" | "pricingModel">>): Promise<ListingRow | undefined> {
            const updateSet: Record<string, unknown> = { updatedAt: sql`NOW()` };
            if (data.title !== undefined) updateSet.title = data.title;
            if (data.description !== undefined) updateSet.description = data.description;
            if (data.category !== undefined) updateSet.category = data.category;
            if (data.pricingModel !== undefined) updateSet.pricingModel = data.pricingModel;

            const rows = await db
                .update(listings)
                .set(updateSet)
                .where(and(eq(listings.id, id), eq(listings.providerId, providerId)))
                .returning();
            return rows[0];
        },

        async updateStatus(id: string, providerId: string, status: ListingRow["status"]): Promise<ListingRow | undefined> {
            const rows = await db
                .update(listings)
                .set({ status, updatedAt: sql`NOW()` })
                .where(and(eq(listings.id, id), eq(listings.providerId, providerId)))
                .returning();
            return rows[0];
        },

        async search(filters: ListingSearchFilters): Promise<Paginated<ListingRow>> {
            const { query, category, page, pageSize } = filters;
            const offset = (page - 1) * pageSize;

            const conditions = [eq(listings.status, "active" as const)];

            if (category) {
                conditions.push(eq(listings.category, category));
            }

            const where = and(...conditions);

            if (query) {
                const searchCondition = sql`${listings.searchVector} @@ plainto_tsquery('english', ${query})`;
                const fullWhere = and(where, searchCondition);

                const countResult = await db
                    .select({ count: sql<number>`count(*)::int` })
                    .from(listings)
                    .where(fullWhere);

                let orderBy;
                switch (filters.sort) {
                    case "newest":
                        orderBy = sql`${listings.createdAt} DESC`;
                        break;
                    case "relevance":
                    default:
                        orderBy = sql`ts_rank(${listings.searchVector}, plainto_tsquery('english', ${query})) DESC`;
                        break;
                }

                const rows = await db
                    .select()
                    .from(listings)
                    .where(fullWhere)
                    .orderBy(orderBy)
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
                .from(listings)
                .where(where);

            let orderBy;
            switch (filters.sort) {
                case "price_asc":
                    orderBy = sql`${listings.createdAt} ASC`;
                    break;
                case "price_desc":
                    orderBy = sql`${listings.createdAt} DESC`;
                    break;
                case "newest":
                    orderBy = sql`${listings.createdAt} DESC`;
                    break;
                default:
                    orderBy = sql`${listings.createdAt} DESC`;
                    break;
            }

            const rows = await db
                .select()
                .from(listings)
                .where(where)
                .orderBy(orderBy)
                .limit(pageSize)
                .offset(offset);

            return {
                items: rows,
                total: countResult[0]?.count ?? 0,
                page,
                pageSize,
            };
        },

        // --- Pricing Tiers ---

        async addPricingTier(data: NewPricingTier): Promise<PricingTierRow> {
            const rows = await db
                .insert(pricingTiers)
                .values({
                    listingId: data.listingId,
                    tierName: data.tierName,
                    price: data.price,
                    deliverables: data.deliverables ?? null,
                    estimatedDays: data.estimatedDays ?? null,
                    displayOrder: data.displayOrder ?? 0,
                })
                .returning();
            return rows[0]!;
        },

        async getPricingTiers(listingId: string): Promise<PricingTierRow[]> {
            return db
                .select()
                .from(pricingTiers)
                .where(eq(pricingTiers.listingId, listingId))
                .orderBy(pricingTiers.displayOrder);
        },

        async findPricingTierById(id: string): Promise<PricingTierRow | undefined> {
            const rows = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
            return rows[0];
        },
    };
}
