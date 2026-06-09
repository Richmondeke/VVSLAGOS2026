"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const timelineData = [
    {
        year: "2022",
        title: "THE DEBUT",
        theme: "The Debut",
        venue: "THE GOOD BEACH",
        description: "The inauguration of a vision. A statement of intent for the Lagos creative community.",
        image: "/assets/evolution/VVS2022.png",
    },
    {
        year: "2023",
        title: "VVS 2023",
        theme: "The Luxury of Authenticity and Collaboration",
        venue: "WINGS TOWERS VI",
        description: "Exploring the fusion of digital innovation and traditional African narratives.",
        image: "/assets/evolution/VVS2023.png",
    },
    {
        year: "2024",
        title: "VVS 2024",
        theme: "The Luxury of Authenticity",
        venue: "Alliance Française de Lagos, John Randle Museum",
        description: "A deep dive into what makes African luxury unique: heritage, partnership, and truth.",
        image: "/assets/evolution/VVS2024.png",
    },
    {
        year: "2025",
        title: "VVS 2025",
        theme: "Este Fuego",
        venue: "Nahouse · British Council · Alliance Française · John Randle Museum",
        description: "The fire within. A cross-cultural explosion across multiple iconic Lagos venues.",
        image: "/assets/evolution/VVS20255.png",
    },
];

export default function Journey() {
    const [current, setCurrent] = useState(0);

    const item = timelineData[current];

    return (
        <section id="journey" className="py-20 md:py-32 bg-vvs-black relative overflow-hidden">
            {/* Decorative mascot watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none overflow-hidden">
                <img src="/assets/VVSMASCOT3.webp" alt="" className="h-[120%] object-contain rotate-12" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                {/* Header */}
                <div className="mb-10 md:mb-14">
                    <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                        VVS JOURNEY
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-vvs-white">
                        THE <span className="text-vvs-gold">EVOLUTION</span>
                    </h2>
                </div>

                {/* Year tab buttons */}
                <div className="flex items-center gap-2 sm:gap-3 mb-8 md:mb-12 flex-wrap">
                    {timelineData.map((entry, i) => (
                        <button
                            key={entry.year}
                            onClick={() => setCurrent(i)}
                            className={`relative px-4 sm:px-6 py-2 rounded-full font-mono font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 border ${i === current
                                ? "bg-vvs-gold text-vvs-black border-vvs-gold shadow-[0_0_24px_rgba(193,155,75,0.35)]"
                                : "bg-transparent text-vvs-white/50 border-vvs-white/15 hover:border-vvs-gold/40 hover:text-vvs-white"
                                }`}
                        >
                            {entry.year}
                            {i === current && (
                                <motion.span
                                    layoutId="year-pill"
                                    className="absolute inset-0 rounded-full bg-vvs-gold -z-10"
                                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Animated card */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -18 }}
                            transition={{ duration: 0.38, ease: "easeOut" }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
                        >
                            {/* Left Side: Content */}
                            <div className="flex flex-col gap-6">
                                <div className="flex-1 min-w-0">
                                    <p className="text-vvs-gold text-xs uppercase tracking-[0.4em] font-mono font-bold mb-2">
                                        {item.title}
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-vvs-white uppercase tracking-tight mb-3 break-words">
                                        {item.theme}
                                    </h3>
                                    <p className="text-vvs-gold/60 text-[10px] sm:text-xs uppercase tracking-widest mb-4 font-mono break-words">
                                        {item.venue}
                                    </p>
                                    <p className="text-vvs-white/60 text-sm md:text-base leading-relaxed font-light max-w-xl">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Prev / Next nav */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                                        disabled={current === 0}
                                        className="w-10 h-10 rounded-full border border-vvs-gold/30 flex items-center justify-center text-vvs-gold/70 hover:border-vvs-gold hover:text-vvs-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setCurrent((p) => Math.min(timelineData.length - 1, p + 1))}
                                        disabled={current === timelineData.length - 1}
                                        className="w-10 h-10 rounded-full border border-vvs-gold/30 flex items-center justify-center text-vvs-gold/70 hover:border-vvs-gold hover:text-vvs-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        →
                                    </button>
                                    <span className="text-vvs-white/30 font-mono text-xs uppercase tracking-widest">
                                        {String(current + 1).padStart(2, "0")} / {String(timelineData.length).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>

                            {/* Right Side: Image */}
                            <div className="relative group flex justify-center lg:justify-end">
                                <div className="absolute -inset-4 bg-vvs-gold/10 rounded-2xl blur-3xl group-hover:bg-vvs-gold/20 transition-all duration-700"></div>
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-full">
                                    <motion.img
                                        key={item.image}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        src={item.image}
                                        alt={`${item.year} Evolution`}
                                        className="w-full h-auto max-h-[70vh] object-contain block"
                                    />
                                    {/* Overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-vvs-black/40 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-4 right-6 pointer-events-none">
                                        <span className="text-[60px] leading-none font-mono font-extrabold text-vvs-gold/10 select-none">
                                            {item.year}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="mt-10 md:mt-14 h-[1px] bg-vvs-white/10 relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-vvs-gold"
                        animate={{ width: `${((current + 1) / timelineData.length) * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>
        </section>
    );
}
