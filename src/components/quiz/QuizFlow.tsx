"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";
import QuizResults from "./QuizResults";
import { UploadCloud, Image as ImageIcon, ArrowRight } from "lucide-react";

export interface AIStyleData {
    archetype: string;
    reading: string;
    colors: string[];
    userImage?: string; // Storing the base64 to pass to results
}

export default function QuizFlow() {
    const [phase, setPhase] = useState<"intro" | "upload" | "calculating" | "results">("intro");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aiData, setAiData] = useState<AIStyleData | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        triggerHaptic("medium");
        setPhase("upload");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            triggerHaptic("light");
        }
    };

    // Client-side image compression
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas not supported");

                ctx.drawImage(img, 0, 0, width, height);
                const base64 = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG
                resolve(base64);
            };
            img.onerror = reject;
        });
    };

    const handleAnalyze = async () => {
        if (!file) return;
        triggerHaptic("medium");
        setPhase("calculating");
        setError(null);

        try {
            const base64Image = await compressImage(file);

            const res = await fetch("/api/analyze-style", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ images: [base64Image] }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Analysis failed");
            }

            const data = await res.json();
            
            // Validate expected structure loosely
            if (!data.archetype) {
                throw new Error("Invalid analysis data returned");
            }

            setAiData({
                ...data,
                userImage: base64Image // Pass this so we can show it in the results
            });

            triggerHaptic("success");
            setPhase("results");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong. Please try again.");
            setPhase("upload"); // Revert back so they can try again
            triggerHaptic("light"); // Fallback for error
        }
    };

    return (
        <>
            {phase === "results" && aiData ? (
                <QuizResults aiData={aiData} />
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
                                        AI Style<br />
                                        <span className="text-[#c5a059]">Wrapped</span>
                                    </h1>
                                    <p className="text-white/50 text-sm mb-12 max-w-sm mx-auto leading-relaxed">
                                        Upload a picture of your best fit or a screenshot of your Instagram grid. Our AI will analyze your aesthetic and generate your official VVS Lagos Style Wrapped card.
                                    </p>
                                    <button
                                        onClick={handleStart}
                                        className="px-10 py-4 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:text-black transition-all shadow-lg active:scale-95"
                                    >
                                        Drop Your Style
                                    </button>
                                </motion.div>
                            )}

                            {/* ── UPLOAD ── */}
                            {phase === "upload" && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full flex flex-col items-center text-center"
                                >
                                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 uppercase tracking-tight leading-tight">
                                        Upload Your Aesthetic
                                    </h2>
                                    <p className="text-white/50 text-xs mb-8">Screenshot your IG grid or upload a fit pic.</p>

                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-square max-h-[300px] border-2 border-dashed border-[#c5a059]/40 rounded-2xl bg-white/[0.02] hover:bg-[#c5a059]/[0.05] hover:border-[#c5a059] transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                        
                                        {preview ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-black/80 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 p-6">
                                                <UploadCloud className="w-12 h-12 text-[#c5a059]/60" />
                                                <p className="text-sm text-white/60 font-medium">Tap to select an image</p>
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <p className="text-red-400 mt-6 text-sm font-medium bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/20">
                                            {error}
                                        </p>
                                    )}

                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: preview ? 1 : 0.5, y: 0 }}
                                        disabled={!preview}
                                        onClick={handleAnalyze}
                                        className="mt-8 flex items-center gap-3 px-8 py-4 bg-[#c5a059] text-black font-extrabold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Analyze Aesthetic <ArrowRight className="w-4 h-4" />
                                    </motion.button>
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
                                        Vision AI Analyzing...
                                    </h2>
                                    <p className="text-white/30 text-xs mt-4 font-mono">
                                        Extracting color palettes & silhouettes
                                    </p>
                                    
                                    <div className="w-full max-w-xs mt-12 bg-white/5 rounded-full h-1 overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-[#c5a059]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 6, ease: "easeInOut" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </>
    );
}
