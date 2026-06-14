"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [copied, setCopied] = useState(false);

    const [rsvpsCount, setRsvpsCount] = useState<number>(0);
    const [membersCount, setMembersCount] = useState<number>(0);
    const [myReferralsCount, setMyReferralsCount] = useState<number>(0);

    async function loadStats() {
        setLoading(true);
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rdoldxaclybdlggayjnc.supabase.co";
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb2xkeGFjbHliZGxnZ2F5am5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA4OTgsImV4cCI6MjA5Njg0Njg5OH0.n5hUc0sFDOHHS-1ljPXl93wgt_Bp2Hk3VdFQ3FzCi7o";
            
            // Fetch total RSVPs
            const rsvpRes = await fetch(`${supabaseUrl}/rest/v1/rsvps?select=id`, {
                headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
            });
            if (rsvpRes.ok) {
                const rsvps = await rsvpRes.json();
                setRsvpsCount(rsvps.length);
            }

            // Fetch my referrals
            if (user?.email) {
                const refRes = await fetch(`${supabaseUrl}/rest/v1/rsvps?select=id&referred_by_admin=eq.${encodeURIComponent(user.email)}`, {
                    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
                });
                if (refRes.ok) {
                    const refs = await refRes.json();
                    setMyReferralsCount(refs.length);
                }
            }

            // Fallback for members (we don't have a members table yet)
            setMembersCount(0);

        } catch (err) {
            console.error("Failed to load stats", err);
        }

        setLastRefresh(new Date());
        setLoading(false);
    }

    useEffect(() => {
        if (user) {
            loadStats();
        }
    }, [user]);

    const referralLink = user?.email ? `https://vvslagos.com/rsvp?ref=${encodeURIComponent(user.email)}` : "";

    const copyLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">Dashboard</h1>
                    <p className="text-sm text-admin-muted mt-1">Platform overview and referral stats.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-admin-muted">
                        Last updated {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={loadStats}
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
                <div className="flex items-center gap-2 max-w-2xl">
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
                <MetricCard label="Total App Signups" value={membersCount} loading={loading} />
                <MetricCard label="Total RSVPs" value={rsvpsCount} loading={loading} />
                <MetricCard 
                    label="Your Referrals" 
                    value={myReferralsCount} 
                    loading={loading} 
                    highlight 
                />
            </div>
            
            <div className="flex justify-end">
                <Link href="/rsvps" className="text-xs font-bold uppercase tracking-widest text-admin-accent hover:underline flex items-center gap-1">
                    View All RSVPs <span>&rarr;</span>
                </Link>
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
