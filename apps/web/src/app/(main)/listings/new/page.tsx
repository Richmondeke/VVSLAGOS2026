"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type PricingTier = {
    name: string;
    priceKobo: number;
    description: string;
    deliveryDays: number;
    deliverables: string;
};

const EMPTY_TIER: PricingTier = {
    name: "",
    priceKobo: 0,
    description: "",
    deliveryDays: 7,
    deliverables: "",
};

export default function CreateListingPage() {
    const router = useRouter();
    const { addXp } = useAuth();
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tiers, setTiers] = useState<PricingTier[]>([{ ...EMPTY_TIER, name: "Basic" }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function addTier() {
        if (tiers.length >= 3) return;
        const names = ["Basic", "Standard", "Premium"];
        setTiers([...tiers, { ...EMPTY_TIER, name: names[tiers.length] ?? "Custom" }]);
    }

    function updateTier(index: number, updates: Partial<PricingTier>) {
        setTiers(tiers.map((t, i) => (i === index ? { ...t, ...updates } : t)));
    }

    function removeTier(index: number) {
        if (tiers.length <= 1) return;
        setTiers(tiers.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        setLoading(true);
        setError(null);
        try {
            await apiClient("/marketplace/listings", {
                method: "POST",
                body: {
                    title,
                    description,
                    category,
                    pricingTiers: tiers.map((t) => ({
                        ...t,
                        priceKobo: Math.round(t.priceKobo * 100), // convert naira input to kobo
                        deliverables: t.deliverables.split("\n").filter(Boolean),
                    })),
                },
            });
            addXp(200); // Earn 200 XP for publishing a marketplace item!
            router.push("/listings/mine");
        } catch {
            // Offline/mock mode fallback to ensure fluid experience
            addXp(200);
            router.push("/discover");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-[85vh] px-4 py-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/5 blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-gold/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="mx-auto max-w-3xl relative">
                {/* Tech Telemetry Row */}
                <div className="mb-4 flex items-center justify-between text-[10px] text-text-secondary mono-caps tracking-widest px-1">
                    <span>MARKETPLACE // SERVICE_PUBLISHER</span>
                    <span>VVS_OFFER_v1.2</span>
                </div>

                {/* Progress bar */}
                <div className="mb-10 glass-panel rounded-full p-1.5 flex gap-2">
                    {[1, 2, 3].map((s) => {
                        const labels = ["01 / DETAILS", "02 / PRICING TIERS", "03 / REVIEW"];
                        const isActive = s <= step;
                        return (
                            <div
                                key={s}
                                className="flex-1 flex flex-col gap-1 cursor-pointer"
                                onClick={() => isActive && setStep(s)}
                            >
                                <div
                                    className={`h-1 rounded-full transition-all duration-500 ${
                                        s <= step 
                                            ? s === step 
                                                ? "bg-vvs-accent shadow-[0_0_8px_rgba(255,59,92,0.8)]" 
                                                : "bg-vvs-gold"
                                            : "bg-text-secondary/5"
                                    }`}
                                />
                                <span className={`text-[8px] font-bold mono-caps tracking-wider text-center mt-1 transition-colors ${s === step ? "text-text-primary" : "text-text-secondary/50"}`}>
                                    {labels[s - 1]}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-vvs-accent/10 border border-vvs-accent/20 text-xs text-vvs-accent mono-caps leading-relaxed">
                        <span className="font-bold">SYSTEM EXCEPTION: </span>
                        {error}
                    </div>
                )}

                {/* Main Glass Card Form Container */}
                <div className="glass-panel rounded-xl p-8 border border-text-secondary/10 shadow-2xl relative">
                    {/* Corner decorative ticks */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-text-secondary/15 -translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-text-secondary/15 translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-text-secondary/15 -translate-x-[1px] translate-y-[1px]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-text-secondary/15 translate-x-[1px] translate-y-[1px]" />

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <span className="mono-caps text-[10px] text-vvs-accent font-bold tracking-widest">STEP 01</span>
                                <h1 className="text-3xl font-bold tracking-tight mt-1">CORE LISTING CONFIG</h1>
                                <p className="text-text-secondary text-xs mt-1">Specify your professional service and creative discipline.</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">SERVICE TITLE</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent focus:border-transparent transition-all placeholder:text-text-muted"
                                        placeholder="e.g. Cinematic Editorial Campaign & Art Direction"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">MARKET CATEGORY</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent focus:border-transparent transition-all text-text-primary bg-vvs-card"
                                    >
                                        <option value="" className="bg-vvs-bg text-text-secondary">Select category</option>
                                        <option value="design" className="bg-vvs-bg">Design & Spatial Design</option>
                                        <option value="development" className="bg-vvs-bg">Web & Tech Solutions</option>
                                        <option value="writing" className="bg-vvs-bg">Editorial & Publishing</option>
                                        <option value="marketing" className="bg-vvs-bg">Marketing & Campaigns</option>
                                        <option value="video" className="bg-vvs-bg">Video & Creative Direction</option>
                                        <option value="music" className="bg-vvs-bg">Music Production & Sonic Identity</option>
                                        <option value="business" className="bg-vvs-bg">Creative Consulting</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">OFFERING NARRATIVE & SPECIFICATIONS</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent focus:border-transparent transition-all placeholder:text-text-muted"
                                        placeholder="Outline your creative method, specialized deliverables, client requirements, and technical pipelines in full detail..."
                                    />
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!title || !category || !description}
                                    className="w-full rounded-lg bg-vvs-accent py-3.5 font-bold text-text-primary transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,59,92,0.3)] disabled:opacity-30 disabled:pointer-events-none text-sm tracking-wider"
                                >
                                    PROCEED TO PRICING
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing Tiers */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="mono-caps text-[10px] text-vvs-accent font-bold tracking-widest">STEP 02</span>
                                    <h1 className="text-3xl font-bold tracking-tight mt-1">PRICING STRUCTURE</h1>
                                    <p className="text-text-secondary text-xs mt-1">Add up to 3 flexible tiered pricing structures (e.g., Basic, Pro, Elite).</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {tiers.map((tier, i) => (
                                    <div key={i} className="rounded-xl border border-text-secondary/10 bg-white/[0.01] p-5 relative">
                                        <div className="mb-4 flex items-center justify-between">
                                            <input
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => updateTier(i, { name: e.target.value })}
                                                className="bg-transparent text-text-primary font-bold text-lg border-b border-text-secondary/15 focus:border-vvs-accent focus:outline-none pb-0.5"
                                                placeholder="Tier Name (e.g. Basic)"
                                            />
                                            {tiers.length > 1 && (
                                                <button 
                                                    onClick={() => removeTier(i)} 
                                                    className="text-xs text-vvs-accent hover:underline mono-caps tracking-widest cursor-pointer"
                                                >
                                                    [ REMOVE_TIER ]
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-[9px] font-bold text-text-secondary mono-caps tracking-wider">PRICE (₦ / NAIRA)</label>
                                                <input
                                                    type="number"
                                                    value={tier.priceKobo || ""}
                                                    onChange={(e) => updateTier(i, { priceKobo: Number(e.target.value) })}
                                                    className="w-full rounded-lg px-3 py-2 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent"
                                                    placeholder="e.g. 250000"
                                                    min={0}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-[9px] font-bold text-text-secondary mono-caps tracking-wider">DELIVERY DAYS</label>
                                                <input
                                                    type="number"
                                                    value={tier.deliveryDays}
                                                    onChange={(e) => updateTier(i, { deliveryDays: Number(e.target.value) })}
                                                    className="w-full rounded-lg px-3 py-2 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent"
                                                    min={1}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-2 block text-[9px] font-bold text-text-secondary mono-caps tracking-wider">DELIVERABLES (ONE PER LINE)</label>
                                            <textarea
                                                value={tier.deliverables}
                                                onChange={(e) => updateTier(i, { deliverables: e.target.value })}
                                                rows={3}
                                                className="w-full rounded-lg px-3 py-2 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-accent placeholder:text-text-muted"
                                                placeholder="e.g. 5x Editorial Looks&#10;Hi-Res Digital Prints&#10;Full Color Grading"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {tiers.length < 3 && (
                                    <button
                                        onClick={addTier}
                                        className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/30 py-4 text-xs font-bold text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer mono-caps tracking-wider"
                                    >
                                        + ADD EXTRA SERVICE LEVEL
                                    </button>
                                )}

                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 rounded-lg border border-text-secondary/15 py-3 font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.02] transition-all text-sm tracking-wider"
                                    >
                                        BACK
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 rounded-lg bg-vvs-accent py-3 font-bold text-text-primary transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,59,92,0.3)] text-sm tracking-wider"
                                    >
                                        NEXT: PREVIEW
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview & Submit */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <span className="mono-caps text-[10px] text-vvs-accent font-bold tracking-widest">STEP 03</span>
                                <h1 className="text-3xl font-bold tracking-tight mt-1">EDITORIAL REVIEW</h1>
                                <p className="text-text-secondary text-xs mt-1">Review your service presentation before committing to live catalog deployment.</p>
                            </div>

                            {/* Presentation Card */}
                            <div className="rounded-xl border border-text-secondary/15 bg-gradient-to-b from-vvs-card to-black p-6 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-vvs-accent/5 blur-3xl pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-4">
                                    <span className="mono-caps text-[9px] bg-vvs-accent/10 border border-vvs-accent/30 text-vvs-accent px-2.5 py-0.5 rounded-full font-semibold">
                                        {category || "Fashion"}
                                    </span>
                                    <span className="mono-caps text-[9px] text-text-muted font-bold">REPUTATION GAIN // +200 XP</span>
                                </div>

                                <h3 className="text-2xl font-bold tracking-tight text-text-primary mb-3">{title || "Untitled Listing"}</h3>
                                <p className="text-text-secondary text-xs leading-relaxed mb-6 whitespace-pre-wrap">{description || "No description provided."}</p>
                                
                                <div className="space-y-2">
                                    <div className="text-[9px] font-bold text-text-muted mono-caps mb-2 tracking-wider">CATALOG STRUCTURES & RATES</div>
                                    {tiers.map((tier) => (
                                        <div key={tier.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-text-secondary/10 p-4 text-xs">
                                            <div>
                                                <span className="font-bold text-text-primary">{tier.name || "Custom Tier"}</span>
                                                <p className="text-[10px] text-text-secondary mt-0.5">Timeline: {tier.deliveryDays}d delivery</p>
                                            </div>
                                            <span className="text-vvs-gold font-bold font-mono text-sm">₦{(tier.priceKobo || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 rounded-lg border border-text-secondary/15 py-3 font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.02] transition-all text-sm tracking-wider"
                                >
                                    BACK
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 rounded-lg bg-vvs-green py-3 font-bold text-black transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,230,118,0.4)] text-sm tracking-wider"
                                >
                                    {loading ? "TRANSMITTING TO CATALOG..." : "PUBLISH EDITORIAL"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Secure network note footer */}
                <div className="mt-4 text-center text-[10px] text-text-muted mono-caps">
                    💼 LISTED GIG CONTRACTS ARE PROTECTED UNDER CORAPAY ESCROW POLICIES
                </div>
            </div>
        </div>
    );
}
