"use client";

import React from "react";
import { motion } from "framer-motion";

const partners = [
    "MAC Cosmetics",
    "Audiomack",
    "TikTok",
    "MTN",
    "British Council",
    "Pepsi",
    "Heineken",
    "Lagos State Tourism Board",
    "GQ"
];

interface PastPartnersProps {
    theme?: "light" | "dark";
}

export default function PastPartners({ theme = "dark" }: PastPartnersProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-24 overflow-hidden border-t ${
            isDark ? "bg-black border-white/5" : "bg-[#FAF7F2] border-black/5"
        }`}>
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <p className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em]">
                    Past Partners
                </p>
            </div>
            
            {/* Infinite Marquee */}
            <div className="relative w-full flex overflow-x-hidden">
                <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r z-10 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l z-10 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                
                <motion.div
                    className="flex whitespace-nowrap gap-16 md:gap-32 items-center"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {/* Duplicate the array to create seamless loop */}
                    {[...partners, ...partners].map((partner, idx) => (
                        <div 
                            key={idx}
                            className={`text-2xl md:text-4xl font-black uppercase tracking-tighter transition-colors duration-300 ${
                                isDark 
                                    ? "text-white/20 hover:text-white/50" 
                                    : "text-black/20 hover:text-black/50"
                            }`}
                        >
                            {partner}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
