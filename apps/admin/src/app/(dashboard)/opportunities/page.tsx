"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type ContentOpportunity = {
    id: string;
    type: string;
    title: string;
    description: string;
    url: string | null;
    brand: string | null;
    brandLogo: string | null;
    category: string;
    location: string | null;
    deadline: string | null;
    budget: string | null;
    xpReward: number | null;
    isVerifiedBrand: boolean;
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
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-admin-muted border border-admin-border hover:bg-admin-border/20 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<ContentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

    // Form state
    const [type, setType] = useState("job");
    const [title, setTitle] = useState("");
    const [brand, setBrand] = useState("");
    const [brandLogo, setBrandLogo] = useState("");
    const [category, setCategory] = useState("Other");
    const [location, setLocation] = useState("");
    const [deadline, setDeadline] = useState("");
    const [budget, setBudget] = useState("");
    const [xpReward, setXpReward] = useState<number | "">("");
    const [isVerifiedBrand, setIsVerifiedBrand] = useState(false);
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    async function loadOpportunities() {
        setLoading(true);
        try {
            const data = await apiClient<ContentOpportunity[]>("/admin/api/content/opportunities");
            setOpportunities(data);
        } catch (err) {
            console.error(err);
            showToast("Failed to load opportunities — check your connection.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (view === "list") loadOpportunities();
    }, [view]);

    function openCreate() {
        setEditingId(null);
        setType("job");
        setTitle("");
        setBrand("");
        setBrandLogo("");
        setCategory("Other");
        setLocation("");
        setDeadline("");
        setBudget("");
        setXpReward("");
        setIsVerifiedBrand(false);
        setDescription("");
        setUrl("");
        setIsPublished(false);
        setFormError(null);
        setView("form");
    }

    function openEdit(o: ContentOpportunity) {
        setEditingId(o.id);
        setType(o.type);
        setTitle(o.title);
        setBrand(o.brand || "");
        setBrandLogo(o.brandLogo || "");
        setCategory(o.category || "Other");
        setLocation(o.location || "");
        // Format ISO string to date input format (YYYY-MM-DD)
        setDeadline(o.deadline ? new Date(o.deadline).toISOString().split('T')[0] : "");
        setBudget(o.budget || "");
        setXpReward(o.xpReward ?? "");
        setIsVerifiedBrand(o.isVerifiedBrand ?? false);
        setDescription(o.description);
        setUrl(o.url || "");
        setIsPublished(o.isPublished);
        setFormError(null);
        setView("form");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { 
                type, title, description, url, isPublished, 
                brand, brandLogo, category, location, 
                deadline: deadline ? new Date(deadline).toISOString() : null, 
                budget, 
                xpReward: typeof xpReward === 'number' ? xpReward : (parseInt(xpReward, 10) || 0), 
                isVerifiedBrand 
            };
            if (editingId) {
                await apiClient(`/admin/api/content/opportunities/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            } else {
                await apiClient("/admin/api/content/opportunities", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }
            showToast(`Opportunity ${editingId ? "updated" : "created"} successfully.`, "success");
            setView("list");
        } catch (err: any) {
            setFormError(err.message || "Failed to save opportunity. Please try again.");
        }
    }

    async function confirmDelete() {
        if (!confirmDeleteId) return;
        try {
            await apiClient(`/admin/api/content/opportunities/${confirmDeleteId}`, { method: "DELETE" });
            showToast("Opportunity deleted.", "success");
            loadOpportunities();
        } catch (err: any) {
            showToast(err.message || "Failed to delete opportunity.", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    }

    return (
        <>
            {toast && <ToastBanner toast={toast} onClose={() => setToast(null)} />}
            {confirmDeleteId && (
                <ConfirmModal
                    message="Are you sure you want to delete this opportunity? This cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}

            {view === "form" ? (
            <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-admin-primary">{editingId ? "Edit Opportunity" : "Create Opportunity"}</h1>
                    <button onClick={() => setView("list")} className="text-sm font-bold text-admin-muted hover:text-admin-primary">Cancel</button>
                </div>
                {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                        {formError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 bg-admin-surface border border-admin-border p-6 rounded-xl">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Type</label>
                        <select required value={type} onChange={e => setType(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none">
                            <option value="job">Job</option>
                            <option value="internship">Internship</option>
                            <option value="grant">Grant</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Title</label>
                        <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Brand</label>
                            <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Brand Logo URL</label>
                            <input type="url" value={brandLogo} onChange={e => setBrandLogo(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Category</label>
                            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Fashion, Tech" className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Location</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Deadline</label>
                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">Budget / Compensation</label>
                            <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $500 or Unpaid" className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">XP Reward</label>
                            <input type="number" value={xpReward} onChange={e => setXpReward(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" id="verifiedBrand" checked={isVerifiedBrand} onChange={e => setIsVerifiedBrand(e.target.checked)} />
                            <label htmlFor="verifiedBrand" className="text-sm text-admin-primary font-medium">Verified Brand</label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-admin-muted mb-1">URL (Optional)</label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full border border-admin-border rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-1 focus:ring-admin-accent outline-none" />
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
                        Save Opportunity
                    </button>
                </form>
            </div>
            ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-admin-primary">Opportunities CMS</h1>
                        <p className="text-sm text-admin-muted mt-1">Manage jobs, internships, and grants.</p>
                    </div>
                    <button onClick={openCreate} className="bg-admin-accent hover:bg-admin-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                        + Create Opportunity
                    </button>
                </div>

                <div className="bg-admin-surface border border-admin-border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-admin-surface text-admin-muted uppercase text-[10px] tracking-wider border-b border-admin-border">
                            <tr>
                                <th className="px-6 py-4 font-bold">Type</th>
                                <th className="px-6 py-4 font-bold">Title</th>
                                <th className="px-6 py-4 font-bold">Brand</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">Loading...</td></tr>
                            ) : opportunities.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-admin-muted">No opportunities found.</td></tr>
                            ) : (
                                opportunities.map(opp => (
                                    <tr key={opp.id} className="hover:bg-admin-border/10 transition-colors">
                                        <td className="px-6 py-4 font-medium text-admin-primary capitalize">{opp.type}</td>
                                        <td className="px-6 py-4 text-admin-primary">{opp.title}</td>
                                        <td className="px-6 py-4 text-admin-muted">{opp.brand || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${opp.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {opp.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => openEdit(opp)} className="text-admin-accent hover:underline font-medium">Edit</button>
                                            <button onClick={() => setConfirmDeleteId(opp.id)} className="text-red-500 hover:underline font-medium">Delete</button>
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
