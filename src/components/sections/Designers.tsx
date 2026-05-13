"use client";

import React from "react";
import { motion } from "framer-motion";

const designers = [
    { name: "IN OFFICIAL", image: "/assets/IN OFFICIAL.png" },
    { name: "HERTUNBA", image: "/assets/HERTUNBA.avif" },
    { name: "LFJ OFFICIAL", image: "/assets/LFJ OFFICIAL.webp" },
    { name: "TJ-WHO", image: "/assets/TJ WHO.webp" },
    { name: "PIECE ET PATCH", image: "/assets/PIECE ET PATCH.webp" },
    { name: "FRUCHÉ", image: "/assets/FRUCHE.webp" },
    { name: "ONALAJA", image: "/assets/ONALAJA.webp" },
    { name: "RE LAGOS", image: "/assets/RE LAGOS.webp" },
    { name: "TOKYO JAMES", image: "/assets/TOKYO JAMEs.webp" },
    { name: "I AM ISIGO", image: "/assets/IAM ISIGO.webp" },
    { name: "TZAR STUDIOS", image: "/assets/TZAR STUDIOS.webp" },
];

export default function Designers() {
    return (
        <section id="designers" className="py-20 md:py-32 bg-vvs-black relative overflow-hidden">
            {/* Decorative Mascot */}
            <div className="absolute right-0 top-1/4 w-96 h-96 opacity-[0.03] pointer-events-none translate-x-1/3">
                <img
                    src="/assets/VVSMASCOT7.png"
                    alt=""
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

                {/* Section header */}
                <div className="mb-10 md:mb-16">
                    <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                        VVS COLLECTIVE
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-extrabold text-vvs-white uppercase tracking-tighter">
                        THE <span className="text-vvs-gold">INNOVATORS</span>
                    </h2>
                    <p className="text-vvs-white/50 mt-4 max-w-2xl font-sans font-light text-base md:text-lg">
                        Visionary designers selected for VVS Lagos 2026, each telling a uniquely African story through the lens of tomorrow.
                    </p>
                </div>

                {/* Designer grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {designers.map((designer, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-vvs-gold/10 hover:border-vvs-gold/50 transition-all duration-500 bg-vvs-white/[0.02] hover:bg-vvs-gold/[0.05] hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                        >
                            {/* Image Container */}
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <img
                                    src={designer.image}
                                    alt={designer.name}
                                    className="w-full h-full object-cover grayscale brightness-75 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 group-hover:scale-110 transition-all duration-1000 ease-in-out"
                                />
                                {/* Overlay gradient that fades on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-vvs-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
                            </div>
                            {/* Info */}
                            <div className="p-4 sm:p-5 relative">
                                <h3 className="text-[11px] sm:text-sm md:text-base font-serif font-extrabold text-vvs-white uppercase tracking-[0.1em] group-hover:text-vvs-gold transition-colors duration-300">
                                    {designer.name}
                                </h3>
                                <div className="h-[1px] w-0 group-hover:w-full bg-vvs-gold transition-all duration-500 mt-2" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
