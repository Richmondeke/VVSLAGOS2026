import type { ScopedClient } from "@vvs/shared";
import { ForbiddenError, NotFoundError, writeToOutbox } from "@vvs/shared";
import type { IIdentityService, MemberTier } from "@vvs/contracts";
import type { Listing, ListingCreateInput, PricingTier } from "@vvs/contracts";
import { createListingsRepo, type ListingRow, type PricingTierRow } from "./repositories/listings.js";

function mapTierRow(row: PricingTierRow): PricingTier {
    return {
        id: row.id,
        listingId: row.listingId,
        name: row.tierName as "basic" | "standard" | "premium",
        price: row.price,
        description: row.deliverables ?? "",
    };
}

function mapListingRow(row: ListingRow, tiers: PricingTierRow[]): Listing {
    return {
        id: row.id,
        providerId: row.providerId,
        title: row.title,
        description: row.description ?? "",
        category: row.category ?? "",
        pricingModel: row.pricingModel as "fixed" | "hourly" | "project",
        deliverables: [],
        tiers: tiers.map(mapTierRow),
        status: mapStatus(row.status),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function mapStatus(status: string): "draft" | "published" | "archived" {
    switch (status) {
        case "active":
            return "published";
        case "removed":
            return "archived";
        case "paused":
            return "archived";
        default:
            return "draft";
    }
}

/**
 * Creates a listing. ALWAYS checks tier via live IIdentityService call.
 * Free-tier members cannot create listings.
 */
export async function createListing(
    db: ScopedClient,
    identityService: IIdentityService,
    userId: string,
    input: ListingCreateInput,
): Promise<Listing> {
    // LIVE call — never cached for write-path
    const tier = await identityService.getTier(userId);
    if (tier === "free") {
        throw new ForbiddenError("Only Verified or Pro members can create listings");
    }

    const repo = createListingsRepo(db);

    const listing = await repo.create({
        providerId: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        pricingModel: input.pricingModel,
    });

    // Add pricing tiers
    const tierRows: PricingTierRow[] = [];
    for (let i = 0; i < input.tiers.length; i++) {
        const t = input.tiers[i]!;
        const row = await repo.addPricingTier({
            listingId: listing.id,
            tierName: t.name,
            price: t.price,
            deliverables: t.description,
            displayOrder: i,
        });
        tierRows.push(row);
    }

    // Activate listing
    await repo.updateStatus(listing.id, userId, "active");
    const updated = await repo.findById(listing.id);

    await writeToOutbox(
        db,
        "marketplace.listing.created",
        {
            listingId: listing.id,
            providerId: userId,
            category: input.category,
            timestamp: new Date(),
        },
        `listing-created-${listing.id}`,
    );

    return mapListingRow(updated!, tierRows);
}

export async function updateListing(
    db: ScopedClient,
    userId: string,
    listingId: string,
    input: Partial<Pick<ListingCreateInput, "title" | "description" | "category" | "pricingModel">>,
): Promise<Listing> {
    const repo = createListingsRepo(db);

    const row = await repo.update(listingId, userId, input);
    if (!row) throw new NotFoundError("Listing", listingId);

    const tiers = await repo.getPricingTiers(listingId);
    return mapListingRow(row, tiers);
}

export async function pauseListing(
    db: ScopedClient,
    userId: string,
    listingId: string,
): Promise<Listing> {
    const repo = createListingsRepo(db);
    const row = await repo.updateStatus(listingId, userId, "paused");
    if (!row) throw new NotFoundError("Listing", listingId);

    const tiers = await repo.getPricingTiers(listingId);
    return mapListingRow(row, tiers);
}

export async function deleteListing(
    db: ScopedClient,
    userId: string,
    listingId: string,
): Promise<void> {
    const repo = createListingsRepo(db);
    const row = await repo.updateStatus(listingId, userId, "removed");
    if (!row) throw new NotFoundError("Listing", listingId);
}
