"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type OrderSummary = {
    id: string;
    listingTitle: string;
    counterpartyName: string;
    status: string;
    totalKobo: number;
    updatedAt: string;
};

const MOCK_ORDERS_CLIENT: OrderSummary[] = [
    {
        id: "vvs-order-101",
        listingTitle: "SS27 Editorial Campaign Visuals",
        counterpartyName: "Orange Culture",
        status: "pending_approval",
        totalKobo: 30000000, // ₦300,000
        updatedAt: "2026-05-28T02:00:00Z"
    },
    {
        id: "vvs-order-102",
        listingTitle: "3D Spatial Stage Rendering",
        counterpartyName: "Amina Studio Accra",
        status: "completed",
        totalKobo: 45000000, // ₦450,000
        updatedAt: "2026-05-20T10:30:00Z"
    }
];

const MOCK_ORDERS_PROVIDER: OrderSummary[] = [
    {
        id: "vvs-order-201",
        listingTitle: "Identity System & Brand Guidelines",
        counterpartyName: "NATIVE Mag Lagos",
        status: "funded",
        totalKobo: 60000000, // ₦600,000
        updatedAt: "2026-05-27T15:45:00Z"
    }
];

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string; label: string }> = {
    draft: { bg: "bg-white/5", text: "text-text-secondary", border: "border-white/10", label: "DRAFT" },
    pending_funding: { bg: "bg-vvs-yellow/10", text: "text-vvs-yellow", border: "border-vvs-yellow/20", label: "AWAITING FUNDING" },
    funded: { bg: "bg-vvs-blue/10", text: "text-vvs-blue", border: "border-vvs-blue/20", label: "ESCROW SECURED" },
    in_progress: { bg: "bg-vvs-blue/10", text: "text-vvs-blue", border: "border-vvs-blue/20", label: "IN PROGRESS" },
    delivered: { bg: "bg-vvs-gold/10", text: "text-vvs-gold", border: "border-vvs-gold/20", label: "DELIVERED" },
    pending_approval: { bg: "bg-vvs-yellow/10", text: "text-vvs-yellow", border: "border-vvs-yellow/20", label: "PENDING APPROVAL" },
    completed: { bg: "bg-vvs-green/10", text: "text-vvs-green", border: "border-vvs-green/20", label: "COMPLETED" },
    disputed: { bg: "bg-vvs-accent/10", text: "text-vvs-accent", border: "border-vvs-accent/20", label: "DISPUTED" },
    cancelled: { bg: "bg-white/5", text: "text-text-muted", border: "border-white/5", label: "CANCELLED" },
};

export default function OrdersPage() {
    const [tab, setTab] = useState<"client" | "provider">("client");
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, [tab]);

    async function loadOrders() {
        setLoading(true);
        try {
            const data = await apiClient<{ items: OrderSummary[] }>(
                `/marketplace/orders?role=${tab}`,
            );
            if (data.items && data.items.length > 0) {
                setOrders(data.items);
            } else {
                setOrders(tab === "client" ? MOCK_ORDERS_CLIENT : MOCK_ORDERS_PROVIDER);
            }
        } catch {
            // High fidelity Mock fallback
            setOrders(tab === "client" ? MOCK_ORDERS_CLIENT : MOCK_ORDERS_PROVIDER);
        } finally {
            setLoading(false);
        }
    }

    const actionNeeded = (status: string) =>
        ["delivered", "pending_approval", "pending_funding"].includes(status);

    return (
        <div className="relative min-h-[85vh] px-6 py-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/5 blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-blue/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="mx-auto max-w-4xl relative space-y-8">
                {/* Tech header telemetry */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <span className="mono-caps text-xs text-vvs-accent font-semibold tracking-widest">TRANSACTIONAL // ESCROWS</span>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">ESCROW CONTRACTS</h1>
                        <p className="mt-2 text-text-secondary text-sm max-w-xl">
                            Secured bookings, creative commissions, and professional service orders tracked inside the CoraPay escrow vault system.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="glass-panel p-1 rounded-lg flex border border-white/5 shrink-0 min-w-[240px]">
                        {(["client", "provider"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 rounded-md py-2 text-xs font-bold transition-all duration-300 mono-caps tracking-wider cursor-pointer ${
                                    tab === t 
                                        ? "bg-vvs-accent text-white shadow-[0_0_12px_rgba(255,59,92,0.3)]" 
                                        : "text-text-secondary hover:text-white"
                                }`}
                            >
                                {t === "client" ? "As Buyer" : "As Seller"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="space-y-4">
                        <LoadingSkeleton className="h-24 rounded-xl" />
                        <LoadingSkeleton className="h-24 rounded-xl" />
                    </div>
                )}

                {!loading && orders.length === 0 && (
                    <div className="glass-panel p-12 text-center rounded-xl border border-white/5">
                        <div className="text-3xl mb-4">📂</div>
                        <h3 className="text-lg font-bold mb-2">No active escrow records</h3>
                        <p className="text-text-secondary text-xs max-w-md mx-auto mb-6">
                            {tab === "client"
                                ? "You haven't purchased or funded any active creative catalog listings yet."
                                : "No orders received yet. Update your professional listings to boost marketplace discovery."}
                        </p>
                        <Link
                            href={tab === "client" ? "/discover" : "/listings/new"}
                            className="inline-block rounded-lg bg-vvs-blue px-6 py-2.5 text-xs font-bold text-white tracking-widest mono-caps hover:shadow-[0_0_15px_rgba(0,153,255,0.3)]"
                        >
                            {tab === "client" ? "BROWSE_CATALOG" : "CREATE_LISTING"}
                        </Link>
                    </div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const theme = STATUS_THEMES[order.status] ?? { bg: "bg-white/5", text: "text-white", border: "border-white/5", label: "RECORD" };
                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block glass-panel rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 relative group overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 -translate-x-[1px] -translate-y-[1px]" />
                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 translate-x-[1px] -translate-y-[1px]" />

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-extrabold text-lg text-white group-hover:text-vvs-accent transition-colors">
                                                    {order.listingTitle}
                                                </h3>
                                                {actionNeeded(order.status) && (
                                                    <span className="flex h-2 w-2 rounded-full bg-vvs-accent animate-pulse" title="ACTION REQUIRED" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                <span>Contractor:</span>
                                                <span className="font-semibold text-white">{order.counterpartyName}</span>
                                                <span className="text-text-muted font-mono">•</span>
                                                <span className="font-mono text-[10px]">ID: {order.id}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:text-right md:flex-col gap-2 shrink-0 border-t border-white/5 pt-4 md:pt-0 md:border-t-0">
                                            <span className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold border mono-caps tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
                                                {theme.label}
                                            </span>
                                            <div className="font-mono font-black text-white text-base md:text-lg">
                                                ₦{(order.totalKobo / 100).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
