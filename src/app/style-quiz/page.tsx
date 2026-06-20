"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import QuizFlow from "@/components/quiz/QuizFlow";

export default function StyleQuizPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
            <style>{`
                @keyframes glitch {
                    0% {
                        transform: translate(0);
                        clip-path: inset(0 0 0 0);
                    }
                    5% {
                        transform: translate(-3px, -2px) skewX(4deg);
                        clip-path: inset(12% 0 25% 0);
                    }
                    10% {
                        transform: translate(2px, 3px) skewX(-4deg);
                        clip-path: inset(35% 0 15% 0);
                    }
                    15% {
                        transform: translate(-2px, 1px);
                        clip-path: inset(5% 0 75% 0);
                    }
                    20% {
                        transform: translate(3px, -2px) skewX(2deg);
                        clip-path: inset(55% 0 8% 0);
                    }
                    25% {
                        transform: translate(0);
                        clip-path: inset(0 0 0 0);
                    }
                    100% {
                        transform: translate(0);
                        clip-path: inset(0 0 0 0);
                    }
                }

                @keyframes rgb-split-left {
                    0%, 100% { transform: translate(0); opacity: 0; }
                    8% { transform: translate(-4px, 2px); opacity: 0.7; }
                    12% { transform: translate(3px, -1px); opacity: 0.5; }
                    18% { transform: translate(-2px, 3px); opacity: 0.8; }
                    22% { transform: translate(0); opacity: 0; }
                }

                @keyframes rgb-split-right {
                    0%, 100% { transform: translate(0); opacity: 0; }
                    5% { transform: translate(4px, -3px); opacity: 0.6; }
                    14% { transform: translate(-3px, 2px); opacity: 0.8; }
                    20% { transform: translate(2px, -2px); opacity: 0.5; }
                    24% { transform: translate(0); opacity: 0; }
                }

                .glitch-img {
                    animation: glitch 4s infinite steps(2, start) alternate;
                }
                .glitch-split-cyan {
                    animation: rgb-split-left 4s infinite steps(2, start) alternate;
                    filter: hue-rotate(180deg) saturate(3);
                }
                .glitch-split-magenta {
                    animation: rgb-split-right 4s infinite steps(2, start) alternate;
                    filter: hue-rotate(300deg) saturate(3);
                }
            `}</style>

            {/* Top Fixed Premium Navbar */}
            <nav className="fixed top-0 left-0 w-full z-[100] py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
                    
                    {/* Left Navigation Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        <a href="/#about" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-[#c5a059] transition-colors">About</a>
                        <a href="/#schedule" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-[#c5a059] transition-colors">Schedule</a>
                        <a href="/#countdown" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-[#c5a059] transition-colors">Kickoff</a>
                        <a href="/#calendar" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-[#c5a059] transition-colors">Events</a>
                    </div>

                    {/* Center Logo - Glitching Mask */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <a 
                            href="/"
                            className="flex items-center justify-center w-14 h-14 relative group cursor-pointer"
                        >
                            <img src="/assets/VVSWhiteMAsk.png" alt="" className="absolute w-10 h-10 object-contain glitch-split-cyan opacity-40 group-hover:opacity-75 transition-opacity" />
                            <img src="/assets/VVSWhiteMAsk.png" alt="" className="absolute w-10 h-10 object-contain glitch-split-magenta opacity-40 group-hover:opacity-75 transition-opacity" />
                            <img src="/assets/VVSWhiteMAsk.png" alt="VVS Mask Logo" className="w-10 h-10 object-contain glitch-img group-hover:scale-110 transition-transform duration-300" />
                        </a>
                    </div>

                    {/* Right Navigation Links & Controls */}
                    <div className="flex items-center gap-4 ml-auto lg:ml-0">
                        <a href="/" className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#c5a059] hover:text-white transition-colors">Home</a>
                        <button
                            onClick={() => { window.location.href = "/#rsvp"; }}
                            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-extrabold bg-white text-black hover:bg-[#c5a059] hover:text-white transition-all shadow-md active:scale-95"
                        >
                            RSVP NOW
                        </button>
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-white"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Top Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[99] bg-black/95 flex flex-col justify-center items-center gap-8 text-center pt-20">
                    <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.25em] font-bold text-white hover:text-[#c5a059] transition-colors">About</a>
                    <a href="/#schedule" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.25em] font-bold text-white hover:text-[#c5a059] transition-colors">Schedule</a>
                    <a href="/#countdown" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.25em] font-bold text-white hover:text-[#c5a059] transition-colors">Kickoff</a>
                    <a href="/#calendar" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-[0.25em] font-bold text-white hover:text-[#c5a059] transition-colors">Events</a>
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            window.location.href = "/#rsvp";
                        }}
                        className="px-8 py-3 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-xs rounded-full"
                    >
                        RSVP NOW
                    </button>
                </div>
            )}

            {/* Content Container */}
            <div className="pt-20">
                <QuizFlow />
            </div>
        </main>
    );
}
