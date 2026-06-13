"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import ThemeLogo from "@/components/theme-logo";

type Step = 2 | 3 | 4;
type Intent = "hire" | "offer" | "both";

export default function WelcomePage() {
    const router = useRouter();
    const { addXp } = useAuth();
    const [step, setStep] = useState<Step>(2);
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
            addXp(150);
            setStep(3);
        } catch {
            addXp(150);
            setStep(3);
        } finally {
            setLoading(false);
        }
    }

    function handleFinish() {
        localStorage.setItem("vvs_onboarding_complete", "true");
        addXp(100);

        if (intent === "offer" || intent === "both") {
            router.push("/verify-identity");
        } else {
            router.push("/discover");
        }
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#F9F6EE] text-vvs-black font-sans">
            {/* Header / Navigation Bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <button
                    onClick={() => {
                        if (step > 2) {
                            setStep((s) => (s - 1) as Step);
                        } else {
                            router.push("/login");
                        }
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-vvs-black"
                >
                    <span className="text-base font-bold">←</span>
                </button>
                <div className="flex items-center gap-1">
                    {[2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`w-2.5 h-1 rounded-full transition-all duration-300 ${
                                s <= step ? "bg-vvs-gold w-5" : "bg-black/10"
                            }`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleFinish}
                    className="text-xs font-bold text-vvs-black/60 hover:text-vvs-black transition-all cursor-pointer"
                >
                    Skip
                </button>
            </div>

            <div className="w-full max-w-md space-y-6">
                {step === 2 && (
                    <div className="space-y-6 text-left">
                        <div className="text-center flex flex-col items-center gap-2 mb-4">
                            <div className="w-16 h-16 rounded-[22px] bg-white border border-black/5 flex items-center justify-center shadow-md p-1.5">
                                <ThemeLogo forceTheme="light" />
                            </div>
                            <span className="text-[10px] text-vvs-gold tracking-widest font-extrabold uppercase">Profile Setup</span>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider">Profile Details</span>
                            <h2 className="text-3xl font-bold tracking-tight text-vvs-black mt-1 font-serif">Tell us about yourself</h2>
                            <p className="text-vvs-black/60 text-xs mt-1">Fill in your details to set up your profile.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all resize-none"
                                    placeholder="Tell us a bit about your work..."
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Profession</label>
                                <input
                                    type="text"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                                    placeholder="e.g. Designer, Photographer, Stylist"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 transition-all appearance-none"
                                >
                                    <option value="" className="text-vvs-black/40">Select your discipline</option>
                                    <option value="design">Design & Architecture</option>
                                    <option value="development">Tech & Web3</option>
                                    <option value="writing">Editorial & Literature</option>
                                    <option value="marketing">Brand Strategy</option>
                                    <option value="video">Film & Motion</option>
                                    <option value="music">Audio & Sound Design</option>
                                    <option value="business">Creative Business</option>
                                    <option value="other">Alternative Art Forms</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">
                                    Skills
                                </label>
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                                    placeholder="e.g. Design, Styling, Editing (comma separated)"
                                />
                            </div>

                            <button
                                onClick={handleProfileSubmit}
                                disabled={loading || !bio || !profession || !category}
                                className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide disabled:opacity-30 disabled:pointer-events-none cursor-pointer mt-4"
                            >
                                {loading ? "Saving..." : "Continue"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-left">
                        <div>
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider">Your Goal</span>
                            <h2 className="text-3xl font-bold tracking-tight text-vvs-black mt-1 font-serif">What are you looking to do?</h2>
                            <p className="text-vvs-black/60 text-xs mt-1">Select how you want to use VVS.</p>
                        </div>

                        <div className="space-y-3">
                            {([
                                { value: "hire", label: "Hire Creatives", desc: "Find, collaborate with, and pay verified professionals." },
                                { value: "offer", label: "Offer Services", desc: "Showcase your portfolio, apply to gigs, and get paid securely." },
                                { value: "both", label: "Both", desc: "Simultaneously hire creative talent and list your services." },
                            ] as const).map((option) => {
                                const isSelected = intent === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setIntent(option.value)}
                                        className={`w-full rounded-2xl border p-5 text-left transition-all duration-300 cursor-pointer ${
                                            isSelected
                                                ? "border-vvs-gold bg-[#FFFDF6] shadow-sm"
                                                : "border-black/5 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-sm text-vvs-black">{option.label}</div>
                                            <div className={`h-4 w-4 rounded-full border border-black/20 flex items-center justify-center ${isSelected ? "bg-vvs-gold border-vvs-gold" : ""}`}>
                                                {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        <div className="text-xs text-vvs-black/60 mt-1.5 leading-relaxed">{option.desc}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setStep(4)}
                            disabled={!intent}
                            className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide disabled:opacity-30 disabled:pointer-events-none cursor-pointer mt-4"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-6 space-y-6 text-left">
                        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-vvs-gold/10 border border-vvs-gold/30 text-vvs-gold text-3xl">
                            ✓
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider block">All Set!</span>
                            <h2 className="text-3xl font-bold tracking-tight mt-1 text-vvs-black font-serif">Profile Setup Complete!</h2>
                            <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                {intent === "hire"
                                    ? "Account configured. Find creatives and manage campaign opportunities."
                                    : "Account configured. Proceed to verify your identity to list services and apply for opportunities."}
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl border border-black/5 bg-white flex items-center justify-between text-left">
                            <div>
                                <div className="text-[10px] text-vvs-black/50 font-bold uppercase tracking-wider">Welcome Bonus</div>
                                <div className="text-xl font-bold text-vvs-gold mt-0.5">250 XP</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-vvs-black/50 font-bold uppercase tracking-wider">Daily Streak</div>
                                <div className="text-sm font-bold text-vvs-black mt-0.5">🔥 1 DAY</div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide cursor-pointer shadow-md"
                        >
                            {intent === "hire" ? "Enter App" : "Continue"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
