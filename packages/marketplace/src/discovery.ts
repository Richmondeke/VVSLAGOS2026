import type { ScopedClient } from "@vvs/shared";
import type { Paginated, ListingSummary, ListingSearchQuery, MemberTier } from "@vvs/contracts";
import { createListingsRepo, type ListingRow } from "./repositories/listings.js";
import { createVerificationCacheRepo } from "./verification-cache.js";

function mapListingToSummary(row: ListingRow, tier: MemberTier): ListingSummary {
    return {
        id: row.id,
        providerId: row.providerId,
        title: row.title,
        category: row.category ?? "",
        pricingModel: row.pricingModel as "fixed" | "hourly" | "project",
        providerTier: tier,
        createdAt: row.createdAt,
    };
}

/**
 * Full-text search for active listings with filters and sorting.
 */
export async function searchListings(
    db: ScopedClient,
    query: ListingSearchQuery & {
        minPrice?: number;
        maxPrice?: number;
        minReputation?: number;
        availability?: string;
        sort?: "relevance" | "rating" | "price_asc" | "price_desc" | "newest";
    },
): Promise<Paginated<ListingSummary>> {
    const repo = createListingsRepo(db);
    const cacheRepo = createVerificationCacheRepo(db);

    const result = await repo.search({
        query: query.query,
        category: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sort: query.sort ?? "relevance",
        page: query.page,
        pageSize: query.pageSize,
    });

    // Enrich with cached tier info for display
    const summaries: ListingSummary[] = [];
    for (const row of result.items) {
        const cached = await cacheRepo.get(row.providerId);
        const tier: MemberTier = (cached?.tier as MemberTier) ?? "free";
        summaries.push(mapListingToSummary(row, tier));
    }

    return {
        items: summaries,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
    };
}
