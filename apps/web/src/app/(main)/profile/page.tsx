"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { TierBadge } from "@/components/tier-badge";
import { AvailabilityIndicator } from "@/components/availability-indicator";
import { RatingDisplay } from "@/components/rating-display";
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

const MOCK_PROFILE: Profile = {
    id: "vvs-profile-001",
    userId: "mock-user-id",
    displayName: "Amina Osei",
    bio: "Synthesizing traditional West African textile narratives with modern structural minimalism. Creating editorial visual architectures for forward-thinking international brands.",
    profession: "Editorial Director & Fashion Designer",
    category: "Fashion & Styling",
    skills: ["Creative Direction", "Editorial Styling", "3D Visualizations", "Sustainable Textiles", "Identity Systems"],
    avatarUrl: null, // Let's use a beautiful SVG placeholder or initials
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
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState("available");
    const [activeTab, setActiveTab] = useState<"portfolio" | "reputation" | "about">("portfolio");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<Profile>("/members/profiles/me");
                setProfile({ ...MOCK_PROFILE, ...data });
                setAvailability(data.availability ?? "available");
            } catch {
                // If it fails (such as in local setup/mock), use full high-fidelity Mock Profile
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
            // Revert state if backend call fails
            setAvailability(availability);
            setProfile({ ...profile, availability });
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center gap-6">
                    <LoadingSkeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <LoadingSkeleton className="h-8 w-1/3" />
                        <LoadingSkeleton className="h-4 w-1/4" />
                    </div>
                </div>
                <LoadingSkeleton className="h-48 rounded-vvs-lg" />
            </div>
        );
    }

    const currentProfile = profile ?? MOCK_PROFILE;
    const proThreshold = 10;
    const remaining = Math.max(0, proThreshold - currentProfile.transactionCount);
    
    // XP level calculation parameters
    const nextLevelXP = 10000;
    const xpProgressPercent = Math.min(100, Math.round((currentProfile.xp ?? 0) / nextLevelXP * 100));

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-8 pb-24">
            {/* Header / Premium Banner Card */}
            <div className="relative rounded-vvs-xl border border-white/5 bg-vvs-card/40 p-6 md:p-8 overflow-hidden backdrop-blur-md shadow-2xl">
                {/* Ambient glow backing */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-vvs-accent/5 blur-3xl pointer-events-none rounded-full" />
                <div className="absolute -bottom-10 left-10 w-48 h-48 bg-vvs-blue/5 blur-3xl pointer-events-none rounded-full" />

                {/* Corner Technical Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 z-10 relative">
                    {/* Premium Avatar Circle */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-vvs-accent via-vvs-blue to-vvs-gold opacity-40 blur group-hover:opacity-75 transition duration-500" />
                        <div className="relative h-24 w-24 rounded-full bg-vvs-card-elevated flex items-center justify-center text-4xl overflow-hidden border border-white/10">
                            {currentProfile.avatarUrl ? (
                                <img src={currentProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-text-secondary to-text-muted">
                                    {currentProfile.displayName.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {/* Status availability dot over avatar */}
                        <span className={`absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-vvs-bg ${
                            availability === "available" ? "bg-vvs-green" : availability === "busy" ? "bg-vvs-yellow" : "bg-text-secondary"
                        }`} />
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">
                                    {currentProfile.displayName}
                                </h1>
                                <TierBadge tier={currentProfile.tier} size="lg" />
                            </div>
                            <p className="text-sm font-mono text-vvs-blue font-semibold uppercase tracking-wider">
                                {currentProfile.profession}
                            </p>
                        </div>

                        {/* Fast telemetry stats */}
                        <div className="flex flex-wrap gap-4 text-xs font-mono text-text-secondary pt-1">
                            <button onClick={toggleAvailability} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5">
                                <span className={`inline-block h-2 w-2 rounded-full ${
                                    availability === "available" ? "bg-vvs-green" : availability === "busy" ? "bg-vvs-yellow" : "bg-text-secondary"
                                }`} />
                                <span className="mono-caps text-[10px] tracking-widest text-white">{availability}</span>
                            </button>

                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <span className="text-vvs-accent">🔥</span>
                                <span className="mono-caps text-[10px] tracking-widest text-white">{currentProfile.streak ?? 12} DAY STREAK</span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <span className="text-vvs-gold">★</span>
                                <span className="mono-caps text-[10px] tracking-widest text-white">LEVEL 4 // {currentProfile.level}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <Link
                            href="/settings"
                            className="rounded-vvs-md bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs mono-caps tracking-widest font-semibold border border-white/5 text-white transition-colors"
                        >
                            SETTINGS
                        </Link>
                        <Link
                            href="/profile/edit"
                            className="rounded-vvs-md bg-vvs-accent hover:shadow-[0_0_15px_rgba(255,59,92,0.3)] px-4 py-2.5 text-xs mono-caps tracking-widest font-semibold text-white transition-all"
                        >
                            EDIT SYSTEM
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Splits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Gamification & Metadata Sidecar */}
                <div className="space-y-6 lg:col-span-1">
                    {/* XP & Reputation Cockpit */}
                    <div className="rounded-vvs-lg border border-white/5 bg-vvs-card/30 p-5 space-y-4">
                        <h3 className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest">REPUTATION TELEMETRY</h3>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black font-mono text-white leading-none">{currentProfile.xp ?? 2450} <span className="text-xs text-text-secondary font-medium">XP</span></span>
                                <span className="text-[10px] font-mono text-text-muted">{nextLevelXP} XP FOR ICON</span>
                            </div>
                            
                            {/* Modern technical progress bar */}
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-vvs-accent to-vvs-blue rounded-full transition-all duration-1000"
                                    style={{ width: `${xpProgressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Transaction & Escrow Statistics */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-white/2 rounded-vvs-md p-3 border border-white/5 text-center">
                                <div className="text-lg font-black font-mono text-white leading-none">{currentProfile.transactionCount}</div>
                                <div className="text-[9px] mono-caps text-text-muted tracking-wider mt-1">TRANSACTIONS</div>
                            </div>
                            <div className="bg-white/2 rounded-vvs-md p-3 border border-white/5 text-center">
                                <div className="text-lg font-black font-mono text-vvs-gold leading-none">{currentProfile.rating.toFixed(1)}</div>
                                <div className="text-[9px] mono-caps text-text-muted tracking-wider mt-1">VVS RATING</div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Cultural Badges Showcase */}
                    <div className="rounded-vvs-lg border border-white/5 bg-vvs-card/30 p-5 space-y-3">
                        <h3 className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest">SYSTEM BADGES</h3>
                        <div className="flex flex-col gap-2">
                            {(currentProfile.badges ?? ["VVS Verified"]).map((badge) => (
                                <div key={badge} className="flex items-center gap-2.5 px-3 py-2 rounded-vvs-md border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
                                    <span className="h-2 w-2 rounded-full bg-vvs-accent animate-pulse" />
                                    <span className="text-xs font-mono font-bold tracking-wide text-white uppercase">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Network Referral Data */}
                    {currentProfile.referredBy && (
                        <div className="rounded-vvs-lg border border-white/5 bg-vvs-card/20 p-5 text-center">
                            <span className="text-[9px] mono-caps text-text-muted tracking-widest block">AUTHENTICATED REFERRAL NODE</span>
                            <span className="text-xs font-mono font-bold text-vvs-blue uppercase mt-1 inline-block bg-vvs-blue/5 border border-vvs-blue/10 px-3 py-1 rounded">
                                @{currentProfile.referredBy}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Side: Tabbed Dynamic Panel (Portfolio showcase first) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Navigation tabs */}
                    <div className="flex border-b border-white/5 gap-6">
                        {(["portfolio", "about", "reputation"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-xs mono-caps tracking-widest font-bold transition-all relative ${
                                    activeTab === tab ? "text-white" : "text-text-muted hover:text-text-secondary"
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-vvs-accent" />
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === "portfolio" && (
                        <div className="space-y-6">
                            {/* Grid of high-fidelity showcases */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_PROJECTS.map((proj, idx) => (
                                    <div key={idx} className="group rounded-vvs-lg overflow-hidden border border-white/5 bg-vvs-card/20 hover:border-white/10 transition-all shadow-md relative">
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-vvs-card relative">
                                            {/* Beautiful dark image filter */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-vvs-bg via-transparent to-transparent opacity-85 z-10" />
                                            <img 
                                                src={proj.image} 
                                                alt={proj.title} 
                                                className="h-full w-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                                            />
                                            <div className="absolute bottom-3 left-3 right-3 z-20 space-y-0.5">
                                                <span className="text-[9px] font-mono text-vvs-accent uppercase tracking-widest font-bold bg-vvs-accent/10 border border-vvs-accent/20 px-2 py-0.5 rounded">{proj.category}</span>
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wide pt-1">{proj.title}</h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="rounded-vvs-lg border border-white/5 bg-vvs-card/20 p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest">ABOUT THE DESIGNER</h3>
                                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{currentProfile.bio}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h3 className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest">ENGINEERED SKILLS</h3>
                                <div className="flex flex-wrap gap-2">
                                    {currentProfile.skills.map((skill) => (
                                        <span key={skill} className="rounded-full border border-white/5 bg-white/2 hover:bg-white/5 transition-colors px-3 py-1 text-xs text-text-secondary">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "reputation" && (
                        <div className="rounded-vvs-lg border border-white/5 bg-vvs-card/20 p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest">REPUTATION LOGS</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between p-3 rounded-vvs-md bg-white/2 border border-white/5">
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase">COMMUNITY ONBOARDING COMPLETED</h4>
                                            <p className="text-[10px] text-text-muted mt-0.5">VERIFIED INVITATION LINK VIA REFERRER</p>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-vvs-green">+1000 XP</span>
                                    </div>
                                    <div className="flex items-start justify-between p-3 rounded-vvs-md bg-white/2 border border-white/5">
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase">WEEKLY STREAK REWARD</h4>
                                            <p className="text-[10px] text-text-muted mt-0.5">MAINTAINED TERMINAL HEARTBEAT FOR 7 DAYS</p>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-vvs-green">+500 XP</span>
                                    </div>
                                    <div className="flex items-start justify-between p-3 rounded-vvs-md bg-white/2 border border-white/5">
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase">CORAPAY GATEWAY INTEGRATION</h4>
                                            <p className="text-[10px] text-text-muted mt-0.5">LINKED ESCROW WALLET DEPOSIT MECHANISMS</p>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-vvs-green">+1500 XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

