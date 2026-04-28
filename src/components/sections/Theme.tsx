"use client";

import React from "react";
import { motion } from "framer-motion";

const pillars = [
    { label: "Heritage", icon: "✦" },
    { label: "Innovation", icon: "✦" },
    { label: "Couture", icon: "✦" },
    { label: "Futurism", icon: "✦" },
];

export default function Theme() {
    return (
        <section id="theme" className="py-20 md:py-32 bg-vvs-black relative overflow-hidden">
            {/* Decorative vertical line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent to-vvs-gold/50" />

            {/* Background mascot watermark */}
            <div className="absolute inset-0 flex items-center justify-end opacity-[0.04] pointer-events-none overflow-hidden">
                <img src="/assets/VVSMASCOT2.webp" alt="" className="h-full object-contain" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                <div className="flex flex-col items-start gap-10 lg:gap-14">
                    {/* Left: Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="w-full min-w-0 max-w-3xl"
                    >
                        <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-6 block font-mono font-bold">
                            2026 THEME
                        </span>
                        <h2 className="font-serif font-extrabold text-vvs-white mb-6 md:mb-8 leading-[1.05]" style={{ fontSize: "clamp(2rem, 8vw, 3.75rem)" }}>
                            AFRO<br /><span className="text-vvs-gold italic">MODERNISM</span>
                        </h2>
                        <div className="space-y-4 md:space-y-5 text-vvs-white/70 text-sm sm:text-base md:text-lg leading-relaxed font-light font-sans break-words">
                            <p>
                                In its 5th edition, VVS Lagos explores the complex dialogue between our ancestral heritage and the digital frontier.
                            </p>
                            <p>
                                <span className="text-vvs-white font-medium">Afromodernism</span> is not just an aesthetic — it is a movement. The conscious reconstruction of African identities using the tools of the future, while remaining deeply rooted in the soil of our past.
                            </p>
                            <p>
                                We collide the worlds of haute couture, generative art, and cinematic storytelling to redefine what it means to be a creator in the modern African landscape.
                            </p>
                        </div>

                    </motion.div>

                    {/* Right: Visual pillars */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="w-full"
                    >
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            {pillars.map((pillar, i) => (
                                <motion.div
                                    key={pillar.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i + 0.3 }}
                                    viewport={{ once: true }}
                                    className="border border-vvs-gold/20 rounded-xl sm:rounded-2xl p-5 sm:p-8 bg-vvs-white/[0.02] hover:border-vvs-gold/50 transition-all group"
                                >
                                    <img src="/assets/VVSMASCOT7.png" alt="" className="h-6 w-6 object-contain opacity-70" />
                                    <h3 className="text-base sm:text-xl font-serif font-extrabold text-vvs-white uppercase tracking-tight group-hover:text-vvs-gold transition-colors">
                                        {pillar.label}
                                    </h3>
                                </motion.div>
                            ))}
                        </div>

                        {/* Mascot accent image */}
                        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl overflow-hidden border border-vvs-gold/10 aspect-video relative">
                            <img
                                src="/assets/VVSMASCOT2.webp"
                                alt="VVS Brand Visual"
                                className="w-full h-full object-cover object-center opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-vvs-black/80 to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
