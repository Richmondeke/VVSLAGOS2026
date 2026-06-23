"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { designers } from "../sections/Designers";
import * as htmlToImage from "html-to-image";
import { triggerHaptic } from "@/utils/haptic";

// Style twins — just names, no photos
const ALL_STYLE_TWINS = [
    "Bloody Civilian",
    "Adebayo Oke-Lawal",
    "Ashley Okoli",
    "Fade Ogunro",
    "Ehis D'Enero",
    "Fisayo Longe",
    "Denola Grey",
    "Osas Ighodaro",
];

import type { AIStyleData } from "./QuizFlow";

// ── 10 Archetype definitions ──
const ARCHETYPE_MAP: Record<string, {
    title: string;
    type: string;
    color: string;
    brands: string[];
    tagline: string;
}> = {
    FUTURIST: {
        title: "You are a Futurist",
        type: "FUTURIST",
        color: "#c5a059",
        brands: ["LFJ OFFICIAL", "TJ-WHO", "PIECE ET PATCH"],
        tagline: "Sleek · Experimental · Tech-Inspired",
    },
    STREETWEAR: {
        title: "You are Streetwear",
        type: "STREETWEAR",
        color: "#e74c3c",
        brands: ["TOKYO JAMES", "TZAR STUDIOS", "PIECE ET PATCH"],
        tagline: "Urban · Casual · Sneaker-Focused",
    },
    MINIMALIST: {
        title: "You are a Minimalist",
        type: "MINIMALIST",
        color: "#95a5a6",
        brands: ["HERTUNBA", "RE LAGOS", "TZAR STUDIOS"],
        tagline: "Clean Lines · Neutral · Understated",
    },
    VINTAGE: {
        title: "You are Vintage",
        type: "VINTAGE",
        color: "#d4a574",
        brands: ["RE LAGOS", "IN OFFICIAL", "FRUCHÉ"],
        tagline: "Retro-Inspired · Nostalgic · Timeless",
    },
    FORMAL: {
        title: "You are Formal",
        type: "FORMAL",
        color: "#2c3e50",
        brands: ["HERTUNBA", "FRUCHÉ", "ONALAJA"],
        tagline: "Refined · Polished · Traditional",
    },
    CASUAL: {
        title: "You are Casual",
        type: "CASUAL",
        color: "#27ae60",
        brands: ["RE LAGOS", "TZAR STUDIOS", "IN OFFICIAL"],
        tagline: "Relaxed · Everyday · Effortless",
    },
    ATHLEISURE: {
        title: "You are Athleisure",
        type: "ATHLEISURE",
        color: "#3498db",
        brands: ["TOKYO JAMES", "LFJ OFFICIAL", "PIECE ET PATCH"],
        tagline: "Sporty · Functional · Comfort-Focused",
    },
    BOHEMIAN: {
        title: "You are Bohemian",
        type: "BOHEMIAN",
        color: "#e67e22",
        brands: ["I AM ISIGO", "IN OFFICIAL", "FRUCHÉ"],
        tagline: "Eclectic · Free-Spirited · Textured",
    },
    LUXURY: {
        title: "You are Luxury",
        type: "LUXURY",
        color: "#c5a059",
        brands: ["HERTUNBA", "FRUCHÉ", "ONALAJA", "TOKYO JAMES"],
        tagline: "Premium · Designer · High-End",
    },
    AVANT_GARDE: {
        title: "You are Avant-Garde",
        type: "AVANT-GARDE",
        color: "#9b59b6",
        brands: ["TJ-WHO", "PIECE ET PATCH", "I AM ISIGO", "LFJ OFFICIAL"],
        tagline: "Artistic · Unconventional · Bold",
    },
};

interface QuizResultsProps {
    aiData: AIStyleData;
}

export default function QuizResults({ aiData }: QuizResultsProps) {
    const [storyIndex, setStoryIndex] = useState(0);
    const summaryCardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const archetype = useMemo(() => {
        const type = (aiData.archetype || "STREETWEAR").toUpperCase().replace(/-/g, "_");
        const match = ARCHETYPE_MAP[type] || ARCHETYPE_MAP.STREETWEAR;
        return { ...match, desc: aiData.reading };
    }, [aiData]);

    // Pick 3 style twins
    const styleTwins = useMemo(() => {
        return [...ALL_STYLE_TWINS].sort(() => 0.5 - Math.random()).slice(0, 3);
    }, []);

    // Get brand list details from Designers data
    const matchedBrands = useMemo(() => {
        return designers.filter(d => archetype.brands.includes(d.name.toUpperCase()) || archetype.brands.includes(d.name));
    }, [archetype]);

    const STORIES_COUNT = 4;
    const STORY_DURATION = 7500;

    // Auto-advance stories
    useEffect(() => {
        if (storyIndex !== 1 && storyIndex < STORIES_COUNT - 1) {
            const timer = setTimeout(() => {
                setStoryIndex(p => p + 1);
            }, STORY_DURATION);
            return () => clearTimeout(timer);
        }
    }, [storyIndex]);

    const handleScreenTap = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;

        if (storyIndex === 1) return;

        if (clickX < width * 0.3 && storyIndex > 0) {
            triggerHaptic("light");
            setStoryIndex(p => p - 1);
        } else if (clickX >= width * 0.3 && storyIndex < STORIES_COUNT - 1) {
            triggerHaptic("light");
            setStoryIndex(p => p + 1);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!summaryCardRef.current) return;
        triggerHaptic("medium");
        setIsDownloading(true);
        try {
            await htmlToImage.toPng(summaryCardRef.current, { skipFonts: true, pixelRatio: 3, backgroundColor: "#111111" });
            const dataUrl = await htmlToImage.toPng(summaryCardRef.current, { skipFonts: true, pixelRatio: 3, backgroundColor: "#111111" });
            const link = document.createElement("a");
            link.download = `VVS-${archetype.type}-Match.png`;
            link.href = dataUrl;
            link.click();
            triggerHaptic("success");
        } catch (err) {
            console.error("Download error:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-black flex items-center justify-center p-0">
            <div
                onClick={handleScreenTap}
                className="relative w-full max-w-[420px] aspect-[9/16] bg-black overflow-hidden mx-auto cursor-pointer select-none"
            >
                {/* Progress bars */}
                <div className="absolute top-2 left-3 right-3 z-30 flex gap-1">
                    {Array.from({ length: STORIES_COUNT }).map((_, i) => (
                        <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: archetype.color }}
                                initial={{ width: "0%" }}
                                animate={{
                                    width: i < storyIndex ? "100%" : i === storyIndex ? "100%" : "0%",
                                }}
                                transition={
                                    i === storyIndex
                                        ? { duration: STORY_DURATION / 1000, ease: "linear" }
                                        : { duration: 0.2 }
                                }
                            />
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ─────────────── SLIDE 0: Archetype Reveal ─────────────── */}
                    {storyIndex === 0 && (
                        <motion.div
                            key="s0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10"
                        >
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40 mb-4"
                            >
                                Your Style Archetype
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
                                className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-center mb-3"
                                style={{ color: archetype.color }}
                            >
                                {archetype.type}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 mb-8"
                            >
                                {archetype.tagline}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="text-sm text-white/70 text-center leading-relaxed max-w-xs italic"
                            >
                                &ldquo;{archetype.desc}&rdquo;
                            </motion.p>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 1: Brand Matches ─────────────── */}
                    {storyIndex === 1 && (
                        <motion.div
                            key="s1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic("light");
                                setStoryIndex(2);
                            }}
                        >
                            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40 mb-6">
                                Matched Brands
                            </p>
                            <div className="flex flex-col items-center gap-4">
                                {matchedBrands.length > 0
                                    ? matchedBrands.map((brand, i) => (
                                        <motion.div
                                            key={brand.name}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.2 }}
                                            className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-xl border border-white/10"
                                        >
                                            {brand.image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={brand.image} alt={brand.name} className="w-12 h-12 rounded-lg object-cover" />
                                            )}
                                            <div>
                                                <p className="text-white font-bold text-sm uppercase tracking-wide">{brand.name}</p>
                                                {brand.tagline && <p className="text-white/40 text-[10px]">{brand.tagline}</p>}
                                            </div>
                                        </motion.div>
                                    ))
                                    : archetype.brands.map((name, i) => (
                                        <motion.div
                                            key={name}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.2 }}
                                            className="px-6 py-3 bg-white/5 rounded-xl border border-white/10"
                                        >
                                            <p className="text-white font-bold text-sm uppercase tracking-wider">{name}</p>
                                        </motion.div>
                                    ))}
                            </div>
                            <p className="text-white/20 text-[9px] mt-8 font-mono uppercase tracking-widest">Tap to continue</p>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 2: Style Twins ─────────────── */}
                    {storyIndex === 2 && (
                        <motion.div
                            key="s2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10"
                        >
                            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40 mb-6">
                                Your Influencer Twins
                            </p>
                            <div className="flex flex-col items-center gap-5">
                                {styleTwins.map((twin, i) => (
                                    <motion.div
                                        key={twin}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.3 }}
                                    >
                                        <span className="block text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
                                            {twin}
                                        </span>
                                        {i < styleTwins.length - 1 && (
                                            <div className="mt-3 w-8 h-[1px] bg-white/20 mx-auto" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 3: Summary Card (Report Card Style) ─────────────── */}
                    {storyIndex === 3 && (
                        <motion.div
                            key="s3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-3 z-10 bg-black"
                        >
                            {/* Report Card */}
                            <div
                                ref={summaryCardRef}
                                className="relative w-full aspect-[9/16] bg-[#111111] overflow-hidden flex flex-col border border-[#c5a059]/30 rounded-2xl"
                            >
                                {/* Gold header bar with mascot logo */}
                                <div className="w-full bg-[#c5a059] px-5 py-3 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/assets/VVSWhiteMAsk.png"
                                            alt="VVS Logo"
                                            className="w-7 h-7 object-contain"
                                            style={{ filter: "brightness(0)" }}
                                        />
                                        <p className="text-[9px] font-mono text-black/70 uppercase tracking-[0.25em] font-bold">
                                            VVS Lagos &apos;26
                                        </p>
                                    </div>
                                    <p className="text-[9px] font-mono text-black/70 uppercase tracking-[0.25em] font-bold">
                                        Style Report
                                    </p>
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col px-5 pt-5 pb-4 gap-0">
                                    {/* ID Photo + Archetype Header */}
                                    <div className="flex items-start gap-4 mb-5">
                                        {/* ID-style user photo */}
                                        <div className="w-[90px] h-[110px] rounded-lg overflow-hidden border-2 border-[#c5a059]/40 bg-white/5 flex-shrink-0">
                                            {aiData.userImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={aiData.userImage}
                                                    alt="Your style"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px] font-mono uppercase">
                                                    No Photo
                                                </div>
                                            )}
                                        </div>

                                        {/* Archetype info */}
                                        <div className="flex-1 pt-1">
                                            <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#c5a059]/70 mb-1">
                                                Archetype Match
                                            </p>
                                            <h2 className="text-2xl font-extrabold uppercase leading-tight" style={{ color: archetype.color }}>
                                                {archetype.type}
                                            </h2>
                                            <p className="text-[9px] text-white/40 font-mono mt-1 uppercase tracking-wider">
                                                {archetype.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-[1px] bg-white/10 mb-4" />

                                    {/* Reading */}
                                    <div className="mb-4">
                                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono mb-2">
                                            AI Reading
                                        </p>
                                        <p className="text-[11px] text-white/70 leading-relaxed italic">
                                            &ldquo;{archetype.desc}&rdquo;
                                        </p>
                                    </div>

                                    {/* Matched Brands */}
                                    <div className="mb-4">
                                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono mb-2">
                                            Matched Brands
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {archetype.brands.map((b) => (
                                                <span
                                                    key={b}
                                                    className="px-3 py-1.5 bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#c5a059] text-[8px] font-bold uppercase tracking-wider rounded-md"
                                                >
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dominant Palette */}
                                    <div className="mb-4">
                                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono mb-2">
                                            Dominant Palette
                                        </p>
                                        <div className="flex gap-2">
                                            {aiData.colors?.map((c) => (
                                                <div key={c} className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: c }} />
                                                    <span className="text-[8px] font-mono text-white/30 uppercase">{c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Influencer Twins */}
                                    <div className="mb-auto">
                                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono mb-2">
                                            Influencer Twins
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            {styleTwins.map((t) => (
                                                <span
                                                    key={t}
                                                    className="text-xs font-bold italic text-white/80 uppercase tracking-tight"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                        <p className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/20">
                                            #VVSLagos26
                                        </p>
                                        <p className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/20">
                                            vvslagos.com
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="mt-4 flex gap-3 w-full px-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex-1 py-3 bg-[#c5a059] text-black font-bold uppercase tracking-wider text-[9px] rounded-xl hover:bg-white transition-colors"
                                >
                                    {isDownloading ? "Saving\u2026" : "Save Card"}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic("light");
                                        window.location.href = "/";
                                    }}
                                    className="flex-1 py-3 border border-white/20 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl hover:bg-white hover:text-black transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
