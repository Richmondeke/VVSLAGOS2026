"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";
import QuizResults from "./QuizResults";

const questions = [
    {
        id: "style",
        title: "What is your primary creative medium?",
        options: [
            "Street Art & DJing",
            "Design & Architecture",
            "Generative Art & Tech",
            "Crafts & Archiving"
        ],
        mapping: {
            "Street Art & DJing": "Streetwear",
            "Design & Architecture": "Minimalist",
            "Generative Art & Tech": "Avant-Garde",
            "Crafts & Archiving": "High-End Luxury"
        }
    },
    {
        id: "staple",
        title: "Select your signature wardrobe piece:",
        options: [
            "Deconstructed Oversized Outerwear",
            "Monochrome Tailored Jacket",
            "Sculptural Metal Accessory",
            "Hand-woven Traditional Fabric"
        ]
    },
    {
        id: "vibe",
        title: "Your ideal showcase atmosphere is:",
        options: [
            "Underground Industrial Loft",
            "Glasshouse Modernist Pavilion",
            "Neon Hologram Cyber Room",
            "Historic Courtyard Museum"
        ]
    }
];

export default function QuizFlow() {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [phase, setPhase] = useState<"intro" | "questions" | "calculating" | "results">("intro");

    const handleStart = () => {
        triggerHaptic("medium");
        setPhase("questions");
    };

    const handleAnswer = (answer: string) => {
        triggerHaptic("light");
        const currentQuestion = questions[currentIdx];
        let val = answer;
        if (currentQuestion.id === "style" && "mapping" in currentQuestion) {
            const mapping = currentQuestion.mapping as Record<string, string>;
            val = mapping[answer] || answer;
        }
        const newAnswers = { ...answers, [currentQuestion.id]: val };
        setAnswers(newAnswers);
        if (currentIdx < questions.length - 1) {
            setTimeout(() => setCurrentIdx(currentIdx + 1), 350);
        } else {
            setPhase("calculating");
        }
    };

    useEffect(() => {
        if (phase === "calculating") {
            const t = setTimeout(() => {
                setPhase("results");
                triggerHaptic("success");
            }, 3200);
            return () => clearTimeout(t);
        }
    }, [phase]);

    return (
        <>
            {phase === "results" ? (
                <QuizResults answers={answers} />
            ) : (
                <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center overflow-hidden relative font-sans">
                    {/* Subtle rotating ring background – mirrors landing page */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1/2 -left-1/2 w-[200vw] h-[200vw] border border-[#c5a059]/30 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1/4 -right-1/4 w-[150vw] h-[150vw] border border-white/20 rounded-full"
                        />
                    </div>

                    <div className="relative z-10 w-full max-w-lg px-6">
                        <AnimatePresence mode="wait">
                            {/* ── INTRO ── */}
                            {phase === "intro" && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -24 }}
                                    transition={{ duration: 0.45 }}
                                    className="text-center"
                                >
                                    <p className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em] mb-5">
                                        VVS Lagos &apos;26
                                    </p>
                                    <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tighter mb-5 text-white">
                                        Style Archetype<br />
                                        <span className="text-[#c5a059]">Match</span>
                                    </h1>
                                    <p className="text-white/50 text-sm mb-12 max-w-sm mx-auto leading-relaxed">
                                        Discover your creative fashion archetype, matched innovator brands, and style twins in our afromodernist collective.
                                    </p>
                                    <button
                                        onClick={handleStart}
                                        className="px-10 py-4 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-lg active:scale-95"
                                    >
                                        Start the Quiz
                                    </button>
                                </motion.div>
                            )}

                            {/* ── QUESTIONS ── */}
                            {phase === "questions" && (
                                <motion.div
                                    key={`q-${currentIdx}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full flex flex-col items-center text-center"
                                >
                                    <p className="text-[#c5a059] font-mono text-[10px] uppercase tracking-[0.3em] mb-6">
                                        Question {currentIdx + 1} of {questions.length}
                                    </p>
                                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 uppercase tracking-tight leading-tight">
                                        {questions[currentIdx].title}
                                    </h2>

                                    <div className="flex flex-col gap-3 w-full">
                                        {questions[currentIdx].options.map((opt) => {
                                            const isSelected = answers[questions[currentIdx].id] === opt;
                                            return (
                                                <motion.button
                                                    key={opt}
                                                    onClick={() => handleAnswer(opt)}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`
                                                        w-full p-5 rounded-xl border text-left transition-all duration-300 cursor-pointer group
                                                        ${isSelected
                                                            ? "border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.2)]"
                                                            : "border-white/10 bg-white/[0.02] text-white hover:border-[#c5a059]/40 hover:bg-[#c5a059]/[0.04] hover:shadow-[0_0_15px_rgba(197,160,89,0.1)]"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm uppercase tracking-wide">
                                                            {opt}
                                                        </span>
                                                        <div className={`w-4 h-[2px] bg-[#c5a059] transition-all duration-500 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* ── CALCULATING ── */}
                            {phase === "calculating" && (
                                <motion.div
                                    key="calculating"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center text-center"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                        className="w-14 h-14 border-[3px] border-[#c5a059] border-t-transparent rounded-full mb-8"
                                    />
                                    <h2 className="text-xl font-bold uppercase tracking-widest text-[#c5a059] animate-pulse">
                                        Fusing your archetype…
                                    </h2>
                                    <p className="text-white/30 text-xs mt-4 font-mono">
                                        Fusing brand alignments
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </>
    );
}
