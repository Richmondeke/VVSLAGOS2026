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
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="mb-4 text-2xl font-bold text-vvs-primary">Messages</h1>

            {loading && (
                <div className="space-y-3">
                    <LoadingSkeleton className="h-16" />
                    <LoadingSkeleton className="h-16" />
                </div>
            )}

            {!loading && conversations.length === 0 && (
                <EmptyState message="No conversations yet. Start one from a member's profile." />
            )}

            {!loading && conversations.length > 0 && (
                <div className="space-y-1">
                    {conversations.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/messages/${conv.id}`}
                            className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium truncate">{conv.otherUserName}</span>
                                    <span className="text-xs text-gray-400 ml-2 shrink-0">
                                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vvs-accent text-xs text-white">
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
