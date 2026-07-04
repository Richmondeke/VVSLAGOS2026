"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, Music, Calendar, MapPin, Check, Loader2, Volume2, VolumeX, Disc } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";

export default function DescendantsPage() {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    // Hydrate email from localStorage if they have verified/voted/rsvp'd before
    useEffect(() => {
        const savedEmail = localStorage.getItem("vvs_voter_email");
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim() || !formData.name.trim()) return;

        setIsSubmitting(true);
        triggerHaptic("medium");

        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim() || null,
                    events: ["JULY 9"], // VVS Album Release Party
                    attendance: "yes",
                    heard_about: "Website - Descendants Album Page"
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit RSVP");
            }

            // Persist voter email
            localStorage.setItem("vvs_voter_email", formData.email.trim());

            triggerHaptic("success");
            setSubmitSuccess(true);
            setFormData(prev => ({ ...prev, name: "", phone: "" }));
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (err) {
            console.error("RSVP submission error:", err);
            alert("Could not process your RSVP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const artists = [
        "JERIQ", "TRINIDAD JAMES", "MINZ", "PRETTYBOY DO", "WTC", "WIZARD CHAN", "IJAYA"
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-700 overflow-x-hidden ${
            theme === "dark" ? "bg-black text-white" : "bg-[#F5F0E8] text-black"
        }`}>
            {/* Header */}
            <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
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
                        DESCENDANTS
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

            {/* Video Hero Block */}
            <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10" />
                    <video
                        src="https://rdoldxaclybdlggayjnc.supabase.co/storage/v1/object/public/selfies/THE_ALBUM.mp4"
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover grayscale brightness-[0.45]"
                    />
                </div>

                {/* Video controls */}
                <button
                    onClick={() => {
                        triggerHaptic("light");
                        setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-8 right-8 z-30 p-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all active:scale-95"
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <div className="relative z-20 text-center max-w-4xl px-6 flex flex-col items-center">
                    <motion.span
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[#c5a059] text-xs font-mono tracking-[0.5em] uppercase font-extrabold mb-4 block"
                    >
                        Official Album Project
                    </motion.span>
                    
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-5xl sm:text-7xl md:text-8xl font-serif font-black uppercase tracking-tight leading-none text-white mb-6"
                    >
                        VVS Descendants
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/70 text-base sm:text-lg max-w-xl font-light leading-relaxed mb-8"
                    >
                        Releasing globally on platforms July 10, 2026. Pre-save or RSVP for the exclusive listening party in Lagos.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
                    >
                        <a
                            href="https://open.spotify.com/album/60Gx4JgOIF7rpjK1Lz7rn3?si=2cb57f59fe4148de"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => triggerHaptic("medium")}
                            className="flex-1 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:scale-[1.03]"
                        >
                            <Music size={14} /> Spotify Pre-Save
                        </a>
                        <a
                            href="#rsvp"
                            className="flex-1 py-4 bg-[#c5a059] hover:bg-white text-black font-extrabold uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 transition-all hover:scale-[1.03]"
                        >
                            <Calendar size={14} /> RSVP Listening Party
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Album details & presentation */}
            <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    
                    {/* Left Column: Cover Art Visuals */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative group max-w-md w-full aspect-square">
                            {/* Glow Behind */}
                            <div className="absolute inset-0 bg-[#c5a059]/20 rounded-2xl filter blur-3xl group-hover:bg-[#c5a059]/35 transition-all duration-700" />
                            
                            {/* Vinyl Disc Slideout Effect */}
                            <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-[85%] h-[85%] rounded-full bg-[#111] border border-white/10 shadow-2xl flex items-center justify-center transition-all duration-700 group-hover:-right-24 rotate-[360deg] duration-[2.5s] z-0">
                                <div className="w-[30%] h-[30%] rounded-full bg-[#c5a059] flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-black" />
                                </div>
                                <Disc className="absolute inset-4 text-white/5 animate-spin duration-[10s]" />
                            </div>

                            {/* Main Cover Art */}
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 z-10 bg-black">
                                <img
                                    src="/assets/VVS_ALBUM_ART.jpg"
                                    alt="VVS Descendants Album Cover"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Track & Artist Info */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <span className="text-[#c5a059] text-xs font-mono tracking-[0.3em] uppercase block mb-3 font-bold">
                                THE VIBE &amp; CONCEPT
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tight mb-6">
                                Afromodernist Soundscapes
                            </h2>
                            <p className={`text-base leading-relaxed font-light ${
                                theme === "dark" ? "text-white/70" : "text-black/70"
                            }`}>
                                VVS Descendants is the sonic translation of VVS Lagos 2026. A 12-track project that reconstructs traditional African rhythms through high-tech electronic synthesis, jazz fusion, and modern alternative hip-hop.
                            </p>
                        </div>

                        {/* Artists Grid */}
                        <div>
                            <span className="text-[#c5a059] text-xs font-mono tracking-[0.3em] uppercase block mb-4 font-bold">
                                FEATURED ARTISTS
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {artists.map((artist, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
                                            theme === "dark"
                                                ? "bg-white/5 border-white/10 text-white hover:border-[#c5a059]"
                                                : "bg-black/5 border-black/10 text-black hover:border-[#c5a059]"
                                        }`}
                                    >
                                        {artist}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Audio Streaming Embed */}
                        <div className="pt-4">
                            <iframe 
                                style={{ borderRadius: "12px" }}
                                src="https://open.spotify.com/embed/album/60Gx4JgOIF7rpjK1Lz7rn3?utm_source=generator&theme=0" 
                                width="100%" 
                                height="152" 
                                frameBorder="0" 
                                allowFullScreen={false} 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                loading="lazy"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* Watch Video Section */}
            <section className={`py-20 md:py-28 border-t ${
                theme === "dark" ? "border-white/10 bg-[#070707]" : "border-black/10 bg-[#FAF7F2]"
            }`}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-[#c5a059] text-xs font-mono tracking-[0.4em] uppercase block mb-3 font-bold">
                        ALBUM TRAILER
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tight mb-8">
                        Watch The Visual Teaser
                    </h2>
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                        <video
                            src="https://rdoldxaclybdlggayjnc.supabase.co/storage/v1/object/public/selfies/THE_ALBUM.mp4"
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* RSVP Form Section */}
            <section id="rsvp" className={`py-24 border-t ${
                theme === "dark" ? "border-white/10 bg-white/[0.01]" : "border-black/10 bg-black/[0.01]"
            }`}>
                <div className="max-w-3xl mx-auto px-6">
                    <div className={`p-8 sm:p-12 rounded-3xl border text-center ${
                        theme === "dark"
                            ? "bg-gradient-to-b from-[#0c0c0c] to-black border-white/10 shadow-2xl"
                            : "bg-white border-black/10 shadow-lg"
                    }`}>
                        <span className="text-[#c5a059] text-xs font-mono tracking-[0.4em] uppercase block mb-4 font-bold">
                            EXCLUSIVE EVENT
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tight mb-4">
                            Listening Party
                        </h2>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono mb-10 text-[#c5a059]">
                            <span className="flex items-center gap-2"><Calendar size={14} /> July 9, 2026</span>
                            <span className="flex items-center gap-2"><MapPin size={14} /> AFRIFF Experience Hub, Ikoyi</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {submitSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="py-12 flex flex-col items-center justify-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center mb-6 text-[#c5a059]">
                                        <Check size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                                        RSVP Confirmed!
                                    </h3>
                                    <p className={`text-xs max-w-sm ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                                        Your details have been registered. You will receive entry instructions shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4 max-w-md mx-auto text-left"
                                >
                                    <div>
                                        <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-75">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className={`w-full px-4 py-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                                                theme === "dark"
                                                    ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                    : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-75">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Your email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className={`w-full px-4 py-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                                                theme === "dark"
                                                    ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                    : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2 block opacity-75">
                                            Phone Number (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="e.g. +234..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className={`w-full px-4 py-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                                                theme === "dark"
                                                    ? "bg-[#141414] border-white/10 text-white focus:border-[#c5a059]"
                                                    : "bg-black/[0.02] border-black/10 text-black focus:border-[#c5a059]"
                                            }`}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 bg-[#c5a059] text-black hover:bg-white hover:text-black active:scale-[0.98] disabled:opacity-50 mt-8"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" /> Submitting RSVP...
                                            </>
                                        ) : (
                                            "Confirm Attendance"
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </section>

        </div>
    );
}
