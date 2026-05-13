"use client";

import React from "react";
import { motion } from "framer-motion";

const highlights = [
    { title: "Runway", icon: "✦" },
    { title: "Art", icon: "✦" },
    { title: "Culture", icon: "✦" },
    { title: "Music", icon: "✦" },
];

export default function Highlights() {
    return (
        <section className="py-20 bg-vvs-gold text-vvs-black overflow-hidden">
            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex items-center space-x-20 py-4"
                >
                    {[...Array(10)].map((_, i) => (
                        <React.Fragment key={i}>
                            {highlights.map((item) => (
                                <div key={item.title} className="flex items-center space-x-4 sm:space-x-8">
                                    <img src="/assets/VVSMASCOT1.webp" alt="" aria-hidden="true" className="h-6 sm:h-10 w-auto opacity-70" />
                                    <span className="text-3xl sm:text-5xl md:text-7xl font-serif font-extrabold uppercase tracking-tighter">{item.title}</span>
                                    <img src="/assets/VVSMASCOT1.webp" alt="" aria-hidden="true" className="h-6 sm:h-10 w-auto opacity-70" />
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
