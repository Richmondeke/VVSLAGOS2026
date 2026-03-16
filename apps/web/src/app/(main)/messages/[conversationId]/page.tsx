"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Message = {
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
};

export default function ConversationPage() {
    const params = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
    }, [params.conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function loadMessages() {
        try {
            const data = await apiClient<{ items: Message[] }>(
                `/social/messages/${params.conversationId}`,
            );
            setMessages(data.items ?? []);
        } catch {
            // handled
        }
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await apiClient(`/social/messages/${params.conversationId}`, {
                method: "POST",
                body: { body: newMessage },
            });
            setNewMessage("");
            await loadMessages();
        } catch {
            // error toast
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex h-[calc(100vh-7.5rem)] flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                                isMe ? "bg-vvs-accent text-white" : "bg-gray-100 text-gray-900"
                            }`}>
                                <p>{msg.body}</p>
                                <div className={`mt-1 text-[10px] ${isMe ? "text-white/70" : "text-gray-400"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-lg bg-vvs-accent px-4 py-2 font-medium text-white hover:bg-vvs-accent/90 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
