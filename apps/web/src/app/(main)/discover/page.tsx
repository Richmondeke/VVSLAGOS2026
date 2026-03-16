"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";

type ListingSummary = {
    id: string;
    title: string;
    category: string;
    pricingTiers: Array<{ name: string; priceKobo: number }>;
    providerName?: string;
};

export default function DiscoverPage() {
    const [listings, setListings] = useState<ListingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadListings();
    }, []);

    async function loadListings(query?: string) {
        setLoading(true);
        setError(null);
        try {
            const params = query ? `?search=${encodeURIComponent(query)}` : "";
            const data = await apiClient<{ items: ListingSummary[] }>(
                `/marketplace/listings${params}`,
            );
            setListings(data.items ?? []);
        } catch {
            setError("Failed to load listings. Pull to refresh.");
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        loadListings(search);
    }

    return (
        <div className="mx-auto max-w-3xl p-4">
            <form onSubmit={handleSearch} className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                />
            </form>

            {loading && (
                <div className="space-y-4">
                    <LoadingSkeleton className="h-32" />
                    <LoadingSkeleton className="h-32" />
                    <LoadingSkeleton className="h-32" />
                </div>
            )}

            {!loading && error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {!loading && !error && listings.length === 0 && (
                <EmptyState
                    message={
                        search
                            ? `No services found for "${search}". Know someone who offers this? Invite them.`
                            : "No services listed yet. Be the first to create a listing!"
                    }
                    ctaLabel="Create Listing"
                    ctaHref="/listings/new"
                />
            )}

            {!loading && listings.length > 0 && (
                <div className="space-y-4">
                    {listings.map((listing) => {
                        const lowestPrice = Math.min(
                            ...listing.pricingTiers.map((t) => t.priceKobo),
                        );
                        return (
                            <a
                                key={listing.id}
                                href={`/listings/${listing.id}`}
                                className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                            >
                                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                                    {listing.category}
                                </div>
                                <h3 className="mb-1 text-lg font-semibold">{listing.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {listing.providerName ?? "Provider"}
                                    </span>
                                    <span className="font-medium text-vvs-primary">
                                        from &#8358;{(lowestPrice / 100).toLocaleString()}
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
