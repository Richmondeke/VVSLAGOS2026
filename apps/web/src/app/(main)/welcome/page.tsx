"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Step = 1 | 2 | 3 | 4;
type Intent = "hire" | "offer" | "both";

export default function WelcomePage() {
    const router = useRouter();
    const { addXp } = useAuth();
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
            addXp(150); // Reward for completing profile setup!
            setStep(3);
        } catch {
            // Continue anyway in mock/offline mode so user is never blocked
            addXp(150);
            setStep(3);
        } finally {
            setLoading(false);
        }
    }

    function handleFinish() {
        localStorage.setItem("vvs_onboarding_complete", "true");
        addXp(100); // Reward for finishing onboarding!

        if (intent === "offer" || intent === "both") {
            router.push("/verify-identity");
        } else {
            router.push("/discover");
        }
    }

    return (
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/10 blur-[100px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-blue/10 blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="relative w-full max-w-lg">
                {/* Tech Header telemetry */}
                <div className="mb-4 flex items-center justify-between text-[10px] text-text-secondary mono-caps tracking-widest px-1">
                    <span>SYSTEM_INITIALIZATION // INTENT</span>
                    <span>OP_ONBOARD_SEQ_v1.0</span>
                </div>

                {/* Progress bar */}
                <div className="mb-8 glass-panel rounded-full p-1.5 flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                s <= step 
                                    ? s === step 
                                        ? "bg-vvs-accent shadow-[0_0_8px_rgba(255,59,92,0.8)]" 
                                        : "bg-vvs-blue"
                                    : "bg-white/5"
                            }`}
                        />
                    ))}
                </div>

                {/* Main Onboarding Glass Card */}
                <div className="glass-panel rounded-xl p-8 border border-white/5 shadow-2xl relative">
                    {/* Corner decorative bracket ticks */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20 -translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20 translate-x-[1px] -translate-y-[1px]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20 -translate-x-[1px] translate-y-[1px]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20 translate-x-[1px] translate-y-[1px]" />

                    {step === 1 && (
                        <div className="text-center py-6">
                            <div className="inline-block mb-4 px-3 py-1 bg-vvs-accent/10 border border-vvs-accent/30 rounded-full">
                                <span className="mono-caps text-xs text-vvs-accent font-semibold tracking-wider">CREATOR ECOSYSTEM</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-glow-ruby">
                                WELCOME TO VVS
                            </h1>
                            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                                You have successfully unlocked entry to a curated, high-reputation African creative community. Let&#39;s synchronize your professional identity.
                            </p>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full relative group overflow-hidden rounded-lg bg-vvs-accent py-4 font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,59,92,0.4)] hover:scale-[1.01]"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                INITIALIZE PROFILE SETUP
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <span className="mono-caps text-[10px] text-vvs-blue font-bold tracking-widest">STEP 02 / 04</span>
                                <h2 className="text-2xl font-black tracking-tight mt-1">COMPLETE CREATIVE SPEC</h2>
                                <p className="text-text-secondary text-xs mt-1">Provide your professional credentials to build digital status.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">Bio / Narrative</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-blue focus:border-transparent transition-all placeholder:text-text-muted"
                                        placeholder="Synthesizing fashion design and 3D textures in Accra..."
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">Creative Profession</label>
                                    <input
                                        type="text"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-blue focus:border-transparent transition-all placeholder:text-text-muted"
                                        placeholder="e.g. Editorial Director, 3D Animator"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">Core Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-blue focus:border-transparent transition-all text-white bg-vvs-card"
                                    >
                                        <option value="" className="bg-vvs-bg text-text-secondary">Select a discipline</option>
                                        <option value="design" className="bg-vvs-bg">Design & Architecture</option>
                                        <option value="development" className="bg-vvs-bg">Tech & Web3</option>
                                        <option value="writing" className="bg-vvs-bg">Editorial & Literature</option>
                                        <option value="marketing" className="bg-vvs-bg">Brand Strategy</option>
                                        <option value="video" className="bg-vvs-bg">Film & Motion</option>
                                        <option value="music" className="bg-vvs-bg">Audio & Sound Design</option>
                                        <option value="business" className="bg-vvs-bg">Creative Business</option>
                                        <option value="other" className="bg-vvs-bg">Alternative Art Forms</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-secondary mono-caps">
                                        Skills (comma-separated tags)
                                    </label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        className="w-full rounded-lg px-4 py-3 text-sm glass-input focus:outline-none focus:ring-2 focus:ring-vvs-blue focus:border-transparent transition-all placeholder:text-text-muted"
                                        placeholder="e.g. Styling, Creative Direction, Blender"
                                    />
                                </div>

                                <button
                                    onClick={handleProfileSubmit}
                                    disabled={loading || !bio || !profession || !category}
                                    className="w-full rounded-lg bg-vvs-blue py-3.5 font-bold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,153,255,0.3)] disabled:opacity-30 disabled:pointer-events-none text-sm tracking-wider"
                                >
                                    {loading ? "COMPILE DATA..." : "CONTINUE PIPELINE"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <span className="mono-caps text-[10px] text-vvs-gold font-bold tracking-widest">STEP 03 / 04</span>
                                <h2 className="text-2xl font-black tracking-tight mt-1">SELECT YOUR PATH</h2>
                                <p className="text-text-secondary text-xs mt-1">Configure your primary mode of engagement inside VVS.</p>
                            </div>

                            <div className="space-y-3">
                                {([
                                    { value: "hire", label: "COMMISSION CREATIVES", desc: "Source, contract, and pay verified African professionals via CoraPay.", border: "hover:border-vvs-blue/30 active:border-vvs-blue" },
                                    { value: "offer", label: "OFFER SERVICES", desc: "Showcase your portfolio, submit pitches to briefs, and earn secure payouts.", border: "hover:border-vvs-accent/30 active:border-vvs-accent" },
                                    { value: "both", label: "HYBRID ACCESS (BOTH)", desc: "Simultaneously hire creative talent and list professional services.", border: "hover:border-vvs-gold/30 active:border-vvs-gold" },
                                ] as const).map((option) => {
                                    const isSelected = intent === option.value;
                                    let borderStyle = "border-white/5 bg-white/[0.01]";
                                    if (isSelected) {
                                        if (option.value === "hire") borderStyle = "border-vvs-blue bg-vvs-blue/5 shadow-[0_0_15px_rgba(0,153,255,0.1)]";
                                        else if (option.value === "offer") borderStyle = "border-vvs-accent bg-vvs-accent/5 shadow-[0_0_15px_rgba(255,59,92,0.1)]";
                                        else borderStyle = "border-vvs-gold bg-vvs-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]";
                                    }
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setIntent(option.value)}
                                            className={`w-full rounded-xl border p-5 text-left transition-all duration-300 cursor-pointer ${borderStyle} ${option.border}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-sm tracking-wide text-white">{option.label}</div>
                                                <div className={`h-2.5 w-2.5 rounded-full border border-white/20 flex items-center justify-center p-0.5 ${isSelected ? "bg-white" : ""}`}>
                                                    {isSelected && <div className="h-1 w-1 bg-black rounded-full" />}
                                                </div>
                                            </div>
                                            <div className="text-xs text-text-secondary mt-1.5 leading-relaxed">{option.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setStep(4)}
                                disabled={!intent}
                                className="w-full rounded-lg bg-vvs-gold py-3.5 font-bold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:pointer-events-none text-sm tracking-wider"
                            >
                                SYNCHRONIZE PATHWAY
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-6 space-y-6">
                            <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-vvs-green/10 border border-vvs-green/30 text-vvs-green text-3xl shadow-[0_0_30px_rgba(0,230,118,0.15)] animate-float">
                                <span className="absolute inset-0 w-full h-full rounded-full border border-vvs-green/40 animate-ping opacity-25" style={{ animationDuration: "3s" }} />
                                ✓
                            </div>
                            
                            <div>
                                <span className="mono-caps text-[10px] text-vvs-green font-bold tracking-widest">CREDENTIALS APPROVED</span>
                                <h2 className="text-3xl font-black tracking-tight mt-2">OPERATIONAL</h2>
                                <p className="text-text-secondary text-sm leading-relaxed mt-2 max-w-sm mx-auto">
                                    {intent === "hire"
                                        ? "Account configured for high-level creative recruitment. Discover professionals and manage campaign opportunities."
                                        : "Account configured. Proceed to verification to activate your professional creator profile and listings."}
                                </p>
                            </div>

                            {/* Verification badge / reputation hint */}
                            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-left max-w-xs mx-auto">
                                <div>
                                    <div className="text-[10px] text-text-secondary mono-caps">INITIAL REPUTATION XP</div>
                                    <div className="text-lg font-black text-vvs-gold">250 XP</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-text-secondary mono-caps">DISCIPLINE STREAK</div>
                                    <div className="text-sm font-bold text-white">🔥 1 DAY</div>
                                </div>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full rounded-lg bg-vvs-green py-4 font-bold text-black transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,230,118,0.4)] text-sm tracking-wider"
                            >
                                {intent === "hire" ? "ENTER CORE DISCOVERY" : "START IDENTITY VERIFICATION"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Secure network note footer */}
                <div className="mt-4 text-center text-[10px] text-text-muted mono-caps">
                    🔒 VVS SECURED ENCRYPTION PIPELINE // NO OUTSIDE DATA LEAKS
                </div>
            </div>
        </div>
    );
}
