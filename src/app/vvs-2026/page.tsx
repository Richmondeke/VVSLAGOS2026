"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { triggerHaptic } from "@/utils/haptic";

export default function VVS2026Page() {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans transition-colors duration-700">
            
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-4 ${
                scrolled ? "bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
                    <div className="flex items-center gap-4">
                        <Link href="/" onClick={() => triggerHaptic("light")} className="text-white hover:text-[#c5a059] transition-colors flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold">
                            <ArrowLeft size={16} /> Back
                        </Link>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Link href="/">
                            <img src="/assets/VVSWhiteMAsk.png" alt="VVS Logo" className="w-12 h-12 object-contain hover:scale-110 transition-transform duration-500" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-extrabold transition-all shadow-md active:scale-95 bg-white text-black hover:bg-[#c5a059] hover:text-white hidden md:block">
                            Secure Access
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-[72px] inset-x-0 z-[90] md:hidden p-6 border-b bg-black/95 border-white/10 text-white flex flex-col gap-4"
                    >
                        <Link href="/" className="text-[12px] uppercase tracking-[0.2em] font-bold py-2 border-b border-white/5">Home</Link>
                        <button className="w-full text-left text-[12px] uppercase tracking-[0.2em] font-bold py-2 border-b border-white/5">Schedule</button>
                        <button className="w-full text-left text-[12px] uppercase tracking-[0.2em] font-bold py-2 border-b border-white/5">Get Access</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <main className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
                {/* Background Video / Graphic */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
                    <img src="/assets/IN OFFICIAL.png" alt="VVS 2026 Background" className="w-full h-full object-cover grayscale opacity-30" />
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-[#c5a059] font-mono text-xs md:text-sm uppercase tracking-[0.4em] mb-6 font-bold">
                            The 5th Anniversary
                        </p>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-none mb-6 text-balance"
                    >
                        VVS <span className="text-transparent stroke-text" style={{ WebkitTextStroke: "2px white", color: "transparent" }}>LAGOS</span> 2026
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="bg-black/40 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl mt-12 w-full max-w-3xl"
                    >
                        <h2 className="text-[#c5a059] text-xl md:text-2xl font-bold uppercase tracking-widest mb-4">
                            Theme: Afromodernism
                        </h2>
                        <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed mb-8">
                            Celebrating Modern African Innovation. A conscious reconstruction of our identity, merging high luxury with digital frontier technologies and ancestral roots.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-white text-black font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-[#c5a059] hover:text-white transition-all">
                                Secure Tickets
                            </button>
                            <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all">
                                View Schedule
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>

        </div>
    );
}
