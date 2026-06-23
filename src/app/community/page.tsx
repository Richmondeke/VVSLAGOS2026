"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useScroll } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, CheckCircle2, ArrowRight, X, Loader2 } from "lucide-react";

const INTERESTS = [
    "Fashion", "Art", "Music", "Film", "Technology",
    "Photography", "Design", "Architecture", "Creative Entrepreneurship",
    "Luxury", "Culture", "Sustainability", "Afrobeats", "Contemporary Art",
];

const CITIES = [
    "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan",
    "Accra", "Nairobi", "Johannesburg", "London", "New York",
    "Paris", "Dubai", "Toronto", "Amsterdam", "Other"
];

type FormData = {
    name: string;
    age: string;
    email: string;
    occupation: string;
    city: string;
    gender: string;
    interests: string[];
    selfieFile: File | null;
    selfiePreview: string | null;
};

export default function CommunityPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });

    const [form, setForm] = useState<FormData>({
        name: "",
        age: "",
        email: "",
        occupation: "",
        city: "",
        gender: "",
        interests: [],
        selfieFile: null,
        selfiePreview: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleInterestToggle = (interest: string) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB.");
            return;
        }
        const preview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, selfieFile: file, selfiePreview: preview }));
        setError(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.selfieFile) {
            setError("Please upload a selfie photo.");
            return;
        }
        if (form.interests.length === 0) {
            setError("Please select at least one interest.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Upload selfie to Supabase Storage
            const fileExt = form.selfieFile.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `community/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("selfies")
                .upload(filePath, form.selfieFile, { contentType: form.selfieFile.type, upsert: false });

            let selfieUrl = null;
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from("selfies").getPublicUrl(filePath);
                selfieUrl = urlData?.publicUrl ?? null;
            } else {
                console.warn("Selfie upload warning:", uploadError.message);
            }

            // 2. Insert community member record
            const { error: insertError } = await supabase
                .from("community_members")
                .insert([{
                    name: form.name,
                    age: parseInt(form.age),
                    email: form.email,
                    occupation: form.occupation,
                    city: form.city,
                    gender: form.gender,
                    interests: form.interests,
                    selfie_url: selfieUrl,
                    created_at: new Date().toISOString(),
                }]);

            if (insertError) {
                throw new Error(insertError.message);
            }

            setSubmitted(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#c5a059] transition-colors";
    const selectClass = "w-full px-4 py-3 rounded-xl border border-white/15 bg-black text-white text-xs focus:outline-none focus:border-[#c5a059] transition-colors";
    const labelClass = "text-[10px] font-mono uppercase tracking-widest font-bold text-white/50 block mb-1.5";

    return (
        <div
            ref={containerRef}
            className="bg-black text-white min-h-screen relative overflow-y-auto w-full selection:bg-[#c5a059]/30 font-sans"
        >
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-6 overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c5a059]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#c5a059]/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059] mb-4">
                            VVS Lagos · Community
                        </p>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter text-[#c5a059] mb-6 leading-none">
                            Join Our<br />Community
                        </h1>
                        <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
                            VVS Lagos is more than a festival — it's a movement. Join a growing collective of Africa's
                            most visionary creatives, designers, artists, and cultural entrepreneurs shaping the next decade.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="flex justify-center gap-12 mt-10"
                    >
                        {[
                            { label: "Community Members", value: "5,000+" },
                            { label: "Cities Represented", value: "40+" },
                            { label: "Events Annually", value: "12+" },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl font-extrabold text-[#c5a059]">{stat.value}</p>
                                <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Form Section */}
            <section className="px-6 pb-24 relative z-10">
                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    className="inline-flex mb-6"
                                >
                                    <CheckCircle2 size={64} className="text-[#c5a059]" />
                                </motion.div>
                                <h2 className="text-3xl font-extrabold uppercase text-[#c5a059] mb-4">Welcome to the Community!</h2>
                                <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
                                    You're now part of Africa's most vibrant creative collective. We'll be in touch with updates, invites, and exclusive access.
                                </p>
                                <a
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#c5a059] text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all"
                                >
                                    Back to VVS Lagos <ArrowRight size={14} />
                                </a>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
                            >
                                <h2 className="text-xl font-extrabold uppercase mb-2 text-white">Your Details</h2>
                                <p className="text-xs text-white/40 mb-8 font-mono">All fields are required</p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name + Age */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className={inputClass}
                                                placeholder="Your full name"
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Age</label>
                                            <input
                                                type="number"
                                                required
                                                min="16"
                                                max="100"
                                                className={inputClass}
                                                placeholder="e.g. 28"
                                                value={form.age}
                                                onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className={labelClass}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className={inputClass}
                                            placeholder="you@example.com"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        />
                                    </div>

                                    {/* Occupation + City */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Occupation</label>
                                            <input
                                                type="text"
                                                required
                                                className={inputClass}
                                                placeholder="e.g. Designer, Artist"
                                                value={form.occupation}
                                                onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>City</label>
                                            <select
                                                required
                                                className={selectClass}
                                                value={form.city}
                                                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                            >
                                                <option value="" disabled>Select your city</option>
                                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select
                                            required
                                            className={selectClass}
                                            value={form.gender}
                                            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                                        >
                                            <option value="" disabled>Select gender</option>
                                            <option value="female">Female</option>
                                            <option value="male">Male</option>
                                            <option value="non-binary">Non-binary</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    {/* Interests */}
                                    <div>
                                        <label className={labelClass}>Interests (select all that apply)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {INTERESTS.map(interest => {
                                                const selected = form.interests.includes(interest);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={interest}
                                                        onClick={() => handleInterestToggle(interest)}
                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all ${
                                                            selected
                                                                ? "bg-[#c5a059] text-black border-[#c5a059] font-bold"
                                                                : "bg-transparent text-white/60 border-white/20 hover:border-[#c5a059]/60 hover:text-white"
                                                        }`}
                                                    >
                                                        {interest}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Selfie Upload */}
                                    <div>
                                        <label className={labelClass}>Your Selfie</label>
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                                dragOver
                                                    ? "border-[#c5a059] bg-[#c5a059]/10"
                                                    : "border-white/15 hover:border-[#c5a059]/50 hover:bg-white/5"
                                            }`}
                                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
                                            />

                                            {form.selfiePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={form.selfiePreview}
                                                        alt="Selfie preview"
                                                        className="w-28 h-28 rounded-xl object-cover mx-auto border-2 border-[#c5a059]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setForm(p => ({ ...p, selfieFile: null, selfiePreview: null }));
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                    <p className="text-[10px] text-[#c5a059] font-mono mt-2">Photo selected ✓</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Camera className="mx-auto mb-3 text-white/30" size={32} />
                                                    <p className="text-xs text-white/50 mb-1">Drop your selfie here or click to browse</p>
                                                    <p className="text-[10px] text-white/30 font-mono">JPG, PNG, WEBP · Max 5MB</p>
                                                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-[10px] text-white/60 hover:border-[#c5a059]/60 transition-colors">
                                                        <Upload size={12} /> Choose File
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <p className="text-red-400 text-xs font-mono text-center py-2 px-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            {error}
                                        </p>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-[#c5a059] text-black text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Joining Community...
                                            </>
                                        ) : (
                                            <>
                                                Join the Community <ArrowRight size={14} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-white/30 text-center font-mono">
                                        By joining, you agree to receive updates from VVS Lagos. We respect your privacy.
                                    </p>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t text-center text-xs opacity-50 border-white/10 bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/assets/VVSWhiteMAsk.png" alt="Logo" className="w-6 h-6 object-contain" />
                        <span className="font-bold tracking-wider">VVS LAGOS 2026</span>
                    </div>
                    <p>© 2026 VERY VERY SPECIAL. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </div>
    );
}
