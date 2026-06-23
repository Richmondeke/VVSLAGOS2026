"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rdoldxaclybdlggayjnc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb2xkeGFjbHliZGxnZ2F5am5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA4OTgsImV4cCI6MjA5Njg0Njg5OH0.n5hUc0sFDOHHS-1ljPXl93wgt_Bp2Hk3VdFQ3FzCi7o";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Member = {
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

export default function CommunityPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        fetchMembers();
    }, [page, search, cityFilter, genderFilter]);

    async function fetchMembers() {
        setLoading(true);
        try {
            let query = supabase
                .from("community_members")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (search) query = query.ilike("name", `%${search}%`);
            if (cityFilter) query = query.eq("city", cityFilter);
            if (genderFilter) query = query.eq("gender", genderFilter);

            const { data, count, error } = await query;
            if (!error && data) {
                setMembers(data);
                setTotal(count ?? 0);
            }
        } catch (e) {
            console.error("Error fetching community members:", e);
        }
        setLoading(false);
    }

    const cities = ["Lagos", "Abuja", "Port Harcourt", "Accra", "Nairobi", "Johannesburg", "London", "New York", "Paris", "Dubai", "Toronto", "Amsterdam", "Other"];

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">Community Members</h1>
                    <p className="text-sm text-admin-muted mt-1">{total} members joined</p>
                </div>
                <button
                    onClick={fetchMembers}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#c5a059] text-black rounded-lg hover:bg-[#b08d47] transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-surface text-admin-primary focus:outline-none focus:border-[#c5a059] min-w-[200px]"
                />
                <select
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setPage(0); }}
                    className="rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-surface text-admin-primary focus:outline-none"
                >
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={genderFilter}
                    onChange={(e) => { setGenderFilter(e.target.value); setPage(0); }}
                    className="rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-surface text-admin-primary focus:outline-none"
                >
                    <option value="">All Genders</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-admin-surface border-b border-admin-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Details</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Interests</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Joined</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-admin-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-admin-muted">Loading members...</td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-admin-muted">No community members found.</td>
                                </tr>
                            ) : members.map((m) => (
                                <tr key={m.id} className="hover:bg-admin-surface/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {m.selfie_url ? (
                                                <img
                                                    src={m.selfie_url}
                                                    alt={m.name}
                                                    className="w-9 h-9 rounded-full object-cover border border-admin-border flex-shrink-0"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-bold text-sm flex-shrink-0">
                                                    {m.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-admin-primary">{m.name}</p>
                                                <p className="text-xs text-admin-muted">Age {m.age} · {m.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-admin-primary text-xs">{m.email}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-admin-primary text-xs">{m.occupation}</p>
                                        <p className="text-admin-muted text-xs">{m.city}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                            {(m.interests || []).slice(0, 3).map(i => (
                                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-[#c5a059]/15 text-[#c5a059] font-mono">{i}</span>
                                            ))}
                                            {(m.interests || []).length > 3 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-admin-border text-admin-muted font-mono">+{m.interests.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-admin-muted whitespace-nowrap">{formatDate(m.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedMember(m)}
                                            className="text-xs text-[#c5a059] hover:underline font-medium"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > PAGE_SIZE && (
                    <div className="border-t border-admin-border px-4 py-3 flex items-center justify-between text-xs text-admin-muted">
                        <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1.5 rounded border border-admin-border hover:bg-admin-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(page + 1) * PAGE_SIZE >= total}
                                className="px-3 py-1.5 rounded border border-admin-border hover:bg-admin-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Member Detail Modal */}
            {selectedMember && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="bg-admin-card border border-admin-border rounded-2xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-admin-primary">Member Profile</h2>
                            <button onClick={() => setSelectedMember(null)} className="text-admin-muted hover:text-admin-primary text-xl leading-none">&times;</button>
                        </div>

                        <div className="flex items-center gap-4">
                            {selectedMember.selfie_url ? (
                                <img src={selectedMember.selfie_url} alt={selectedMember.name} className="w-20 h-20 rounded-xl object-cover border-2 border-[#c5a059]/40" />
                            ) : (
                                <div className="w-20 h-20 rounded-xl bg-[#c5a059]/20 border-2 border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] font-bold text-2xl">
                                    {selectedMember.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-lg font-bold text-admin-primary">{selectedMember.name}</p>
                                <p className="text-sm text-admin-muted">{selectedMember.occupation} · {selectedMember.city}</p>
                                <p className="text-xs text-admin-muted mt-1">Age {selectedMember.age} · {selectedMember.gender}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">Email</span>
                                <span className="text-admin-primary">{selectedMember.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">City</span>
                                <span className="text-admin-primary">{selectedMember.city}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-admin-border">
                                <span className="text-admin-muted text-xs font-mono uppercase">Joined</span>
                                <span className="text-admin-primary">{formatDate(selectedMember.created_at)}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-mono uppercase text-admin-muted mb-2">Interests</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(selectedMember.interests || []).map(i => (
                                    <span key={i} className="px-2 py-1 rounded-full text-[10px] bg-[#c5a059]/15 text-[#c5a059] font-mono">{i}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
