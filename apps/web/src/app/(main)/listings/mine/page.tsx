"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type MyListing = {
    id: string;
    title: string;
    category: string;
    status: string;
    pricingTiers: Array<{ priceKobo: number }>;
};

export default function MyListingsPage() {
    const [listings, setListings] = useState<MyListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<{ items: MyListing[] }>("/marketplace/listings?mine=true");
                setListings(data.items ?? []);
            } catch {
                // handled below
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="mx-auto max-w-3xl p-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-vvs-primary">My Listings</h1>
                <Link
                    href="/listings/new"
                    className="rounded-lg bg-vvs-accent px-4 py-2 text-sm font-medium text-white hover:bg-vvs-accent/90"
                >
                    + New Listing
                </Link>
            </div>

            {loading && (
                <div className="space-y-4">
                    <LoadingSkeleton className="h-24" />
                    <LoadingSkeleton className="h-24" />
                </div>
            )}

            {!loading && listings.length === 0 && (
                <EmptyState
                    message="You haven't created any listings yet. Start by listing your first service."
                    ctaLabel="Create Listing"
                    ctaHref="/listings/new"
                />
            )}

            {!loading && listings.length > 0 && (
                <div className="space-y-3">
                    {listings.map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
                            <div>
                                <h3 className="font-medium">{listing.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{listing.category}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        listing.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {listing.status}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/listings/${listing.id}`}
                                className="text-sm text-vvs-accent hover:underline"
                            >
                                View
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
