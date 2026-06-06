"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

type LinkItem = {
    title: string;
    url: string;
    type: "link" | "file" | "pdf";
};

const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", // Premium portrait
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", // Male portrait
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", // Female portrait
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"  // Casual portrait
];

export default function ProfileEditPage() {
    const { user, updateUser, addXp } = useAuth();
    const router = useRouter();

    // Editable fields
    const [name, setName] = useState(user?.name || "Amina Osei");
    const [bio, setBio] = useState(user?.bio || "Synthesizing traditional West African textile narratives with modern structural minimalism. Creating editorial visual architectures for forward-thinking international brands.");
    const [discipline, setDiscipline] = useState(user?.discipline || "Editorial Director & Fashion Designer");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
    
    // Links list
    const [links, setLinks] = useState<LinkItem[]>(
        (user?.links as LinkItem[]) || [
            { title: "Runway Collection SS27 Portfolio", url: "https://vvs.lagos/aura-ss27", type: "link" },
            { title: "Brand Identity Architecture Guide", url: "https://vvs.lagos/brand-identity-vvs.pdf", type: "pdf" },
            { title: "Creative Agency Showreel Video", url: "https://vvs.lagos/showreel", type: "link" }
        ]
    );

    // New link form states
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newType, setNewType] = useState<"link" | "file" | "pdf">("link");

    // File drag & drop simulated state
    const [dragging, setDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);

    const handleAddLink = () => {
        if (!newTitle.trim() || !newUrl.trim()) return;
        const urlToUse = newUrl.startsWith("http://") || newUrl.startsWith("https://") ? newUrl : `https://${newUrl}`;
        setLinks([...links, { title: newTitle, url: urlToUse, type: newType }]);
        setNewTitle("");
        setNewUrl("");
        setNewType("link");
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        updateUser({
            name,
            bio,
            discipline,
            avatarUrl,
            links
        });
        addXp(100); // Earn status points for updating profile info
        router.push("/profile");
    };

    // Drag-and-drop event handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const fileList = Array.from(files).map((f) => {
                const ext = f.name.split(".").pop()?.toLowerCase();
                const type: "link" | "file" | "pdf" = ext === "pdf" ? "pdf" : "file";
                
                // Add to Link-in-Bio immediately for extreme responsiveness
                const simulatedUrl = `https://vvs.lagos/uploads/${f.name}`;
                setLinks(prev => [...prev, { title: f.name.replace(/\.[^/.]+$/, ""), url: simulatedUrl, type }]);

                return {
                    name: f.name,
                    size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
                    type: f.type
                };
            });
            setUploadedFiles(prev => [...prev, ...fileList]);
            addXp(50); // Status point rewards for file uploads
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileList = Array.from(files).map((f) => {
                const ext = f.name.split(".").pop()?.toLowerCase();
                const type: "link" | "file" | "pdf" = ext === "pdf" ? "pdf" : "file";
                
                const simulatedUrl = `https://vvs.lagos/uploads/${f.name}`;
                setLinks(prev => [...prev, { title: f.name.replace(/\.[^/.]+$/, ""), url: simulatedUrl, type }]);

                return {
                    name: f.name,
                    size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
                    type: f.type
                };
            });
            setUploadedFiles(prev => [...prev, ...fileList]);
            addXp(50);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-0 space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-text-secondary/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-text-primary uppercase">
                        Edit Profile
                    </h1>
                </div>
                <Link 
                    href="/profile" 
                    className="text-xs px-4 py-2 border border-text-secondary/10 text-text-secondary hover:text-text-primary rounded-full transition-all"
                >
                    Cancel
                </Link>
            </div>

            {/* Profile Editor Fields */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-text-secondary/10 space-y-8">
                
                {/* 1. Avatar Preset Selector */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        Profile Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-20 w-20 rounded-full overflow-hidden bg-text-secondary/5 border border-text-secondary/15 shrink-0">
                            <img src={avatarUrl} alt="Selected Avatar" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] text-text-secondary block">Select a premium curated portrait:</span>
                            <div className="flex gap-3">
                                {AVATAR_PRESETS.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setAvatarUrl(preset)}
                                        className={`h-11 w-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                                            avatarUrl === preset ? "border-vvs-accent scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <img src={preset} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Basic Attributes */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="glass-input w-full rounded-xl px-4 py-3 text-xs focus:outline-none"
                            placeholder="e.g. Amina Osei"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                            Creative Discipline
                        </label>
                        <input
                            type="text"
                            value={discipline}
                            onChange={(e) => setDiscipline(e.target.value)}
                            className="glass-input w-full rounded-xl px-4 py-3 text-xs focus:outline-none"
                            placeholder="e.g. Editorial Director"
                        />
                    </div>
                </div>

                {/* 3. Bio / Creative Manifesto */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                        About / Bio
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="glass-input w-full rounded-xl px-4 py-3 text-xs focus:outline-none resize-none leading-relaxed"
                        placeholder="Explain your creative focus..."
                    />
                </div>

                {/* 4. Link-in-Bio Manager */}
                <div className="space-y-4 pt-4 border-t border-text-secondary/5">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                            Link in Bio Showcase
                        </label>
                        <p className="text-[10px] text-text-secondary">
                            Add clickable portfolios, external links, social reels, or design lookbooks.
                        </p>
                    </div>

                    {/* Active Links List */}
                    <div className="space-y-2">
                        {links.map((link, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-3 rounded-xl border border-text-secondary/5 bg-text-secondary/2 text-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">
                                        {link.type === "pdf" ? "📄" : link.type === "file" ? "📁" : "🔗"}
                                    </span>
                                    <div>
                                        <span className="font-bold text-text-primary block leading-none">{link.title}</span>
                                        <span className="text-[10px] text-text-secondary font-mono truncate max-w-xs block mt-0.5">{link.url}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveLink(idx)}
                                    className="text-text-muted hover:text-vvs-accent p-1.5 transition-colors cursor-pointer text-[10px] uppercase font-bold font-mono"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Link Form */}
                    <div className="bg-text-secondary/2 border border-text-secondary/5 p-4 rounded-xl space-y-4">
                        <span className="text-[10px] font-bold font-mono tracking-wide text-vvs-gold block uppercase">
                            + Add New Showcase Item
                        </span>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <input
                                type="text"
                                placeholder="Link Label (e.g. Portfolio)"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="glass-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-1 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="URL (e.g. behance.net/amina)"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="glass-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-1 focus:outline-none"
                            />
                            <div className="flex gap-2 sm:col-span-1">
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value as "link" | "file" | "pdf")}
                                    className="glass-input rounded-xl px-3 py-2.5 text-xs flex-1 focus:outline-none bg-vvs-bg"
                                >
                                    <option value="link">Website Link</option>
                                    <option value="pdf">PDF Document</option>
                                    <option value="file">Asset File</option>
                                </select>
                                <button
                                    onClick={handleAddLink}
                                    className="mono-caps text-[10px] font-bold px-4 py-2.5 bg-text-primary text-vvs-bg rounded-xl hover:bg-vvs-accent hover:text-text-primary transition-all cursor-pointer shrink-0"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Dropzone File Upload Simulator */}
                <div className="space-y-4 pt-4 border-t border-text-secondary/5">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                            Upload Work (Images, Pictures, PDFs)
                        </label>
                        <p className="text-[10px] text-text-secondary">
                            Simulate uploading portfolio files. Uploaded items automatically publish as clickable link nodes in your bio.
                        </p>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative cursor-pointer ${
                            dragging 
                                ? "border-vvs-accent bg-vvs-accent/5 scale-102" 
                                : "border-text-secondary/20 hover:border-text-secondary/40 bg-transparent"
                        }`}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span className="text-3xl block mb-2">📁</span>
                        <p className="text-xs font-semibold text-text-primary">
                            {dragging ? "Release to upload files!" : "Drag & drop images, portfolio pieces, or PDFs here"}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-1">
                            or click to browse local storage. Max 25MB.
                        </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-bold font-mono tracking-wider text-vvs-green block uppercase">
                                ✓ Uploaded Files (Linked to bio)
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {uploadedFiles.map((file, idx) => (
                                    <span 
                                        key={idx} 
                                        className="text-[10px] px-3 py-1 bg-vvs-green/5 border border-vvs-green/10 text-vvs-green rounded-full flex items-center gap-1"
                                    >
                                        📄 {file.name} ({file.size})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-text-secondary/5 flex justify-end gap-3">
                    <Link 
                        href="/profile" 
                        className="text-xs font-semibold px-5 py-3 border border-text-secondary/10 text-text-secondary hover:text-text-primary rounded-xl transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        className="mono-caps text-xs font-bold px-6 py-3 bg-vvs-accent text-text-primary rounded-xl hover:shadow-[0_0_20px_rgba(255,59,92,0.4)] hover:scale-101 transition-all cursor-pointer"
                    >
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
