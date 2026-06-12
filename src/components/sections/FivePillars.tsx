"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface FivePillarsProps {
    theme?: "light" | "dark";
}

const pillars = [
    {
        title: "Fashion",
        desc: "Runways & Exhibitions"
    },
    {
        title: "Art",
        desc: "Curated Installations"
    },
    {
        title: "Music",
        desc: "Performances & Culture"
    },
    {
        title: "Film",
        desc: "Screenings & Storytelling"
    },
    {
        title: "Tech",
        desc: "Tools & Innovation"
    }
];

export default function FivePillars({ theme = "dark" }: FivePillarsProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-24 md:py-32 overflow-hidden relative border-y ${
            isDark ? "bg-[#111111] border-white/5" : "bg-[#FAF7F2] border-black/5"
        }`}>
            <div className="max-w-7xl mx-auto px-6 mb-16 text-center md:text-left">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={`text-4xl md:text-6xl font-extrabold uppercase tracking-tighter mb-4 ${
                        isDark ? "text-white" : "text-black"
                    }`}>
                        The Five <span className="text-[#c5a059]">Pillars</span>
                    </h2>
                    <p className={`max-w-xl text-sm md:text-base font-mono uppercase tracking-widest ${
                        isDark ? "text-white/50" : "text-black/50"
                    } mx-auto md:mx-0`}>
                        The foundation of our collective
                    </p>
                </motion.div>
            </div>

            <div className="w-full">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap lg:grid lg:grid-cols-5 gap-4 md:gap-6 justify-center">
                        {pillars.map((pillar, idx) => (
                            <div
                                key={pillar.title}
                                className={`w-full sm:w-[calc(50%-12px)] lg:w-auto flex flex-col group ${
                                    idx === 4 ? "sm:w-[calc(50%-12px)] lg:w-auto" : ""
                                }`}
                            >
                                <div className={`h-[320px] md:h-[400px] w-full rounded-2xl overflow-hidden border relative p-6 md:p-8 flex flex-col justify-end transition-all duration-300 hover:-translate-y-2 ${
                                    isDark 
                                        ? "bg-black border-white/10 hover:border-[#c5a059]/50" 
                                        : "bg-white border-black/10 hover:border-[#c5a059]/50 hover:shadow-xl"
                                }`}>
                                    <p className="text-[#c5a059] font-mono text-[10px] uppercase tracking-[0.3em] mb-4">
                                        0{idx + 1}
                                    </p>
                                    <h3 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase mb-3 ${
                                        isDark ? "text-white" : "text-black"
                                    }`}>
                                        {pillar.title}
                                    </h3>
                                    <p className={`text-sm font-medium ${
                                        isDark ? "text-white/70" : "text-black/70"
                                    }`}>
                                        {pillar.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
