"use client";

import { useEffect } from "react";

export type PanelData = {
    type: "rsvp" | "member" | "futurelabs" | "votes";
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
                        {type === "rsvp" ? "RSVP Details" : type === "futurelabs" ? "Future Labs Application" : type === "votes" ? "Voter Ballot Details" : "Member Details"}
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
                                {type === "futurelabs" && (
                                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-admin-accent/10 text-admin-accent">
                                        {data.category || "Unknown Category"}
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
                            {/* Contact Info — members only (RSVPs use Contact & Profile section below) */}
                            {type === "member" && (
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
                            )}

                            {/* Additional Info for RSVP */}
                            {type === "rsvp" && (
                                <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Contact & Profile</h4>
                                    <div className="space-y-3">
                                        {data.phone && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Phone</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.phone}</div>
                                            </div>
                                        )}
                                        {data.gender && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Gender</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.gender}</div>
                                            </div>
                                        )}
                                        {data.occupation && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Occupation</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.occupation}</div>
                                            </div>
                                        )}
                                        {data.company && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Company / Brand</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.company}</div>
                                            </div>
                                        )}
                                        {data.role && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Role</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.role}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info for Future Labs Application */}
                            {type === "futurelabs" && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Contact & Profile</h4>
                                        <div className="space-y-3">
                                            {data.phone && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Phone</div>
                                                    <div className="text-sm font-medium text-admin-primary">{data.phone}</div>
                                                </div>
                                            )}
                                            {data.gender && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Gender</div>
                                                    <div className="text-sm font-medium text-admin-primary">{data.gender}</div>
                                                </div>
                                            )}
                                            {data.city && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">City & Country</div>
                                                    <div className="text-sm font-medium text-admin-primary">{data.city}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Project & Vision</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Portfolio / Website Link</div>
                                                {data.portfolio_url ? (
                                                    <a 
                                                        href={data.portfolio_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-sm font-medium text-admin-accent hover:underline break-all"
                                                    >
                                                        {data.portfolio_url}
                                                    </a>
                                                ) : (
                                                    <div className="text-sm text-admin-muted italic">No portfolio link provided.</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Statement of Intent</div>
                                                <div className="text-sm font-light text-admin-primary leading-relaxed whitespace-pre-wrap mt-1">
                                                    {data.statement}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Submitted On</div>
                                                <div className="text-xs font-mono text-admin-muted mt-0.5">
                                                    {new Date(data.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {type === "rsvp" && (
                                <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Event Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Referred By</div>
                                            <div className="text-sm font-medium text-admin-primary">
                                                {data.referredByAdmin ? (
                                                    <span className="px-2 py-1 bg-admin-accent/10 text-admin-accent rounded-md text-xs font-medium">
                                                        {data.referredByAdmin}
                                                    </span>
                                                ) : (
                                                    <span className="italic text-gray-400">Organic (No Referrer)</span>
                                                )}
                                            </div>
                                        </div>
                                        {data.heardAbout && (
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">How They Heard About VVS</div>
                                                <div className="text-sm font-medium text-admin-primary">{data.heardAbout}</div>
                                            </div>
                                        )}
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
                            {/* Additional Info for Votes */}
                            {type === "votes" && (
                                <div className="bg-white dark:bg-white/5 border border-admin-border rounded-xl p-4 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-4">Cast Ballots</h4>
                                    <div className="space-y-4">
                                        {Array.isArray(data.votesList) && data.votesList.map((v: any, idx: number) => (
                                            <div key={idx} className="pb-3 border-b border-admin-border last:border-b-0 last:pb-0">
                                                <div className="text-[10px] font-mono uppercase tracking-wider text-[#c5a059] mb-0.5">{v.category}</div>
                                                <div className="text-sm font-extrabold text-admin-primary">{v.nominee}</div>
                                                <div className="text-[10px] text-admin-muted mt-0.5">Cast: {new Date(v.created_at).toLocaleString()}</div>
                                            </div>
                                        ))}
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
