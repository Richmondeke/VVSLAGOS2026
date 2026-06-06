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
        <div className="relative min-h-[85vh] px-4 py-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/5 blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-gold/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="mx-auto max-w-3xl relative">
                {/* Tech Telemetry Row */}
                <div className="mb-4 flex items-center justify-between text-[10px] text-text-secondary mono-caps tracking-widest px-1">
                    <span>MARKETPLACE // MY_PORTFOLIO</span>
                    <span>VVS_OFFER_LIST_v1.0</span>
                </div>

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">MY LIVE SERVICES</h1>
                        <p className="text-text-secondary text-xs mt-1">Manage your active creative contracts and published service tiers.</p>
                    </div>
                    <Link
                        href="/listings/new"
                        className="mono-caps text-[10px] font-bold px-4 py-2.5 bg-white text-black rounded-lg transition-all duration-300 hover:bg-vvs-accent hover:text-text-primary hover:scale-[1.02]"
                    >
                        + NEW LISTING
                    </Link>
                </div>

                {loading && (
                    <div className="space-y-4">
                        <LoadingSkeleton className="h-24 bg-text-secondary/5 rounded-xl animate-pulse" />
                        <LoadingSkeleton className="h-24 bg-text-secondary/5 rounded-xl animate-pulse" />
                    </div>
                )}

                {!loading && listings.length === 0 && (
                    <div className="glass-panel text-center py-20 rounded-xl max-w-xl mx-auto border border-text-secondary/10 relative">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-text-secondary/15 -translate-x-[1px] -translate-y-[1px]" />
                        <span className="text-4xl">💼</span>
                        <h3 className="text-lg font-bold mt-4">No Services Published Yet</h3>
                        <p className="text-xs text-text-secondary mt-1 mb-6 max-w-xs mx-auto animate-pulse">
                            Start listing your first creative service to earn reputation XP and receive CoraPay escrow orders.
                        </p>
                        <Link
                            href="/listings/new"
                            className="inline-block mono-caps text-[10px] font-bold px-6 py-3 bg-vvs-accent text-text-primary rounded-lg transition-all duration-300 hover:bg-white hover:text-black"
                        >
                            CREATE FIRST LISTING
                        </Link>
                    </div>
                )}

                {!loading && listings.length > 0 && (
                    <div className="space-y-4">
                        {listings.map((listing) => (
                            <div 
                                key={listing.id} 
                                className="glass-card p-6 rounded-xl flex items-center justify-between relative group border border-text-secondary/10"
                            >
                                {/* Accent indicator glow */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-vvs-accent/30 transition-all duration-300" />
                                
                                <div>
                                    <h3 className="text-base font-bold text-text-primary group-hover:text-vvs-accent transition-colors">
                                        {listing.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs mt-2">
                                        <span className="mono-caps text-[9px] bg-text-secondary/5 text-text-secondary border border-text-secondary/10 px-2 py-0.5 rounded">
                                            {listing.category}
                                        </span>
                                        <span className={`mono-caps text-[9px] px-2 py-0.5 rounded border font-semibold ${
                                            listing.status === "active" 
                                                ? "bg-vvs-green/10 text-vvs-green border-vvs-green/30 shadow-[0_0_10px_rgba(0,230,118,0.15)]" 
                                                : "bg-text-secondary/5 text-text-secondary border-text-secondary/10"
                                        }`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/listings/${listing.id}`}
                                    className="mono-caps text-[10px] font-bold px-4 py-2 bg-text-secondary/5 border border-text-secondary/15 text-text-primary rounded-lg hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                                >
                                    VIEW SERVICES
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
