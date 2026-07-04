"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { triggerHaptic } from "@/utils/haptic";

interface RSVPSectionProps {
    theme?: "light" | "dark";
}

function RSVPForm({ isDark }: { isDark: boolean }) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const referredBy = searchParams.get("ref");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubmitting(true);
            setError(null);
            try {
                const res = await fetch("/api/rsvp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Quick RSVP Guest",
                        email: email.trim(),
                        attendance: "yes",
                        events: [],
                        event_type: "quick_rsvp",
                        referred_by_admin: referredBy || null,
                    }),
                });
                const result = await res.json();
                if (!res.ok) {
                    throw new Error(result.error || "Failed to submit RSVP");
                }
                triggerHaptic("success");
                setSubmitted(true);
                setEmail("");
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Failed to submit RSVP");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <section className={`py-20 md:py-28 relative overflow-hidden border-t ${
            isDark ? "border-white/10 bg-[#0d0d0d]" : "border-black/10 bg-[#FAF7F2]"
        }`}>
            {/* Background glow in theme accent colors */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#c5a059]/5 blur-[120px] rounded-full pointer-events-none" />

             <div className="w-full max-w-5xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                    
                    {/* VVS Mascot Left Column with Glitch Effect */}
                    <div className="md:col-span-4 flex justify-center">
                        <motion.div
                            animate={{ 
                                filter: ["hue-rotate(0deg)", "hue-rotate(0deg)", "hue-rotate(90deg) invert(1)", "hue-rotate(-90deg) blur(1.5px)", "hue-rotate(0deg)", "hue-rotate(0deg)"] 
                            }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                            className="w-28 h-28 sm:w-36 sm:h-36 relative"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img
                                src={isDark ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                alt="VVS Mascot Head"
                                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(197,160,89,0.25)]"
                            />
                        </motion.div>
                    </div>

                    {/* RSVP Form Right Column */}
                    <div className="md:col-span-8 text-center md:text-left space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] mb-3 block uppercase">
                                ATTENDANCE &amp; TICKETS
                            </span>
                            
                            <h2 className={`text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-4 ${
                                isDark ? "text-white" : "text-black"
                            }`}>
                                REQUEST <span className="text-[#c5a059]">ACCESS</span>
                            </h2>
                            
                            <p className={`text-xs sm:text-sm font-light leading-relaxed max-w-xl ${
                                isDark ? "text-white/60" : "text-black/60"
                            }`}>
                                VVS Lagos is an exclusive, highly curated experience. Submit your details to request an invitation to the 2026 events.
                            </p>

                            {/* Partyverse Ticket Link Info Card */}
                            <div className={`p-4 rounded-xl border mt-6 mb-4 text-xs max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
                                isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"
                            }`}>
                                <div className="text-center sm:text-left">
                                    <span className="font-bold uppercase tracking-wider block text-[10px] text-[#c5a059] mb-1">
                                        ✦ VVS RUNWAY SHOW (MAIN EVENT)
                                    </span>
                                    <p className={isDark ? "text-white/50" : "text-black/50"}>
                                        Looking for Runway tickets? Buy directly on Partyverse.
                                    </p>
                                </div>
                                <a
                                    href="https://www.pv.rsvp/vvs-fashion-show"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-[#c5a059] text-black hover:bg-white hover:text-black font-extrabold uppercase tracking-wider text-[10px] rounded-lg transition-colors inline-block shrink-0"
                                >
                                    Buy Tickets
                                </a>
                            </div>

                            {error && (
                                <div className="mb-4 text-xs text-red-500 font-mono">
                                    {error}
                                </div>
                            )}

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-4 px-6 border border-[#c5a059]/30 rounded-2xl bg-[#c5a059]/5 max-w-md"
                                >
                                    <span className="text-[#c5a059] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                        ✦ Your request has been received
                                    </span>
                                </motion.div>
                            ) : (
                                <form 
                                    onSubmit={handleSubmit} 
                                    className={`flex flex-col sm:flex-row gap-2 max-w-xl rounded-xl p-1.5 border ${
                                        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                    }`}
                                >
                                    <input
                                        type="email"
                                        required
                                        disabled={isSubmitting}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className={`flex-1 px-4 py-3 text-xs sm:text-sm bg-transparent outline-none ${
                                            isDark 
                                                ? "text-white placeholder:text-white/30" 
                                                : "text-black placeholder:text-black/30"
                                        }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-[#c5a059] text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? "SUBMITTING..." : "RSVP NOW"}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default function RSVPSection({ theme = "dark" }: RSVPSectionProps) {
    return (
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
            <RSVPForm isDark={theme === "dark"} />
        </Suspense>
    );
}
