"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const EVENT_OPTIONS = [
    "The Entire Event — VVS Lagos 2026",
    "Grand Opening Night — July 5",
    "Business & Culture Day — July 6",
    "Collectors Preview — July 7",
    "Public Opening — July 8",
    "Pop-Ups & Exhibitions — July 9–10",
    "Film Day — July 11",
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function SponsorModal({ open, onClose }: Props) {
    const [form, setForm] = useState({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        sponsorshipInterest: "",
        message: "",
    });

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    function update(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const subject = encodeURIComponent("Sponsorship Inquiry — VVS Lagos 2026");
        const body = encodeURIComponent(
            `SPONSORSHIP INQUIRY — VVS Lagos 2026\n` +
            `────────────────────────────\n\n` +
            `Full Name: ${form.fullName}\n` +
            `Company / Organization: ${form.companyName}\n` +
            `Email: ${form.email}\n` +
            `Phone: ${form.phone}\n\n` +
            `Interested in sponsoring: ${form.sponsorshipInterest}\n\n` +
            `Additional Details:\n${form.message || "N/A"}\n`
        );

        window.location.href = `mailto:vvslagos@gmail.com?subject=${subject}&body=${body}`;
        handleClose();
    }

    function handleClose() {
        setForm({ fullName: "", companyName: "", email: "", phone: "", sponsorshipInterest: "", message: "" });
        onClose();
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-vvs-gold/20 rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a0a0a] border-b border-vvs-gold/10 p-5 sm:p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-vvs-gold/10 border border-vvs-gold/20">
                                    <Sparkles size={18} className="text-vvs-gold" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-extrabold text-vvs-white uppercase tracking-tight">
                                        Sponsor Application
                                    </h3>
                                    <p className="text-[10px] text-vvs-white/40 uppercase tracking-[0.2em] font-mono">
                                        VVS Lagos 2026
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-vvs-white/5 transition-colors">
                                <X size={18} className="text-vvs-white/50" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => update("fullName", e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white placeholder:text-vvs-white/20 focus:outline-none focus:border-vvs-gold/40 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                    Company / Organization *
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={form.companyName}
                                    onChange={(e) => update("companyName", e.target.value)}
                                    placeholder="Your company or organization"
                                    className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white placeholder:text-vvs-white/20 focus:outline-none focus:border-vvs-gold/40 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                        Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        placeholder="you@company.com"
                                        className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white placeholder:text-vvs-white/20 focus:outline-none focus:border-vvs-gold/40 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                        Phone *
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => update("phone", e.target.value)}
                                        placeholder="+234..."
                                        className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white placeholder:text-vvs-white/20 focus:outline-none focus:border-vvs-gold/40 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                    What would you like to sponsor? *
                                </label>
                                <select
                                    required
                                    value={form.sponsorshipInterest}
                                    onChange={(e) => update("sponsorshipInterest", e.target.value)}
                                    className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white focus:outline-none focus:border-vvs-gold/40 transition-colors appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                        backgroundPosition: "right 12px center",
                                        backgroundRepeat: "no-repeat",
                                    }}
                                >
                                    <option value="" disabled className="bg-[#0a0a0a] text-vvs-white/30">
                                        Select an event...
                                    </option>
                                    {EVENT_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt} className="bg-[#0a0a0a] text-vvs-white">
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-vvs-white/40 font-mono font-bold mb-1.5">
                                    Additional Details
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.message}
                                    onChange={(e) => update("message", e.target.value)}
                                    placeholder="Tell us about your sponsorship goals, budget range, or any specific requirements..."
                                    className="w-full bg-vvs-white/[0.03] border border-vvs-gold/10 rounded-lg px-4 py-3 text-sm text-vvs-white placeholder:text-vvs-white/20 focus:outline-none focus:border-vvs-gold/40 transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-vvs-gold text-vvs-black text-xs uppercase tracking-[0.2em] font-bold rounded-lg hover:bg-vvs-gold/90 transition-colors flex items-center justify-center gap-2"
                            >
                                Submit Inquiry →
                            </button>

                            <p className="text-center text-[10px] text-vvs-white/30 font-mono">
                                This will open your email client with the details pre‑filled
                            </p>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
