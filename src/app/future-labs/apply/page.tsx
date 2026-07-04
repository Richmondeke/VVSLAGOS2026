"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";

const CATEGORIES = [
    "Fashion & Textile",
    "Visual Art",
    "Design & Architecture",
    "Film & Moving Image",
    "Technology & Innovation",
    "Music & Sound",
    "Cultural Entrepreneurship",
    "Photography",
    "Creative Writing & Poetry"
];

const COUNTRY_CODES = [
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+1", flag: "🇨🇦", name: "Canada" }
];

export default function FutureLabsApplyPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        city: "",
        category: "",
        portfolioUrl: "",
        statement: "",
    });

    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        triggerHaptic("medium");

        try {
            const formattedPhone = `${selectedCountry.code} ${form.phone.trim()}`;
            const res = await fetch("/api/future-labs/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: formattedPhone,
                    gender: form.gender,
                    city: form.city,
                    category: form.category,
                    portfolioUrl: form.portfolioUrl,
                    statement: form.statement,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Submission failed");

            triggerHaptic("success");
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-5 py-4 rounded-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors";
    const labelClass = "text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2";

    return (
        <div className="bg-black text-white min-h-screen relative font-sans selection:bg-[#c5a059]/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-black to-[#0a0a0a]" />
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#c5a059]/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#c5a059]/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            <div className="pt-32 pb-24 px-6 min-h-[100dvh] flex items-center justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border shadow-2xl relative bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 text-white"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <span className="text-[#c5a059] text-xs font-mono tracking-[0.3em] font-bold uppercase block mb-2">
                            Future Labs Cohort 2026
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold uppercase mb-2">Residency Application</h3>
                        <p className="text-xs opacity-50 max-w-md mx-auto leading-relaxed mt-2">
                            Submit your portfolio and project vision to apply for the VVS Future Labs creative residency incubator.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 flex flex-col items-center justify-center text-center gap-6"
                            >
                                <div className="w-20 h-20 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
                                    <Check size={40} />
                                </div>
                                <h4 className="text-2xl font-bold uppercase">Application Logged</h4>
                                <p className="text-sm opacity-60 max-w-[320px]">
                                    Thank you! Your Future Labs residency application has been successfully submitted. Our team will review your portfolio and be in touch soon.
                                </p>
                                <a
                                    href="/"
                                    className="mt-4 px-8 py-4 bg-[#c5a059] text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-all"
                                >
                                    Return Home
                                </a>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        className={inputClass}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                            className={inputClass}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className={labelClass}>Phone Number</label>
                                        <div className="flex relative">
                                            <button
                                                type="button"
                                                onClick={() => { triggerHaptic("light"); setShowCountryDropdown(!showCountryDropdown); }}
                                                className="flex items-center gap-1.5 px-3.5 bg-white/5 border border-white/10 rounded-l-xl text-sm border-r-0 hover:bg-white/10 transition-colors focus:outline-none"
                                            >
                                                <span className="text-lg leading-none inline-block filter saturate-[1.2]">{selectedCountry.flag}</span>
                                                <span className="text-xs text-white/50">{selectedCountry.code}</span>
                                                <span className="text-[10px] opacity-30">▼</span>
                                            </button>
                                            <input
                                                type="tel"
                                                required
                                                value={form.phone}
                                                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-5 py-4 rounded-r-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors"
                                                placeholder="000 000 0000"
                                            />
                                            {showCountryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-45" onClick={() => setShowCountryDropdown(false)} />
                                                    <div className="absolute top-[105%] left-0 z-50 w-64 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0a] p-1.5 shadow-2xl backdrop-blur-xl scrollbar-none">
                                                        {COUNTRY_CODES.map((c) => (
                                                            <button
                                                                key={c.code + c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    triggerHaptic("light");
                                                                    setSelectedCountry(c);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-xs hover:bg-white/5 transition-colors text-white"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <span className="text-base leading-none">{c.flag}</span>
                                                                    <span>{c.name}</span>
                                                                </span>
                                                                <span className="text-white/50 font-mono">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gender & City */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select
                                            required
                                            value={form.gender}
                                            onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                                            className={`${inputClass} cursor-pointer`}
                                            style={{ background: "rgba(255,255,255,0.05)" }}
                                        >
                                            <option value="" disabled style={{ background: "#111" }}>Select gender</option>
                                            <option value="Male" style={{ background: "#111" }}>Male</option>
                                            <option value="Female" style={{ background: "#111" }}>Female</option>
                                            <option value="Non-binary" style={{ background: "#111" }}>Non-binary</option>
                                            <option value="Prefer not to say" style={{ background: "#111" }}>Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>City & Country</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.city}
                                            onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g. Lagos, Nigeria"
                                        />
                                    </div>
                                </div>

                                {/* Discipline Category */}
                                <div>
                                    <label className={labelClass}>Creative Discipline</label>
                                    <select
                                        required
                                        value={form.category}
                                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                                        className={`${inputClass} cursor-pointer`}
                                        style={{ background: "rgba(255,255,255,0.05)" }}
                                    >
                                        <option value="" disabled style={{ background: "#111" }}>Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat} style={{ background: "#111" }}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Portfolio Url */}
                                <div>
                                    <label className={labelClass}>Portfolio / Project URL</label>
                                    <input
                                        type="url"
                                        value={form.portfolioUrl}
                                        onChange={(e) => setForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                                        className={inputClass}
                                        placeholder="Link to your portfolio or website (Behance, GitHub, Dribbble, etc.)"
                                    />
                                </div>

                                {/* Statement of Intent */}
                                <div>
                                    <label className={labelClass}>Statement of Intent / Project Pitch</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={form.statement}
                                        onChange={(e) => setForm(prev => ({ ...prev, statement: e.target.value }))}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Describe your creative work, what you plan to build during the residency, and how VVS Future Labs can support your growth."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-5 bg-[#c5a059] text-black text-sm uppercase tracking-widest font-bold rounded-xl transition-all ${
                                        isSubmitting
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:bg-white hover:text-black active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-[#c5a059]/20"
                                    }`}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
