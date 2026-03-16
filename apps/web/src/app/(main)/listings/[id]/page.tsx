"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { TierBadge } from "@/components/tier-badge";
import { RatingDisplay } from "@/components/rating-display";
import { AvailabilityIndicator } from "@/components/availability-indicator";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import type { MemberTier } from "@vvs/contracts";

type PricingTier = {
    name: string;
    priceKobo: number;
    description: string;
    deliveryDays: number;
    deliverables: string[];
};

type ListingDetail = {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    pricingTiers: PricingTier[];
    providerId: string;
    providerName?: string;
    providerTier?: MemberTier;
    providerRating?: number;
    providerTxCount?: number;
    providerAvailability?: string;
    portfolioSamples?: string[];
};

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<ListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState(0);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [ordering, setOrdering] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<ListingDetail>(`/marketplace/listings/${params.id}`);
                setListing(data);
            } catch {
                // error handled by empty state
            } finally {
                setLoading(false);
            }
        })();
    }, [params.id]);

    async function handleOrder() {
        if (!listing) return;
        setOrdering(true);
        try {
            const tier = listing.pricingTiers[selectedTier]!;
            await apiClient("/marketplace/orders", {
                method: "POST",
                body: {
                    listingId: listing.id,
                    pricingTierName: tier.name,
                    notes: "",
                },
            });
            setShowOrderModal(false);
            router.push("/orders");
        } catch {
            // error toast
        } finally {
            setOrdering(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <LoadingSkeleton className="h-48" />
                <LoadingSkeleton className="h-32" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="mx-auto max-w-3xl p-4 text-center">
                <p className="text-gray-600">This listing is currently unavailable.</p>
            </div>
        );
    }

    const activeTier = listing.pricingTiers[selectedTier]!;

    return (
        <div className="mx-auto max-w-3xl p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {listing.category}
                </div>
                <h1 className="text-2xl font-bold text-vvs-primary">{listing.title}</h1>
            </div>

            {/* Provider card */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl">
                        👤
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{listing.providerName ?? "Provider"}</span>
                            {listing.providerTier && <TierBadge tier={listing.providerTier} />}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            {listing.providerRating != null && (
                                <RatingDisplay mode="read" rating={listing.providerRating} count={listing.providerTxCount} />
                            )}
                            {listing.providerAvailability && (
                                <AvailabilityIndicator status={listing.providerAvailability as any} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <h2 className="mb-2 font-semibold">About This Service</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Pricing tiers */}
            <div className="mb-6">
                <h2 className="mb-3 font-semibold">Pricing</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                    {listing.pricingTiers.map((tier, i) => (
                        <button
                            key={tier.name}
                            onClick={() => setSelectedTier(i)}
                            className={`rounded-lg border-2 p-4 text-left transition-colors ${
                                selectedTier === i
                                    ? "border-vvs-accent bg-vvs-accent/5"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="mb-1 font-medium">{tier.name}</div>
                            <div className="mb-2 text-lg font-bold text-vvs-primary">
                                &#8358;{(tier.priceKobo / 100).toLocaleString()}
                            </div>
                            <div className="mb-2 text-xs text-gray-500">
                                {tier.deliveryDays} day{tier.deliveryDays > 1 ? "s" : ""} delivery
                            </div>
                            <ul className="space-y-1">
                                {tier.deliverables.map((d) => (
                                    <li key={d} className="text-xs text-gray-600">
                                        ✓ {d}
                                    </li>
                                ))}
                            </ul>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sticky CTA */}
            <div className="fixed bottom-16 left-0 right-0 border-t border-gray-200 bg-white p-4 sm:static sm:border-0 sm:p-0">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                    <div>
                        <span className="text-sm text-gray-500">{activeTier.name}</span>
                        <div className="text-lg font-bold">
                            &#8358;{(activeTier.priceKobo / 100).toLocaleString()}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowOrderModal(true)}
                        className="rounded-lg bg-vvs-accent px-6 py-3 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                    >
                        Order This Service
                    </button>
                </div>
            </div>

            {/* Order confirmation modal */}
            <ConfirmationDialog
                open={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                onConfirm={handleOrder}
                title="Confirm Order"
                message={`You're ordering "${activeTier.name}" for this listing. The provider will review and accept your order.`}
                confirmLabel="Place Order"
                variant="money"
                amount={activeTier.priceKobo}
                loading={ordering}
            />
        </div>
    );
}
