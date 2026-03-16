"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

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
            router.push("/listings/mine");
        } catch {
            setError("Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl p-4">
            <h1 className="mb-6 text-2xl font-bold text-vvs-primary">Create Listing</h1>

            {/* Progress */}
            <div className="mb-8 flex gap-2">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-vvs-accent" : "bg-gray-200"}`}
                    />
                ))}
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {/* Step 1: Basics */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Basics</h2>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                            placeholder="e.g. Professional Logo Design"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                        >
                            <option value="">Select category</option>
                            <option value="design">Design</option>
                            <option value="development">Development</option>
                            <option value="writing">Writing</option>
                            <option value="marketing">Marketing</option>
                            <option value="video">Video & Animation</option>
                            <option value="music">Music & Audio</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                            placeholder="Describe your service in detail..."
                        />
                    </div>
                    <button
                        onClick={() => setStep(2)}
                        disabled={!title || !category || !description}
                        className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                    >
                        Next: Pricing
                    </button>
                </div>
            )}

            {/* Step 2: Pricing Tiers */}
            {step === 2 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Pricing Tiers</h2>
                    {tiers.map((tier, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => updateTier(i, { name: e.target.value })}
                                    className="rounded border border-gray-300 px-2 py-1 text-sm font-medium"
                                />
                                {tiers.length > 1 && (
                                    <button onClick={() => removeTier(i)} className="text-sm text-red-500 hover:text-red-700">
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs text-gray-500">Price (&#8358;)</label>
                                    <input
                                        type="number"
                                        value={tier.priceKobo || ""}
                                        onChange={(e) => updateTier(i, { priceKobo: Number(e.target.value) })}
                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-gray-500">Delivery (days)</label>
                                    <input
                                        type="number"
                                        value={tier.deliveryDays}
                                        onChange={(e) => updateTier(i, { deliveryDays: Number(e.target.value) })}
                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                        min={1}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="mb-1 block text-xs text-gray-500">Deliverables (one per line)</label>
                                <textarea
                                    value={tier.deliverables}
                                    onChange={(e) => updateTier(i, { deliverables: e.target.value })}
                                    rows={3}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                    placeholder="Logo file (PNG + SVG)&#10;3 revisions&#10;Source file"
                                />
                            </div>
                        </div>
                    ))}
                    {tiers.length < 3 && (
                        <button
                            onClick={addTier}
                            className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400"
                        >
                            + Add Pricing Tier
                        </button>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="flex-1 rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                        >
                            Next: Preview
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Submit */}
            {step === 3 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{category}</div>
                        <h3 className="mb-2 text-xl font-bold">{title}</h3>
                        <p className="mb-4 text-sm text-gray-600 whitespace-pre-wrap">{description}</p>
                        <div className="space-y-2">
                            {tiers.map((tier) => (
                                <div key={tier.name} className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm">
                                    <span className="font-medium">{tier.name}</span>
                                    <span>&#8358;{tier.priceKobo.toLocaleString()} &middot; {tier.deliveryDays}d</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                        >
                            {loading ? "Publishing..." : "Publish Listing"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
