"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type ContentEvent = {
    id: string;
    title: string;
    description: string;
    customSlug: string;
    coverImage: string | null;
    eventDate: string | null;
    isPublished: boolean;
    createdAt: string;
};

type RSVP = {
    id: number;
    name: string;
    email: string;
    attendance: string;
    events: string[] | null;
    createdAt: string;
};

type Toast = { message: string; type: "success" | "error" };

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
            <span>{toast.type === "error" ? "✕" : "✓"}</span>
            <span>{toast.message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-admin-surface border border-admin-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                <p className="text-admin-primary font-medium text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-admin-muted border border-admin-border hover:bg-admin-border/20 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState<ContentEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form" | "rsvps">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingEvent, setViewingEvent] = useState<ContentEvent | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [rsvps, setRsvps] = useState<RSVP[]>([]);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [customSlug, setCustomSlug] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
    };

    async function loadEvents() {
        setLoading(true);
        try {
            const data = await apiClient<ContentEvent[]>("/admin/api/content/events");
            setEvents(data);
        } catch (err) {
            console.error(err);
            showToast("Failed to load events — check your connection.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (view === "list") loadEvents();
    }, [view]);

    async function openRsvps(event: ContentEvent) {
        setViewingEvent(event);
        setView("rsvps");
        setLoading(true);
        try {
            const data = await apiClient<RSVP[]>("/admin/api/rsvps");
            const eventRsvps = data.filter(r => r.events && r.events.includes(event.id));
            setRsvps(eventRsvps);
        } catch (err) {
            console.error(err);
            showToast("Failed to load RSVPs.", "error");
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setCustomSlug("");
        setIsPublished(false);
        setFormError(null);
        setView("form");
    }

    function openEdit(e: ContentEvent) {
        setEditingId(e.id);
        setTitle(e.title);
        setDescription(e.description);
        setCustomSlug(e.customSlug);
        setIsPublished(e.isPublished);
        setFormError(null);
        setView("form");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { title, description, customSlug, isPublished };
            if (editingId) {
                await apiClient(`/admin/api/content/events/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            } else {
                await apiClient("/admin/api/content/events", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }
            showToast(`Event ${editingId ? "updated" : "created"} successfully.`, "success");
            setView("list");
        } catch (err: any) {
            setFormError(err.message || "Failed to save event. Please try again.");
        }
    }

    async function confirmDelete() {
        if (!confirmDeleteId) return;
        try {
            await apiClient(`/admin/api/content/events/${confirmDeleteId}`, { method: "DELETE" });
            showToast("Event deleted.", "success");
            loadEvents();
        } catch (err: any) {
            showToast(err.message || "Failed to delete event.", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    }

    return (
        <>
            {toast && <ToastBanner toast={toast} onClose={() => setToast(null)} />}
            {confirmDeleteId && (
                <ConfirmModal
                    message="Are you sure you want to delete this event? This cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}

            {view === "form" ? (
                <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-admin-primary">{editingId ? "Edit Event" : "Create Event"}</h1>
                        <button onClick={() => setView("list")} className="text-sm font-bold text-admin-muted hover:text-admin-primary">Cancel</button>
                    </div>
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4 bg-admin-surface border border-admin-border p-6 rounded-xl">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Custom Slug (RSVP Link)</label>
                            <input required value={customSlug} onChange={e => setCustomSlug(e.target.value)} placeholder="e.g. vvslagos2026-vip" className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                            <p className="text-[10px] text-admin-muted mt-1">This will be accessible at: /rsvp/{customSlug}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="published" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
                            <label htmlFor="published" className="text-sm text-admin-primary font-medium">Publish immediately</label>
                        </div>
                        <button type="submit" className="bg-admin-accent hover:bg-admin-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                            Save Event
                        </button>
                    </form>
                </div>
            ) : view === "rsvps" && viewingEvent ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-admin-primary">RSVPs: {viewingEvent.title}</h1>
                            <p className="text-sm text-admin-muted mt-1">Submissions for this event</p>
                        </div>
                        <button onClick={() => setView("list")} className="px-4 py-2 bg-admin-surface border border-admin-border text-admin-primary hover:bg-admin-border/20 rounded-lg text-sm font-bold transition-colors">
                            Back to Events
                        </button>
                    </div>

                    <div className="bg-admin-surface border border-admin-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Name</th>
                                    <th className="px-6 py-4 font-bold">Email</th>
                                    <th className="px-6 py-4 font-bold">Attendance</th>
                                    <th className="px-6 py-4 font-bold">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading submissions...</td></tr>
                                ) : rsvps.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No RSVPs found for this event.</td></tr>
                                ) : (
                                    rsvps.map(rsvp => (
                                        <tr key={rsvp.id} className="hover:bg-admin-border/10 transition-colors">
                                            <td className="px-6 py-4 font-medium text-admin-primary">{rsvp.name}</td>
                                            <td className="px-6 py-4 text-admin-muted">{rsvp.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    rsvp.attendance === 'yes' ? 'bg-green-100 text-green-700' :
                                                    rsvp.attendance === 'no' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {rsvp.attendance}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-admin-muted">
                                                {new Date(rsvp.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-admin-primary">Events CMS</h1>
                            <p className="text-sm text-admin-muted mt-1">Manage events and custom RSVP links.</p>
                        </div>
                        <button onClick={openCreate} className="bg-admin-accent hover:bg-admin-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            + Create Event
                        </button>
                    </div>

                    <div className="bg-admin-surface border border-admin-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Title</th>
                                    <th className="px-6 py-4 font-bold">Slug</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No events found.</td></tr>
                                ) : (
                                    events.map(event => (
                                        <tr key={event.id} className="hover:bg-admin-border/10 transition-colors">
                                            <td className="px-6 py-4 font-medium text-admin-primary">{event.title}</td>
                                            <td className="px-6 py-4 text-admin-muted font-mono">{event.customSlug}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {event.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => openRsvps(event)} className="text-admin-accent hover:underline font-medium">RSVPs</button>
                                                <button onClick={() => openEdit(event)} className="text-admin-accent hover:underline font-medium">Edit</button>
                                                <button onClick={() => setConfirmDeleteId(event.id)} className="text-red-500 hover:underline font-medium">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
