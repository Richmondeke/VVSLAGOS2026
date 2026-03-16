"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

type DisputedOrder = {
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

type DisputesResponse = {
    items: DisputedOrder[];
    total: number;
    page: number;
    pageSize: number;
};

export default function DisputesPage() {
    const [data, setData] = useState<DisputesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const result = await apiClient<DisputesResponse>(`/admin/api/disputes?page=${page}`);
                setData(result);
            } catch { /* error */ }
            setLoading(false);
        })();
    }, [page]);

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-admin-primary">Disputes</h1>
            <p className="mb-4 text-sm text-admin-muted">
                Orders currently in disputed status. Click to view details and resolve.
            </p>

            <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-admin-border bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Order</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Filed</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Age</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">Loading...</td></tr>
                        ) : !data?.items.length ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-admin-muted">No open disputes</td></tr>
                        ) : (
                            data.items.map((order) => {
                                const ageMs = Date.now() - new Date(order.updatedAt).getTime();
                                const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
                                const slaBreached = ageHours > 48;

                                return (
                                    <tr key={order.id} className="border-b border-admin-border last:border-0">
                                        <td className="px-4 py-3">
                                            <Link href={`/orders/${order.id}`} className="font-mono text-xs text-admin-accent hover:underline">
                                                {order.id.slice(0, 8)}...
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {order.currency === "NGN" ? "\u20A6" : "$"}{order.agreedPrice?.toLocaleString() ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-admin-muted">
                                            {new Date(order.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={slaBreached ? "font-medium text-admin-danger" : "text-admin-muted"}>
                                                {ageHours}h {slaBreached ? "(SLA breached)" : ""}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="rounded bg-admin-accent px-2 py-1 text-xs font-medium text-white hover:bg-admin-accent/90"
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.total > data.pageSize && (
                <div className="mt-4 flex justify-end gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50">Prev</button>
                    <button disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)} className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}
