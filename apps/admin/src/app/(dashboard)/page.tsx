"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiClient, ApiError } from "@/lib/api-client";
import { UserSidebarPanel, PanelData } from "@/components/UserSidebarPanel";

type Member = {
    id: string;
    email: string;
    phone: string | null;
    status: string;
    source: string;
    createdAt: string;
};

type MembersResponse = {
    items: Member[];
    total: number;
    page: number;
    pageSize: number;
};

type CommunityMember = {
    id: string;
    name: string;
    age: number;
    email: string;
    occupation: string;
    city: string;
    gender: string;
    interests: string[];
    selfie_url: string | null;
    created_at: string;
};

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: "bg-green-100 text-green-700",
        pending_approval: "bg-yellow-100 text-yellow-700",
        suspended: "bg-orange-100 text-orange-700",
        banned: "bg-red-100 text-red-700",
        rejected: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [copied, setCopied] = useState(false);

    // Dashboard Stats
    const [rsvpsCount, setRsvpsCount] = useState<number>(0);
    const [membersCount, setMembersCount] = useState<number>(0);
    const [myReferralsCount, setMyReferralsCount] = useState<number>(0);

    // Unified Table State
    const [activeTab, setActiveTab] = useState<"rsvps" | "signups" | "community" | "futurelabs" | "votes" | "questions" | "admins">("rsvps");
    const [searchQuery, setSearchQuery] = useState("");
    const [panelData, setPanelData] = useState<PanelData | null>(null);

    // Votes Data
    const [votes, setVotes] = useState<any[]>([]);
    const [votesLoading, setVotesLoading] = useState(false);
    const [votesSubTab, setVotesSubTab] = useState<"ballots" | "leaderboard">("ballots");

    // Panel Questions Data
    const [panelQuestions, setPanelQuestions] = useState<any[]>([]);
    const [panelQuestionsLoading, setPanelQuestionsLoading] = useState(false);

    // RSVPs Data
    const [rsvps, setRsvps] = useState<any[]>([]);
    
    // Future Labs Data
    const [futureLabsApps, setFutureLabsApps] = useState<any[]>([]);
    const [futureLabsLoading, setFutureLabsLoading] = useState(false);

    // Members Data
    const [membersData, setMembersData] = useState<MembersResponse | null>(null);
    const [membersPage, setMembersPage] = useState(1);
    const [membersLoading, setMembersLoading] = useState(false);

    // Community Members Data
    const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityTotal, setCommunityTotal] = useState(0);
    const [communityPage, setCommunityPage] = useState(1);
    const [communityCityFilter, setCommunityCityFilter] = useState("");
    const [communityGenderFilter, setCommunityGenderFilter] = useState("");
    const [selectedCommunityMember, setSelectedCommunityMember] = useState<CommunityMember | null>(null);

    // RSVP Filters
    const [rsvpEventFilter, setRsvpEventFilter] = useState("");
    const [rsvpReferralFilter, setRsvpReferralFilter] = useState("");

    // Votes Category Filter
    const [votesCategoryFilter, setVotesCategoryFilter] = useState("");

    // Panel Questions Session Filter
    const [questionsSessionFilter, setQuestionsSessionFilter] = useState("");

    const cities = ["Lagos", "Abuja", "Port Harcourt", "Accra", "Nairobi", "Johannesburg", "London", "New York", "Paris", "Dubai", "Toronto", "Amsterdam", "Other"];
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    // Admins Data
    const [admins, setAdmins] = useState<any[]>([]);
    const [adminsLoading, setAdminsLoading] = useState(false);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminRole, setNewAdminRole] = useState("admin");

    // Removed hardcoded supabase keys as they are now handled by API Client

    async function loadFutureLabs() {
        setFutureLabsLoading(true);
        try {
            const res = await fetch("/api/future-labs");
            if (res.ok) {
                const result = await res.json();
                setFutureLabsApps(result);
            }
        } catch (err) {
            console.error("Failed to load Future Labs applications", err);
        } finally {
            setFutureLabsLoading(false);
        }
    }
    async function loadVotes() {
        setVotesLoading(true);
        try {
            const res = await fetch("/api/votes");
            if (res.ok) {
                const data = await res.json();
                setVotes(data);
            }
        } catch (err) {
            console.error("Failed to load votes", err);
        } finally {
            setVotesLoading(false);
        }
    }

    async function loadPanelQuestions() {
        setPanelQuestionsLoading(true);
        try {
            const res = await fetch("/api/panel-questions");
            if (res.ok) {
                const data = await res.json();
                setPanelQuestions(data);
            }
        } catch (err) {
            console.error("Failed to load panel questions", err);
        } finally {
            setPanelQuestionsLoading(false);
        }
    }

    async function loadStatsAndRsvps() {
        setLoading(true);
        try {
            const res = await fetch("/api/rsvps");
            if (res.ok) {
                const rsvpsList = await res.json();
                setRsvps(rsvpsList);
                setRsvpsCount(rsvpsList.length);

                if (user?.email) {
                    const myRefs = rsvpsList.filter((r: any) => r.referred_by_admin === user.email);
                    setMyReferralsCount(myRefs.length);
                }
            }
        } catch (err) {
            console.error("Failed to load RSVPs", err);
        }
        setLastRefresh(new Date());
        setLoading(false);
    }

    async function loadMembers() {
        setMembersLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery && activeTab === "signups") params.set("search", searchQuery);
            params.set("page", String(membersPage));
            const res = await fetch(`/api/members?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setMembersData(result);
                setMembersCount(result.total);
            }
        } catch (err) {
            console.error("Failed to load members", err);
        } finally {
            setMembersLoading(false);
        }
    }

    async function loadAdmins() {
        setAdminsLoading(true);
        try {
            const res = await fetch("/api/admins");
            if (res.ok) {
                const result = await res.json();
                setAdmins(result);
            }
        } catch (err) {
            console.error("Failed to load admins", err);
        } finally {
            setAdminsLoading(false);
        }
    }

    async function handleAddAdmin() {
        if (!newAdminEmail) return;
        try {
            const res = await fetch("/api/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: newAdminEmail, role: newAdminRole })
            });
            if (res.ok) {
                setNewAdminEmail("");
                loadAdmins();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add admin");
            }
        } catch (err) {
            console.error("Failed to add admin", err);
            alert("Failed to add admin");
        }
    }

    async function handleRemoveAdmin(userId: string) {
        if (!confirm("Are you sure you want to remove this admin?")) return;
        try {
            const res = await fetch(`/api/admins/${userId}`, { method: "DELETE" });
            if (res.ok) {
                loadAdmins();
            } else {
                alert("Failed to remove admin");
            }
        } catch (err) {
            console.error("Failed to remove admin", err);
            alert("Failed to remove admin");
        }
    }

    async function loadCommunityMembers() {
        setCommunityLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", String(communityPage));
            if (searchQuery && activeTab === "community") params.set("search", searchQuery);
            if (communityCityFilter) params.set("city", communityCityFilter);
            if (communityGenderFilter) params.set("gender", communityGenderFilter);

            const res = await fetch(`/api/community-members?${params.toString()}`);
            if (res.ok) {
                const result = await res.json();
                setCommunityMembers(result.items);
                setCommunityTotal(result.total);
            }
        } catch (err) {
            console.error("Failed to load community members", err);
        } finally {
            setCommunityLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            loadStatsAndRsvps();
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === "signups") {
            loadMembers();
        }
        if (user && activeTab === "admins") {
            loadAdmins();
        }
        if (user && activeTab === "community") {
            loadCommunityMembers();
        }
        if (user && activeTab === "futurelabs") {
            loadFutureLabs();
        }
        if (user && activeTab === "votes") {
            loadVotes();
        }
        if (user && activeTab === "questions") {
            loadPanelQuestions();
        }
    }, [user, activeTab, membersPage, communityPage, searchQuery, communityCityFilter, communityGenderFilter]);

    const referralLink = user?.email ? `https://vvslagos.com/rsvp?ref=${encodeURIComponent(user.email)}` : "";

    const copyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Filter RSVPs locally
    // Extract unique referrers from RSVPs list
    const uniqueReferrers = useMemo(() => {
        const referrers = new Set<string>();
        rsvps.forEach(r => {
            if (r.referred_by_admin) referrers.add(r.referred_by_admin);
        });
        return Array.from(referrers);
    }, [rsvps]);

    // Filter RSVPs locally with search, event, and referral filter criteria
    const filteredRsvps = useMemo(() => {
        return rsvps.filter(r => {
            const matchesSearch = (r.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                                 (r.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            
            const matchesEvent = !rsvpEventFilter || 
                                 (Array.isArray(r.events) && r.events.includes(rsvpEventFilter)) ||
                                 (typeof r.events === "string" && r.events === rsvpEventFilter);
            
            const matchesReferral = !rsvpReferralFilter || 
                                    (rsvpReferralFilter === "referred" && r.referred_by_admin) ||
                                    (rsvpReferralFilter === "organic" && !r.referred_by_admin) ||
                                    (r.referred_by_admin === rsvpReferralFilter);
            
            return matchesSearch && matchesEvent && matchesReferral;
        });
    }, [rsvps, searchQuery, rsvpEventFilter, rsvpReferralFilter]);

    // Filter Future Labs locally
    const filteredFutureLabs = futureLabsApps.filter(app => 
        (app.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (app.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (app.category?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    // Group all votes by email first
    const groupedVotes = useMemo(() => {
        const groups: Record<string, { email: string; votesList: { category: string; nominee: string; created_at: string }[]; lastVoteDate: string }> = {};
        votes.forEach(v => {
            if (!v.email) return;
            if (!groups[v.email]) {
                groups[v.email] = {
                    email: v.email,
                    votesList: [],
                    lastVoteDate: v.created_at || new Date().toISOString()
                };
            }
            groups[v.email].votesList.push({
                category: v.category || "General",
                nominee: v.nominee || "Unknown",
                created_at: v.created_at || new Date().toISOString()
            });
            if (v.created_at && new Date(v.created_at) > new Date(groups[v.email].lastVoteDate)) {
                groups[v.email].lastVoteDate = v.created_at;
            }
        });
        return Object.values(groups);
    }, [votes]);

    // Filter grouped votes locally
    const filteredGroupedVotes = useMemo(() => {
        return groupedVotes.filter(g => {
            const matchesSearch = (g.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                                 g.votesList.some(v => 
                                     (v.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                                     (v.nominee?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                                 );
            
            const matchesCategory = !votesCategoryFilter || 
                                    g.votesList.some(v => v.category === votesCategoryFilter);
            
            return matchesSearch && matchesCategory;
        });
    }, [groupedVotes, searchQuery, votesCategoryFilter]);

    // Compute Leaderboard
    const leaderboardData = useMemo(() => {
        const categories: Record<string, Record<string, number>> = {};
        votes.forEach(v => {
            const cat = v.category || "General";
            if (!categories[cat]) {
                categories[cat] = {};
            }
            if (v.nominee) {
                categories[cat][v.nominee] = (categories[cat][v.nominee] || 0) + 1;
            }
        });

        const sortedLeaderboard: Record<string, { nominee: string; count: number }[]> = {};
        Object.keys(categories).forEach(cat => {
            sortedLeaderboard[cat] = Object.keys(categories[cat]).map(nominee => ({
                nominee,
                count: categories[cat][nominee]
            })).sort((a, b) => b.count - a.count);
        });

        return sortedLeaderboard;
    }, [votes]);

    // Filter leaderboard category selection
    const filteredLeaderboardData = useMemo(() => {
        if (!votesCategoryFilter) return leaderboardData;
        const filtered: Record<string, any> = {};
        if (leaderboardData[votesCategoryFilter]) {
            filtered[votesCategoryFilter] = leaderboardData[votesCategoryFilter];
        }
        return filtered;
    }, [leaderboardData, votesCategoryFilter]);

    // Filter Panel Questions locally
    const filteredQuestions = useMemo(() => {
        return panelQuestions.filter(q => {
            const matchesSearch = (q.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                                 (q.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                                 (q.session_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                                 (q.question?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            
            const matchesSession = !questionsSessionFilter || q.session_id === questionsSessionFilter;
            
            return matchesSearch && matchesSession;
        });
    }, [panelQuestions, searchQuery, questionsSessionFilter]);

    return (
        <div className="space-y-8 pb-10">
            <UserSidebarPanel 
                isOpen={!!panelData} 
                onClose={() => setPanelData(null)} 
                panelData={panelData} 
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">Dashboard</h1>
                    <p className="text-sm text-admin-muted mt-1">Platform overview and referral stats.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-admin-muted">
                        Last updated {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => {
                            loadStatsAndRsvps();
                            if (activeTab === "signups") loadMembers();
                            if (activeTab === "admins") loadAdmins();
                            if (activeTab === "community") loadCommunityMembers();
                            if (activeTab === "futurelabs") loadFutureLabs();
                            if (activeTab === "votes") loadVotes();
                            if (activeTab === "questions") loadPanelQuestions();
                        }}
                        className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-admin-primary hover:bg-admin-surface shadow-sm transition-all"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Custom RSVP Link Section */}
            <div className="bg-admin-surface border border-admin-border p-6 rounded-xl shadow-[var(--shadow-stripe-ambient)]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-admin-primary mb-2">Your Custom RSVP Link</h2>
                <p className="text-xs text-admin-muted mb-4 max-w-xl">
                    Share this unique link with guests. Anyone who RSVPs using this link will be automatically tracked as your referral.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
                    <input 
                        type="text" 
                        readOnly 
                        value={loading && !user ? "Loading..." : referralLink}
                        className="flex-1 bg-admin-surface border border-admin-border rounded-lg px-4 py-2 text-sm text-admin-primary font-mono outline-none focus:ring-1 focus:ring-admin-accent"
                    />
                    <button 
                        onClick={copyLink}
                        disabled={!referralLink}
                        className="bg-admin-accent hover:bg-admin-accent-hover text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Total Waiting List" value={membersCount || "-"} loading={loading && activeTab !== "signups"} />
                <MetricCard label="Total RSVPs" value={rsvpsCount} loading={loading} />
                <MetricCard 
                    label="Your Referrals" 
                    value={myReferralsCount} 
                    loading={loading} 
                    highlight 
                />
            </div>
            
            {/* Unified Data Tables */}
            <div className="bg-admin-surface border border-admin-border rounded-xl shadow-[var(--shadow-stripe-ambient)] overflow-hidden">
                <div className="p-4 border-b border-admin-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-admin-surface">
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => { setActiveTab("rsvps"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "rsvps" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            RSVPs
                        </button>
                        <button 
                            onClick={() => { setActiveTab("signups"); setSearchQuery(""); setMembersPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "signups" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Waiting List
                        </button>
                        <button 
                            onClick={() => { setActiveTab("community"); setSearchQuery(""); setCommunityPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "community" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Community
                        </button>
                        <button 
                            onClick={() => { setActiveTab("futurelabs"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "futurelabs" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Future Labs
                        </button>
                        <button 
                            onClick={() => { setActiveTab("votes"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "votes" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Votes
                        </button>
                        <button 
                            onClick={() => { setActiveTab("questions"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "questions" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Panel Qs
                        </button>
                        <button 
                            onClick={() => { setActiveTab("admins"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "admins" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-admin-border/20 hover:text-admin-primary"}`}
                        >
                            Admins
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-admin-border text-sm focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Dynamic Filters Row */}
                <div className="px-4 py-3 border-b border-admin-border bg-admin-surface/10 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-admin-muted">Filters:</span>
                    
                    {/* RSVPs Filters */}
                    {activeTab === "rsvps" && (
                        <>
                            <select
                                value={rsvpEventFilter}
                                onChange={(e) => setRsvpEventFilter(e.target.value)}
                                className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                            >
                                <option value="">All Events</option>
                                <option value="JULY 5">July 5 — Opening Gala</option>
                                <option value="JULY 6">July 6 — Panel Sessions</option>
                                <option value="JULY 7">July 7 — Collectors Day</option>
                                <option value="JULY 8-11">July 8-11 — Pop Up Exhibition</option>
                                <option value="JULY 11">July 11 — Film Experience</option>
                                <option value="JULY 12">July 12 — Runway & Afterparty</option>
                            </select>

                            <select
                                value={rsvpReferralFilter}
                                onChange={(e) => setRsvpReferralFilter(e.target.value)}
                                className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                            >
                                <option value="">All Referrals</option>
                                <option value="referred">Any Referral</option>
                                <option value="organic">Organic (No referral)</option>
                                {uniqueReferrers.map(ref => (
                                    <option key={ref} value={ref}>{ref}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {/* Community / Waiting List Filters */}
                    {(activeTab === "signups" || activeTab === "community") && (
                        <>
                            <select
                                value={communityCityFilter}
                                onChange={(e) => {
                                    setCommunityCityFilter(e.target.value);
                                    if (activeTab === "community") setCommunityPage(1);
                                    if (activeTab === "signups") setMembersPage(1);
                                }}
                                className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                            >
                                <option value="">All Cities</option>
                                {cities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <select
                                value={communityGenderFilter}
                                onChange={(e) => {
                                    setCommunityGenderFilter(e.target.value);
                                    if (activeTab === "community") setCommunityPage(1);
                                    if (activeTab === "signups") setMembersPage(1);
                                }}
                                className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                            >
                                <option value="">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </>
                    )}

                    {/* Votes Tab Filters */}
                    {activeTab === "votes" && (
                        <select
                            value={votesCategoryFilter}
                            onChange={(e) => setVotesCategoryFilter(e.target.value)}
                            className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                        >
                            <option value="">All Award Categories</option>
                            <option value="FASHION">Fashion Designer Excellence</option>
                            <option value="VISUAL_ARTS">Contemporary Visual Artist</option>
                            <option value="CREATOR">Digital Creator of the Year</option>
                            <option value="MUSIC">Emerging Music Artist of the Year</option>
                            <option value="FILM_STORYTELLING">Excellence in Film & Screen Storytelling</option>
                            <option value="TECH">Innovation & Technology Excellence</option>
                            <option value="LEADERSHIP">Visionary Leadership</option>
                        </select>
                    )}

                    {/* Panel Qs Filters */}
                    {activeTab === "questions" && (
                        <select
                            value={questionsSessionFilter}
                            onChange={(e) => setQuestionsSessionFilter(e.target.value)}
                            className="bg-admin-surface border border-admin-border text-xs rounded-lg px-3 py-1.5 text-admin-primary outline-none focus:border-admin-accent"
                        >
                            <option value="">All Sessions</option>
                            <option value="session-1">Film & Sovereign Storytelling</option>
                            <option value="session-2">Future of African Music</option>
                            <option value="session-3">Creator Economy & AI</option>
                        </select>
                    )}

                    {/* Reset Button */}
                    {(rsvpEventFilter || rsvpReferralFilter || communityCityFilter || communityGenderFilter || votesCategoryFilter || questionsSessionFilter) && (
                        <button
                            onClick={() => {
                                setRsvpEventFilter("");
                                setRsvpReferralFilter("");
                                setCommunityCityFilter("");
                                setCommunityGenderFilter("");
                                setVotesCategoryFilter("");
                                setQuestionsSessionFilter("");
                                if (activeTab === "community") setCommunityPage(1);
                                if (activeTab === "signups") setMembersPage(1);
                            }}
                            className="text-xs text-admin-accent hover:underline font-bold"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {activeTab === "rsvps" ? (
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Email</th>
                                    <th className="px-6 py-4 font-bold">Name</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Referred By</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                ) : filteredRsvps.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">No RSVPs found.</td></tr>
                                ) : (
                                    filteredRsvps.map((rsvp: any) => (
                                        <tr 
                                            key={rsvp.id} 
                                            onClick={() => setPanelData({ type: "rsvp", data: rsvp })}
                                            className="hover:bg-admin-border/10 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-admin-primary">{rsvp.email}</td>
                                            <td className="px-6 py-4 text-admin-muted">{rsvp.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-admin-info/10 text-admin-info">
                                                    {rsvp.attendance}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-admin-muted">
                                                {rsvp.referred_by_admin ? (
                                                    <span className="px-2 py-1 bg-admin-accent/10 text-admin-accent rounded-md text-xs font-medium">
                                                        {rsvp.referred_by_admin}
                                                    </span>
                                                ) : (
                                                    <span className="text-admin-muted/70 italic">Organic</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-admin-muted">
                                                {new Date(rsvp.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeTab === "signups" ? (
                        <div>
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Source</th>
                                        <th className="px-6 py-4 font-bold">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {membersLoading ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : !membersData?.items.length ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No members found.</td></tr>
                                    ) : (
                                        membersData.items.map((member) => (
                                            <tr 
                                                key={member.id} 
                                                onClick={() => setPanelData({ type: "member", data: member })}
                                                className="hover:bg-admin-border/10 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-admin-primary">{member.email}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={member.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        member.source === "community" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                        {member.source || "app"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-admin-muted">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            {membersData && membersData.total > membersData.pageSize && (
                                <div className="p-4 border-t border-admin-border flex items-center justify-between bg-admin-surface">
                                    <span className="text-xs text-admin-muted">
                                        Showing {(membersData.page - 1) * membersData.pageSize + 1}–{Math.min(membersData.page * membersData.pageSize, membersData.total)} of {membersData.total}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={membersPage <= 1}
                                            onClick={() => setMembersPage(p => p - 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-admin-border/20 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={membersPage * membersData.pageSize >= membersData.total}
                                            onClick={() => setMembersPage(p => p + 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-admin-border/20 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === "community" ? (
                        <div>
                            {/* City and Gender Filters for Community Members */}
                            <div className="p-4 border-b border-admin-border flex flex-wrap gap-3 bg-admin-surface/30">
                                <select
                                    value={communityCityFilter}
                                    onChange={(e) => { setCommunityCityFilter(e.target.value); setCommunityPage(1); }}
                                    className="rounded-lg border border-admin-border px-3 py-1.5 text-xs bg-admin-surface text-admin-primary focus:outline-none focus:border-admin-accent"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={communityGenderFilter}
                                    onChange={(e) => { setCommunityGenderFilter(e.target.value); setCommunityPage(1); }}
                                    className="rounded-lg border border-admin-border px-3 py-1.5 text-xs bg-admin-surface text-admin-primary focus:outline-none focus:border-admin-accent"
                                >
                                    <option value="">All Genders</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="non-binary">Non-binary</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>

                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Member</th>
                                        <th className="px-6 py-4 font-bold">Contact</th>
                                        <th className="px-6 py-4 font-bold">Details</th>
                                        <th className="px-6 py-4 font-bold">Interests</th>
                                        <th className="px-6 py-4 font-bold">Joined</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {communityLoading ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : communityMembers.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-admin-muted">No community members found.</td></tr>
                                    ) : (
                                        communityMembers.map((m) => (
                                            <tr key={m.id} className="hover:bg-admin-border/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {m.selfie_url ? (
                                                            <img
                                                                src={m.selfie_url}
                                                                alt={m.name}
                                                                className="w-9 h-9 rounded-full object-cover border border-admin-border flex-shrink-0"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-admin-accent/20 border border-admin-accent/30 flex items-center justify-center text-admin-accent font-bold text-xs flex-shrink-0">
                                                                {m.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-semibold text-admin-primary">{m.name}</p>
                                                            <p className="text-xs text-admin-muted">Age {m.age} · {m.gender}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-admin-muted">{m.email}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-admin-primary text-xs font-semibold">{m.occupation}</p>
                                                    <p className="text-admin-muted text-xs">{m.city}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                        {(m.interests || []).slice(0, 3).map(i => (
                                                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-admin-accent/15 text-admin-accent font-mono">{i}</span>
                                                        ))}
                                                        {(m.interests || []).length > 3 && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-admin-border text-admin-muted font-mono">+{m.interests.length - 3}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-admin-muted whitespace-nowrap">{formatDate(m.created_at)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedCommunityMember(m)}
                                                        className="text-xs text-admin-accent hover:underline font-bold uppercase"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            {communityTotal > 20 && (
                                <div className="p-4 border-t border-admin-border flex items-center justify-between bg-admin-surface">
                                    <span className="text-xs text-admin-muted">
                                        Showing {(communityPage - 1) * 20 + 1}–{Math.min(communityPage * 20, communityTotal)} of {communityTotal}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={communityPage <= 1}
                                            onClick={() => setCommunityPage(p => p - 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-admin-border/20 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={communityPage * 20 >= communityTotal}
                                            onClick={() => setCommunityPage(p => p + 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-admin-border/20 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === "futurelabs" ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Name</th>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Discipline</th>
                                        <th className="px-6 py-4 font-bold">City</th>
                                        <th className="px-6 py-4 font-bold">Date Applied</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {futureLabsLoading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : filteredFutureLabs.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">No applications found.</td></tr>
                                    ) : (
                                        filteredFutureLabs.map((app: any) => (
                                            <tr 
                                                key={app.id} 
                                                onClick={() => setPanelData({ type: "futurelabs", data: app })}
                                                className="hover:bg-admin-border/10 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-admin-primary">{app.name}</td>
                                                <td className="px-6 py-4 text-admin-muted">{app.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-admin-accent/10 text-admin-accent">
                                                        {app.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-admin-muted">{app.city}</td>
                                                <td className="px-6 py-4 text-admin-muted">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === "votes" ? (
                        <div>
                            {/* Votes Sub-Tabs */}
                            <div className="px-6 py-4 border-b border-admin-border bg-admin-surface/30 flex gap-4">
                                <button
                                    onClick={() => setVotesSubTab("ballots")}
                                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${
                                        votesSubTab === "ballots"
                                            ? "border-admin-accent text-admin-primary"
                                            : "border-transparent text-admin-muted hover:text-admin-primary"
                                    }`}
                                >
                                    Ballots ({filteredGroupedVotes.length} Voters)
                                </button>
                                <button
                                    onClick={() => setVotesSubTab("leaderboard")}
                                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${
                                        votesSubTab === "leaderboard"
                                            ? "border-admin-accent text-admin-primary"
                                            : "border-transparent text-admin-muted hover:text-admin-primary"
                                    }`}
                                >
                                    Leaderboard / Tally
                                </button>
                            </div>

                            {votesSubTab === "ballots" ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left min-w-[600px]">
                                        <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Voter Email</th>
                                                <th className="px-6 py-4 font-bold">Categories Voted</th>
                                                <th className="px-6 py-4 font-bold">Votes Summary</th>
                                                <th className="px-6 py-4 font-bold">Last Vote Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-admin-border">
                                            {votesLoading ? (
                                                <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                            ) : filteredGroupedVotes.length === 0 ? (
                                                <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No votes found.</td></tr>
                                            ) : (
                                                filteredGroupedVotes.map((voter: any, idx: number) => (
                                                    <tr 
                                                        key={idx} 
                                                        onClick={() => setPanelData({ type: "votes", data: voter })}
                                                        className="hover:bg-admin-border/10 cursor-pointer transition-colors"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-admin-primary">{voter.email}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {voter.votesList.map((v: any, i: number) => (
                                                                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-admin-accent/10 text-admin-accent border border-admin-accent/20">
                                                                        {v.category}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-admin-muted max-w-xs truncate">
                                                            {voter.votesList.map((v: any) => v.nominee).join(", ")}
                                                        </td>
                                                        <td className="px-6 py-4 text-admin-muted">
                                                            {new Date(voter.lastVoteDate).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-6">
                                    {Object.keys(filteredLeaderboardData).length === 0 ? (
                                        <div className="text-center py-8 text-admin-muted">No vote tally data available yet.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.keys(filteredLeaderboardData).map((catName) => (
                                                <div key={catName} className="bg-admin-surface/40 border border-admin-border rounded-xl p-5 shadow-sm">
                                                    <span className="text-[#c5a059] text-[10px] font-mono tracking-widest font-bold uppercase block mb-3">
                                                        {catName}
                                                    </span>
                                                    <div className="space-y-3">
                                                        {leaderboardData[catName].map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center pb-2 border-b border-admin-border/50 last:border-b-0 last:pb-0">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="w-5.5 h-5.5 rounded-full bg-admin-border/40 text-admin-primary flex items-center justify-center text-[10px] font-mono font-bold">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <span className="text-sm text-admin-primary font-medium">{item.nominee}</span>
                                                                </div>
                                                                <span className="px-2.5 py-1 bg-admin-accent/10 text-admin-accent font-mono text-xs font-bold rounded-full">
                                                                    {item.count} {item.count === 1 ? "vote" : "votes"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : activeTab === "questions" ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Name</th>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Panel Session</th>
                                        <th className="px-6 py-4 font-bold">Question</th>
                                        <th className="px-6 py-4 font-bold">Date Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {panelQuestionsLoading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : filteredQuestions.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-admin-muted">No questions found.</td></tr>
                                    ) : (
                                        filteredQuestions.map((q: any) => (
                                            <tr 
                                                key={q.id} 
                                                className="hover:bg-admin-border/10 transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-admin-primary">{q.name}</td>
                                                <td className="px-6 py-4 text-admin-muted">{q.email}</td>
                                                <td className="px-6 py-4 text-xs text-[#c5a059] max-w-xs truncate">{q.session_id}</td>
                                                <td className="px-6 py-4 font-light text-admin-primary max-w-sm break-words">{q.question}</td>
                                                <td className="px-6 py-4 text-admin-muted">
                                                    {new Date(q.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="mb-4 flex items-center gap-2">
                                <input 
                                    type="email" 
                                    placeholder="User Email or ID" 
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="px-3 py-1.5 border border-admin-border rounded text-sm bg-admin-surface text-admin-primary"
                                />
                                <select 
                                    value={newAdminRole}
                                    onChange={(e) => setNewAdminRole(e.target.value)}
                                    className="px-3 py-1.5 border border-admin-border rounded text-sm bg-admin-surface text-admin-primary"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <button 
                                    onClick={handleAddAdmin}
                                    className="bg-admin-accent text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-admin-accent-hover"
                                >
                                    Add Admin
                                </button>
                            </div>
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">User ID</th>
                                        <th className="px-6 py-4 font-bold">Role</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {adminsLoading ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : admins.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No admins found.</td></tr>
                                    ) : (
                                        admins.map((admin) => (
                                            <tr key={admin.userId} className="hover:bg-admin-border/10 transition-colors">
                                                <td className="px-6 py-4 font-medium text-admin-primary">{admin.email || "Unknown"}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-admin-muted">{admin.userId}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-admin-info/10 text-admin-info rounded text-xs font-bold uppercase">
                                                        {admin.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveAdmin(admin.userId); }}
                                                        className="text-red-500 hover:text-red-600 text-xs font-bold uppercase"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Community Member Detail Modal */}
            {selectedCommunityMember && (
                <div
                    className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
                    onClick={() => setSelectedCommunityMember(null)}
                >
                    <div
                        className="bg-white dark:bg-admin-surface border border-admin-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-admin-primary">Member Profile</h2>
                            <button onClick={() => setSelectedCommunityMember(null)} className="text-admin-muted hover:text-admin-primary text-xl leading-none">&times;</button>
                        </div>

                        <div className="flex items-center gap-4">
                            {selectedCommunityMember.selfie_url ? (
                                <img src={selectedCommunityMember.selfie_url} alt={selectedCommunityMember.name} className="w-20 h-20 rounded-full object-cover border-2 border-admin-accent/40" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-admin-accent/20 border-2 border-admin-accent/30 flex items-center justify-center text-admin-accent font-bold text-2xl">
                                    {selectedCommunityMember.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-lg font-bold text-admin-primary">{selectedCommunityMember.name}</p>
                                <p className="text-sm text-admin-muted">{selectedCommunityMember.occupation} · {selectedCommunityMember.city}</p>
                                <p className="text-xs text-admin-muted mt-1">Age {selectedCommunityMember.age} · {selectedCommunityMember.gender}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">Email</span>
                                <span className="text-admin-primary">{selectedCommunityMember.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">City</span>
                                <span className="text-admin-primary">{selectedCommunityMember.city}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">Joined</span>
                                <span className="text-admin-primary">{formatDate(selectedCommunityMember.created_at)}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-mono uppercase text-admin-muted mb-2">Interests</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(selectedCommunityMember.interests || []).map(i => (
                                    <span key={i} className="px-2 py-1 rounded-full text-[10px] bg-admin-accent/15 text-admin-accent font-mono">{i}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, loading, highlight = false }: { label: string; value: number | string; loading: boolean, highlight?: boolean }) {
    return (
        <div className={`rounded-xl border p-6 shadow-[var(--shadow-stripe-ambient)] ${
            highlight ? "bg-admin-accent/5 border-admin-accent/20" : "bg-admin-surface border-admin-border"
        }`}>
            <div className={`text-xs font-bold tracking-wider uppercase ${highlight ? "text-admin-accent" : "text-admin-muted"}`}>
                {label}
            </div>
            <div className={`mt-2 text-4xl font-extrabold ${highlight ? "text-admin-accent" : "text-admin-primary"}`}>
                {loading ? <span className="animate-pulse opacity-50">...</span> : value}
            </div>
        </div>
    );
}
