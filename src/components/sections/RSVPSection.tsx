"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

interface RSVPSectionProps {
    theme?: "light" | "dark";
}

function RSVPForm({ isDark }: { isDark: boolean }) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const searchParams = useSearchParams();
    const referredBy = searchParams.get("ref");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            try {
                await supabase.from("rsvps").insert([{
                    name: "Unknown (from quick RSVP)",
                    email: email.trim(),
                    attendance: "yes",
                    events: [],
                    referred_by_admin: referredBy || null,
                    created_at: new Date().toISOString()
                }]);
            } catch (err) {
                console.error("Failed to insert quick RSVP", err);
            }
            setSubmitted(true);
            setEmail("");
        }
    };

    return (
        <section className={`py-20 md:py-28 relative overflow-hidden border-t ${
            isDark ? "border-white/10 bg-[#0d0d0d]" : "border-black/10 bg-[#FAF7F2]"
        }`}>
            {/* Background glow in theme accent colors */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#c5a059]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto"
                >
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] mb-4 block uppercase">
                        ATTENDANCE
                    </span>
                    
                    <h2 className={`text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-4 ${
                        isDark ? "text-white" : "text-black"
                    }`}>
                        REQUEST <span className="text-[#c5a059]">ACCESS</span>
                    </h2>
                    
                    <p className={`text-xs sm:text-sm font-light mb-8 leading-relaxed max-w-md mx-auto ${
                        isDark ? "text-white/50" : "text-black/50"
                    }`}>
                        VVS Lagos is an exclusive, highly curated experience. Submit your details to request an invitation to the 2026 events.
                    </p>

                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-4 px-6 border border-[#c5a059]/30 rounded-2xl bg-[#c5a059]/5 max-w-md mx-auto"
                        >
                            <span className="text-[#c5a059] font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                ✦ Your request has been received
                            </span>
                        </motion.div>
                    ) : (
                        <form 
                            onSubmit={handleSubmit} 
                            className={`flex flex-col sm:flex-row gap-2 max-w-md mx-auto rounded-xl p-1.5 border ${
                                isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                            }`}
                        >
                            <input
                                type="email"
                                required
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
                                className="px-6 py-3 bg-[#c5a059] text-black font-extrabold text-[10px] uppercase tracking-widest rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                RSVP NOW
                            </button>
                        </form>
                    )}
                </motion.div>
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
