"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

type DashboardStats = {
    totalMembers: number;
    pendingApprovals: number;
    totalOrders: number;
    disputedOrders: number;
    activeOrders: number;
    disputeRate: string;
    ordersByStatus: Record<string, number>;
    membersByStatus: Record<string, number>;
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    async function loadStats() {
        try {
            const data = await apiClient<DashboardStats>("/admin/api/stats");
            setStats(data);
            setLastRefresh(new Date());
        } catch {
            // stats unavailable
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStats();
    }, []);

    if (loading) {
        return <div className="text-admin-muted">Loading dashboard...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-admin-primary">Dashboard</h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-admin-muted">
                        Last updated {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => { setLoading(true); loadStats(); }}
                        className="rounded-lg border border-admin-border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Total Members" value={stats?.totalMembers ?? 0} />
                <MetricCard label="Total Orders" value={stats?.totalOrders ?? 0} />
                <MetricCard label="Active Orders" value={stats?.activeOrders ?? 0} />
                <MetricCard
                    label="Dispute Rate"
                    value={`${stats?.disputeRate ?? 0}%`}
                    variant={Number(stats?.disputeRate ?? 0) > 5 ? "danger" : "default"}
                />
            </div>

            {/* Action Items */}
            <h2 className="mb-4 text-lg font-semibold text-admin-primary">Action Items</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ActionCard
                    label="Pending Approvals"
                    count={stats?.pendingApprovals ?? 0}
                    href="/members?status=pending_approval"
                    variant={stats?.pendingApprovals ? "warning" : "default"}
                />
                <ActionCard
                    label="Open Disputes"
                    count={stats?.disputedOrders ?? 0}
                    href="/disputes"
                    variant={stats?.disputedOrders ? "danger" : "default"}
                />
                <ActionCard
                    label="Orders at Risk"
                    count={0}
                    href="/orders?tab=at-risk"
                    description="Orders with no response > 48h"
                />
            </div>

            {/* Order Status Breakdown */}
            {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold text-admin-primary">Orders by Status</h2>
                    <div className="rounded-xl border border-admin-border bg-white p-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                                <div key={status} className="text-center">
                                    <div className="text-xl font-bold text-admin-primary">{count}</div>
                                    <div className="text-xs text-admin-muted capitalize">{status.replace(/_/g, " ")}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, variant = "default" }: { label: string; value: number | string; variant?: "default" | "danger" }) {
    return (
        <div className="rounded-xl border border-admin-border bg-white p-4">
            <div className="text-sm text-admin-muted">{label}</div>
            <div className={`mt-1 text-2xl font-bold ${variant === "danger" ? "text-admin-danger" : "text-admin-primary"}`}>
                {value}
            </div>
        </div>
    );
}

function ActionCard({ label, count, href, variant = "default", description }: {
    label: string;
    count: number;
    href: string;
    variant?: "default" | "warning" | "danger";
    description?: string;
}) {
    const borderColor = variant === "danger" ? "border-admin-danger/30" : variant === "warning" ? "border-admin-warning/30" : "border-admin-border";
    const countColor = variant === "danger" ? "text-admin-danger" : variant === "warning" ? "text-admin-warning" : "text-admin-primary";

    return (
        <Link href={href} className={`block rounded-xl border ${borderColor} bg-white p-4 transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className={`text-xl font-bold ${countColor}`}>{count}</span>
            </div>
            {description && <p className="mt-1 text-xs text-admin-muted">{description}</p>}
        </Link>
    );
}
