"use client";

import React from "react";
import { motion } from "framer-motion";

const partners = [
    "Ledrop (Bumbu, Belaire, Glenfiddich, Balvenie, Jaegermeister, Casa Maestri, Hendricks)",
    "Airpeace",
    "British Council",
    "Mikano",
    "Essenza",
    "Gaaga",
    "Lagos Tourism",
    "Luxe Braids"
];

const mediaPartners = [
    "Pulse",
    "Bounce",
    "Arise",
    "Spice TV",
    "Deeds Magazine",
    "Culture Custodian",
    "Media Room Hub",
    "Grix Magazine",
    "Note Sphere",
    "We talk Sound",
    "Schick Magazine",
    "Gida Journal",
    "Okay Africa",
    "Blanc Magazine",
    "Zoot Magazine",
    "Soundcity"
];

interface PastPartnersProps {
    theme?: "light" | "dark";
}

export default function PastPartners({ theme = "dark" }: PastPartnersProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-20 md:py-28 overflow-hidden border-t ${
            isDark ? "bg-black border-white/5" : "bg-[#FAF7F2] border-black/5"
        }`}>
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto px-6 mb-12 text-center"
            >
                <p className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em] font-extrabold mb-3">
                    Partners & Sponsors
                </p>
                <h2 className={`text-2xl md:text-3xl font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                    Collaborating Brands & Media
                </h2>
            </motion.div>
            
            {/* 1. Partners Marquee (Left to Right) */}
            <div className="relative w-full flex overflow-x-hidden mb-12">
                <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r z-20 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l z-20 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                
                <div className="flex whitespace-nowrap gap-16 md:gap-24 items-center w-full">
                    <div className="shrink-0 bg-[#c5a059]/10 border border-[#c5a059]/20 px-3 py-1 rounded text-center ml-6 z-30">
                        <span className="text-[#c5a059] font-mono text-[9px] uppercase tracking-widest font-extrabold">PARTNERS</span>
                    </div>
                    <motion.div
                        className="flex whitespace-nowrap gap-16 md:gap-24 items-center"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 35
                        }}
                    >
                        {/* Duplicate the array to create seamless loop */}
                        {[...partners, ...partners].map((partner, idx) => (
                            <div 
                                key={idx}
                                className={`text-xl md:text-2xl font-black uppercase tracking-tighter transition-colors duration-300 ${
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
            </div>

            {/* 2. Media Partners Marquee (Right to Left) */}
            <div className="relative w-full flex overflow-x-hidden">
                <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r z-20 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l z-20 ${
                    isDark ? "from-black to-transparent" : "from-[#FAF7F2] to-transparent"
                }`} />
                
                <div className="flex whitespace-nowrap gap-16 md:gap-24 items-center w-full">
                    <div className="shrink-0 bg-[#c5a059]/10 border border-[#c5a059]/20 px-3 py-1 rounded text-center ml-6 z-30">
                        <span className="text-[#c5a059] font-mono text-[9px] uppercase tracking-widest font-extrabold">MEDIA PARTNERS</span>
                    </div>
                    <motion.div
                        className="flex whitespace-nowrap gap-16 md:gap-24 items-center"
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40
                        }}
                    >
                        {/* Duplicate the array to create seamless loop */}
                        {[...mediaPartners, ...mediaPartners].map((media, idx) => (
                            <div 
                                key={idx}
                                className={`text-xl md:text-2xl font-black uppercase tracking-tighter transition-colors duration-300 ${
                                    isDark 
                                        ? "text-white/20 hover:text-white/50" 
                                        : "text-black/20 hover:text-black/50"
                                }`}
                            >
                                {media}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
