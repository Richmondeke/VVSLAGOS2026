"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
    { value: "5", label: "Years Running" },
    { value: "12,000+", label: "Attendees" },
    { value: "100+", label: "Brand Partners" },
    { value: "200M+", label: "Media Impressions" },
    { value: "3,000", label: "Annual Guests" },
    { value: "30M+", label: "Influencer Reach" },
];

interface ImpactStatsProps {
    theme?: "light" | "dark";
}

export default function ImpactStats({ theme = "dark" }: ImpactStatsProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-24 border-y relative overflow-hidden ${
            isDark ? "bg-[#111111] border-white/5" : "bg-[#FAF7F2] border-black/5"
        }`}>
            {/* Subtle glow background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/5 to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <h2 className={`text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4 ${
                        isDark ? "text-white" : "text-black"
                    }`}>
                        Traction & <span className="text-[#c5a059]">Impact</span>
                    </h2>
                    <p className={`max-w-xl mx-auto uppercase tracking-widest text-xs font-mono ${
                        isDark ? "text-white/50" : "text-black/50"
                    }`}>
                        VVS Lagos by the numbers
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col items-center justify-center text-center p-6 border rounded-2xl transition-all duration-300 ${
                                isDark
                                    ? "border-white/5 bg-black/40 hover:bg-[#c5a059]/5 hover:border-[#c5a059]/20"
                                    : "border-black/5 bg-white/40 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30"
                            }`}
                        >
                            <span className={`text-4xl md:text-6xl font-black mb-2 tracking-tighter ${
                                isDark ? "text-white" : "text-black"
                            }`}>
                                {stat.value}
                            </span>
                            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-[#c5a059]">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
