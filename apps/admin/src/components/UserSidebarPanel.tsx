"use client";

import { useEffect } from "react";

export type PanelData = {
    type: "rsvp" | "member";
    data: any;
};

interface UserSidebarPanelProps {
    isOpen: boolean;
    onClose: () => void;
    panelData: PanelData | null;
}

export function UserSidebarPanel({ isOpen, onClose, panelData }: UserSidebarPanelProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!isOpen || !panelData) return null;

    const { type, data } = panelData;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md transform bg-admin-surface border-l border-admin-border shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-admin-border px-6 py-4 bg-admin-surface/80 backdrop-blur">
                    <h2 className="text-lg font-bold text-admin-primary tracking-tight">
                        {type === "rsvp" ? "RSVP Details" : "Member Details"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 text-admin-muted hover:bg-gray-100 hover:text-admin-primary transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">
                        
                        {/* Profile Summary Section */}
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-admin-accent/10 flex items-center justify-center text-admin-accent text-2xl font-bold border border-admin-accent/20">
                                {(data.name || data.email || "?")[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-admin-primary">
                                    {data.name || "Unknown"}
                                </h3>
                                <p className="text-sm text-admin-muted">{data.email}</p>
                                {type === "rsvp" && (
                                    <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                        data.attendance === "Going" ? "bg-green-100 text-green-800" : "bg-admin-info/10 text-admin-info"
                                    }`}>
                                        {data.attendance || "Unknown"}
                                    </span>
                                )}
                                {type === "member" && (
                                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                                        {data.status?.replace(/_/g, " ")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Contact Info */}
                            <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Contact Information</h4>
                                <div className="space-y-3">
                                    {data.phone && (
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Phone</div>
                                            <div className="text-sm font-medium text-admin-primary">{data.phone}</div>
                                        </div>
                                    )}
                                    {data.instagram && (
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Instagram</div>
                                            <div className="text-sm font-medium text-admin-primary">@{data.instagram.replace("@", "")}</div>
                                        </div>
                                    )}
                                    {type === "member" && !data.phone && (
                                        <div className="text-sm text-admin-muted italic">No phone number provided.</div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Info for RSVP */}
                            {type === "rsvp" && (
                                <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Event Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Referred By</div>
                                            <div className="text-sm font-medium text-admin-primary">
                                                {data.referred_by_admin ? (
                                                    <span className="px-2 py-1 bg-admin-accent/10 text-admin-accent rounded-md text-xs font-medium">
                                                        {data.referred_by_admin}
                                                    </span>
                                                ) : (
                                                    <span className="italic text-gray-400">Organic (No Referrer)</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Target Events</div>
                                            <div className="text-sm font-medium text-admin-primary">
                                                {Array.isArray(data.events) && data.events.length > 0 ? data.events.join(", ") : "Not specified"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Submitted On</div>
                                            <div className="text-sm font-medium text-admin-primary">
                                                {new Date(data.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Info for Member */}
                            {type === "member" && (
                                <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">App Activity</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Registered On</div>
                                            <div className="text-sm font-medium text-admin-primary">
                                                {new Date(data.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Wallet / Balance</div>
                                            <div className="text-sm font-medium text-admin-muted italic">
                                                (Wallet data integration pending)
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Orders</div>
                                            <div className="text-sm font-medium text-admin-muted italic">
                                                (Order history integration pending)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className="border-t border-admin-border p-6 bg-gray-50 dark:bg-black/20 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-white dark:bg-white/5 dark:hover:bg-white/10 border border-admin-border text-admin-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    {type === "member" && data.status === "pending_approval" && (
                        <button className="flex-1 bg-admin-success text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-admin-success/90 transition-colors shadow-sm">
                            Approve Member
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
