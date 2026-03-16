"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";

type MemberDetail = {
    id: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export default function MemberDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [member, setMember] = useState<MemberDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState<"suspend" | "ban" | "reject" | null>(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<MemberDetail>(`/admin/api/members/${id}`);
                setMember(data);
            } catch { /* not found */ }
            setLoading(false);
        })();
    }, [id]);

    async function handleAction(action: string) {
        if (!reason.trim() && action !== "approve") return;
        setActionLoading(true);
        try {
            if (action === "approve") {
                await apiClient(`/admin/api/members/${id}/approve`, { method: "POST", body: {} });
            } else if (action === "reject") {
                await apiClient(`/admin/api/members/${id}/reject`, { method: "POST", body: { reason } });
            } else if (action === "suspend") {
                await apiClient(`/admin/members/${id}/suspend`, { method: "POST", body: { reason } });
            } else if (action === "ban") {
                await apiClient(`/admin/members/${id}/ban`, { method: "POST", body: { reason } });
            } else if (action === "reinstate") {
                await apiClient(`/admin/members/${id}/reinstate`, { method: "POST", body: { reason } });
            }
            // Reload
            const data = await apiClient<MemberDetail>(`/admin/api/members/${id}`);
            setMember(data);
            setShowModal(null);
            setReason("");
        } catch (err) {
            alert(err instanceof ApiError ? err.message : "Action failed");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) return <div className="text-admin-muted">Loading...</div>;
    if (!member) return <div className="text-admin-danger">Member not found</div>;

    return (
        <div>
            <button onClick={() => router.back()} className="mb-4 text-sm text-admin-accent hover:underline">
                Back to members
            </button>

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-admin-primary">{member.email}</h1>
                    <p className="text-sm text-admin-muted">ID: {member.id}</p>
                </div>
                <StatusBadge status={member.status} />
            </div>

            {/* Profile Info */}
            <div className="mb-6 rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Profile</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-admin-muted">Email</span>
                        <p className="font-medium">{member.email}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Phone</span>
                        <p className="font-medium">{member.phone ?? "—"}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Status</span>
                        <p className="font-medium capitalize">{member.status.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                        <span className="text-admin-muted">Registered</span>
                        <p className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="rounded-xl border border-admin-border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Admin Actions</h2>
                <div className="flex flex-wrap gap-3">
                    {member.status === "pending_approval" && (
                        <>
                            <button
                                onClick={() => handleAction("approve")}
                                disabled={actionLoading}
                                className="rounded-lg bg-admin-success px-4 py-2 text-sm font-medium text-white hover:bg-admin-success/90 disabled:opacity-50"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => setShowModal("reject")}
                                className="rounded-lg bg-admin-danger px-4 py-2 text-sm font-medium text-white hover:bg-admin-danger/90"
                            >
                                Reject
                            </button>
                        </>
                    )}
                    {member.status === "active" && (
                        <>
                            <button
                                onClick={() => setShowModal("suspend")}
                                className="rounded-lg bg-admin-warning px-4 py-2 text-sm font-medium text-white hover:bg-admin-warning/90"
                            >
                                Suspend
                            </button>
                            <button
                                onClick={() => setShowModal("ban")}
                                className="rounded-lg bg-admin-danger px-4 py-2 text-sm font-medium text-white hover:bg-admin-danger/90"
                            >
                                Ban
                            </button>
                        </>
                    )}
                    {(member.status === "suspended" || member.status === "banned") && (
                        <button
                            onClick={() => { setReason("Reinstated by admin"); handleAction("reinstate"); }}
                            disabled={actionLoading}
                            className="rounded-lg bg-admin-info px-4 py-2 text-sm font-medium text-white hover:bg-admin-info/90 disabled:opacity-50"
                        >
                            Reinstate
                        </button>
                    )}
                </div>
            </div>

            {/* Reason Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold capitalize">{showModal} Member</h3>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason (required)"
                            rows={3}
                            className="mb-4 w-full rounded-lg border border-admin-border px-3 py-2 text-sm"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(null); setReason(""); }}
                                className="rounded-lg border border-admin-border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(showModal)}
                                disabled={actionLoading || !reason.trim()}
                                className="rounded-lg bg-admin-danger px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {actionLoading ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: "bg-green-100 text-green-700",
        pending_approval: "bg-yellow-100 text-yellow-700",
        suspended: "bg-orange-100 text-orange-700",
        banned: "bg-red-100 text-red-700",
        rejected: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}
