"use client";

import React from "react";
import { motion } from "framer-motion";

interface WhatIsVVSProps {
    theme?: "light" | "dark";
}

export default function WhatIsVVS({ theme = "dark" }: WhatIsVVSProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-32 relative overflow-hidden ${
            isDark ? "bg-black" : "bg-white"
        }`}>
            <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em] mb-8"
                >
                    What Is VVS?
                </motion.p>
                
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className={`text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-[1.1] mb-12 text-balance ${
                        isDark ? "text-white" : "text-black"
                    }`}
                >
                    VVS Lagos is a creative convention born in Lagos and built for the world.
                </motion.h2>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="w-24 h-1 bg-[#c5a059] mx-auto mb-12"
                />
                
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className={`text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                        isDark ? "text-white/70" : "text-black/70"
                    }`}
                >
                    VVS exists to liberate African creatives through culture, community, opportunity, and innovation.
                </motion.p>
            </div>
        </section>
    );
}
