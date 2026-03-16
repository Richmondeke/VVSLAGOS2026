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

const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_funding: "bg-yellow-100 text-yellow-700",
    funded: "bg-blue-100 text-blue-700",
    in_progress: "bg-blue-100 text-blue-700",
    delivered: "bg-purple-100 text-purple-700",
    pending_approval: "bg-orange-100 text-orange-700",
    completed: "bg-green-100 text-green-700",
    disputed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
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
            setOrders(data.items ?? []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    const actionNeeded = (status: string) =>
        ["delivered", "pending_approval", "pending_funding"].includes(status);

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="mb-4 text-2xl font-bold text-vvs-primary">Orders</h1>

            {/* Tabs */}
            <div className="mb-6 flex rounded-lg border border-gray-200 bg-white p-1">
                {(["client", "provider"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                            tab === t ? "bg-vvs-accent text-white" : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        As {t === "client" ? "Client" : "Provider"}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="space-y-3">
                    <LoadingSkeleton className="h-20" />
                    <LoadingSkeleton className="h-20" />
                </div>
            )}

            {!loading && orders.length === 0 && (
                <EmptyState
                    message={
                        tab === "client"
                            ? "No orders yet. Browse services to get started."
                            : "No orders yet. Make sure your listings are active."
                    }
                    ctaLabel={tab === "client" ? "Browse Services" : "My Listings"}
                    ctaHref={tab === "client" ? "/discover" : "/listings/mine"}
                />
            )}

            {!loading && orders.length > 0 && (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{order.listingTitle}</h3>
                                    {actionNeeded(order.status) && (
                                        <span className="h-2 w-2 rounded-full bg-orange-500" title="Requires action" />
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">{order.counterpartyName}</div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
                                    {order.status.replace(/_/g, " ")}
                                </span>
                                <div className="mt-1 text-sm font-medium">
                                    &#8358;{(order.totalKobo / 100).toLocaleString()}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
