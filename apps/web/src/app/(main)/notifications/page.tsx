"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Notification = {
    id: string;
    title: string;
    body: string;
    link?: string;
    read: boolean;
    createdAt: string;
};

function groupByDate(items: Notification[]): Record<string, Notification[]> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: Record<string, Notification[]> = { Today: [], "This Week": [], Earlier: [] };

    for (const item of items) {
        const date = new Date(item.createdAt);
        if (date.toDateString() === today.toDateString()) {
            groups.Today.push(item);
        } else if (date > weekAgo) {
            groups["This Week"].push(item);
        } else {
            groups.Earlier.push(item);
        }
    }

    return groups;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<{ items: Notification[] }>("/notifications");
                setNotifications(data.items ?? []);
            } catch {
                // handled
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function markAllRead() {
        try {
            await apiClient("/notifications/read-all", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch {
            // ignore
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl space-y-3 p-4">
                <LoadingSkeleton className="h-16" />
                <LoadingSkeleton className="h-16" />
                <LoadingSkeleton className="h-16" />
            </div>
        );
    }

    const groups = groupByDate(notifications);
    const hasUnread = notifications.some((n) => !n.read);

    return (
        <div className="mx-auto max-w-3xl p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-vvs-primary">Notifications</h1>
                {hasUnread && (
                    <button onClick={markAllRead} className="text-sm text-vvs-accent hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">No notifications yet.</p>
            )}

            {Object.entries(groups).map(([label, items]) =>
                items.length > 0 ? (
                    <div key={label} className="mb-6">
                        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">{label}</h2>
                        <div className="space-y-1">
                            {items.map((n) => {
                                const cls = `block rounded-lg p-3 transition-colors hover:bg-gray-50 ${
                                    n.read ? "" : "bg-vvs-accent/5"
                                }`;
                                const inner = (
                                    <div className="flex items-start gap-2">
                                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-vvs-accent shrink-0" />}
                                        <div>
                                            <div className="text-sm font-medium">{n.title}</div>
                                            <div className="text-sm text-gray-500">{n.body}</div>
                                            <div className="mt-1 text-xs text-gray-400">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                                return n.link ? (
                                    <Link key={n.id} href={n.link} className={cls}>
                                        {inner}
                                    </Link>
                                ) : (
                                    <div key={n.id} className={cls}>
                                        {inner}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null,
            )}
        </div>
    );
}
