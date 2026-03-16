"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type DashboardStats = {
    totalOrders: number;
    disputedOrders: number;
    activeOrders: number;
    ordersByStatus: Record<string, number>;
};

export default function FinancePage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<DashboardStats>("/admin/api/stats");
                setStats(data);
            } catch { /* error */ }
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="text-admin-muted">Loading finance data...</div>;

    const completedOrders = (stats?.ordersByStatus?.completed ?? 0) + (stats?.ordersByStatus?.rated ?? 0);
    const fundedOrders = stats?.activeOrders ?? 0;

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-admin-primary">Finance Overview</h1>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-white p-6">
                    <div className="text-sm text-admin-muted">Completed Orders</div>
                    <div className="mt-1 text-3xl font-bold text-admin-primary">{completedOrders}</div>
                    <p className="mt-1 text-xs text-admin-muted">Orders that reached completion/rated</p>
                </div>

                <div className="rounded-xl border border-admin-border bg-white p-6">
                    <div className="text-sm text-admin-muted">Active Escrow Orders</div>
                    <div className="mt-1 text-3xl font-bold text-admin-accent">{fundedOrders}</div>
                    <p className="mt-1 text-xs text-admin-muted">Orders with funds in escrow</p>
                </div>

                <div className="rounded-xl border border-admin-border bg-white p-6">
                    <div className="text-sm text-admin-muted">Disputed Orders</div>
                    <div className="mt-1 text-3xl font-bold text-admin-danger">{stats?.disputedOrders ?? 0}</div>
                    <p className="mt-1 text-xs text-admin-muted">Requiring admin resolution</p>
                </div>
            </div>

            {/* Fee Settings Summary */}
            <div className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Platform Fee Configuration</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-admin-muted">Platform Fee</span>
                        <p className="text-lg font-bold">7.5%</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Minimum Fee</span>
                        <p className="text-lg font-bold">{"\u20A6"}500</p>
                    </div>
                </div>
                <p className="mt-3 text-xs text-admin-muted">
                    Fee settings can be changed in Settings. Changes take effect on the next escrow release.
                </p>
            </div>

            {/* Order Breakdown */}
            {stats?.ordersByStatus && (
                <div className="rounded-xl border border-admin-border bg-white p-6">
                    <h2 className="mb-4 text-lg font-semibold">Orders by Status</h2>
                    <div className="space-y-2">
                        {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between border-b border-admin-border py-2 last:border-0">
                                <span className="text-sm capitalize text-gray-700">{status.replace(/_/g, " ")}</span>
                                <span className="font-medium text-admin-primary">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
