"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TierBadge } from "@/components/tier-badge";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import type { MemberTier } from "@vvs/contracts";

type Profile = {
    id: string;
    userId: string;
    displayName: string;
    bio: string;
    profession: string;
    category: string;
    skills: string[];
    avatarUrl: string | null;
    tier: MemberTier;
    availability: string;
    rating: number;
    transactionCount: number;
    referredBy: string | null;
    streak?: number;
    xp?: number;
    level?: string;
    badges?: string[];
};

type LinkItem = {
    title: string;
    url: string;
    type: "link" | "file" | "pdf";
};

type Comment = {
    id: string;
    authorName: string;
    avatar: string;
    role: string;
    text: string;
    date: string;
    rating: number;
};

const DEFAULT_LINKS: LinkItem[] = [
    { title: "Runway Collection SS27 Portfolio", url: "https://vvs.lagos/aura-ss27", type: "link" },
    { title: "Brand Identity Architecture Guide", url: "https://vvs.lagos/brand-identity-vvs.pdf", type: "pdf" },
    { title: "Creative Agency Showreel Video", url: "https://vvs.lagos/showreel", type: "link" }
];

const MOCK_PROFILE: Profile = {
    id: "vvs-profile-001",
    userId: "mock-user-id",
    displayName: "Amina Osei",
    bio: "Synthesizing traditional West African textile narratives with modern structural minimalism. Creating editorial visual architectures for forward-thinking international brands.",
    profession: "Editorial Director & Fashion Designer",
    category: "Fashion & Styling",
    skills: ["Creative Direction", "Editorial Styling", "3D Visualizations", "Sustainable Textiles", "Identity Systems"],
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    tier: "pro" as MemberTier,
    availability: "available",
    rating: 5.0,
    transactionCount: 24,
    referredBy: "Kofi_VVS",
    streak: 18,
    xp: 6420,
    level: "Visionary",
    badges: ["VVS Verified", "Top Collaborator", "Trendsetter", "Studio Host"]
};

const MOCK_PROJECTS = [
    {
        title: "AURA // Editorial Campaign",
        category: "Creative Direction",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
        year: "2026"
    },
    {
        title: "Lagos Craft & Structure",
        category: "Sustainable Fashion",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
        year: "2026"
    },
    {
        title: "Digital Checkout Showcase",
        category: "UI Architecture",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        year: "2025"
    }
];

const MOCK_COMMENTS: Comment[] = [
    {
        id: "com-1",
        authorName: "Tega Mavin",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        role: "Brand Director",
        text: "Amina's eye for structural minimalism is unmatched. Exceptional collaboration on the Runway SS27 campaign.",
        date: "2 days ago",
        rating: 5
    },
    {
        id: "com-2",
        authorName: "Zara Odu",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        role: "Sustainability Lead",
        text: "Always bringing sustainable textile innovation to the forefront. A crucial voice in our panel discussion.",
        date: "1 week ago",
        rating: 5
    },
    {
        id: "com-3",
        authorName: "Korede Roberts",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        role: "Editorial Lead",
        text: "Brilliant creative direction. The visual identity of the Windsor Gallery private tour set a new standard.",
        date: "3 weeks ago",
        rating: 5
    }
];

export default function ProfilePage() {
    const { user, xp } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState("available");
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<"portfolio" | "about" | "reputation">("portfolio");
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [newCommentText, setNewCommentText] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<Profile>("/members/profiles/me");
                setProfile({ ...MOCK_PROFILE, ...data });
                setAvailability(data.availability ?? "available");
            } catch {
                setProfile(MOCK_PROFILE);
                setAvailability(MOCK_PROFILE.availability);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!showStatusDropdown) return;
        const handleOutsideClick = () => setShowStatusDropdown(false);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [showStatusDropdown]);

    async function selectAvailability(status: string) {
        setAvailability(status);
        setShowStatusDropdown(false);
        if (!profile) return;
        setProfile({ ...profile, availability: status });
        try {
            await apiClient("/members/profiles/me", {
                method: "PATCH",
                body: { availability: status },
            });
        } catch {
            // silent rollback or keep local state
        }
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;
        const comment: Comment = {
            id: `com-${Date.now()}`,
            authorName: user?.name || "VVS Member",
            avatar: user?.avatarUrl || "https://www.vvslagos.com/assets/VVSMASCOT7.png",
            role: user?.discipline || "VVS Member",
            text: newCommentText,
            date: "Just now",
            rating: 5
        };
        setComments([comment, ...comments]);
        setNewCommentText("");
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-8 py-10 px-4">
                <div className="flex items-center gap-6">
                    <LoadingSkeleton className="h-28 w-28 rounded-full" />
                    <div className="space-y-3 flex-1">
                        <LoadingSkeleton className="h-8 w-1/3 rounded-vvs-md" />
                        <LoadingSkeleton className="h-4 w-1/4 rounded-vvs-sm" />
                    </div>
                </div>
                <LoadingSkeleton className="h-56 rounded-vvs-xl" />
            </div>
        );
    }

    const currentProfile = profile ?? MOCK_PROFILE;

    const displayName = user?.name || currentProfile.displayName;
    const profession = user?.discipline || currentProfile.profession;
    const bio = user?.bio || currentProfile.bio;
    const avatarUrl = user?.avatarUrl || currentProfile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
    const userLinks = (user?.links as LinkItem[]) || DEFAULT_LINKS;
    const userXp = xp || user?.xp || currentProfile.xp || 6420;
    const streak = user?.streak || currentProfile.streak || 18;

    return (
        <div className="mx-auto max-w-4xl py-10 px-4 space-y-8 pb-28">
            {/* ── Hero Profile Card ── */}
            <div className="rounded-vvs-xl bg-vvs-card p-8 md:p-10 border border-text-secondary/5 relative">
                <div className="flex flex-col md:flex-row md:items-center gap-7">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="h-28 w-28 rounded-full overflow-hidden bg-vvs-card-elevated">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-text-secondary">
                                    {displayName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-[3px] border-vvs-card ${
                            availability === "available" ? "bg-vvs-green" : availability === "busy" ? "bg-vvs-yellow" : "bg-text-muted"
                        }`} />
                    </div>

                    {/* Name & Info */}
                    <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-none">
                                    {displayName}
                                </h1>
                                <TierBadge tier={currentProfile.tier} size="lg" />
                            </div>
                            <p className="text-sm text-text-secondary font-medium">
                                {profession}
                            </p>
                        </div>

                        {/* Pill tags row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {/* Availability Toggle Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStatusDropdown(!showStatusDropdown);
                                    }}
                                    className="pill-tag cursor-pointer hover:bg-vvs-card-hover border border-text-secondary/10 flex items-center gap-1.5 transition-colors"
                                >
                                    <span className={`inline-block h-2 w-2 rounded-full ${
                                        availability === "available" ? "bg-vvs-green" : availability === "busy" ? "bg-vvs-yellow" : "bg-text-muted"
                                    }`} />
                                    <span className="capitalize">{availability}</span>
                                    <span className="text-[8px] text-text-muted">▼</span>
                                </button>

                                {showStatusDropdown && (
                                    <div 
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute left-0 mt-2 w-36 rounded-xl bg-vvs-card border border-text-secondary/10 shadow-lg z-50 p-1 space-y-1"
                                    >
                                        {[
                                            { label: "Available", value: "available", color: "bg-vvs-green" },
                                            { label: "Busy", value: "busy", color: "bg-vvs-yellow" },
                                            { label: "Unavailable", value: "unavailable", color: "bg-text-muted" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => selectAvailability(opt.value)}
                                                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-text-secondary/5 flex items-center gap-2 text-text-primary transition-all font-medium cursor-pointer"
                                            >
                                                <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <span className="pill-tag">
                                <span className="text-vvs-accent">🔥</span>
                                {streak} Day Streak
                            </span>

                            <span className="pill-tag">
                                <span className="text-vvs-gold">★</span>
                                Level 4 · {currentProfile.level}
                            </span>

                            {currentProfile.referredBy && (
                                <span className="pill-tag">
                                    <span className="text-vvs-gold">🔗</span>
                                    Referred by @{currentProfile.referredBy}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                        <Link href="/settings" className="pill-btn pill-btn-ghost text-xs">
                            Settings
                        </Link>
                        <Link href="/profile/edit" className="pill-btn pill-btn-accent text-xs">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Main Tabbed Panel Layout (Full Width) ── */}
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-vvs-card rounded-full p-1.5 w-fit border border-text-secondary/5">
                    {(["portfolio", "about", "reputation"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer capitalize ${
                                activeTab === tab
                                    ? "bg-text-primary text-vvs-bg shadow-sm"
                                    : "text-text-muted hover:text-text-primary"
                            }`}
                        >
                            {tab === "reputation" ? "Reputation" : tab}
                        </button>
                    ))}
                </div>

                {/* ── Portfolio Tab ── */}
                {activeTab === "portfolio" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {MOCK_PROJECTS.map((proj, idx) => (
                            <div key={idx} className="group rounded-vvs-xl overflow-hidden bg-vvs-card hover:bg-vvs-card-hover transition-all cursor-pointer border border-text-secondary/5">
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                    <img
                                        src={proj.image}
                                        alt={proj.title}
                                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1.5">
                                        <span className="inline-block text-[10px] font-semibold text-white/80 uppercase tracking-wider bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                            {proj.category}
                                        </span>
                                        <h4 className="text-sm font-bold text-white leading-snug">{proj.title}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── About Tab ── */}
                {activeTab === "about" && (
                    <div className="rounded-vvs-xl bg-vvs-card p-7 space-y-7 border border-text-secondary/5">
                        <div className="space-y-2">
                            <p className="section-eyebrow">About the Creator</p>
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{bio}</p>
                        </div>

                        {/* Link-in-Bio */}
                        <div className="space-y-3 pt-4 border-t border-text-secondary/8">
                            <p className="section-eyebrow">Link in Bio</p>
                            <div className="grid gap-2.5 sm:grid-cols-3">
                                {userLinks.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-vvs-lg bg-vvs-card-elevated hover:bg-vvs-card-hover transition-all group border border-text-secondary/5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                                                {link.type === "pdf" ? "📄" : link.type === "file" ? "📁" : "🔗"}
                                            </span>
                                            <div className="min-w-0">
                                                <span className="font-semibold text-xs text-text-primary group-hover:text-vvs-accent transition-colors block truncate">
                                                    {link.title}
                                                </span>
                                                <span className="text-[10px] text-text-muted block mt-0.5 uppercase tracking-wide">
                                                    {link.type?.toUpperCase() || "LINK"}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-text-muted group-hover:text-vvs-accent transition-all transform translate-x-0 group-hover:translate-x-1 text-sm">
                                            →
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-3 pt-4 border-t border-text-secondary/8">
                            <p className="section-eyebrow">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {currentProfile.skills.map((skill) => (
                                    <span key={skill} className="pill-tag">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Reputation Tab ── */}
                {activeTab === "reputation" && (
                    <div className="rounded-vvs-xl bg-vvs-card p-7 space-y-6 border border-text-secondary/5">
                        <div className="flex items-center justify-between">
                            <p className="section-eyebrow">Peer Endorsements</p>
                            <span className="text-xs text-text-muted font-mono">{comments.length} Endorsements</span>
                        </div>

                        {/* Comment input form */}
                        <form onSubmit={handleAddComment} className="space-y-3 pb-6 border-b border-text-secondary/8">
                            <textarea
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Leave an endorsement or feedback for this creator..."
                                className="w-full h-20 rounded-xl bg-vvs-card-elevated border border-text-secondary/10 p-3 text-xs focus:outline-none focus:border-vvs-gold/50 text-text-primary placeholder:text-text-muted resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!newCommentText.trim()}
                                    className="pill-btn pill-btn-accent text-xs disabled:opacity-50 cursor-pointer"
                                >
                                    Post Endorsement
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="p-5 rounded-vvs-lg bg-vvs-card-elevated border border-text-secondary/5 space-y-3 hover:border-text-secondary/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={comment.avatar}
                                                alt={comment.authorName}
                                                className="h-9 w-9 rounded-full object-cover border border-vvs-gold/20"
                                            />
                                            <div>
                                                <span className="block text-xs font-bold text-text-primary leading-none">
                                                    {comment.authorName}
                                                </span>
                                                <span className="block text-[10px] text-text-muted mt-0.5 font-medium">
                                                    {comment.role}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-text-muted">{comment.date}</span>
                                    </div>

                                    <p className="text-xs text-text-secondary leading-relaxed pl-12 font-serif italic">
                                        "{comment.text}"
                                    </p>

                                    <div className="flex items-center gap-1 pl-12">
                                        {Array.from({ length: comment.rating }).map((_, i) => (
                                            <span key={i} className="text-[10px] text-vvs-gold">★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
