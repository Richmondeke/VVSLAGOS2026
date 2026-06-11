"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

type Step = 1 | 2 | 3 | 4;
type Intent = "hire" | "offer" | "both";

const AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://www.vvslagos.com/assets/VVSMASCOT7.png",
];

export default function WelcomePage() {
    const router = useRouter();
    const { addXp } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [introSlide, setIntroSlide] = useState<1 | 2 | 3>(1);
    const [showIntro, setShowIntro] = useState(true);
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
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 bg-[#F9F6EE] text-vvs-black font-sans transition-colors duration-300">
            {/* Header / Navigation Bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <button 
                    onClick={() => {
                        if (showIntro) {
                            if (introSlide > 1) setIntroSlide((s) => (s - 1) as 1 | 2 | 3);
                        } else {
                            if (step === 2) setShowIntro(true);
                            else setStep((s) => (s - 1) as Step);
                        }
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-vvs-black"
                >
                    <span className="text-base font-bold">←</span>
                </button>
                <div className="flex items-center gap-1">
                    {showIntro ? (
                        [1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`w-2.5 h-1 rounded-full transition-all duration-300 ${
                                    s <= introSlide ? "bg-vvs-gold w-5" : "bg-black/10"
                                }`}
                            />
                        ))
                    ) : (
                        [2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-2.5 h-1 rounded-full transition-all duration-300 ${
                                    s <= step ? "bg-vvs-gold w-5" : "bg-black/10"
                                }`}
                            />
                        ))
                    )}
                </div>
                <button 
                    onClick={() => {
                        setShowIntro(false);
                        setStep(2);
                    }}
                    className="text-xs font-bold text-vvs-black/60 hover:text-vvs-black transition-all cursor-pointer"
                >
                    Skip
                </button>
            </div>

            <div className="w-full max-w-md space-y-6">
                {showIntro && (
                    <div className="text-center space-y-8">
                        {/* Interactive Floating/Orbiting Bubble Visual */}
                        <div className="relative h-64 w-full flex items-center justify-center">
                            {/* Inner and Outer Orbit Lines */}
                            <div className="absolute w-52 h-52 rounded-full border border-black/5" />
                            <div className="absolute w-36 h-36 rounded-full border border-black/5" />

                            {/* Center Avatar Container */}
                            <div className="relative z-10 w-24 h-24 rounded-[32px] bg-white border border-black/5 flex items-center justify-center shadow-lg overflow-hidden p-2 transform transition-transform duration-500 hover:scale-105">
                                <img
                                    src="https://www.vvslagos.com/assets/VVSMASCOT7.png"
                                    alt="VVS Mascot Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Orbiting Ring of Avatars */}
                            {introSlide === 1 && (
                                <div className="absolute inset-0 w-full h-full animate-orbit-container pointer-events-none">
                                    {AVATARS.map((url, index) => {
                                        const angle = (index * 360) / AVATARS.length;
                                        return (
                                            <div
                                                key={index}
                                                className="absolute w-10 h-10 rounded-xl bg-white border border-black/5 shadow-md overflow-hidden p-0.5"
                                                style={{
                                                    top: "calc(50% - 20px)",
                                                    left: "calc(50% - 20px)",
                                                    transform: `rotate(${angle}deg) translate(95px) rotate(-${angle}deg)`,
                                                }}
                                            >
                                                <div className="w-full h-full rounded-lg overflow-hidden animate-counter-rotate">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Collaborate Page Visuals: Connecting lines & paired positions */}
                            {introSlide === 2 && (
                                <div className="absolute inset-0 w-full h-full pointer-events-none">
                                    {AVATARS.map((url, index) => {
                                        // Position them clustered into pairs connecting to center
                                        const angle = (index * 360) / AVATARS.length;
                                        const dist = 75; // closer to center indicating collaboration
                                        return (
                                            <div key={index} className="absolute inset-0 w-full h-full flex items-center justify-center">
                                                {/* Connection Link line */}
                                                <div 
                                                    className="absolute h-[2px] bg-dashed bg-vvs-gold/45 origin-left"
                                                    style={{
                                                        width: `${dist}px`,
                                                        transform: `rotate(${angle}deg) translateX(12px)`,
                                                    }}
                                                />
                                                <div
                                                    className="absolute w-10 h-10 rounded-xl bg-white border border-black/10 shadow-lg overflow-hidden p-0.5 animate-float-slow"
                                                    style={{
                                                        transform: `rotate(${angle}deg) translate(${dist}px) rotate(-${angle}deg)`,
                                                        animationDelay: `${index * 0.4}s`
                                                    }}
                                                >
                                                    <img src={url} alt="" className="w-full h-full rounded-lg object-cover" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Stay Connected Visuals: Mini ticket passes floating around */}
                            {introSlide === 3 && (
                                <div className="absolute inset-0 w-full h-full pointer-events-none">
                                    {AVATARS.map((url, index) => {
                                        const angle = (index * 360) / AVATARS.length;
                                        const dist = 90;
                                        return (
                                            <div key={index} className="absolute inset-0 w-full h-full flex items-center justify-center">
                                                <div
                                                    className="absolute w-12 h-8 rounded-lg bg-white border-2 border-dashed border-vvs-gold/30 shadow-md flex items-center justify-center p-1 animate-float-slow"
                                                    style={{
                                                        transform: `rotate(${angle}deg) translate(${dist}px) rotate(-${angle}deg) rotate(15deg)`,
                                                        animationDelay: `${index * 0.5}s`
                                                    }}
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-vvs-gold absolute -left-1" />
                                                    <img src={url} alt="" className="w-6 h-6 rounded-md object-cover" />
                                                    <div className="w-2 h-2 rounded-full bg-vvs-gold absolute -right-1" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Title and Descriptions */}
                        <div className="space-y-3 px-4">
                            {introSlide === 1 && (
                                <>
                                    <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                        Discover
                                    </h1>
                                    <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                        Discover grants and opportunities exclusive to community members only.
                                    </p>
                                </>
                            )}
                            {introSlide === 2 && (
                                <>
                                    <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                        Collaborate
                                    </h1>
                                    <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                        Collaborate with other creatives who need your skills.
                                    </p>
                                </>
                            )}
                            {introSlide === 3 && (
                                <>
                                    <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                        Stay Connected
                                    </h1>
                                    <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                        stay Connected, Attend Events, Enter Contests and Win prizes.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 px-4 space-y-3">
                            <button
                                onClick={() => {
                                    if (introSlide < 3) {
                                        setIntroSlide((s) => (s + 1) as 1 | 2 | 3);
                                    } else {
                                        setShowIntro(false);
                                        setStep(2);
                                    }
                                }}
                                className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide shadow-md cursor-pointer text-center"
                            >
                                {introSlide === 3 ? "Get Started" : "Next"}
                            </button>
                        </div>
                    </div>
                )}

                {!showIntro && step === 2 && (
                    <div className="space-y-6 text-left">
                        <div>
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider">Profile Info</span>
                            <h2 className="text-3xl font-bold tracking-tight text-vvs-black mt-1 font-serif">Let's get to know you</h2>
                            <p className="text-vvs-black/60 text-xs mt-1">Provide your professional credentials to build digital status.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Bio / Narrative</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all resize-none"
                                    placeholder="Synthesizing fashion design and 3D textures in Accra..."
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Creative Profession</label>
                                <input
                                    type="text"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                                    placeholder="e.g. Editorial Director, 3D Animator"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-vvs-black/70">Core Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 transition-all appearance-none"
                                >
                                    <option value="" className="text-vvs-black/40">Select a discipline</option>
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
                                    Skills (comma-separated tags)
                                </label>
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                                    placeholder="e.g. Styling, Creative Direction, Blender"
                                />
                            </div>

                            <button
                                onClick={handleProfileSubmit}
                                disabled={loading || !bio || !profession || !category}
                                className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide disabled:opacity-30 disabled:pointer-events-none cursor-pointer mt-4"
                            >
                                {loading ? "Updating Info..." : "Proceed"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-left">
                        <div>
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider">Primary Path</span>
                            <h2 className="text-3xl font-bold tracking-tight text-vvs-black mt-1 font-serif">What is your primary goal?</h2>
                            <p className="text-vvs-black/60 text-xs mt-1">Configure your primary mode of engagement inside the ecosystem.</p>
                        </div>

                        <div className="space-y-3">
                            {([
                                { value: "hire", label: "Commission Creatives", desc: "Source, contract, and pay verified African professionals via CoraPay." },
                                { value: "offer", label: "Offer Services", desc: "Showcase your portfolio, submit pitches to briefs, and earn secure payouts." },
                                { value: "both", label: "Hybrid Access", desc: "Simultaneously hire creative talent and list professional services." },
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
                            Proceed
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-6 space-y-6 text-left">
                        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-vvs-gold/10 border border-vvs-gold/30 text-vvs-gold text-3xl">
                            ✓
                        </div>
                        
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-vvs-gold uppercase tracking-wider block">Credentials Approved</span>
                            <h2 className="text-3xl font-bold tracking-tight mt-1 text-vvs-black font-serif">Setup Complete!</h2>
                            <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                {intent === "hire"
                                    ? "Account configured for high-level creative recruitment. Discover professionals and manage campaign opportunities."
                                    : "Account configured. Proceed to verification to activate your professional creator profile and listings."}
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl border border-black/5 bg-white flex items-center justify-between text-left">
                            <div>
                                <div className="text-[10px] text-vvs-black/50 font-bold uppercase tracking-wider">Initial Reputation</div>
                                <div className="text-xl font-bold text-vvs-gold mt-0.5">250 XP</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-vvs-black/50 font-bold uppercase tracking-wider">Discipline Streak</div>
                                <div className="text-sm font-bold text-vvs-black mt-0.5">🔥 1 DAY</div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide cursor-pointer shadow-md"
                        >
                            {intent === "hire" ? "Enter Discovery" : "Start Identity Verification"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
