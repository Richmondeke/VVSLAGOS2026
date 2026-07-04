"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubmitting(true);
            setError(null);
            try {
                const res = await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const result = await res.json();
                if (!res.ok) {
                    throw new Error(result.error || "Failed to subscribe");
                }
                triggerHaptic("success");
                setSubmitted(true);
                setEmail("");
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Failed to subscribe");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <section className="py-20 md:py-28 bg-vvs-black relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vvs-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                        STAY CONNECTED
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-vvs-white uppercase tracking-tighter mb-4">
                        JOIN THE <span className="text-vvs-gold">MOVEMENT</span>
                    </h2>
                    <p className="text-vvs-white/50 text-sm sm:text-base font-sans font-light mb-8 leading-relaxed">
                        Be the first to know about designer reveals, event updates, and exclusive access.
                    </p>

                    {error && (
                        <div className="mb-4 text-xs text-red-500 font-mono">
                            {error}
                        </div>
                    )}

                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-6 px-8 border border-vvs-gold/30 rounded-2xl bg-vvs-gold/5"
                        >
                            <span className="text-vvs-gold font-mono font-bold text-sm uppercase tracking-widest">
                                ✦ You&apos;re on the list
                            </span>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                            <input
                                type="email"
                                required
                                disabled={isSubmitting}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 bg-vvs-white/5 border border-vvs-gold/20 sm:rounded-l-full sm:rounded-r-none rounded-full text-vvs-white text-sm font-sans placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-4 bg-vvs-gold text-vvs-black text-xs uppercase tracking-[0.2em] font-bold sm:rounded-r-full sm:rounded-l-none rounded-full hover:bg-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(197,160,89,0.2)]"
                            >
                                {isSubmitting ? "Subscribed..." : "Subscribe"}
                            </button>
                        </form>
                    )}

                    <p className="text-vvs-white/20 text-[10px] font-mono mt-4 uppercase tracking-widest">
                        No spam. Unsubscribe anytime.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
