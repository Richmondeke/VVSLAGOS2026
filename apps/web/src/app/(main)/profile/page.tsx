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
        title: "CoraPay Digital Checkout Showcase",
        category: "UI Architecture",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        year: "2025"
    }
];

export default function ProfilePage() {
    const { user, xp } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState("available");
    const [activeTab, setActiveTab] = useState<"portfolio" | "about" | "reputation">("portfolio");

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

    async function toggleAvailability() {
        const next = availability === "available" ? "busy" : availability === "busy" ? "unavailable" : "available";
        setAvailability(next);
        if (!profile) return;
        setProfile({ ...profile, availability: next });
        try {
            await apiClient("/members/profiles/me", {
                method: "PATCH",
                body: { availability: next },
            });
        } catch {
            setAvailability(availability);
            setProfile({ ...profile, availability });
        }
    }

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

    const nextLevelXP = 10000;
    const xpProgressPercent = Math.min(100, Math.round((userXp / nextLevelXP) * 100));

    return (
        <div className="mx-auto max-w-4xl py-10 px-4 space-y-10 pb-28">
            {/* ── Hero Profile Card ── */}
            <div className="rounded-vvs-xl bg-vvs-card p-8 md:p-10">
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
                        <div className="flex flex-wrap gap-2 pt-1">
                            <button onClick={toggleAvailability} className="pill-tag cursor-pointer">
                                <span className={`inline-block h-2 w-2 rounded-full ${
                                    availability === "available" ? "bg-vvs-green" : availability === "busy" ? "bg-vvs-yellow" : "bg-text-muted"
                                }`} />
                                <span className="capitalize">{availability}</span>
                            </button>

                            <span className="pill-tag">
                                <span className="text-vvs-accent">🔥</span>
                                {streak} Day Streak
                            </span>

                            <span className="pill-tag">
                                <span className="text-vvs-gold">★</span>
                                Level 4 · {currentProfile.level}
                            </span>
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

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar — Stats & Badges */}
                <div className="space-y-5 lg:col-span-1">
                    {/* Reputation Card */}
                    <div className="rounded-vvs-xl bg-vvs-card p-6 space-y-5">
                        <p className="section-eyebrow">Reputation</p>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-bold text-text-primary leading-none tracking-tight">
                                    {userXp.toLocaleString()}
                                    <span className="text-sm text-text-muted font-medium ml-1">pts</span>
                                </span>
                                <span className="text-[11px] text-text-muted">{nextLevelXP.toLocaleString()} to level up</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full bg-tag-bg rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-vvs-accent rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${xpProgressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-vvs-lg bg-vvs-card-elevated p-4 text-center">
                                <div className="text-xl font-bold text-text-primary leading-none">{currentProfile.transactionCount}</div>
                                <div className="text-[10px] text-text-muted font-medium mt-1.5 uppercase tracking-wide">Transactions</div>
                            </div>
                            <div className="rounded-vvs-lg bg-vvs-card-elevated p-4 text-center">
                                <div className="text-xl font-bold text-vvs-gold leading-none">{currentProfile.rating.toFixed(1)}</div>
                                <div className="text-[10px] text-text-muted font-medium mt-1.5 uppercase tracking-wide">VVS Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Badges Card */}
                    <div className="rounded-vvs-xl bg-vvs-card p-6 space-y-4">
                        <p className="section-eyebrow">Badges</p>
                        <div className="flex flex-col gap-2">
                            {(currentProfile.badges ?? ["VVS Verified"]).map((badge) => (
                                <div key={badge} className="flex items-center gap-3 px-4 py-3 rounded-vvs-lg bg-vvs-card-elevated hover:bg-vvs-card-hover transition-colors">
                                    <span className="h-2.5 w-2.5 rounded-full bg-vvs-accent" />
                                    <span className="text-sm font-semibold text-text-primary">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Referral */}
                    {currentProfile.referredBy && (
                        <div className="rounded-vvs-xl bg-vvs-card p-6 text-center space-y-2">
                            <p className="section-eyebrow">Referred By</p>
                            <span className="inline-block text-sm font-bold text-vvs-gold bg-vvs-gold/8 px-4 py-1.5 rounded-full">
                                @{currentProfile.referredBy}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Content — Tabbed Panel */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 bg-vvs-card rounded-full p-1.5 w-fit">
                        {(["portfolio", "about", "reputation"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer capitalize ${
                                    activeTab === tab
                                        ? "bg-text-primary text-vvs-bg shadow-sm"
                                        : "text-text-muted hover:text-text-primary"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── Portfolio Tab ── */}
                    {activeTab === "portfolio" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MOCK_PROJECTS.map((proj, idx) => (
                                <div key={idx} className="group rounded-vvs-xl overflow-hidden bg-vvs-card hover:bg-vvs-card-hover transition-all cursor-pointer">
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
                        <div className="rounded-vvs-xl bg-vvs-card p-7 space-y-7">
                            <div className="space-y-2">
                                <p className="section-eyebrow">About the Designer</p>
                                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{bio}</p>
                            </div>

                            {/* Link-in-Bio */}
                            <div className="space-y-3 pt-4 border-t border-text-secondary/8">
                                <p className="section-eyebrow">Link in Bio</p>
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {userLinks.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-vvs-lg bg-vvs-card-elevated hover:bg-vvs-card-hover transition-all group"
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
                        <div className="rounded-vvs-xl bg-vvs-card p-7 space-y-5">
                            <p className="section-eyebrow">Status Logs</p>
                            <div className="space-y-3">
                                {[
                                    { title: "Joined VVS Community", desc: "Onboarding completed via referrer", pts: "+1,000" },
                                    { title: "7-Day Login Streak Secured", desc: "Maintained consistent terminal activity", pts: "+500" },
                                    { title: "CoraPay Wallet Linked", desc: "Established secure escrow contract paths", pts: "+1,500" },
                                ].map((log, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-4 rounded-vvs-lg bg-vvs-card-elevated">
                                        <div>
                                            <h4 className="text-sm font-semibold text-text-primary">{log.title}</h4>
                                            <p className="text-xs text-text-muted mt-0.5">{log.desc}</p>
                                        </div>
                                        <span className="text-sm font-bold text-vvs-green whitespace-nowrap ml-4">{log.pts} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
