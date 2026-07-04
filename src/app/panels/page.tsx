"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Check, Loader2, Sparkles, MapPin, Calendar, Clock } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";
import { supabase } from "@/lib/supabase";

interface Panelist {
    name: string;
    role: string;
    image?: string;
    initials: string;
}

interface PanelSession {
    id: string;
    title: string;
    type: "Panel Discussion" | "Fireside Chat";
    time: string;
    description: string;
    panelists: Panelist[];
}

const PANEL_SESSIONS: PanelSession[] = [
    {
        id: "cinema-ai",
        title: "The Future of African Cinema: How Streaming, AI & Technology Are Transforming the Next Generation of Filmmaking",
        type: "Panel Discussion",
        time: "July 11, 2026 - 3:00 PM WAT",
        description: "An in-depth dialogue on how digital distribution networks, artificial intelligence, and evolving screen technologies are altering the landscape of African storytelling, production workflows, and viewer engagement across the continent and global markets.",
        panelists: [
            { name: "Film One Representative", role: "Distributor & Studio Executive", initials: "FO" },
            { name: "Mo Abudu", role: "Founder & CEO, EbonyLife Group", initials: "MA" },
            { 
                name: "Kemi Adetiba", 
                role: "Filmmaker & Director (King of Boys)", 
                image: "/assets/nominees/EXCELLENCE IN FILM & SCREEN STORYTELLING/Kemi Adetiba — To Kill a Monkey.jpg", 
                initials: "KA" 
            },
            { name: "Kunle Afolayan", role: "Acclaimed Director & CEO, KAP Hub", initials: "KA" },
            { 
                name: "Chioma Ude", 
                role: "Founder, AFRIFF", 
                image: "/assets/nominees/VISIONARY LEADERSHIP AWARD/Chioma Ude  .jpg", 
                initials: "CU" 
            }
        ]
    },
    {
        id: "stories-global",
        title: "African Stories, Global Platforms & AI: Who Owns, Shapes, and Controls the Future of African Filmmaking?",
        type: "Panel Discussion",
        time: "July 11, 2026 - 4:45 PM WAT",
        description: "Unpacking the geopolitics of creative ownership. This panel discusses local intellectual property rights, data sovereignty in AI creation tools, and how local directors negotiate their voices when building films co-financed by international streaming giants.",
        panelists: [
            { name: "Korty EO", role: "Indie Creator & Filmmaker", initials: "KE" },
            { name: "Tayo Aina", role: "New-Age Creator & Documentarian", initials: "TA" },
            { name: "TG Omori", role: "Renowned Music Video Director", initials: "TG" },
            { name: "Director Pink", role: "Leading Female Music Video Director", initials: "DP" }
        ]
    },
    {
        id: "creative-economy",
        title: "The African Creative Economy: Film, Fashion, Music & Culture as Global Influence",
        type: "Fireside Chat",
        time: "July 11, 2026 - 6:30 PM WAT",
        description: "An intimate fireside dialogue reflecting on the intersection of the film, fashion, and musical arts, focusing on the economic multipliers that drive local growth and translate to global cultural diplomacy.",
        panelists: [
            { 
                name: "Chioma Ude", 
                role: "Founder, AFRIFF", 
                image: "/assets/nominees/VISIONARY LEADERSHIP AWARD/Chioma Ude  .jpg", 
                initials: "CU" 
            },
            { name: "Charles of Play", role: "CEO, Play Network Studios", initials: "CO" }
        ]
    }
];

export default function PanelsPage() {
    const [selectedSessionId, setSelectedSessionId] = useState<string>("cinema-ai");
    const [formData, setFormData] = useState({ name: "", email: "", question: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    // Hydrate voter email from localStorage if they have authenticated before
    useEffect(() => {
        const savedEmail = localStorage.getItem("vvs_voter_email");
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, []);

    const activeSession = PANEL_SESSIONS.find(s => s.id === selectedSessionId) || PANEL_SESSIONS[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.question.trim()) return;

        setIsSubmitting(true);
        triggerHaptic("medium");

        try {
            const { error } = await supabase
                .from("panel_questions")
                .insert([
                    {
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        session_id: activeSession.title,
                        question: formData.question.trim()
                    }
                ]);

            if (error) throw error;

            // Persist voter email
            localStorage.setItem("vvs_voter_email", formData.email.trim());

            triggerHaptic("success");
            setSubmitSuccess(true);
            setFormData(prev => ({ ...prev, question: "" })); // Clear question input
            setTimeout(() => setSubmitSuccess(false), 4000);
        } catch (err) {
            console.error("Failed to submit question:", err);
            alert("Unable to submit your question at this time. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-700 ${
            theme === "dark" ? "bg-black text-white" : "bg-[#F5F0E8] text-black"
        }`}>
            {/* Header / Navigation */}
            <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/5 relative z-50">
                <a
                    href="/"
                    className={`flex items-center gap-2 text-xs uppercase font-mono tracking-widest font-black transition-colors ${
                        theme === "dark" ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                    }`}
                >
                    <ArrowLeft size={14} /> Back Home
                </a>
                
                <div className="flex items-center gap-4">
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.4em] uppercase font-black">
                        VVS LAGOS 2026
                    </span>
                    <button
                        onClick={() => {
                            triggerHaptic("light");
                            setTheme(prev => prev === "dark" ? "light" : "dark");
                        }}
                        className={`p-2 rounded-full border text-xs transition-colors ${
                            theme === "dark" ? "border-white/10 text-white bg-white/5" : "border-black/10 text-black bg-black/5"
                        }`}
                    >
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
                
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-4">
                        July 11, 2026 • Film & Cinema Day
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-serif font-extrabold uppercase tracking-tight leading-none mb-6">
                        VVS Film Panels
                    </h1>
                    <p className={`text-base sm:text-lg font-light leading-relaxed ${
                        theme === "dark" ? "text-white/60" : "text-black/60"
                    }`}>
                        Presented in partnership with <span className="text-[#c5a059] font-medium">AFRIFF</span>. Join Africa's cinema gatekeepers and creators as they discuss technology, narrative sovereignty, and creative capital.
                    </p>
                </div>

                {/* Session Tabs */}
                <div className="flex flex-col lg:flex-row gap-4 justify-center mb-16">
                    {PANEL_SESSIONS.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => {
                                triggerHaptic("light");
                                setSelectedSessionId(session.id);
                            }}
                            className={`p-5 rounded-2xl border text-left transition-all duration-300 flex-1 ${
                                selectedSessionId === session.id
                                    ? "bg-[#c5a059] text-black border-[#c5a059] shadow-lg scale-[1.02]"
                                    : theme === "dark"
                                    ? "bg-white/[0.02] border-white/10 text-white hover:bg-white/[0.05]"
                                    : "bg-black/[0.01] border-black/10 text-black hover:bg-black/[0.03]"
                            }`}
                        >
                            <span className={`text-[9px] font-mono uppercase tracking-widest font-black block mb-2 ${
                                selectedSessionId === session.id ? "text-black/60" : "text-[#c5a059]"
                            }`}>
                                {session.type}
                            </span>
                            <h3 className="text-sm font-extrabold uppercase tracking-tight leading-snug line-clamp-2">
                                {session.title}
                            </h3>
                            <span className="text-[10px] font-mono tracking-wider block mt-4 opacity-75">
                                {session.time}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Active Session Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
                    
                    {/* Left Column: Details & Panelists */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <span className="text-[#c5a059] text-xs font-mono tracking-[0.3em] uppercase block mb-3">
                                SESSION SYNOPSIS
                            </span>
                            <p className={`text-base leading-relaxed font-light ${
                                theme === "dark" ? "text-white/80" : "text-black/80"
                            }`}>
                                {activeSession.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs font-mono mt-6">
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                                    theme === "dark" ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-black/5 text-black"
                                }`}>
                                    <Calendar size={12} className="text-[#c5a059]" /> July 11
                                </span>
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                                    theme === "dark" ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-black/5 text-black"
                                }`}>
                                    <Clock size={12} className="text-[#c5a059]" /> 3:00 PM - 7:30 PM
                                </span>
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                                    theme === "dark" ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-black/5 text-black"
                                }`}>
                                    <MapPin size={12} className="text-[#c5a059]" /> AFRIFF Cinema Center
                                </span>
                            </div>
                        </div>

                        {/* Panelists */}
                        <div>
                            <span className="text-[#c5a059] text-xs font-mono tracking-[0.3em] uppercase block mb-6">
                                THE SPEAKERS
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeSession.panelists.map((panelist, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center gap-4 p-4 rounded-xl border ${
                                            theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-black/[0.02] border-black/5"
                                        }`}
                                    >
                                        {/* Speaker Headshot */}
                                        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center bg-gradient-to-br from-[#c5a059]/20 to-black text-[#c5a059]">
                                            {panelist.image ? (
                                                <img
                                                    src={panelist.image}
                                                    alt={panelist.name}
                                                    className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-300"
                                                />
                                            ) : (
                                                <span className="font-mono font-extrabold text-sm tracking-wider">
                                                    {panelist.initials}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-extrabold uppercase tracking-tight">
                                                {panelist.name}
                                            </h4>
                                            <p className={`text-xs mt-0.5 ${
                                                theme === "dark" ? "text-white/50" : "text-black/50"
                                            }`}>
                                                {panelist.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Submission Form */}
                    <div className="lg:col-span-5">
                        <div className={`p-8 rounded-3xl border ${
                            theme === "dark" 
                                ? "bg-gradient-to-br from-[#0c0c0c] to-black border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
                                : "bg-white border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
                        }`}>
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles size={16} className="text-[#c5a059]" />
                                <span className="text-[#c5a059] text-xs font-mono tracking-widest font-black uppercase">
                                    Q&amp;A Curation
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-extrabold uppercase tracking-tight mb-2">
                                Ask the Panel
                            </h3>
                            <p className={`text-xs font-light mb-8 leading-relaxed ${
                                theme === "dark" ? "text-white/55" : "text-black/55"
                            }`}>
                                Submit a question for this session. Curated queries will be answered live by the speakers.
                            </p>

                            <AnimatePresence mode="wait">
                                {submitSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-12 text-center flex flex-col items-center justify-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/40 flex items-center justify-center mb-4 text-[#c5a059]">
                                            <Check size={28} />
                                        </div>
                                        <h4 className="text-lg font-bold uppercase tracking-tight mb-2">
                                            Question Submitted!
                                        </h4>
                                        <p className={`text-xs ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                                            Thank you. We will review your query for the live session.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-70">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all ${
                                                    theme === "dark"
                                                        ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                        : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-70">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="e.g. john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all ${
                                                    theme === "dark"
                                                        ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                        : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-70">
                                                Your Question
                                            </label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Ask about AI, film sovereignty, streaming budgets..."
                                                value={formData.question}
                                                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all resize-none ${
                                                    theme === "dark"
                                                        ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                        : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                                }`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-[#c5a059] text-black hover:bg-white hover:text-black active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" /> Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={12} /> Submit Question
                                                </>
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
