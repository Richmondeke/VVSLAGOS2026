"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiClient, ApiError } from "@/lib/api-client";
import { UserSidebarPanel, PanelData } from "@/components/UserSidebarPanel";

type Member = {
    id: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: string;
};

type MembersResponse = {
    items: Member[];
    total: number;
    page: number;
    pageSize: number;
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
    const [activeTab, setActiveTab] = useState<"rsvps" | "signups">("rsvps");
    const [searchQuery, setSearchQuery] = useState("");
    const [panelData, setPanelData] = useState<PanelData | null>(null);

    // RSVPs Data
    const [rsvps, setRsvps] = useState<any[]>([]);
    
    // Members Data
    const [membersData, setMembersData] = useState<MembersResponse | null>(null);
    const [membersPage, setMembersPage] = useState(1);
    const [membersLoading, setMembersLoading] = useState(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rdoldxaclybdlggayjnc.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb2xkeGFjbHliZGxnZ2F5am5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA4OTgsImV4cCI6MjA5Njg0Njg5OH0.n5hUc0sFDOHHS-1ljPXl93wgt_Bp2Hk3VdFQ3FzCi7o";
    const headers = { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` };

    async function loadStatsAndRsvps() {
        setLoading(true);
        try {
            // Fetch RSVPs
            const rsvpRes = await fetch(`${supabaseUrl}/rest/v1/rsvps?select=*&order=created_at.desc`, { headers });
            if (rsvpRes.ok) {
                const rsvpsList = await rsvpRes.json();
                setRsvps(rsvpsList);
                setRsvpsCount(rsvpsList.length);

                // My Referrals
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
            const result = await apiClient<MembersResponse>(`/admin/api/members?${params}`);
            setMembersData(result);
            setMembersCount(result.total);
        } catch (err) {
            console.error("Failed to load members", err);
        } finally {
            setMembersLoading(false);
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
    }, [user, activeTab, membersPage, searchQuery]);

    const referralLink = user?.email ? `https://vvslagos.com/rsvp?ref=${encodeURIComponent(user.email)}` : "";

    const copyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Filter RSVPs locally
    const filteredRsvps = rsvps.filter(r => 
        (r.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (r.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

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
                <MetricCard label="Total App Signups" value={membersCount || "-"} loading={loading && activeTab !== "signups"} />
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
                <div className="p-4 border-b border-admin-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50/50">
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => { setActiveTab("rsvps"); setSearchQuery(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "rsvps" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-gray-100 hover:text-admin-primary"}`}
                        >
                            RSVPs
                        </button>
                        <button 
                            onClick={() => { setActiveTab("signups"); setSearchQuery(""); setMembersPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "signups" ? "bg-admin-accent text-white" : "text-admin-muted hover:bg-gray-100 hover:text-admin-primary"}`}
                        >
                            App Signups
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
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
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
                                                    <span className="text-gray-400 italic">Organic</span>
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
                    ) : (
                        <div>
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Email</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {membersLoading ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                    ) : !membersData?.items.length ? (
                                        <tr><td colSpan={3} className="px-6 py-8 text-center text-admin-muted">No members found.</td></tr>
                                    ) : (
                                        membersData.items.map((member) => (
                                            <tr 
                                                key={member.id} 
                                                onClick={() => setPanelData({ type: "member", data: member })}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 font-medium text-admin-primary">{member.email}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={member.status} />
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
                                <div className="p-4 border-t border-admin-border flex items-center justify-between bg-gray-50">
                                    <span className="text-xs text-admin-muted">
                                        Showing {(membersData.page - 1) * membersData.pageSize + 1}–{Math.min(membersData.page * membersData.pageSize, membersData.total)} of {membersData.total}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={membersPage <= 1}
                                            onClick={() => setMembersPage(p => p - 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={membersPage * membersData.pageSize >= membersData.total}
                                            onClick={() => setMembersPage(p => p + 1)}
                                            className="rounded border border-admin-border px-3 py-1 text-xs font-bold disabled:opacity-50 hover:bg-white transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
