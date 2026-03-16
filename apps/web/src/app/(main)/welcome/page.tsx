"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type Step = 1 | 2 | 3 | 4;
type Intent = "hire" | "offer" | "both";

export default function WelcomePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [bio, setBio] = useState("");
    const [profession, setProfession] = useState("");
    const [category, setCategory] = useState("");
    const [skills, setSkills] = useState("");
    const [intent, setIntent] = useState<Intent | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleProfileSubmit() {
        setLoading(true);
        try {
            await apiClient("/members/profiles/me", {
                method: "PATCH",
                body: {
                    bio,
                    profession,
                    category,
                    skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
                },
            });
            setStep(3);
        } catch {
            // Continue anyway — profile can be updated later
            setStep(3);
        } finally {
            setLoading(false);
        }
    }

    function handleFinish() {
        // Mark onboarding as complete
        localStorage.setItem("vvs_onboarding_complete", "true");

        if (intent === "offer" || intent === "both") {
            router.push("/verify-identity");
        } else {
            router.push("/discover");
        }
    }

    return (
        <div className="mx-auto max-w-lg p-4">
            {/* Progress */}
            <div className="mb-8 flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full ${
                            s <= step ? "bg-vvs-accent" : "bg-gray-200"
                        }`}
                    />
                ))}
            </div>

            {step === 1 && (
                <div className="text-center">
                    <h1 className="mb-4 text-3xl font-bold text-vvs-primary">Welcome to VVS</h1>
                    <p className="mb-8 text-gray-600">
                        You&#39;re part of a referral-only network of verified professionals.
                        Let&#39;s get you set up.
                    </p>
                    <button
                        onClick={() => setStep(2)}
                        className="rounded-lg bg-vvs-accent px-8 py-3 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                    >
                        Get Started
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="mb-6 text-xl font-bold text-vvs-primary">Complete Your Profile</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Profession</label>
                            <input
                                type="text"
                                value={profession}
                                onChange={(e) => setProfession(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                                placeholder="e.g. Graphic Designer"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                            >
                                <option value="">Select a category</option>
                                <option value="design">Design</option>
                                <option value="development">Development</option>
                                <option value="writing">Writing</option>
                                <option value="marketing">Marketing</option>
                                <option value="video">Video & Animation</option>
                                <option value="music">Music & Audio</option>
                                <option value="business">Business</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Skills (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                                placeholder="e.g. Logo Design, Branding, UI/UX"
                            />
                        </div>
                        <button
                            onClick={handleProfileSubmit}
                            disabled={loading}
                            className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Continue"}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2 className="mb-2 text-xl font-bold text-vvs-primary">What brings you here?</h2>
                    <p className="mb-6 text-sm text-gray-600">You can always change this later.</p>
                    <div className="space-y-3">
                        {([
                            { value: "hire", label: "I want to hire talent", desc: "Find and work with verified professionals" },
                            { value: "offer", label: "I want to offer services", desc: "List your skills and earn" },
                            { value: "both", label: "Both", desc: "Hire and offer services" },
                        ] as const).map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setIntent(option.value)}
                                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                                    intent === option.value
                                        ? "border-vvs-accent bg-vvs-accent/5"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.desc}</div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setStep(4)}
                        disabled={!intent}
                        className="mt-6 w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                    >
                        Continue
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                        ✓
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-vvs-primary">You&#39;re All Set!</h2>
                    <p className="mb-8 text-gray-600">
                        {intent === "hire"
                            ? "Start discovering talented professionals."
                            : "Next step: verify your identity to start listing services."}
                    </p>
                    <button
                        onClick={handleFinish}
                        className="rounded-lg bg-vvs-accent px-8 py-3 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                    >
                        {intent === "hire" ? "Browse Services" : "Verify Identity"}
                    </button>
                </div>
            )}
        </div>
    );
}
