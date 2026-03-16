"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type StateLogEntry = {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    actorId: string | null;
    reason: string | null;
    createdAt: string;
};

type OrderDetail = {
    id: string;
    listingId: string;
    clientId: string;
    providerId: string;
    status: string;
    agreedPrice: number;
    currency: string;
    platformFee: number | null;
    escrowId: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    stateLog: StateLogEntry[];
};

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<OrderDetail>(`/admin/api/orders/${id}`);
                setOrder(data);
            } catch { /* not found */ }
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="text-admin-muted">Loading...</div>;
    if (!order) return <div className="text-admin-danger">Order not found</div>;

    return (
        <div>
            <button onClick={() => router.back()} className="mb-4 text-sm text-admin-accent hover:underline">
                Back to orders
            </button>

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">Order {order.id.slice(0, 8)}...</h1>
                    <p className="text-sm text-admin-muted">Full ID: {order.id}</p>
                </div>
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${
                    order.status === "disputed" ? "bg-red-100 text-red-700" :
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    "bg-blue-100 text-blue-700"
                }`}>
                    {order.status.replace(/_/g, " ")}
                </span>
            </div>

            {/* Order Info */}
            <div className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-3">
                    <div>
                        <span className="text-admin-muted">Amount</span>
                        <p className="font-medium">{order.currency === "NGN" ? "\u20A6" : "$"}{order.agreedPrice?.toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Platform Fee</span>
                        <p className="font-medium">{order.platformFee != null ? `${order.currency === "NGN" ? "\u20A6" : "$"}${order.platformFee.toLocaleString()}` : "—"}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Escrow ID</span>
                        <p className="font-mono text-xs">{order.escrowId ?? "—"}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Client ID</span>
                        <p className="font-mono text-xs">{order.clientId}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Provider ID</span>
                        <p className="font-mono text-xs">{order.providerId}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Listing ID</span>
                        <p className="font-mono text-xs">{order.listingId}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Created</span>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Last Updated</span>
                        <p className="font-medium">{new Date(order.updatedAt).toLocaleString()}</p>
                    </div>
                    {order.notes && (
                        <div className="col-span-full">
                            <span className="text-admin-muted">Notes</span>
                            <p className="font-medium">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* State Log / Audit Trail */}
            <div className="rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">State Transitions</h2>
                {order.stateLog.length === 0 ? (
                    <p className="text-sm text-admin-muted">No state transitions recorded</p>
                ) : (
                    <div className="space-y-3">
                        {order.stateLog.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-3 border-l-2 border-admin-border pl-4">
                                <div className="flex-1">
                                    <div className="text-sm">
                                        {entry.fromStatus ? (
                                            <span>
                                                <span className="font-medium capitalize">{entry.fromStatus.replace(/_/g, " ")}</span>
                                                {" \u2192 "}
                                                <span className="font-medium capitalize">{entry.toStatus.replace(/_/g, " ")}</span>
                                            </span>
                                        ) : (
                                            <span className="font-medium capitalize">{entry.toStatus.replace(/_/g, " ")}</span>
                                        )}
                                    </div>
                                    {entry.reason && <p className="text-xs text-admin-muted">{entry.reason}</p>}
                                </div>
                                <span className="text-xs text-admin-muted">{new Date(entry.createdAt).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
