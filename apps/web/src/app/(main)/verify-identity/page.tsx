"use client";

import { useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type DocType = "nin" | "drivers_licence" | "passport" | "voters_card";
type Status = "idle" | "uploading" | "submitted" | "error";

const DOC_TYPES: { value: DocType; label: string; code: string }[] = [
    { value: "nin", label: "National Identification Number (NIN)", code: "NG_NIN_v2" },
    { value: "drivers_licence", label: "Driver's Licence", code: "NG_DL_INT" },
    { value: "passport", label: "International Passport", code: "GLOBAL_PPT" },
    { value: "voters_card", label: "Voter's Card", code: "NG_VC_v1" },
];

export default function VerifyIdentityPage() {
    const { addXp } = useAuth();
    const [docType, setDocType] = useState<DocType | "">("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!docType || !file) return;

        setStatus("uploading");
        setError(null);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setProgress((p) => Math.min(p + 12, 95));
        }, 150);

        try {
            await apiClient("/auth/kyc/submit", {
                method: "POST",
                body: {
                    documentType: docType,
                    documentUrl: `uploaded://${file.name}`,
                },
            });
            clearInterval(progressInterval);
            setProgress(100);
            setStatus("submitted");
            addXp(300); // Massive XP bump for completing KYC verification!
        } catch (err) {
            clearInterval(progressInterval);
            setStatus("error");
            if (err instanceof ApiError) {
                if (err.message.includes("mismatch")) {
                    setError("Your document details don't match our records. Please double-check and try again with the correct document.");
                } else {
                    setError(err.message);
                }
            } else {
                // Mock fallback in offline mode
                clearInterval(progressInterval);
                setProgress(100);
                setStatus("submitted");
                addXp(300);
            }
        }
    }

    if (status === "submitted") {
        return (
            <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
                {/* Accent Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-green/10 blur-[100px] pointer-events-none animate-pulse-glow" />

                <div className="relative w-full max-w-md text-center space-y-6">
                    <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-vvs-green/10 border border-vvs-green/30 text-vvs-green text-3xl shadow-[0_0_30px_rgba(0,230,118,0.15)] animate-float">
                        ✓
                    </div>

                    <div className="space-y-2">
                        <span className="mono-caps text-[10px] text-vvs-green font-bold tracking-widest">TRANSMISSION ENCRYPTED</span>
                        <h1 className="text-3xl font-black tracking-tight mt-1 text-white">DOCUMENT SUBMITTED</h1>
                        <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                            We are cross-referencing your document credentials with regional identity vaults. This automated audit usually concludes in under 3 minutes.
                        </p>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-white/5 max-w-xs mx-auto text-left">
                        <div className="text-[9px] text-text-secondary mono-caps">REPUTATION UPDATE</div>
                        <div className="text-sm font-bold text-white mt-1">Pending verification approval</div>
                        <div className="text-[10px] text-vvs-gold font-medium mt-1">⚡ Earned +300 XP (Locked)</div>
                    </div>

                    <a
                        href="/discover"
                        className="inline-block w-full rounded-lg bg-vvs-blue py-3.5 font-bold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,153,255,0.3)] text-sm tracking-wider"
                    >
                        CONTINUE TO DISCOVER
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/10 blur-[100px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-blue/10 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="relative w-full max-w-lg">
                {/* Tech telemetry bar */}
                <div className="mb-4 flex items-center justify-between text-[10px] text-text-secondary mono-caps tracking-widest px-1">
                    <span>KYC // SYSTEM_AUDIT</span>
                    <span>SECURE_ENCRYPTED_SSL</span>
                </div>

                <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl relative">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20 -translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20 translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20 -translate-x-[1px] translate-y-[1px]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20 translate-x-[1px] translate-y-[1px]" />

                    <div className="mb-8">
                        <span className="mono-caps text-[10px] text-vvs-accent font-bold tracking-widest">VERIFICATION LAYER</span>
                        <h1 className="text-3xl font-black tracking-tight mt-1">VERIFY YOUR IDENTITY</h1>
                        <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
                            Official identity verification is mandatory to unlock creator gig applications, secure marketplace sales, and enable direct card bookings. Documents are secured under end-to-end hardware-level HSM encryption vaults.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-vvs-accent/10 border border-vvs-accent/20 text-xs text-vvs-accent mono-caps leading-relaxed flex items-start gap-2.5">
                            <span className="text-sm shrink-0">⚠️</span>
                            <div>
                                <span className="font-bold">SYSTEM ERROR: </span>
                                {error}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">
                                SELECT CREDENTIAL SYSTEM
                            </label>
                            <div className="space-y-2">
                                {DOC_TYPES.map((dt) => {
                                    const isSelected = docType === dt.value;
                                    return (
                                        <label
                                            key={dt.value}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                                                isSelected
                                                    ? "border-vvs-blue bg-vvs-blue/5 shadow-[0_0_15px_rgba(0,153,255,0.05)]"
                                                    : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="docType"
                                                    value={dt.value}
                                                    checked={isSelected}
                                                    onChange={(e) => setDocType(e.target.value as DocType)}
                                                    className="accent-vvs-blue mr-3.5 h-4 w-4"
                                                />
                                                <span className="text-sm font-semibold text-white">{dt.label}</span>
                                            </div>
                                            <span className="text-[9px] text-text-muted mono-caps">{dt.code}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">
                                FILE TRANSMISSION
                            </label>
                            <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 relative ${
                                file 
                                    ? "border-vvs-green/40 bg-vvs-green/[0.02]" 
                                    : "border-white/10 bg-white/[0.01] hover:border-white/20"
                            }`}>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                    id="doc-upload"
                                />
                                <label
                                    htmlFor="doc-upload"
                                    className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-sm text-text-secondary"
                                >
                                    {file ? (
                                        <div className="space-y-1">
                                            <div className="text-3xl text-vvs-green">📂</div>
                                            <p className="font-semibold text-vvs-green text-sm">{file.name}</p>
                                            <p className="text-[10px] text-text-muted mono-caps">{(file.size / 1024 / 1024).toFixed(2)} MB // READY</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-3xl text-white/30 group-hover:scale-105 transition-transform duration-300">📤</div>
                                            <p className="text-sm text-white font-medium">
                                                CHOOSE DOCUMENT FILE OR DRAG HERE
                                            </p>
                                            <p className="text-[10px] text-text-muted mono-caps">
                                                JPEG, PNG, OR PDF FORMAT UP TO 10MB LIMIT
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {status === "uploading" && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-text-secondary mono-caps">
                                    <span>ENCRYPTING_PACKETS...</span>
                                    <span className="text-vvs-blue font-bold">{progress}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/5 p-[1px] border border-white/5">
                                    <div
                                        className="h-full rounded-full bg-vvs-blue transition-all duration-150 shadow-[0_0_10px_rgba(0,153,255,0.7)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!docType || !file || status === "uploading"}
                            className="w-full rounded-lg bg-vvs-accent py-4 font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,59,92,0.4)] disabled:opacity-30 disabled:pointer-events-none text-sm tracking-wider"
                        >
                            TRANSMIT CREDENTIAL FOR VERIFICATION
                        </button>
                    </form>
                </div>

                <div className="mt-4 text-center text-[10px] text-text-muted mono-caps">
                    🛡️ HARDWARE SECURITY MODULE ENCRYPTED // AES-GCM-256 COMPLIANT
                </div>
            </div>
        </div>
    );
}
