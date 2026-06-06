"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type Article = {
    id: string;
    title: string;
    category: string;
    date: string;
    image: string;
    summary: string;
    readTime: string;
    highlightColor: "red" | "gold";
};

const MOCK_ARTICLES: Article[] = [
    {
        id: "feed-1",
        title: "VVS SS27 High-Fashion Capsule: Behind the Scenes",
        category: "Announcements",
        date: "Today at 09:00",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        summary: "Our next structural capsule is dropping in weeks. From pattern cutting at TJ-WHO to styling with VVS creative leads. Get your invite keys ready, zero stories.",
        readTime: "3 min read",
        highlightColor: "red"
    },
    {
        id: "feed-2",
        title: "Securing the Creative Bag: CoraPay Escrow Upgrades",
        category: "Product News",
        date: "Yesterday",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
        summary: "No more story-telling from clients. All contract deposits are now locked automatically in secure, instant-settlement CoraPay escrow. Your funds release when work is verified.",
        readTime: "2 min read",
        highlightColor: "gold"
    },
    {
        id: "feed-3",
        title: "Street Scouting for Tokyo James Runway SSP27",
        category: "Casting Update",
        date: "May 25, 2026",
        image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80",
        summary: "Lagos street scouting is officially open for Tokyo James SS27. Raw attitude and pure, unbothered presence wanted. Apply directly through the Opportunities tab.",
        readTime: "4 min read",
        highlightColor: "red"
    }
];

const BANNER_ADS = [
    {
        id: "ad-1",
        tag: "VVS SOUND LAB // GBEDU LAB",
        title: "Submit your Amapiano-Electronic fusion track before June 15",
        cta: "Unlock +250 XP",
        tagColor: "text-vvs-accent",
        emoji: "🎧",
        description: "Show the community how your beat stands out from generic copy-copy loops."
    },
    {
        id: "ad-2",
        tag: "ORANGE CULTURE // CAMPAIGN",
        title: "Street-scouted and gender-neutral runway casting",
        cta: "Claim Spot",
        tagColor: "text-vvs-gold",
        emoji: "🍊",
        description: "Bring your raw cultural energy to the runway. No prior model portfolio required, just unmatched confidence."
    }
];

export default function FeedPage() {
    const { user } = useAuth();
    const [activeAd, setActiveAd] = useState(0);

    // Auto-scroll the banner ads
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveAd((prev) => (prev + 1) % BANNER_ADS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-0">
            {/* Page Header */}
            <div className="mb-10 space-y-2">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-text-primary uppercase leading-none">
                    Feed
                </h1>
                <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
                    News, updates, and cultural intel. Stay locked in with VVS announcements, product upgrades, and live cultural telemetry. No noise, just relevant updates.
                </p>
            </div>

            {/* Exclusive Billboard Banner Ad (Diamond-Cut reference-style) */}
            <div className="mb-10">
                <div
                    className="relative overflow-hidden rounded-2xl bg-vvs-gold text-vvs-black p-6 md:p-8 flex items-center justify-between shadow-lg"
                    style={{
                        background: "linear-gradient(135deg, #FFD500 0%, #F5A623 100%)"
                    }}
                >
                    {/* Left content - Title and Description only */}
                    <div className="space-y-1.5 max-w-[65%] z-10">
                        <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-vvs-black">
                            {BANNER_ADS[activeAd].title}
                        </h2>
                        <p className="text-xs text-vvs-black/75 hidden md:block">
                            {BANNER_ADS[activeAd].description}
                        </p>
                    </div>

                    {/* Right content - View button cleanly pushed right, with large overlaid diamond shape */}
                    <div className="flex items-center gap-4 shrink-0 z-10">
                        {/* View Button */}
                        <button className="px-5 py-2.5 bg-white text-vvs-black rounded-full text-xs font-extrabold flex items-center gap-1.5 hover:bg-white/95 transition-all shadow-md cursor-pointer z-10">
                            View <span className="font-sans font-black">»</span>
                        </button>
                    </div>

                    {/* Overlaid Diamond emblem positioned in the bottom right corner */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 text-white/15 select-none pointer-events-none z-0 transform rotate-12">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.8L18.4 9H5.6L12 4.8zM4.7 10.5h14.6L12 19.3l-7.3-8.8z"/>
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

            {/* Articles and Announcements List - Improved layout, flat cards */}
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-text-secondary/10 pb-3">
                        <h3 className="mono-caps text-xs font-bold text-text-primary tracking-widest">Latest Broadcasts</h3>
                        <span className="text-xs text-vvs-accent font-bold font-mono">⚡ Curated Broadcasts</span>
                    </div>

                    <div className="grid gap-6">
                        {MOCK_ARTICLES.map((article) => (
                            <div 
                                key={article.id} 
                                className="glass-card overflow-hidden rounded-2xl flex flex-col sm:flex-row border border-text-secondary/5 hover:border-text-secondary/15 transition-all duration-300"
                            >
                                <div className="h-48 sm:h-auto sm:w-48 relative shrink-0 overflow-hidden bg-text-primary/5">
                                    <img 
                                        src={article.image} 
                                        alt={article.title} 
                                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <span className={`absolute top-3 left-3 text-[8px] font-bold mono-caps px-2.5 py-1 rounded-full ${
                                        article.highlightColor === "red" 
                                            ? "bg-vvs-accent/15 text-vvs-accent border border-vvs-accent/25" 
                                            : "bg-vvs-gold/15 text-vvs-gold border border-vvs-gold/25"
                                    }`}>
                                        {article.category}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                                            <span>{article.date}</span>
                                            <span>•</span>
                                            <span>{article.readTime}</span>
                                        </div>
                                        <h4 className="text-base font-bold text-text-primary hover:text-vvs-accent transition-colors leading-snug">
                                            {article.title}
                                        </h4>
                                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                                            {article.summary}
                                        </p>
                                    </div>
                                    <div>
                                        <button className="text-xs font-bold text-vvs-accent hover:underline flex items-center gap-1">
                                            Read Broadcast <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Events Panel */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-text-secondary/10 pb-3">
                        <h3 className="mono-caps text-xs font-bold text-text-primary tracking-widest">Upcoming Events</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="glass-card p-5 rounded-2xl border border-text-secondary/5 hover:border-vvs-gold/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="mono-caps text-[8px] text-vvs-gold font-bold tracking-widest">SHOWROOM // VICTORIA ISLAND</span>
                                <span className="text-[8px] font-mono text-vvs-gold font-bold bg-vvs-gold/10 px-2.5 py-0.5 rounded-full">JUNE 20</span>
                            </div>
                            <h5 className="text-xs font-bold text-text-primary leading-snug">VVS Lagos Private Showroom SS27</h5>
                            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                                Curated structural showcase of the SS27 capsule garments. Access restricted to verified vanguard members. Redeem passes via XP.
                            </p>
                        </div>

                        <div className="glass-card p-5 rounded-2xl border border-text-secondary/5 hover:border-vvs-accent/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="mono-caps text-[8px] text-vvs-accent font-bold tracking-widest">ROUNDTABLE // ONIKAN</span>
                                <span className="text-[8px] font-mono text-vvs-accent font-bold bg-vvs-accent/10 px-2.5 py-0.5 rounded-full">JULY 05</span>
                            </div>
                            <h5 className="text-xs font-bold text-text-primary leading-snug">Creative Roundtable 04: Sonic Archives</h5>
                            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                                An intimate dialogue exploring West African sound preservation and electronic architecture with industry vanguard leaders.
                            </p>
                        </div>

                        <div className="glass-card p-5 rounded-2xl border border-text-secondary/5 hover:border-vvs-accent/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="mono-caps text-[8px] text-vvs-accent font-bold tracking-widest">CASTING // SURULERE</span>
                                <span className="text-[8px] font-mono text-vvs-accent font-bold bg-vvs-accent/10 px-2.5 py-0.5 rounded-full">JULY 12</span>
                            </div>
                            <h5 className="text-xs font-bold text-text-primary leading-snug">Tokyo James Casting Call</h5>
                            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
                                Physical model scouting callbacks for the upcoming Paris runway collection. Bring your physical portfolio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
