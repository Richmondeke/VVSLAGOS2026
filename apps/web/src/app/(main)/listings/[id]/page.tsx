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
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <LoadingSkeleton className="h-12 bg-text-secondary/5 rounded-xl animate-pulse" />
                <LoadingSkeleton className="h-48 bg-text-secondary/5 rounded-xl animate-pulse" />
                <LoadingSkeleton className="h-32 bg-text-secondary/5 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="mx-auto max-w-3xl p-8 text-center">
                <div className="glass-panel py-16 rounded-xl border border-text-secondary/10">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-lg font-bold mt-4">Service Unavailable</h2>
                    <p className="text-xs text-text-secondary mt-1">This listing is currently unavailable or has been archived.</p>
                </div>
            </div>
        );
    }

    const activeTier = listing.pricingTiers[selectedTier]!;

    return (
        <div className="relative min-h-[90vh] px-4 py-12 overflow-hidden pb-32">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-vvs-accent/5 blur-[130px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[400px] rounded-full bg-vvs-gold/5 blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

            <div className="mx-auto max-w-3xl relative space-y-8">
                {/* Tech Telemetry Row */}
                <div className="flex items-center justify-between text-[10px] text-text-secondary mono-caps tracking-widest px-1">
                    <span>MARKETPLACE // SERVICE_DETAILS</span>
                    <span>VVS_SERVICE_ID_{listing.id.slice(0, 8).toUpperCase()}</span>
                </div>

                {/* Header */}
                <div>
                    <span className="mono-caps text-[9px] font-bold px-3 py-1 bg-vvs-accent/10 border border-vvs-accent/30 text-vvs-accent rounded-full">
                        {listing.category}
                    </span>
                    <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
                        {listing.title}
                    </h1>
                </div>

                {/* Provider Card */}
                <div className="glass-card p-5 rounded-xl border border-text-secondary/10 flex items-center justify-between relative group">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-text-secondary/5 border border-text-secondary/15 text-2xl shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                            👤
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-text-primary text-base">{listing.providerName ?? "Provider"}</span>
                                {listing.providerTier && <TierBadge tier={listing.providerTier} />}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs">
                                {listing.providerRating != null && (
                                    <div className="text-vvs-gold">
                                        <RatingDisplay mode="read" rating={listing.providerRating} count={listing.providerTxCount} />
                                    </div>
                                )}
                                {listing.providerAvailability && (
                                    <AvailabilityIndicator status={listing.providerAvailability as any} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block text-right">
                        <span className="mono-caps text-[8px] text-text-secondary">ESTABLISHED COOPERATIVE</span>
                        <div className="text-[11px] font-mono font-bold text-vvs-gold mt-0.5">CONTRACTOR_REPUTABLE</div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mono-caps">About This Service</h2>
                    <div className="glass-panel p-6 rounded-xl border border-text-secondary/10 relative">
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-text-secondary/15 -translate-x-[1px] -translate-y-[1px]" />
                        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                            {listing.description}
                        </p>
                    </div>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mono-caps">Pricing Tiers</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {listing.pricingTiers.map((tier, i) => {
                            const isSelected = selectedTier === i;
                            return (
                                <button
                                    key={tier.name}
                                    onClick={() => setSelectedTier(i)}
                                    className={`rounded-xl border p-5 text-left transition-all duration-300 relative group cursor-pointer ${
                                        isSelected
                                            ? "border-vvs-accent bg-vvs-accent/[0.03]"
                                            : "border-text-secondary/10 bg-white/[0.01] hover:border-text-secondary/20 hover:bg-white/[0.02]"
                                    }`}
                                >
                                    {/* Accent corner glowing block */}
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-vvs-accent -translate-x-[1px] -translate-y-[1px]" />
                                    )}

                                    <div className={`text-xs font-bold mono-caps tracking-wider transition-colors ${isSelected ? "text-vvs-accent" : "text-text-secondary"}`}>
                                        {tier.name}
                                    </div>
                                    <div className="mt-2 text-2xl font-bold text-text-primary font-mono">
                                        &#8358;{(tier.priceKobo / 100).toLocaleString()}
                                    </div>
                                    <div className="mt-1 text-[10px] text-text-secondary font-semibold font-mono">
                                        {tier.deliveryDays} day{tier.deliveryDays > 1 ? "s" : ""} timeline
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-text-secondary/10 space-y-2">
                                        {tier.deliverables.map((d) => (
                                            <div key={d} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                                <span className="text-vvs-green text-[10px] mt-0.5">✓</span>
                                                <span className="leading-tight">{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sticky / Frosted Bottom Drawer for checkout */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-text-secondary/15 px-6 py-5 md:relative md:rounded-xl md:border md:bg-white/[0.02] md:p-6 md:border-text-secondary/15 md:shadow-none">
                    <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] text-text-secondary mono-caps tracking-widest">{activeTier.name} service tier</span>
                            <div className="text-2xl font-bold text-text-primary font-mono mt-0.5">
                                &#8358;{(activeTier.priceKobo / 100).toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowOrderModal(true)}
                            className="mono-caps text-[10px] font-bold px-6 py-3.5 bg-white text-black rounded-lg transition-all duration-300 hover:bg-vvs-accent hover:text-text-primary hover:scale-[1.02] cursor-pointer"
                        >
                            ORDER THIS SERVICE
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
        </div>
    );
}
