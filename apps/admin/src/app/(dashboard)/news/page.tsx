"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type ContentNews = {
    id: string;
    title: string;
    content: string;
    coverImage: string | null;
    isPublished: boolean;
    createdAt: string;
};

type Toast = { message: string; type: "success" | "error" };

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
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

export default function NewsPage() {
    const [news, setNews] = useState<ContentNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

    async function loadNews() {
        setLoading(true);
        try {
            const data = await apiClient<ContentNews[]>("/admin/api/content/news");
            setNews(data);
        } catch (err) {
            console.error(err);
            showToast("Failed to load news — check your connection.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (view === "list") loadNews();
    }, [view]);

    function openCreate() {
        setEditingId(null);
        setTitle("");
        setContent("");
        setIsPublished(false);
        setFormError(null);
        setView("form");
    }

    function openEdit(n: ContentNews) {
        setEditingId(n.id);
        setTitle(n.title);
        setContent(n.content);
        setIsPublished(n.isPublished);
        setFormError(null);
        setView("form");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { title, content, isPublished };
            if (editingId) {
                await apiClient(`/admin/api/content/news/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            } else {
                await apiClient("/admin/api/content/news", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }
            showToast(`News ${editingId ? "updated" : "created"} successfully.`, "success");
            setView("list");
        } catch (err: any) {
            setFormError(err.message || "Failed to save news. Please try again.");
        }
    }

    async function confirmDelete() {
        if (!confirmDeleteId) return;
        try {
            await apiClient(`/admin/api/content/news/${confirmDeleteId}`, { method: "DELETE" });
            showToast("News item deleted.", "success");
            loadNews();
        } catch (err: any) {
            showToast(err.message || "Failed to delete news item.", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    }

    return (
        <>
            {toast && <ToastBanner toast={toast} onClose={() => setToast(null)} />}
            {confirmDeleteId && (
                <ConfirmModal
                    message="Are you sure you want to delete this news item? This cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}

            {view === "form" ? (
                <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-admin-primary">{editingId ? "Edit News" : "Create News"}</h1>
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
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Content (Markdown supported)</label>
                            <textarea required value={content} onChange={e => setContent(e.target.value)} rows={10} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="published" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
                            <label htmlFor="published" className="text-sm text-admin-primary font-medium">Publish immediately</label>
                        </div>
                        <button type="submit" className="bg-admin-accent hover:bg-admin-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                            Save News
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-admin-primary">News CMS</h1>
                            <p className="text-sm text-admin-muted mt-1">Manage platform news and announcements.</p>
                        </div>
                        <button onClick={openCreate} className="bg-admin-accent hover:bg-admin-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            + Create News
                        </button>
                    </div>

                    <div className="bg-admin-surface border border-admin-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Title</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                                ) : news.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No news found.</td></tr>
                                ) : (
                                    news.map(n => (
                                        <tr key={n.id} className="hover:bg-admin-border/10 transition-colors">
                                            <td className="px-6 py-4 font-medium text-admin-primary">{n.title}</td>
                                            <td className="px-6 py-4 text-admin-muted">{new Date(n.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${n.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                    {n.isPublished ? "Published" : "Draft"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => openEdit(n)} className="text-admin-accent hover:underline font-medium">Edit</button>
                                                <button onClick={() => setConfirmDeleteId(n.id)} className="text-red-500 hover:underline font-medium">Delete</button>
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
