"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

type Article = {
    id: string;
    title: string;
    category: "Announcements" | "Updates" | "Product News" | "Casting Update" | "Brand Collabs";
    date: string;
    image: string;
    summary: string;
    readTime: string;
    author: {
        name: string;
        avatar: string;
    };
    likes: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
};

const MOCK_ARTICLES: Article[] = [
    {
        id: "news-1",
        title: "VVS SS27 High-Fashion Capsule: Behind the Scenes",
        category: "Announcements",
        date: "Updated just now",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        summary:
            "Our next structural capsule is dropping in weeks. From pattern cutting at TJ-WHO to styling with VVS creative leads. Get your invite keys ready, zero stories. The curation combines raw Lagos subculture with extreme luxury textiles.",
        readTime: "3 min read",
        author: {
            name: "Wade Warren",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        },
        likes: 142,
    },
    {
        id: "news-2",
        title: "Securing the Creative Bag: VVS Escrow Upgrades",
        category: "Product News",
        date: "Updated 10m ago",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
        summary:
            "No more story-telling from clients. All contract deposits are now locked automatically in secure, instant-settlement VVS escrow. Your funds release when work is verified, protecting creatives and brands alike.",
        readTime: "2 min read",
        author: {
            name: "Amina Yusuf",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        },
        likes: 98,
    },
    {
        id: "news-3",
        title: "Street Scouting for Tokyo James Runway SS27",
        category: "Casting Update",
        date: "Updated 1h ago",
        image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80",
        summary:
            "Lagos street scouting is officially open for Tokyo James SS27. Raw attitude and pure, unbothered presence wanted. Apply directly through the Opportunities tab or scan key locations across Lagos.",
        readTime: "4 min read",
        author: {
            name: "Tunde Olayinka",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        },
        likes: 215,
    },
    {
        id: "news-4",
        title: "LFJ Brass Accessories: Blending 3D Tech & Craft",
        category: "Brand Collabs",
        date: "Updated 1d ago",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
        summary:
            "LFJ Official details their custom 3D printed structural brass accessories for the upcoming showcase. A deep dive into combining generative CAD algorithms with traditional metal-smithing.",
        readTime: "5 min read",
        author: {
            name: "Kofi Mensah",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        },
        likes: 87,
    },
    {
        id: "news-5",
        title: "VVS Lagos Convention Week 2026: The Creative Convergence",
        category: "Announcements",
        date: "Updated 2d ago",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        summary:
            "Get ready for the ultimate annual convergence of art, culture, and fashion in Lagos. This year features physical exhibitions, panel discussions, live experiences, and showcase runways.",
        readTime: "6 min read",
        author: {
            name: "VVS Lagos Curatorial",
            avatar: "https://www.vvslagos.com/assets/VVSMASCOT7.png",
        },
        likes: 312,
    }
];

const BANNER_ADS = [
    {
        id: "ad-1",
        tag: "MTN // VVS PARTNERSHIP",
        title: "Free Data every Month on MTN VVS Plan",
        cta: "Activate",
        tagColor: "text-vvs-accent",
        emoji: "📶",
        description:
            "Stay connected to the creative grid. Get 10GB free data monthly on the exclusive MTN VVS custom plan.",
    },
    {
        id: "ad-2",
        tag: "MAYBELLINE // VVS BEAUTY",
        title: "Maybelline Cosmetics",
        cta: "Claim Spot",
        tagColor: "text-vvs-gold",
        emoji: "💄",
        description:
            "VVS Runway partner. Discover raw attitude and premium editorial palettes designed for the Surulere catwalk.",
    },
];

export default function FeedPage() {
    const { user } = useAuth();
    const [activeAd, setActiveAd] = useState(0);
    const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
    const [activeArticleIndex, setActiveArticleIndex] = useState(0);
    const [followingAuthors, setFollowingAuthors] = useState<Record<string, boolean>>({});
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

    // Auto-scroll the banner ads
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveAd((prev) => (prev + 1) % BANNER_ADS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const selectedArticle = articles.find((a) => a.id === selectedArticleId) || null;

    const handleNextCard = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (articles.length <= 1) return;
        setActiveArticleIndex((prev) => (prev + 1) % articles.length);
    };

    const handleOpenArticle = (article: Article) => {
        setSelectedArticleId(article.id);
    };

    const toggleLike = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setArticles((prev) =>
            prev.map((art) => {
                if (art.id === id) {
                    const isLiked = !art.isLiked;
                    return {
                        ...art,
                        isLiked,
                        likes: isLiked ? art.likes + 1 : art.likes - 1,
                    };
                }
                return art;
            })
        );
    };

    const toggleBookmark = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setArticles((prev) =>
            prev.map((art) => {
                if (art.id === id) {
                    return { ...art, isBookmarked: !art.isBookmarked };
                }
                return art;
            })
        );
    };

    const toggleFollow = (authorName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFollowingAuthors((prev) => ({
            ...prev,
            [authorName]: !prev[authorName],
        }));
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-0">
            {selectedArticle ? (
                /* ── ARTICLE DETAILS SCREEN ── */
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={() => setSelectedArticleId(null)}
                        className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-all pb-2 cursor-pointer"
                    >
                        <span>←</span> Back to News
                    </button>

                    <div className="rounded-[32px] bg-[#FAF7F0] dark:bg-[#0E0F12] text-black dark:text-white border border-[#EBEBEF] dark:border-white/5 p-6 md:p-8 shadow-md space-y-6">
                        {/* Tags & Read Time */}
                        <div className="flex items-center justify-between">
                            <span className="bg-vvs-gold/15 text-vvs-gold border border-vvs-gold/25 text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                {selectedArticle.category}
                            </span>
                            <span className="text-xs font-mono text-text-secondary">
                                {selectedArticle.readTime}
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight font-sans">
                            {selectedArticle.title}
                        </h2>

                        {/* Author block & Follow button */}
                        <div className="flex items-center justify-between border-b border-[#EBEBEF]/80 dark:border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedArticle.author.avatar}
                                    alt={selectedArticle.author.name}
                                    className="h-10 w-10 rounded-full object-cover border border-vvs-gold/25"
                                />
                                <div>
                                    <span className="block text-[10px] text-text-secondary">
                                        Published by
                                    </span>
                                    <span className="block text-sm font-bold font-sans text-text-primary">
                                        {selectedArticle.author.name}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => toggleFollow(selectedArticle.author.name, e)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                                    followingAuthors[selectedArticle.author.name]
                                        ? "bg-vvs-gold/25 text-vvs-gold border-vvs-gold"
                                        : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 border-transparent"
                                }`}
                            >
                                {followingAuthors[selectedArticle.author.name] ? "Following" : "Follow"}
                            </button>
                        </div>

                        {/* Drop Cap & Article body */}
                        <div className="space-y-4 text-sm md:text-base leading-relaxed text-text-secondary">
                            <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-vvs-gold first-letter:float-left first-letter:mr-2">
                                {selectedArticle.summary}
                            </p>
                        </div>

                        {/* Cover Image */}
                        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[24px] bg-text-primary/5">
                            <img
                                src={selectedArticle.image}
                                alt={selectedArticle.title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="flex items-center justify-between border-t border-[#EBEBEF]/80 dark:border-white/5 pt-4">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={(e) => toggleLike(selectedArticle.id, e)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-vvs-gold ${
                                        selectedArticle.isLiked ? "text-vvs-gold" : "text-text-muted"
                                    }`}
                                >
                                    <span className="text-base">👍</span>
                                    <span className="font-mono">{selectedArticle.likes}</span>
                                </button>

                                <button
                                    onClick={(e) => toggleBookmark(selectedArticle.id, e)}
                                    className={`text-sm font-bold transition-colors hover:text-vvs-gold ${
                                        selectedArticle.isBookmarked ? "text-vvs-gold" : "text-text-muted"
                                    }`}
                                    title="Bookmark"
                                >
                                    <span className="text-base">🔖</span>
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${window.location.origin}/feed#${selectedArticle.id}`
                                    );
                                    alert("Link copied to clipboard!");
                                }}
                                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-vvs-gold font-bold transition-colors"
                            >
                                <span>🔗</span> Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── MAIN CARD DECK SCREEN ── */
                <>
                    {/* Page Header */}
                    <div className="mb-10 space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-text-primary uppercase leading-none">
                            News
                        </h1>
                        <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
                            Stay locked in with VVS Announcements, updates and creative insights.
                        </p>
                    </div>

                    {/* Exclusive Billboard Banner Ad */}
                    <div className="mb-10">
                        <div
                            className="relative overflow-hidden rounded-2xl bg-vvs-gold text-vvs-black p-6 md:p-8 flex items-center justify-between shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #FFD500 0%, #F5A623 100%)",
                            }}
                        >
                            <div className="space-y-1.5 max-w-[65%] z-10">
                                <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-vvs-black font-serif">
                                    {BANNER_ADS[activeAd].title}
                                </h2>
                                <p className="text-xs text-vvs-black/75 hidden md:block">
                                    {BANNER_ADS[activeAd].description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 z-10">
                                <button className="px-5 py-2.5 bg-white text-vvs-black rounded-full text-xs font-extrabold flex items-center gap-1.5 hover:bg-white/95 transition-all shadow-md cursor-pointer z-10">
                                    View <span className="font-sans font-black">»</span>
                                </button>
                            </div>

                            <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 text-white/15 select-none pointer-events-none z-0 transform rotate-12">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                    <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.8L18.4 9H5.6L12 4.8zM4.7 10.5h14.6L12 19.3l-7.3-8.8z" />
                                </svg>
                            </div>

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

                    {/* Deck Deck container */}
                    <div className="flex flex-col items-center justify-center py-6">
                        {articles.length === 0 ? (
                            <div className="text-center py-20 rounded-vvs-xl bg-vvs-card w-full max-w-md">
                                <span className="text-5xl">📭</span>
                                <h3 className="text-lg font-bold mt-4 text-text-primary">
                                    No updates here
                                </h3>
                            </div>
                        ) : (
                            <>
                                <div className="relative w-full max-w-[340px] h-[450px]">
                                    {articles.map((article, index) => {
                                        const total = articles.length;
                                        const position = (index - activeArticleIndex + total) % total;

                                        if (position > 2) return null;

                                        const styles = [
                                            {
                                                transform: "translate(0px, 0px) rotate(0deg) scale(1)",
                                                zIndex: 30,
                                                opacity: 1,
                                            },
                                            {
                                                transform: "translate(12px, 16px) rotate(3deg) scale(0.96)",
                                                zIndex: 20,
                                                opacity: 0.9,
                                            },
                                            {
                                                transform: "translate(-8px, 32px) rotate(-4deg) scale(0.92)",
                                                zIndex: 10,
                                                opacity: 0.8,
                                            },
                                        ][position];

                                        const isTopCard = position === 0;

                                        return (
                                            <div
                                                key={article.id}
                                                onClick={(e) => {
                                                    if (isTopCard) {
                                                        handleOpenArticle(article);
                                                    } else {
                                                        handleNextCard(e);
                                                    }
                                                }}
                                                style={styles}
                                                className={`absolute inset-0 rounded-[32px] p-6 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-500 ease-out border select-none ${
                                                    isTopCard
                                                        ? "bg-[#FAF7F0] dark:bg-[#15161A] text-black dark:text-white border-vvs-gold/40 hover:scale-[1.01]"
                                                        : "bg-[#F3EFE6] dark:bg-[#1D1E22] text-black/85 dark:text-white/80 border-[#EBEBEF] dark:border-white/5"
                                                }`}
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="bg-vvs-gold/15 text-vvs-gold border border-vvs-gold/25 text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                                            {article.category}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-text-secondary/60">
                                                            {article.readTime}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-snug font-sans">
                                                        {article.title}
                                                    </h3>

                                                    <span className="block text-[10px] text-vvs-gold font-mono uppercase font-bold tracking-wide">
                                                        {article.date}
                                                    </span>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={article.author.avatar}
                                                                alt={article.author.name}
                                                                className="h-8 w-8 rounded-full object-cover border border-vvs-gold/20"
                                                            />
                                                            <div className="leading-tight">
                                                                <span className="block text-[10px] text-text-secondary">
                                                                    Published by
                                                                </span>
                                                                <span className="block text-xs font-bold font-sans">
                                                                    {article.author.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isTopCard && (
                                                            <button
                                                                onClick={(e) => toggleFollow(article.author.name, e)}
                                                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                                                                    followingAuthors[article.author.name]
                                                                        ? "bg-vvs-gold/25 text-vvs-gold border-vvs-gold"
                                                                        : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 border-transparent"
                                                                }`}
                                                            >
                                                                {followingAuthors[article.author.name] ? "Following" : "Follow"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-text-secondary/10 pt-4 mt-auto">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={(e) => toggleLike(article.id, e)}
                                                            className={`flex items-center gap-1.5 text-xs transition-colors hover:text-vvs-gold ${
                                                                article.isLiked ? "text-vvs-gold" : "text-text-muted"
                                                            }`}
                                                        >
                                                            <span className="text-sm">👍</span>
                                                            <span className="font-mono">{article.likes}</span>
                                                        </button>

                                                        <button
                                                            onClick={(e) => toggleBookmark(article.id, e)}
                                                            className={`text-xs transition-colors hover:text-vvs-gold ${
                                                                article.isBookmarked ? "text-vvs-gold" : "text-text-muted"
                                                            }`}
                                                            title="Bookmark"
                                                        >
                                                            <span className="text-sm">🔖</span>
                                                        </button>
                                                    </div>

                                                    <span className="text-[10px] font-bold text-vvs-gold font-mono uppercase tracking-wider">
                                                        Read More →
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-12 flex items-center gap-4">
                                    <button
                                        onClick={handleNextCard}
                                        className="px-6 py-2.5 bg-vvs-card text-text-primary rounded-full text-xs font-bold border border-text-secondary/10 hover:border-text-secondary/20 transition-all cursor-pointer animate-pulse-slow"
                                    >
                                        Next Update ⚡
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
