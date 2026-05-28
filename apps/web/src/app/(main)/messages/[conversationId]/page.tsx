"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    const router = useRouter();
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
        <div className="flex h-[calc(100vh-7.5rem)] flex-col bg-black">
            {/* Header Telemetry */}
            <div className="flex items-center gap-3 border-b border-white/10 p-4 bg-[#090a0f]/60 backdrop-blur-md shrink-0">
                <button 
                    onClick={() => router.push("/messages")}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm font-mono"
                >
                    ←
                </button>
                <div>
                    <span className="mono-caps text-[9px] text-vvs-accent tracking-widest block mb-0.5 animate-pulse">DIRECT SECURE NODE</span>
                    <h2 className="text-sm font-bold text-white tracking-tight">Active Handshake</h2>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <span className="text-2xl mb-2">💬</span>
                        <p className="text-sm font-mono uppercase tracking-wider">Beginning of transmission</p>
                        <p className="text-[10px] font-mono text-white/50">All packets are locally cached and validated</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm relative overflow-hidden ${
                                isMe 
                                    ? "bg-gradient-to-br from-vvs-accent to-vvs-accent/80 text-white rounded-br-none border border-vvs-accent/10 glow-accent" 
                                    : "bg-white/5 text-white/90 rounded-bl-none border border-white/5 backdrop-blur-md"
                            }`}>
                                <p className="leading-relaxed font-medium">{msg.body}</p>
                                <div className={`mt-1.5 text-[9px] font-mono ${isMe ? "text-white/60" : "text-white/40"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Composition Deck */}
            <form onSubmit={sendMessage} className="border-t border-white/10 bg-[#090a0f]/80 p-4 backdrop-blur-md shrink-0">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit a message..."
                        className="glass-input flex-1 rounded-xl px-4 py-3 text-sm placeholder:text-white/30"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="rounded-xl bg-vvs-accent px-5 py-3 font-semibold text-white hover:bg-vvs-accent/90 disabled:opacity-50 transition-all text-sm shrink-0 flex items-center gap-1.5 mono-caps tracking-wider"
                    >
                        {sending ? "..." : "Send"}
                    </button>
                </div>
            </form>
        </div>
    );
}

