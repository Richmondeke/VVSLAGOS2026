"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Conversation = {
    id: string;
    otherUserId: string;
    otherUserName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
};

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<{ items: Conversation[] }>("/social/messages");
                setConversations(data.items ?? []);
            } catch {
                // handled
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="mx-auto max-w-3xl p-6 space-y-8">
            {/* Header */}
            <div className="border-b border-text-secondary/15 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Messages</h1>
            </div>

            {loading && (
                <div className="space-y-4">
                    <LoadingSkeleton className="h-20 bg-text-secondary/5 border border-text-secondary/10" />
                    <LoadingSkeleton className="h-20 bg-text-secondary/5 border border-text-secondary/10" />
                </div>
            )}

            {!loading && conversations.length === 0 && (
                <div className="glass-panel rounded-xl p-12 text-center border border-text-secondary/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-text-secondary/15" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-text-secondary/15" />
                    <div className="text-4xl mb-4 text-text-primary/20">💬</div>
                    <p className="text-text-primary/60 font-medium mb-1">No active handshakes found.</p>
                    <p className="text-xs text-text-primary/40 font-mono uppercase tracking-wider">Start a secure conversation from a creative's profile</p>
                </div>
            )}

            {!loading && conversations.length > 0 && (
                <div className="space-y-2">
                    {conversations.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/messages/${conv.id}`}
                            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all relative overflow-hidden group border border-text-secondary/10"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-text-secondary/5 border border-text-secondary/15 text-xl font-semibold text-text-primary group-hover:border-vvs-accent/50 group-hover:text-vvs-accent transition-all duration-300">
                                {conv.otherUserName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-text-primary group-hover:text-vvs-accent transition-colors truncate">
                                        {conv.otherUserName}
                                    </span>
                                    <span className="text-[10px] font-mono text-text-primary/40 ml-2 shrink-0">
                                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-text-primary/60 truncate group-hover:text-text-primary/80 transition-colors">
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vvs-accent text-[10px] font-bold text-text-primary animate-pulse glow-accent">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

