"use client";

import Countdown from "@/components/countdown";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

type Opportunity = {
    id: string;
    title: string;
    brand: string;
    brandLogo?: string;
    isVerifiedBrand: boolean;
    type:
        | "Gigs"
        | "Grants"
        | "Castings"
        | "Residencies"
        | "Brand Activations"
        | "Collaborations"
        | "Competitions";
    category: "Fashion" | "Film" | "Photography" | "Music" | "Tech" | "Culture";
    location: string;
    deadline: string;
    budget: string;
    xpReward: string;
    description: string;
};

type Creative = {
    id: string;
    name: string;
    avatarUrl: string;
    discipline: string;
    location: string;
    status: string;
    steez: number;
    bio: string;
    skills: string[];
    links: Array<{
        title: string;
        url: string;
        type: "link" | "file" | "pdf" | "website" | "reel" | "document";
    }>;
    projects: number;
    earnings: string;
    rating: number;
};

const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: "opp-1",
        title: "Lead Stylist for VVS Lagos Runway Activation",
        brand: "VVS Lagos",
        brandLogo: "https://www.vvslagos.com/assets/VVSMASCOT7.png",
        isVerifiedBrand: true,
        type: "Castings",
        category: "Fashion",
        location: "Lagos, Nigeria",
        deadline: "June 15, 2026",
        budget: "₦450,000",
        xpReward: "+150 XP",
        description:
            "We are hunting for a super creative lead stylist to direct styling for the upcoming VVS Lagos high-fashion capsule drop. Bring your A-game fashion presence.",
    },
    {
        id: "opp-3",
        title: "Creative Lead for Capsule Showcase Campaign",
        brand: "Hertunba",
        brandLogo: "https://www.vvslagos.com/assets/HERTUNBA.avif",
        isVerifiedBrand: true,
        type: "Collaborations",
        category: "Film",
        location: "Lekki, Lagos",
        deadline: "July 02, 2026",
        budget: "₦1,200,000",
        xpReward: "+250 XP",
        description:
            "Directing the visual narrative and lookbook videography for Hertunba's new collection. Tell a story that will make viewers choke with pure cultural intelligence.",
    },
    {
        id: "opp-4",
        title: "Apparel Styling Associate & Showroom Curator",
        brand: "In Official",
        brandLogo: "https://www.vvslagos.com/assets/IN%20OFFICIAL.png",
        isVerifiedBrand: true,
        type: "Gigs",
        category: "Fashion",
        location: "Ikoyi, Lagos",
        deadline: "June 20, 2026",
        budget: "₦350,000",
        xpReward: "+100 XP",
        description:
            "Help curate and coordinate the premium showroom and client styling sessions for In Official's upcoming exclusive private collectors drop.",
    },
    {
        id: "opp-5",
        title: "Avant-Garde Accessory Design Partnership",
        brand: "LFJ Official",
        brandLogo: "https://www.vvslagos.com/assets/LFJ%20OFFICIAL.webp",
        isVerifiedBrand: true,
        type: "Collaborations",
        category: "Culture",
        location: "Remote / Lagos",
        deadline: "July 12, 2026",
        budget: "₦850,000",
        xpReward: "+180 XP",
        description:
            "Collaborative design gig to co-create custom 3D printed structural brass accessories for the LFJ runway. Show us why your creative skill choke, no caps.",
    },
    {
        id: "opp-6",
        title: "Model Casting: Tokyo James Runway Campaign",
        brand: "Tokyo James",
        brandLogo: "https://www.vvslagos.com/assets/TOKYO%20JAMEs.webp",
        isVerifiedBrand: true,
        type: "Castings",
        category: "Fashion",
        location: "Lagos, Nigeria",
        deadline: "June 18, 2026",
        budget: "₦500,000",
        xpReward: "+150 XP",
        description:
            "Street-scouted and seasoned professional models wanted to walk the Tokyo James SS27 showcase. Looking for candidates with pure, raw attitude and unmatched presence.",
    },
];

const MOCK_CREATIVES: Creative[] = [
    {
        id: "cr-1",
        name: "Amina Yusuf",
        avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        discipline: "Afromodernist Textile Designer",
        location: "Lagos, Nigeria",
        status: "Vanguard Elite",
        steez: 98,
        bio: "Weaving Yoruba architectural geometries into high-fashion structural textiles. Featured in SS25 Paris Showcases.",
        skills: ["Textile Design", "Geometric Weaving", "Creative Direction"],
        links: [
            { title: "Portfolio Reel 🎥", url: "https://vvs.is/amina-reel", type: "reel" },
            { title: "SS26 Lookbook.pdf 📄", url: "https://vvs.is/amina-lookbook", type: "pdf" },
        ],
        projects: 52,
        earnings: "$45k+",
        rating: 4.9,
    },
    {
        id: "cr-2",
        name: "Tunde Olayinka",
        avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        discipline: "Utilitarian Outerwear Architect",
        location: "Yaba, Lagos",
        status: "Pro",
        steez: 95,
        bio: "Specializing in heavy brass-buckled canvas outerwear and modular pocket structures. Functional garments only.",
        skills: ["Pattern Cutting", "Utility Outerwear", "3D Drafting"],
        links: [
            { title: "Technical Folio", url: "https://vvs.is/tunde-folio", type: "link" },
            { title: "Brand Concept", url: "https://vvs.is/tunde-brand", type: "website" },
        ],
        projects: 38,
        earnings: "$28k+",
        rating: 4.7,
    },
    {
        id: "cr-3",
        name: "Zara Coker",
        avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        discipline: "Art Director & Lead Stylist",
        location: "Ikoyi, Lagos",
        status: "Visionary",
        steez: 99,
        bio: "Curating high-contrast editorial concepts that bridge Nigerian archive photography with luxury street aesthetics.",
        skills: ["Editorial Styling", "Art Direction", "Set Design"],
        links: [
            { title: "Creative Reel ⚡", url: "https://vvs.is/zara-reel", type: "reel" },
            { title: "Editorial Deck.pdf 📄", url: "https://vvs.is/zara-deck", type: "pdf" },
        ],
        projects: 64,
        earnings: "$55k+",
        rating: 5.0,
    },
    {
        id: "cr-4",
        name: "Kofi Mensah",
        avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        discipline: "Avant-Garde Jewelry Maker",
        location: "Accra / Lagos",
        status: "Member",
        steez: 91,
        bio: "Sculpting wearable art out of recycled brass, bronze, and raw crystal clusters. Inspired by cosmic geometries.",
        skills: ["Jewelry Craft", "3D Printing", "Metal Forging"],
        links: [{ title: "Jewelry Showroom", url: "https://vvs.is/kofi-shop", type: "website" }],
        projects: 29,
        earnings: "$18k+",
        rating: 4.5,
    },
    {
        id: "cr-5",
        name: "Nneka Okafor",
        avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        discipline: "Visual Storyteller & Filmmaker",
        location: "Lekki, Lagos",
        status: "Pro",
        steez: 94,
        bio: "Documenting subcultures of Lagos through high-contrast film-grain reels and digital-art activations.",
        skills: ["Cinematography", "Subculture Research", "Color Grading"],
        links: [
            { title: "Director's Cut 🎥", url: "https://vvs.is/nneka-cut", type: "reel" },
            { title: "Lagos Subculture PDF 📄", url: "https://vvs.is/nneka-doc", type: "pdf" },
        ],
        projects: 41,
        earnings: "$32k+",
        rating: 4.8,
    },
];

const OPPORTUNITY_TYPES = [
    "All",
    "Gigs",
    "Grants",
    "Castings",
    "Brand Activations",
    "Residencies",
    "Competitions",
] as const;
const CATEGORIES = ["All", "Fashion", "Film", "Photography", "Music", "Tech", "Culture"] as const;

const BANNER_ADS = [
    {
        id: "ad-1",
        tag: "VVS LAGOS 2026",
        title: "VVSLagos is 24 days away",
        cta: "RSVP",
        tagColor: "text-vvs-accent",
        imageUrl:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
        description:
            "Experience the 5th edition of VVS Lagos - Art, Fashion, and Cultural Extravaganza.",
        targetDate: "2026-07-05T19:00:00",
    },
    {
        id: "ad-2",
        tag: "VVS CASTING // SURULERE",
        title: "VVS Casting",
        cta: "Claim Spot",
        tagColor: "text-vvs-gold",
        imageUrl:
            "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80",
        description: "June 23rd, 2026",
        targetDate: "2026-06-23T09:00:00",
    },
];

// Helper to compute relative days left from May 28, 2026
const getDaysLeft = (deadlineStr: string) => {
    const current = new Date("2026-05-28");
    const target = new Date(deadlineStr);
    const diffTime = target.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Expired";
};

export default function DiscoverPage() {
    const { user, addXp } = useAuth();
    const [currentView, setCurrentTab] = useState<"opportunities" | "creatives">("opportunities");
    const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
    const [selectedType, setSelectedType] = useState<string>("All");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Application CV flow states
    const [applyingOpp, setApplyingOpp] = useState<Opportunity | null>(null);
    const [coverPitch, setCoverPitch] = useState("");
    const [isApplied, setIsApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Banner ad slide state
    const [activeAd, setActiveAd] = useState(0);

    // Auto-scroll the banner ads
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveAd((prev) => (prev + 1) % BANNER_ADS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    // Filter logic
    const filteredOpportunities = opportunities.filter((opp) => {
        const matchesType = selectedType === "All" || opp.type === selectedType;
        const matchesCategory = selectedCategory === "All" || opp.category === selectedCategory;
        const matchesSearch =
            opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesCategory && matchesSearch;
    });

    const filteredCreatives = MOCK_CREATIVES.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleApplyClick = (opp: Opportunity) => {
        setApplyingOpp(opp);
        setIsApplied(false);
        setCoverPitch("");
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsApplying(true);

        // Simulate secure API/escrow submission of user's CV Profile
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsApplying(false);
        setIsApplied(true);
        addXp(100); // Reward the user with VVS Status XP

        // Close after brief delay
        setTimeout(() => {
            setApplyingOpp(null);
            setIsApplied(false);
        }, 2200);
    };

    return (
        <div className="mx-auto max-w-5xl py-10 px-4 md:px-0">
            {/* Page Header */}
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary leading-none">
                        Discover
                    </h1>
                    <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
                        Gigs, grants, and everything sweet. We source the finest design roles,
                        high-fashion casting briefs, and global creative grants.
                    </p>
                </div>
            </div>

            {/* ── Diamond-Cut Brand Banner (Reference-style) ── */}
            <div className="mb-10">
                <div
                    className="relative overflow-hidden rounded-2xl bg-vvs-gold text-vvs-black p-6 md:p-8 flex items-center justify-between shadow-lg"
                    style={{
                        background: "linear-gradient(135deg, #FFD500 0%, #F5A623 100%)",
                    }}
                >
                    {/* Left content - Title and Description only */}
                    <div className="space-y-2.5 max-w-[65%] z-10 flex flex-col justify-start">
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold font-mono tracking-widest text-vvs-black/60 uppercase">
                                {BANNER_ADS[activeAd].tag}
                            </span>
                            <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-vvs-black font-serif">
                                {BANNER_ADS[activeAd].title}
                            </h2>
                            <p className="text-xs text-vvs-black/75 hidden md:block">
                                {BANNER_ADS[activeAd].description}
                            </p>
                        </div>
                        {/* Countdown widget */}
                        <Countdown targetDate={BANNER_ADS[activeAd].targetDate} variant="banner" />
                    </div>

                    {/* Right content - View button cleanly pushed right, with large overlaid diamond shape */}
                    <div className="flex items-center gap-4 shrink-0 z-10">
                        {/* View Button */}
                        <button className="px-5 py-2.5 bg-white text-vvs-black rounded-full text-xs font-extrabold flex items-center gap-1.5 hover:bg-white/95 transition-all shadow-md cursor-pointer z-10">
                            {BANNER_ADS[activeAd].cta}{" "}
                            <span className="font-sans font-black">»</span>
                        </button>
                    </div>

                    {/* Overlaid Diamond emblem positioned in the bottom right corner */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 text-white/15 select-none pointer-events-none z-0 transform rotate-12">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.8L18.4 9H5.6L12 4.8zM4.7 10.5h14.6L12 19.3l-7.3-8.8z" />
                        </svg>
                    </div>

                    {/* Subtle design overlays */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {BANNER_ADS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveAd(i)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                activeAd === i ? "w-8 bg-text-primary" : "w-2 bg-text-muted/30"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Search Bar - Positioned above switcher */}
            <div className="mb-6 w-full max-w-full">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={
                            currentView === "opportunities"
                                ? "Search opportunities..."
                                : "Search creatives..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input w-full rounded-full px-5 py-3.5 pl-11 text-sm text-text-primary placeholder-text-muted focus:outline-none"
                    />
                    <span className="absolute left-4 top-4 text-sm opacity-50">🔍</span>
                </div>
            </div>

            {/* View Switcher and Filter Trigger Row */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex bg-vvs-card rounded-full p-1.5 w-fit">
                    <button
                        onClick={() => {
                            setCurrentTab("opportunities");
                            setSearchQuery("");
                        }}
                        className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                            currentView === "opportunities"
                                ? "bg-text-primary text-vvs-bg shadow-sm font-extrabold"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        Opportunities
                    </button>
                    <button
                        onClick={() => {
                            setCurrentTab("creatives");
                            setSearchQuery("");
                        }}
                        className={`px-6 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                            currentView === "creatives"
                                ? "bg-text-primary text-vvs-bg shadow-sm font-extrabold"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        Creatives
                    </button>
                </div>

                {currentView === "opportunities" && (
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-vvs-card border border-text-secondary/10 hover:border-text-secondary/20 rounded-full text-xs font-bold text-text-primary transition-all cursor-pointer"
                    >
                        <span>🎛️</span>
                        <span>Filter</span>
                        {(selectedType !== "All" || selectedCategory !== "All") && (
                            <span className="w-2 h-2 rounded-full bg-vvs-gold" />
                        )}
                    </button>
                )}
            </div>

            {/* VIEW 1: Opportunities Feed View */}
            {currentView === "opportunities" && (
                <div className="space-y-8">
                    {/* Opportunities Feed Grid */}
                    {filteredOpportunities.length === 0 ? (
                        <div className="text-center py-20 rounded-vvs-xl bg-vvs-card max-w-xl mx-auto">
                            <span className="text-5xl">📭</span>
                            <h3 className="text-lg font-bold mt-4 text-text-primary">
                                Nothing here yet
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">
                                Try adjusting your filters or search keywords.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {filteredOpportunities.map((opp) => (
                                <div
                                    key={opp.id}
                                    className="rounded-vvs-xl bg-vvs-card p-6 flex flex-col justify-between h-full group hover:bg-vvs-card-hover transition-all duration-300"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-vvs-card-elevated rounded-vvs-md flex items-center justify-center overflow-hidden shrink-0">
                                                    {opp.brandLogo &&
                                                    (opp.brandLogo.startsWith("http") ||
                                                        opp.brandLogo.startsWith("/")) ? (
                                                        <img
                                                            src={opp.brandLogo}
                                                            alt={opp.brand}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl">
                                                            {opp.brandLogo ?? "⚡"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="text-sm font-bold text-text-primary leading-none">
                                                            {opp.brand}
                                                        </h4>
                                                        {opp.isVerifiedBrand && (
                                                            <span
                                                                className="text-xs text-vvs-gold"
                                                                title="Verified"
                                                            >
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-text-muted mt-1">
                                                        {opp.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="pill-tag text-[10px]">{opp.type}</span>
                                        </div>

                                        <h3 className="text-base font-bold leading-snug text-text-primary group-hover:text-vvs-gold transition-colors">
                                            {opp.title}
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-2.5 line-clamp-3 leading-relaxed">
                                            {opp.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-text-secondary/8 flex flex-col gap-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <div>
                                                <span className="text-text-muted">Budget</span>
                                                <span className="text-vvs-gold font-bold ml-1.5">
                                                    {opp.budget}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-text-muted">Deadline</span>
                                                <span className="text-text-secondary font-semibold ml-1.5">
                                                    {getDaysLeft(opp.deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApplyClick(opp)}
                                            className="w-full text-center text-sm font-semibold py-3 bg-text-primary text-vvs-bg rounded-full transition-all duration-200 hover:bg-vvs-gold cursor-pointer"
                                        >
                                            Quick Apply →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: Creatives Directory View */}
            {currentView === "creatives" && (
                <div className="space-y-6">
                    {filteredCreatives.length === 0 ? (
                        <div className="glass-panel text-center py-20 rounded-2xl max-w-xl mx-auto border border-text-secondary/5">
                            <span className="text-4xl">👥</span>
                            <h3 className="text-base font-bold mt-4 text-text-primary">
                                No creative minds found
                            </h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Try searching another discipline, name, or design style.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCreatives.map((creative) => (
                                <div
                                    key={creative.id}
                                    className="bg-white dark:bg-[#0E0F13] text-black dark:text-white border border-[#EBEBEF] dark:border-white/5 rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full group transition-all duration-300"
                                >
                                    <div className="space-y-4">
                                        {/* Avatar & Name Header */}
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shrink-0 bg-black/5 dark:bg-white/5">
                                                <img
                                                    src={creative.avatarUrl}
                                                    alt={creative.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-text-primary leading-tight">
                                                    {creative.name}
                                                </h3>
                                                <p className="text-xs text-text-secondary mt-1">
                                                    {creative.discipline} • {creative.location}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {creative.bio}
                                        </p>

                                        {/* Details Grid (Separated by subtle lines) */}
                                        <div className="grid grid-cols-3 border-t border-b border-[#EBEBEF]/80 dark:border-white/5 py-4 mt-2">
                                            <div className="text-center border-r border-[#EBEBEF]/80 dark:border-white/5 px-2">
                                                <span className="block text-[10px] text-text-muted">Projects</span>
                                                <span className="block text-sm font-bold text-text-primary mt-1">{creative.projects}</span>
                                            </div>
                                            <div className="text-center border-r border-[#EBEBEF]/80 dark:border-white/5 px-2">
                                                <span className="block text-[10px] text-text-muted">Earnings</span>
                                                <span className="block text-sm font-bold text-text-primary mt-1">{creative.earnings}</span>
                                            </div>
                                            <div className="text-center px-2 flex flex-col items-center justify-center">
                                                <span className="block text-[10px] text-text-muted">Rating</span>
                                                <span className="block text-sm font-bold text-text-primary mt-1 flex items-center justify-center gap-1">
                                                    <span className="text-vvs-gold text-xs">⭐</span> {creative.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <button className="flex-1 py-3 bg-[#0A0A0C] dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold transition-all hover:opacity-90 cursor-pointer">
                                            Hire now
                                        </button>
                                        <button className="flex-1 py-3 bg-[#F5F5F7] dark:bg-white/5 text-[#0A0A0C] dark:text-white rounded-xl text-xs font-bold transition-all hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
                                            Message
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Application Flow Dialog overlay (Submit completed VVS Profile CV) */}
            {applyingOpp && user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    <div className="glass-panel max-w-md w-full p-8 rounded-2xl relative overflow-hidden animate-float border border-text-secondary/15 shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-vvs-gold" />

                        <button
                            onClick={() => setApplyingOpp(null)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-all text-sm cursor-pointer"
                        >
                            ✕
                        </button>

                        {!isApplied ? (
                            <form onSubmit={handleApplySubmit} className="space-y-6">
                                <div className="text-center space-y-1.5">
                                    <span className="mono-caps text-[9px] text-vvs-gold font-bold tracking-widest border border-vvs-gold/25 px-3 py-1 rounded-full bg-vvs-gold/5">
                                        Core Apply
                                    </span>
                                    <h2 className="text-xl font-bold text-text-primary mt-1">
                                        Apply with Profile CV
                                    </h2>
                                    <p className="text-xs text-vvs-gold font-semibold font-mono">
                                        {applyingOpp.title}
                                    </p>
                                </div>

                                {/* Precompiled Profile CV Summary */}
                                <div className="p-4 rounded-xl bg-text-primary/5 border border-text-secondary/10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full border border-text-secondary/15 overflow-hidden bg-text-primary/5">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg">⚡</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-text-primary">
                                                {user.name || "Amina Osei"}
                                            </h4>
                                            <p className="text-[10px] text-vvs-gold font-mono leading-none mt-1 uppercase">
                                                {user.reputationLevel ?? "Visionary"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="block text-[8px] text-text-muted mono-caps">
                                            Discipline Focus
                                        </span>
                                        <p className="text-xs font-semibold text-text-primary">
                                            {user.discipline ?? "Editorial Director & Stylist"}
                                        </p>
                                    </div>

                                    {user.bio && (
                                        <div className="space-y-1">
                                            <span className="block text-[8px] text-text-muted mono-caps">
                                                Profile Bio
                                            </span>
                                            <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 italic">
                                                "{user.bio}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Pre-attached Link-in-Bio node proofs */}
                                    <div className="space-y-2">
                                        <span className="block text-[8px] text-text-muted mono-caps">
                                            Verified Portfolio Proofs (Links in Bio)
                                        </span>
                                        {user.links && user.links.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto">
                                                {user.links.map((link, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-2 rounded bg-text-secondary/5 border border-text-secondary/5 flex items-center justify-between text-[10px]"
                                                    >
                                                        <span className="font-medium truncate text-text-primary">
                                                            {link.title}
                                                        </span>
                                                        <span className="text-[8px] uppercase font-mono opacity-60 text-vvs-gold">
                                                            {link.type ?? "link"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-2.5 rounded bg-vvs-gold/5 border border-vvs-gold/20 text-[10px] text-vvs-gold">
                                                ⚠️ No portfolio links active in your bio. Go to
                                                profile to register them.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="cover-pitch"
                                        className="block text-[10px] mono-caps text-text-secondary font-bold"
                                    >
                                        Quick Pitch (Optional Cover Note)
                                    </label>
                                    <textarea
                                        id="cover-pitch"
                                        rows={2}
                                        value={coverPitch}
                                        onChange={(e) => setCoverPitch(e.target.value)}
                                        placeholder="Add a snappy cover note for the brand team..."
                                        className="glass-input w-full rounded-xl px-4 py-3 text-xs text-text-primary resize-none placeholder:text-text-muted focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="w-full text-center mono-caps text-[10px] font-bold py-3.5 bg-text-primary text-vvs-bg hover:bg-vvs-gold hover:text-text-primary rounded-full transition-all glow-accent flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isApplying ? (
                                        <>
                                            <span className="animate-spin text-sm">⚡</span>
                                            Securing Contract on CoraPay...
                                        </>
                                    ) : (
                                        "Confirm & Submit Profile CV • +100 XP"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-10 space-y-4">
                                <div className="h-16 w-16 bg-vvs-green/10 border border-vvs-green/30 rounded-full flex items-center justify-center text-3xl mx-auto shadow-[0_0_15px_rgba(0,230,118,0.15)] text-vvs-green">
                                    ✓
                                </div>
                                <h3 className="text-lg font-bold text-text-primary">
                                    Sent! Profile Delivered. 🚀
                                </h3>
                                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                                    Your verified CV Profile and active link-in-bio proofs have been
                                    secured via CoraPay. We've notified the brand team. You earned{" "}
                                    <span className="text-vvs-gold font-bold">+100 XP</span>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Filter Modal Sheet */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4">
                    {/* Backdrop closer click */}
                    <div className="absolute inset-0" onClick={() => setIsFilterOpen(false)} />

                    {/* Panel Sheet */}
                    <div className="glass-panel w-full md:max-w-md bg-vvs-bg border-t md:border border-text-secondary/15 rounded-t-3xl md:rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-slide-up md:animate-float z-10">
                        {/* Drag indicator for mobile bottom sheet */}
                        <div className="w-12 h-1 bg-text-secondary/20 rounded-full mx-auto md:hidden mb-2" />

                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-text-primary">
                                Filter Opportunities
                            </h3>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="text-text-muted hover:text-text-primary text-sm cursor-pointer p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Type Filters */}
                        <div className="space-y-2.5">
                            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                Opportunity Type
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {OPPORTUNITY_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedType(type)}
                                        className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                                            selectedType === type
                                                ? "bg-text-primary text-vvs-bg"
                                                : "bg-tag-bg text-text-secondary hover:bg-tag-bg-hover"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filters */}
                        <div className="space-y-2.5">
                            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                Category
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`text-xs px-3.5 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                                            selectedCategory === category
                                                ? "bg-vvs-gold text-vvs-black"
                                                : "bg-tag-bg text-text-secondary hover:bg-tag-bg-hover"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-text-secondary/10 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedType("All");
                                    setSelectedCategory("All");
                                }}
                                className="flex-1 text-center py-3 border border-text-secondary/15 rounded-full text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="flex-1 text-center py-3 bg-text-primary text-vvs-bg rounded-full text-xs font-bold hover:bg-vvs-gold transition-all cursor-pointer"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
