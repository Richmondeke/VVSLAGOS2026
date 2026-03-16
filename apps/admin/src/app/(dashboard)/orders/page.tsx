"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type Order = {
    id: string;
    clientId: string;
    providerId: string;
    listingId: string;
    status: string;
    agreedPrice: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
};

type OrdersResponse = {
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
};

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="text-admin-muted">Loading...</div>}>
            <OrdersContent />
        </Suspense>
    );
}

function OrdersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const statusFilter = searchParams.get("status") ?? "";
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

    const [data, setData] = useState<OrdersResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (statusFilter) params.set("status", statusFilter);
                params.set("page", String(page));
                const result = await apiClient<OrdersResponse>(`/admin/api/orders?${params}`);
                setData(result);
            } catch { /* error */ }
            setLoading(false);
        })();
    }, [statusFilter, page]);

    function setFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("page", "1");
        router.push(`/orders?${params}`);
    }

    const statusOptions = ["", "draft", "pending_funding", "funded", "in_progress", "delivered", "pending_approval", "completed", "rated", "disputed", "cancelled"];

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-admin-primary">Orders</h1>

            <div className="mb-4 flex gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setFilter("status", e.target.value)}
                    className="rounded-lg border border-admin-border px-3 py-2 text-sm"
                >
                    <option value="">All statuses</option>
                    {statusOptions.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-admin-border bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Order ID</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Last Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading...</td></tr>
                        ) : !data?.items.length ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No orders found</td></tr>
                        ) : (
                            data.items.map((order) => (
                                <tr key={order.id} className="border-b border-admin-border last:border-0">
                                    <td className="px-4 py-3">
                                        <Link href={`/orders/${order.id}`} className="font-mono text-xs text-admin-accent hover:underline">
                                            {order.id.slice(0, 8)}...
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {order.currency === "NGN" ? "\u20A6" : "$"}{order.agreedPrice?.toLocaleString() ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <OrderStatusBadge status={order.status} />
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">
                                        {new Date(order.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.total > data.pageSize && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-admin-muted">
                        {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
                    </span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setFilter("page", String(page - 1))} className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50">Prev</button>
                        <button disabled={page * data.pageSize >= data.total} onClick={() => setFilter("page", String(page + 1))} className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function OrderStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        draft: "bg-gray-100 text-gray-600",
        pending_funding: "bg-yellow-100 text-yellow-700",
        funded: "bg-blue-100 text-blue-700",
        in_progress: "bg-indigo-100 text-indigo-700",
        delivered: "bg-purple-100 text-purple-700",
        pending_approval: "bg-orange-100 text-orange-700",
        completed: "bg-green-100 text-green-700",
        rated: "bg-green-100 text-green-700",
        disputed: "bg-red-100 text-red-700",
        cancelled: "bg-gray-100 text-gray-500",
    };
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}
