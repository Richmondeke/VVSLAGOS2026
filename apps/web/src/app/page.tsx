"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ThemeLogo from "@/components/theme-logo";

export default function LandingPage() {
    const router = useRouter();
    const [preloading, setPreloading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [activeMask, setActiveMask] = useState<"white" | "black">("white");

    const [loading, setLoading] = useState(false);
    const [splitActive, setSplitActive] = useState(false);

    // Initial preloader progress simulation
    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        setPreloading(false);
                    }, 800);
                    return 100;
                }
                const increment = Math.floor(Math.random() * 6) + 3;
                return Math.min(prev + increment, 100);
            });
        }, 65);

        return () => clearInterval(progressInterval);
    }, []);

    // Alternating mask icon interval
    useEffect(() => {
        const maskInterval = setInterval(() => {
            setActiveMask((prev) => (prev === "white" ? "black" : "white"));
        }, 700);

        return () => clearInterval(maskInterval);
    }, []);

    const handleEnterApp = () => {
        setLoading(true);
        // Step 1: Wait for soft zoom transition to finish (800ms)
        // Step 2: Trigger double door split slide animations (at 950ms)
        // Step 3: Trigger router navigation (at 1450ms)
        setTimeout(() => {
            setSplitActive(true);
        }, 950);
        setTimeout(() => {
            router.push("/intro");
        }, 1450);
    };

    return (
        <div className="relative min-h-screen bg-[#F9F6EE] text-vvs-black">
            
            {/* 1. Initial Preloader Screen (Alternating Mask Transition) */}
            <AnimatePresence>
                {preloading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed inset-0 z-[1000] bg-[#0A0A0A] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
                    >
                        <div />

                        {/* Central Alternating Masks */}
                        <div className="relative w-full max-w-lg flex flex-col items-center justify-center flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeMask}
                                    src={activeMask === "white" ? "/VVSwhitemask.png" : "/VVSMASKBLACK.png"}
                                    alt="VVS Mask"
                                    initial={{ x: 70, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -70, opacity: 0 }}
                                    transition={{ duration: 0.45, ease: "easeInOut" }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_12px_24px_rgba(197,160,89,0.2)]"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Loading progress bar & percentage */}
                        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                            <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#c5a059]" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                            <span className="font-mono text-[10px] tracking-widest text-[#c5a059] font-bold">{progress} %</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Transition Overlay (Double-door Split Screen on entry) */}
            {loading && (
                <div className="fixed inset-0 z-50 overflow-hidden flex bg-[#F9F6EE] text-vvs-black">
                    {/* Left Panel */}
                    <div className={`w-1/2 h-full bg-[#F9F6EE] flex items-center justify-end relative overflow-hidden transition-transform ${splitActive ? "animate-split-left" : ""}`}>
                        {/* Centered logo container split part */}
                        <div className="absolute right-0 translate-x-1/2 w-48 h-48 flex items-center justify-center p-4">
                            <div className={`w-24 h-24 rounded-full border border-vvs-gold/30 bg-white p-1 shadow-md flex items-center justify-center animate-soft-zoom ${splitActive ? "animate-fade-out-content" : ""}`}>
                                <img src="/VVSMASKBLACK.png" alt="" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className={`w-1/2 h-full bg-[#F9F6EE] flex items-center justify-start relative overflow-hidden transition-transform ${splitActive ? "animate-split-right" : ""}`}>
                        {/* Centered logo container split part */}
                        <div className="absolute left-0 -translate-x-1/2 w-48 h-48 flex items-center justify-center p-4">
                            <div className={`w-24 h-24 rounded-full border border-vvs-gold/30 bg-white p-1 shadow-md flex items-center justify-center animate-soft-zoom ${splitActive ? "animate-fade-out-content" : ""}`}>
                                <img src="/VVSMASKBLACK.png" alt="" className="w-full h-full object-contain invisible" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Main Landing Page Content */}
            <div className="min-h-screen flex flex-col items-center justify-between p-6 md:p-10 font-sans pb-16">
                {/* Top Logo */}
                <div className="w-full max-w-md flex items-center justify-center pt-8">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-vvs-gold/25 p-0.5 bg-white shadow-sm">
                            <ThemeLogo forceTheme="light" />
                        </div>
                        <span className="text-[10px] text-vvs-gold tracking-widest font-extrabold uppercase">VVS Lagos</span>
                    </div>
                </div>

                {/* Hero Main Content */}
                <div className="w-full max-w-md space-y-6 text-left py-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-vvs-black font-serif">
                        Connect with creators
                    </h1>
                    <p className="text-vvs-black/60 text-sm leading-relaxed">
                        Access design briefs, find castings, and collaborate with creative minds across the continent.
                    </p>
                    
                    {/* Features Section */}
                    <div className="pt-4 space-y-4">
                        <div className="border-t border-black/5 pt-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-vvs-black/40 mb-3">What we offer</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">💼</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-vvs-black">Creative Jobs</h4>
                                        <p className="text-xs text-vvs-black/60">Find styling, directing, design, and production opportunities.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">🤝</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-vvs-black">Direct Collaboration</h4>
                                        <p className="text-xs text-vvs-black/60">Match with like-minded creators to build events and runway collections.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-lg">🔒</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-vvs-black">Secure Payments</h4>
                                        <p className="text-xs text-vvs-black/60">Get paid safely and easily for listings and contracts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleEnterApp}
                            className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide shadow-md cursor-pointer text-center"
                        >
                            Enter App
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full max-w-md text-center text-[10px] text-vvs-black/40 uppercase tracking-widest pt-4">
                    © 2026 VVS Lagos. All rights reserved.
                </div>
            </div>
        </div>
    );
}

