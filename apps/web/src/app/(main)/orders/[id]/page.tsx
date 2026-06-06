"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type OrderDetail = {
    id: string;
    listingId: string;
    listingTitle: string;
    clientId: string;
    providerId: string;
    status: string;
    totalKobo: number;
    pricingTierName: string;
    notes: string;
    createdAt: string;
    stateLog: Array<{ fromState: string; toState: string; createdAt: string }>;
};

const STATE_FLOW = ["draft", "pending_funding", "funded", "in_progress", "delivered", "pending_approval", "completed"];

export default function OrderDetailPage() {
    const params = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showDisputeDialog, setShowDisputeDialog] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [params.id]);

    async function loadOrder() {
        try {
            const data = await apiClient<OrderDetail>(`/marketplace/orders/${params.id}`);
            setOrder(data);
        } catch {
            // handled
        } finally {
            setLoading(false);
        }
    }

    async function doAction(action: string, body?: Record<string, unknown>) {
        setActionLoading(true);
        try {
            await apiClient(`/marketplace/orders/${params.id}/${action}`, {
                method: "POST",
                body,
            });
            await loadOrder();
        } catch {
            // toast error
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <LoadingSkeleton className="h-16" />
                <LoadingSkeleton className="h-48" />
            </div>
        );
    }

    if (!order) {
        return <div className="mx-auto max-w-3xl p-4 text-center text-gray-600">Order not found.</div>;
    }

    const isClient = user?.id === order.clientId;
    const isProvider = user?.id === order.providerId;
    const currentIdx = STATE_FLOW.indexOf(order.status);

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="mb-1 text-xl font-bold text-vvs-primary">{order.listingTitle}</h1>
            <div className="mb-6 text-sm text-gray-500">Order #{order.id.slice(0, 8)}</div>

            {/* Status timeline */}
            <div className="mb-6 overflow-x-auto">
                <div className="flex min-w-max gap-1">
                    {STATE_FLOW.map((state, i) => {
                        const isPast = i <= currentIdx;
                        const isCurrent = state === order.status;
                        return (
                            <div key={state} className="flex flex-col items-center">
                                <div className={`h-3 w-3 rounded-full ${isCurrent ? "bg-vvs-accent" : isPast ? "bg-green-500" : "bg-gray-200"}`} />
                                <div className={`mt-1 text-[10px] ${isCurrent ? "font-semibold text-vvs-accent" : isPast ? "text-green-600" : "text-gray-400"}`}>
                                    {state.replace(/_/g, " ")}
                                </div>
                                {i < STATE_FLOW.length - 1 && (
                                    <div className={`mx-auto mt-0.5 h-0.5 w-12 ${isPast ? "bg-green-500" : "bg-gray-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order details */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Tier</span>
                        <div className="font-medium">{order.pricingTierName}</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Amount</span>
                        <div className="font-medium">&#8358;{(order.totalKobo / 100).toLocaleString()}</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Created</span>
                        <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <span className="text-gray-500">Status</span>
                        <div className="font-medium capitalize">{order.status.replace(/_/g, " ")}</div>
                    </div>
                </div>
                {order.notes && (
                    <div className="mt-3 border-t pt-3">
                        <span className="text-sm text-gray-500">Notes</span>
                        <p className="text-sm">{order.notes}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {/* Provider actions */}
                {isProvider && order.status === "draft" && (
                    <div className="flex gap-3">
                        <button onClick={() => doAction("accept")} disabled={actionLoading}
                            className="flex-1 rounded-lg bg-vvs-accent px-4 py-3 font-medium text-text-primary hover:bg-vvs-accent/90 disabled:opacity-50">
                            Accept Order
                        </button>
                        <button onClick={() => doAction("decline")} disabled={actionLoading}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                            Decline
                        </button>
                    </div>
                )}
                {isProvider && order.status === "in_progress" && (
                    <button onClick={() => doAction("deliver")} disabled={actionLoading}
                        className="w-full rounded-lg bg-vvs-accent px-4 py-3 font-medium text-text-primary hover:bg-vvs-accent/90 disabled:opacity-50">
                        Submit Deliverables
                    </button>
                )}

                {/* Client actions */}
                {isClient && order.status === "pending_funding" && (
                    <button onClick={() => doAction("fund")} disabled={actionLoading}
                        className="w-full rounded-lg bg-vvs-green px-4 py-3 font-medium text-text-primary hover:bg-vvs-green/90 disabled:opacity-50">
                        Pay Now — &#8358;{(order.totalKobo / 100).toLocaleString()}
                    </button>
                )}
                {isClient && order.status === "delivered" && (
                    <div className="flex gap-3">
                        <button onClick={() => setShowApproveDialog(true)} disabled={actionLoading}
                            className="flex-1 rounded-lg bg-vvs-green px-4 py-3 font-medium text-text-primary hover:bg-vvs-green/90 disabled:opacity-50">
                            Approve & Release
                        </button>
                        <button onClick={() => doAction("revise", { notes: "Revision needed" })} disabled={actionLoading}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                            Request Revision
                        </button>
                    </div>
                )}
                {isClient && order.status === "delivered" && (
                    <button onClick={() => setShowDisputeDialog(true)}
                        className="w-full text-center text-sm text-red-500 hover:text-red-700">
                        Raise Dispute
                    </button>
                )}
            </div>

            <ConfirmationDialog
                open={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onConfirm={() => { setShowApproveDialog(false); doAction("approve"); }}
                title="Approve & Release Payment"
                message="This will release the payment to the provider. This action cannot be undone."
                confirmLabel="Release Payment"
                variant="money"
                amount={order.totalKobo}
            />

            <ConfirmationDialog
                open={showDisputeDialog}
                onClose={() => setShowDisputeDialog(false)}
                onConfirm={() => { setShowDisputeDialog(false); doAction("dispute", { reason: "Dispute raised" }); }}
                title="Raise a Dispute"
                message="A moderator will review the order and mediate a resolution. Both parties will be notified."
                confirmLabel="Raise Dispute"
                variant="destructive"
            />
        </div>
    );
}
