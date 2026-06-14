"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api-client";

type Member = {
    id: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: string;
};

type MembersResponse = {
    items: Member[];
    total: number;
    page: number;
    pageSize: number;
};

export default function MembersPage() {
    return (
        <Suspense fallback={<div className="text-admin-muted">Loading...</div>}>
            <MembersContent />
        </Suspense>
    );
}

function MembersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const statusFilter = searchParams.get("status") ?? "";
    const searchQuery = searchParams.get("search") ?? "";
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

    const [data, setData] = useState<MembersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    async function loadMembers() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set("status", statusFilter);
            if (searchQuery) params.set("search", searchQuery);
            params.set("page", String(page));
            const result = await apiClient<MembersResponse>(`/admin/api/members?${params}`);
            setData(result);
        } catch {
            // error
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMembers();
    }, [statusFilter, searchQuery, page]);

    async function handleApprove(id: string) {
        setActionLoading(id);
        try {
            await apiClient(`/admin/api/members/${id}/approve`, { method: "POST", body: {} });
            loadMembers();
        } catch (err) {
            alert(err instanceof ApiError ? err.message : "Action failed");
        } finally {
            setActionLoading(null);
        }
    }

    function setFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        params.set("page", "1");
        router.push(`/members?${params}`);
    }

    const statusOptions = ["", "pending_approval", "active", "suspended", "banned", "rejected"];

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-admin-primary">Members</h1>
                <Link
                    href="/members?status=pending_approval"
                    className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90"
                >
                    Approval Queue
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by email..."
                    defaultValue={searchQuery}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") setFilter("search", (e.target as HTMLInputElement).value);
                    }}
                    className="rounded-lg border border-admin-border px-3 py-2 text-sm focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent"
                />
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

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-admin-border bg-white">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-admin-border bg-gray-50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Registered</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-admin-muted">Loading...</td></tr>
                        ) : !data?.items.length ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-admin-muted">No members found</td></tr>
                        ) : (
                            data.items.map((member) => (
                                <tr key={member.id} className="border-b border-admin-border last:border-0">
                                    <td className="px-4 py-3">
                                        <Link href={`/members/${member.id}`} className="text-admin-accent hover:underline">
                                            {member.email}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={member.status} />
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {member.status === "pending_approval" && (
                                            <button
                                                onClick={() => handleApprove(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="rounded bg-admin-success px-2 py-1 text-xs font-medium text-white hover:bg-admin-success/90 disabled:opacity-50"
                                            >
                                                {actionLoading === member.id ? "..." : "Approve"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data && data.total > data.pageSize && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-admin-muted">
                        Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setFilter("page", String(page - 1))}
                            className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page * data.pageSize >= data.total}
                            onClick={() => setFilter("page", String(page + 1))}
                            className="rounded border border-admin-border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
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
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}
