"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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

interface QuizResultsProps {
    aiData: AIStyleData;
}

export default function QuizResults({ aiData }: QuizResultsProps) {
    const [storyIndex, setStoryIndex] = useState(0);
    const summaryCardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const archetype = useMemo(() => {
        const type = aiData.archetype || "REBEL";
        if (type === "REBEL") {
            return {
                title: "You are a Rebel",
                type: "REBEL",
                desc: aiData.reading,
                color: "#ffffff",
                brands: ["TOKYO JAMES", "I AM ISIGO", "TZAR STUDIOS"]
            };
        } else if (type === "FUTURIST") {
            return {
                title: "You are a Futurist",
                type: "FUTURIST",
                desc: aiData.reading,
                color: "#c5a059",
                brands: ["LFJ OFFICIAL", "TJ-WHO", "PIECE ET PATCH"]
            };
        } else if (type === "MINIMALIST") {
            return {
                title: "You are a Minimalist",
                type: "MINIMALIST",
                desc: aiData.reading,
                color: "#c5a059",
                brands: ["HERTUNBA", "FRUCHÉ", "ONALAJA"]
            };
        } else {
            return {
                title: "You are an Archivist",
                type: "ARCHIVIST",
                desc: aiData.reading,
                color: "#ffffff",
                brands: ["IN OFFICIAL", "ONALAJA", "RE LAGOS"]
            };
        }
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
        // Slide 1 (Tinder cards) auto-advances when cards finish swiping, so we handle it separately
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

        // Skip manual tapping for Tinder slide to avoid breaking card swipe
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
            await htmlToImage.toPng(summaryCardRef.current, { skipFonts: true, pixelRatio: 3, backgroundColor: "#ffffff" });
            const dataUrl = await htmlToImage.toPng(summaryCardRef.current, { skipFonts: true, pixelRatio: 3, backgroundColor: "#ffffff" });
            const link = document.createElement("a");
            link.download = `VVS-${archetype.type}-Match.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Download failed", err);
        } finally {
            setIsDownloading(false);
            triggerHaptic("success");
        }
    };

    // --- Tinder Swipe logic for Story 2 ---
    const [cardIndex, setCardIndex] = useState(0);
    const cardControls = useAnimation();

    useEffect(() => {
        if (storyIndex === 1 && cardIndex < matchedBrands.length) {
            // Wait for 1.8s, then swipe the current card out
            const timer = setTimeout(async () => {
                triggerHaptic("light");
                await cardControls.start(i => {
                    if (i === cardIndex) {
                        return {
                            x: 400,
                            rotate: 20,
                            opacity: 0,
                            transition: { duration: 0.65, ease: "easeOut" }
                        };
                    }
                    if (i === cardIndex + 1) {
                        return {
                            scale: 1,
                            y: 0,
                            filter: "brightness(1)",
                            transition: { duration: 0.65, delay: 0.1 }
                        };
                    }
                    return {};
                });
                setCardIndex(p => p + 1);
            }, 2000);
            return () => clearTimeout(timer);
        } else if (storyIndex === 1 && cardIndex >= matchedBrands.length) {
            // Once all swiped, move to next slide
            const timer = setTimeout(() => {
                setStoryIndex(2);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [storyIndex, cardIndex, matchedBrands, cardControls]);

    return (
        <div className="w-full min-h-screen bg-[#141414] flex items-center justify-center p-4">
            
            {/* Phone-sized Container Player */}
            <div
                onClick={handleScreenTap}
                className="w-full max-w-[375px] h-[720px] rounded-[2.5rem] border-[8px] border-[#222] bg-black overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
                
                {/* Story Progress Indicators */}
                <div className="absolute top-4 inset-x-4 flex gap-1.5 z-50 pointer-events-none">
                    {Array.from({ length: STORIES_COUNT }).map((_, idx) => (
                        <div key={idx} className="h-[3px] flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#c5a059] rounded-full"
                                initial={{ width: storyIndex > idx ? "100%" : "0%" }}
                                animate={{
                                    width: storyIndex > idx ? "100%" : storyIndex === idx ? "100%" : "0%",
                                }}
                                transition={{
                                    duration: storyIndex === idx ? (storyIndex === 1 ? (STORY_DURATION * 0.95) / 1000 : STORY_DURATION / 1000) : 0.15,
                                    ease: "linear",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ─────────────── SLIDE 0: Archetype Intro ─────────────── */}
                <AnimatePresence mode="wait">
                    {storyIndex === 0 && (
                        <motion.div
                            key="s0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10"
                        >
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-[#c5a059] uppercase tracking-[0.3em] text-[10px] font-mono mb-6"
                            >
                                VVS Lagos &apos;26 Archetype
                            </motion.p>
                            
                            <motion.h2
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                                className="text-4xl font-extrabold uppercase leading-none tracking-tight mb-4"
                                style={{ color: archetype.color }}
                            >
                                {archetype.title}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-[280px]"
                            >
                                {archetype.desc}
                            </motion.p>

                            {/* Logo mask background */}
                            <div className="absolute inset-x-0 bottom-16 flex justify-center opacity-[0.03] z-0 select-none pointer-events-none">
                                <img src="/assets/VVSWhiteMAsk.png" alt="" className="w-48 object-contain" />
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 1: Match Brands (Tinder Style) ─────────────── */}
                    {storyIndex === 1 && (
                        <motion.div
                            key="s1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col justify-center px-6 pt-12 z-10"
                        >
                            <h3 className="text-2xl font-extrabold text-white leading-tight mb-8 uppercase text-center">
                                Brands that match your style
                            </h3>

                            {/* Stack Container */}
                            <div className="relative w-full aspect-[3/4] flex justify-center items-center">
                                {matchedBrands.map((brand, i) => {
                                    const isCurrent = i === cardIndex;
                                    const isStacked = i > cardIndex;

                                    if (i < cardIndex) return null; // Already swiped

                                    return (
                                        <motion.div
                                            key={brand.name}
                                            custom={i}
                                            animate={cardControls}
                                            style={{ zIndex: matchedBrands.length - i }}
                                            initial={{ 
                                                scale: isCurrent ? 1 : 0.92,
                                                y: isCurrent ? 0 : 20,
                                                opacity: 1,
                                                filter: isCurrent ? "brightness(1)" : "brightness(0.3)"
                                            }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute w-full h-full max-w-[260px] rounded-2xl overflow-hidden border border-[#c5a059]/30 bg-[#151515] flex flex-col justify-between shadow-2xl"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden relative flex-1">
                                                <img
                                                    src={brand.image}
                                                    alt={brand.name}
                                                    className="w-full h-full object-cover grayscale"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                            </div>
                                            <div className="p-4 bg-black/90">
                                                <h4 className="text-xs font-mono font-bold tracking-widest text-[#c5a059] uppercase">{brand.name}</h4>
                                                <span className="text-[9px] text-white/50 uppercase tracking-widest block mt-0.5">VVS Innovator</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 2: Style Twins ─────────────── */}
                    {storyIndex === 2 && (
                        <motion.div
                            key="s2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 bg-[#c5a059]"
                        >
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-black/50 uppercase tracking-[0.3em] text-[10px] font-mono mb-10"
                            >
                                Your Style Twins
                            </motion.p>
                            
                            <div className="flex flex-col items-center gap-6 w-full">
                                {styleTwins.map((twin, i) => (
                                    <motion.div
                                        key={twin}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.4 }}
                                        className="text-center"
                                    >
                                        <span className="block text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-black">
                                            {twin}
                                        </span>
                                        {i < styleTwins.length - 1 && (
                                            <div className="mt-3 w-8 h-[1px] bg-black/20 mx-auto" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────────── SLIDE 3: Summary White Card Report ─────────────── */}
                    {storyIndex === 3 && (
                        <motion.div
                            key="s3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center p-3 z-10 bg-black"
                        >
                            {/* Summary Card (White Background / Image Background) */}
                            <div
                                ref={summaryCardRef}
                                className="relative w-full aspect-[9/16] bg-[#111111] overflow-hidden flex flex-col border border-black/10 rounded-2xl"
                            >
                                {/* AI Image Background */}
                                {aiData.userImage && (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img 
                                            src={aiData.userImage} 
                                            alt="User aesthetic" 
                                            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 grayscale"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/50 to-[#111111]/90" />
                                    </>
                                )}

                                <div className="relative z-10 flex-1 flex flex-col px-6 pt-8 pb-0">
                                    <p className="text-[9px] font-mono text-white/50 uppercase tracking-[0.25em] mb-4">
                                        VVS Lagos &apos;26 · Style Match
                                    </p>

                                    <h2 className="text-3xl font-extrabold uppercase mb-1" style={{ color: archetype.color }}>
                                        {archetype.type}
                                    </h2>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] mb-6">
                                        Archetype Match
                                    </p>

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-2">
                                        Matched Brands
                                    </p>
                                    <div className="flex flex-col gap-1.5 mb-6">
                                        {matchedBrands.slice(0, 3).map((b) => (
                                            <span
                                                key={b.name}
                                                className="px-3 py-1.5 bg-[#c5a059] text-black text-[9px] font-bold uppercase tracking-wider rounded-md inline-block max-w-max"
                                            >
                                                {b.name}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-2">
                                        Dominant Palette
                                    </p>
                                    <div className="flex gap-2 mb-6">
                                        {aiData.colors?.map((c) => (
                                            <div key={c} className="w-6 h-6 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono mb-2">
                                        Influencer Twins
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {styleTwins.map((t) => (
                                            <span
                                                key={t}
                                                className="text-sm font-bold italic text-white uppercase tracking-tight"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pb-4">
                                        <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/30">
                                            #VVSLagos26
                                        </p>
                                    </div>
                                </div>

                                {/* Mascot Peeking at the bottom of the card on a gold bar */}
                                <div className="relative w-full h-[100px] flex-shrink-0 overflow-hidden bg-transparent">
                                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[#c5a059]" />
                                    <img
                                        src="/assets/VVSMASCOT1.webp"
                                        alt="Mascot peeking"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160px] object-contain object-top"
                                        style={{ height: "180px", objectPosition: "top center" }}
                                    />
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="mt-4 flex gap-3 w-full px-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex-1 py-3 bg-[#c5a059] text-black font-bold uppercase tracking-wider text-[9px] rounded-xl hover:bg-white transition-colors"
                                >
                                    {isDownloading ? "Saving…" : "Save Card"}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic("light");
                                        window.location.href = "/type-b";
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
