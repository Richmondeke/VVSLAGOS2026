"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";

type MarketplaceListing = {
    id: string;
    title: string;
    description: string;
    category: "Clothes" | "Accessories" | "Art" | "Creative Services";
    status: string;
    providerName?: string;
    providerRating?: number;
    providerReviewsCount?: number;
    imageUrl: string;
    pricingTiers: Array<{
        name: string;
        priceKobo: number;
        description: string;
    }>;
    isTrend?: boolean;
};

const MOCK_LISTINGS: MarketplaceListing[] = [
    {
        id: "list-1",
        title: "Decorative Velvet Pillowcases",
        description:
            "Solid corduroy cushion covers that bring charm and modernity to your interior. Premium craftsmanship.",
        category: "Art",
        status: "active",
        providerName: "VVS Studio",
        providerRating: 5.0,
        providerReviewsCount: 44,
        imageUrl:
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Velvet Cover Set",
                priceKobo: 1800000,
                description: "Set of 2 luxury velvet pillowcases with hidden zipper closures",
            },
        ],
    },
    {
        id: "list-2",
        title: "LEVIT Humidifier for Bedroom Large Room",
        description:
            "Ultrasonic cool mist humidifier with automated smart humidity control and ultra-quiet motor technology.",
        category: "Accessories",
        status: "active",
        providerName: "LEVIT Home",
        providerRating: 5.0,
        providerReviewsCount: 14,
        imageUrl:
            "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Standard Unit",
                priceKobo: 12500000,
                description: "Includes one smart humidifier unit, cleaning brush, and power cable",
            },
        ],
        isTrend: true,
    },
    {
        id: "list-3",
        title: "VVS SS26 Heavyweight Capsule Jacket",
        description:
            "100% luxury 450gsm Nigerian-woven cotton canvas outerwear featuring modular pocket systems.",
        category: "Clothes",
        status: "active",
        providerName: "TJ-WHO",
        providerRating: 4.9,
        providerReviewsCount: 32,
        imageUrl:
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Single Piece",
                priceKobo: 18000000,
                description: "Numbered collector piece with dust cover",
            },
        ],
    },
    {
        id: "list-4",
        title: "LFJ Custom Hand-Cast Structural Brass Belt",
        description:
            "Bespoke dynamic waist accessory forged from recycled raw Nigerian brass. Heavy premium grade weight.",
        category: "Accessories",
        status: "active",
        providerName: "LFJ Official",
        providerRating: 4.8,
        providerReviewsCount: 7,
        imageUrl:
            "https://images.unsplash.com/photo-1624222247344-550fb8ecf782?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Custom Brass Belt",
                priceKobo: 7500000,
                description: "Tailored belt with dynamic brass buckle",
            },
        ],
    },
    {
        id: "list-5",
        title: "Surulere Mascot Silk-Screen Archival Canvas",
        description:
            "Limited-edition mixed-media study on archival 100% textured heavy linen cotton canvas.",
        category: "Art",
        status: "active",
        providerName: "Tunde Alabi",
        providerRating: 4.3,
        providerReviewsCount: 36,
        imageUrl:
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Original 1/1 Canvas",
                priceKobo: 22000000,
                description: "36x48 inches stretched canvas",
            },
        ],
    },
    {
        id: "list-6",
        title: "High-Fashion Editorial Direction Package",
        description:
            "Complete creative styling curation, archival research, lookbook direction, and campaign curation.",
        category: "Creative Services",
        status: "active",
        providerName: "Amina Yusuf",
        providerRating: 4.9,
        providerReviewsCount: 18,
        imageUrl:
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
        pricingTiers: [
            {
                name: "Campaign package",
                priceKobo: 35000000,
                description: "Full styling and creative direction concept",
            },
        ],
    },
];

const CATEGORIES = ["All", "Clothes", "Accessories", "Art", "Creative Services"] as const;

export default function MarketplacePage() {
    const { user } = useAuth();
    const [listings, setListings] = useState<MarketplaceListing[]>(MOCK_LISTINGS);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [likedListings, setLikedListings] = useState<Record<string, boolean>>({});

    const toggleLike = (id: string) => {
        setLikedListings((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Filter Logic
    const filteredListings = listings.filter((list) => {
        const matchesCategory = selectedCategory === "All" || list.category === selectedCategory;
        const matchesSearch =
            list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            list.providerName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatNaira = (kobo: number) => {
        const naira = kobo / 100;
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(naira);
    };

    // Separate trend card and regular cards
    const trendListing = filteredListings.find((l) => l.isTrend) || filteredListings[0];
    const otherListings = filteredListings.filter((l) => l.id !== trendListing?.id);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 space-y-10">
            {/* Header / Search Area */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary uppercase font-sans">
                        VVS Marketplace
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Acquire original physical garments, bespoke hardware, and certified creative
                        production packages.
                    </p>
                </div>

                {/* Search Bar - Rounded */}
                <div className="w-full max-w-xs">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full border border-text-secondary/15 bg-vvs-card px-5 py-2.5 pl-10 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-vvs-accent transition-all"
                        />
                        <span className="absolute left-4 top-3 text-xs opacity-60">🔍</span>
                    </div>
                </div>
            </div>

            {/* Inspiration Header Banner: Bright Yellow block with rounded corners */}
            <div className="relative overflow-hidden rounded-[2rem] bg-vvs-yellow text-vvs-black p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8 justify-between shadow-sm">
                {/* Yellow background subtle decoration */}
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/5 blur-2xl pointer-events-none" />

                {/* Left content block */}
                <div className="flex-1 space-y-6 z-10 max-w-xl">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-vvs-black">
                            Decorative <br />
                            pillowcases <br />
                            Velvet
                        </h2>
                        <p className="text-vvs-black/70 text-sm md:text-base font-medium max-w-md">
                            Solid corduroy cushion covers that bring charm and modernity to your
                            interior.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/listings/${listings[0]?.id}`}
                            className="px-6 py-3 rounded-full bg-white text-vvs-black font-bold text-xs hover:bg-white/90 transition-all shadow-sm"
                        >
                            Buy Now
                        </Link>
                    </div>
                </div>

                {/* Right image + overlays block */}
                <div className="relative w-full md:w-[45%] aspect-[4/3] rounded-2xl overflow-hidden z-10 bg-white/40 flex items-center justify-center p-2">
                    <img
                        src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80"
                        alt="Velvet Pillowcase Cover Inspiration"
                        className="w-full h-full object-cover rounded-xl"
                    />

                    {/* Price indicator dot */}
                    <div className="absolute top-[35%] right-[25%] bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md flex items-center gap-1 border border-white/50 text-[11px] font-bold text-vvs-black">
                        <span>$39</span>
                        <span className="text-[10px] text-vvs-blue font-black">+</span>
                    </div>

                    {/* Blue overlay pill */}
                    <div className="absolute bottom-4 left-4 right-4 bg-vvs-blue text-white rounded-xl p-3 flex items-center justify-between shadow-lg">
                        <span className="text-xs font-semibold">
                            More than 44 multi-colored species
                        </span>
                        <div className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer">
                            <span className="text-xs font-bold leading-none">➔</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-text-secondary/10 pb-4">
                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`text-xs px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                                selectedCategory === category
                                    ? "text-vvs-black bg-vvs-yellow font-bold"
                                    : "text-text-secondary hover:text-text-primary hover:bg-text-primary/5"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/listings/mine"
                        className="text-xs font-semibold px-4 py-2 border border-text-secondary/10 text-text-secondary hover:text-text-primary hover:border-text-primary transition-all rounded-full"
                    >
                        My Services
                    </Link>
                    <Link
                        href="/listings/new"
                        className="text-xs font-bold px-4 py-2 bg-text-primary text-vvs-bg hover:bg-vvs-accent hover:text-text-primary transition-all duration-300 rounded-full cursor-pointer"
                    >
                        + Create Listing
                    </Link>
                </div>
            </div>

            {/* Listings Layout Section */}
            {filteredListings.length === 0 ? (
                <div className="glass-panel text-center py-20 rounded-2xl max-w-xl mx-auto border border-text-secondary/5">
                    <span className="text-4xl">🛍️</span>
                    <h3 className="text-base font-bold mt-4 text-text-primary">No items found</h3>
                    <p className="text-xs text-text-secondary mt-1">
                        Try resetting your category or search keywords.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left block: Trend Products highlight */}
                    {trendListing && (
                        <div className="lg:col-span-1 bg-vvs-blue rounded-3xl p-6 text-white flex flex-col justify-between aspect-[3/4] lg:aspect-auto relative overflow-hidden group shadow-sm">
                            <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />

                            <div className="space-y-4 z-10">
                                <h3 className="text-2xl font-bold tracking-tight leading-tight">
                                    Trend <br />
                                    Products
                                </h3>

                                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center p-2">
                                    <img
                                        src={trendListing.imageUrl}
                                        alt={trendListing.title}
                                        className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 z-10">
                                <p className="text-[11px] font-medium opacity-80 max-w-[70%] line-clamp-1">
                                    {trendListing.title}
                                </p>
                                <Link
                                    href={`/listings/${trendListing.id}`}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-vvs-blue flex items-center justify-center transition-all cursor-pointer"
                                >
                                    <span className="text-xs">➔</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Right block: List of regular items */}
                    <div className="lg:col-span-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {otherListings.map((list) => {
                            const basePrice = list.pricingTiers[0]?.priceKobo ?? 0;
                            const isLiked = !!likedListings[list.id];
                            return (
                                <div
                                    key={list.id}
                                    className="bg-white rounded-3xl overflow-hidden border border-text-secondary/10 flex flex-col justify-between h-full relative group transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="relative">
                                        {/* Heart Toggle Button */}
                                        <button
                                            type="button"
                                            onClick={() => toggleLike(list.id)}
                                            className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-black/5 flex items-center justify-center cursor-pointer transition-all hover:bg-white hover:scale-110"
                                            aria-label="Toggle Like"
                                        >
                                            <svg
                                                role="img"
                                                aria-label="Like icon"
                                                className={`w-4.5 h-4.5 transition-colors ${isLiked ? "fill-vvs-blue stroke-vvs-blue" : "stroke-text-secondary fill-none"}`}
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                />
                                            </svg>
                                        </button>

                                        {/* Main product image container */}
                                        <div className="w-full aspect-[4/3] bg-vvs-card flex items-center justify-center overflow-hidden">
                                            <img
                                                src={list.imageUrl}
                                                alt={list.title}
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <div className="space-y-1">
                                                <h3 className="text-xs font-bold text-text-primary leading-tight group-hover:text-vvs-accent transition-colors line-clamp-1">
                                                    {list.title}
                                                </h3>
                                                {list.providerName && (
                                                    <p className="text-[10px] text-text-muted mt-1 leading-none">
                                                        By {list.providerName}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Rating and reviews */}
                                            {list.providerRating && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-vvs-yellow">
                                                        ★
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-primary">
                                                        {list.providerRating.toFixed(1)}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted">
                                                        ({list.providerReviewsCount ?? 0} reviews)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="p-4 pt-0 flex items-center justify-between border-t border-text-secondary/5 mt-4">
                                        <div>
                                            <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                Price
                                            </span>
                                            <span className="text-xs font-bold text-text-primary">
                                                {formatNaira(basePrice)}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/listings/${list.id}`}
                                            className="w-8 h-8 rounded-full bg-vvs-black text-white hover:bg-vvs-accent flex items-center justify-center transition-all duration-300 cursor-pointer"
                                            aria-label="Acquire Product"
                                        >
                                            <svg
                                                role="img"
                                                aria-label="Cart icon"
                                                className="w-4 h-4 fill-none stroke-current"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
