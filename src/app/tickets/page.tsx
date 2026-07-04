"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Ticket } from "lucide-react";
import Footer from "@/components/layout/Footer";

const TICKET_URL = "https://www.pv.rsvp/vvs-fashion-show";

const innovators = [
    { name: "IN OFFICIAL", category: "STREETWEAR ARCHIVE", image: "/assets/IN OFFICIAL.png" },
    { name: "HERTUNBA", category: "QUIET LUXURY / COUTURE", image: "/assets/HERTUNBA.avif" },
    { name: "LFJ OFFICIAL", category: "AVANT-GARDE / WEARABLE ART", image: "/assets/LFJ OFFICIAL.webp" },
    { name: "TJ-WHO", category: "CONTEMPORARY TAILORING", image: "/assets/TJ WHO.webp" },
    { name: "PIECE ET PATCH", category: "UPCYCLED STREETWEAR", image: "/assets/PIECE ET PATCH.webp" },
    { name: "FRUCHÉ", category: "AFROPOLITAN MODERNISM", image: "/assets/FRUCHE.webp" },
    { name: "ONALAJA", category: "HIGH CRAFT / BEADING", image: "/assets/ONALAJA.webp" },
    { name: "RE LAGOS", category: "SUSTAINABLE HERITAGE", image: "/assets/RE LAGOS.webp" },
    { name: "TOKYO JAMES", category: "MENSWEAR / AVANT-GARDE", image: "/assets/TOKYO JAMEs.webp" },
    { name: "I AM ISIGO", category: "ETHICAL / WEARABLE ART", image: "/assets/IAM ISIGO.webp" },
    { name: "TZAR STUDIOS", category: "PREMIUM CASUALWEAR", image: "/assets/TZAR STUDIOS.webp" }
];

export default function TicketsPage() {
    return (
        <div className="bg-black text-white min-h-screen relative font-sans selection:bg-[#c5a059]/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-black to-[#0a0a0a]" />
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#c5a059]/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <img 
                        src="/assets/VVSWhiteMAsk.png" 
                        alt="VVS Mask" 
                        className="w-32 h-32 md:w-40 md:h-40 object-contain opacity-85 hover:opacity-100 transition-opacity duration-300"
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter mb-6 max-w-4xl leading-none"
                >
                    VVS RUNWAY <span className="text-[#c5a059]">2026</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-white/60 text-sm sm:text-base md:text-lg font-light max-w-2xl leading-relaxed mb-10"
                >
                    The main fashion runway showcase of VVS Lagos 2026. Afromodernist haute couture collections designed by our selected Innovators, presented under the iconic Falomo bridge structure in a raw, concrete architectural setting.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <a
                        href={TICKET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-[#c5a059] text-black text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white transition-all transform hover:scale-[1.02] shadow-[0_0_25px_rgba(197,160,89,0.35)] flex items-center gap-2"
                    >
                        <Ticket size={14} /> Get Runway Tickets
                    </a>
                </motion.div>
            </div>

            {/* Innovators Section */}
            <div className="relative z-10 py-20 border-t border-white/10 bg-black/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#c5a059] text-xs font-mono tracking-widest font-bold uppercase block mb-2">The Lineup</span>
                        <h2 className="text-2xl sm:text-4xl font-extrabold uppercase">VVS Innovator Collective</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {innovators.map((inv, idx) => (
                            <div 
                                key={idx}
                                className="group rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] hover:border-[#c5a059]/40 transition-all duration-500 flex flex-col"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                                    <img 
                                        src={inv.image} 
                                        alt={inv.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                                </div>
                                <div className="p-6 flex flex-col justify-end flex-grow border-t border-white/5">
                                    <span className="text-[#c5a059] text-[10px] font-mono uppercase tracking-widest block mb-1">{inv.category}</span>
                                    <h3 className="text-lg font-bold uppercase tracking-tight text-white">{inv.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 border-t border-white/10 bg-black">
                <Footer />
            </div>
        </div>
    );
}
