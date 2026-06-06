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
            <div className="mx-auto max-w-3xl space-y-4 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-48 bg-text-secondary/5 animate-pulse rounded-md" />
                    <div className="h-5 w-24 bg-text-secondary/5 animate-pulse rounded-md" />
                </div>
                <LoadingSkeleton className="h-20 bg-text-secondary/5 border border-text-secondary/10" />
                <LoadingSkeleton className="h-20 bg-text-secondary/5 border border-text-secondary/10" />
                <LoadingSkeleton className="h-20 bg-text-secondary/5 border border-text-secondary/10" />
            </div>
        );
    }

    const groups = groupByDate(notifications);
    const hasUnread = notifications.some((n) => !n.read);

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-8">
            {/* Header Telemetry */}
            <div className="flex items-end justify-between border-b border-text-secondary/15 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
                        Notifications
                        <span className="text-xs px-2 py-0.5 rounded border border-text-secondary/15 bg-text-secondary/5 text-text-primary/60 font-mono">
                            {notifications.length} total
                        </span>
                    </h1>
                </div>
                {hasUnread && (
                    <button 
                        onClick={markAllRead} 
                        className="mono-caps text-xs text-vvs-gold hover:text-text-primary border border-vvs-gold/30 hover:border-white px-3 py-1.5 rounded bg-vvs-gold/5 hover:bg-text-secondary/5 transition-all"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 && (
                <div className="glass-panel rounded-xl p-12 text-center border border-text-secondary/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-text-secondary/15" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-text-secondary/15" />
                    <div className="text-4xl mb-4 text-text-primary/20">🔔</div>
                    <p className="text-text-primary/60 font-medium">Your telemetry channel is quiet.</p>
                    <p className="text-xs text-text-primary/40 mt-1 font-mono uppercase tracking-wider">No active signals detected at this coordinates</p>
                </div>
            )}

            {Object.entries(groups).map(([label, items]) =>
                items.length > 0 ? (
                    <div key={label} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="mono-caps text-xs font-semibold text-text-primary/50 tracking-widest">{label}</h2>
                            <div className="h-px flex-1 bg-text-secondary/10" />
                        </div>
                        
                        <div className="space-y-2">
                            {items.map((n) => {
                                const cls = `glass-card block rounded-xl p-4 transition-all relative overflow-hidden group ${
                                    n.read ? "opacity-75" : "border-l-2 border-l-vvs-accent"
                                }`;
                                
                                const inner = (
                                    <div className="flex items-start gap-4">
                                        {!n.read && (
                                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-vvs-accent shrink-0 animate-pulse" />
                                        )}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="text-sm font-bold text-text-primary group-hover:text-vvs-accent transition-colors">
                                                    {n.title}
                                                </div>
                                                <div className="text-[10px] font-mono text-text-primary/40 shrink-0">
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="text-sm text-text-primary/70 line-clamp-2 font-medium">
                                                {n.body}
                                            </div>
                                            <div className="pt-2 flex items-center justify-between">
                                                <div className="text-[10px] font-mono text-text-primary/30">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </div>
                                                {n.link && (
                                                    <span className="mono-caps text-[9px] text-vvs-gold group-hover:underline flex items-center gap-1">
                                                        View Details <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                                                    </span>
                                                )}
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

