"use client";

import React from "react";
import { motion } from "framer-motion";

const timeline = [
    {
        year: "2022",
        title: "The Debut",
        date: "July 16, 2022",
        venue: "The Good Beach, Lagos",
        themeVision: "VVS Lagos debuted as a new fashion week format designed to celebrate the intersection of fashion, art, technology, and culture.",
        highlights: [
            "Runway presentations from renowned designers",
            "Curated art exhibition by Ken Nwadiogbu",
            "Musical performances by Solis and Aylo",
            "First-ever VVS Awards for Lifetime Achievement"
        ],
        legacy: "The inaugural edition established VVS as more than a fashion show, introducing a multidisciplinary platform connecting fashion, art, culture, and technology."
    },
    {
        year: "2023",
        title: "Optimizing Technology for African Art & Design",
        date: "July 15, 2023",
        venue: "Wings Towers, Victoria Island, Lagos",
        theme: "Optimizing Technology for African Art & Design",
        focus: "Exploring how finance and technology can accelerate the growth of African fashion, art, and design industries.",
        highlights: [
            "Showcases from five Nigerian designers",
            "Featured designers included: IN Official, TJ Who, Fruchè, Hertunba",
            "Panel discussions on technology and finance in African fashion",
            "Trunk sales",
            "Art exhibitions",
            "Performances by YKB and DJ Xclusive"
        ],
        legacy: "The 2023 edition shifted the conversation toward innovation, digital transformation, and the future of African creative businesses."
    },
    {
        year: "2024",
        title: "The Luxury of Authenticity & Collaboration",
        date: "July 2, 2024",
        venues: "Alliance Française de Lagos, John Randle Museum",
        theme: "The Luxury of Authenticity & Collaboration",
        focus: "Exploring what authentic luxury means from an African perspective while emphasizing the power of creative partnerships and collaborations.",
        highlights: [
            "Industry panel conversations",
            "Designer runway presentations",
            "Trunk sales",
            "Art exhibitions",
            "Musical performances",
            "Cross-disciplinary collaboration opportunities"
        ],
        legacy: "The 2024 edition reinforced VVS's role as a platform where culture, commerce, and collaboration intersect to elevate African design globally."
    },
    {
        year: "2025",
        title: "Este Fuego: The Fire Forging The Future",
        dates: "July 7–13, 2025",
        venues: "Nahouse Lagos, British Council, Alliance Française, John Randle Museum",
        theme: "Este Fuego: The Fire Forging The Future",
        focus: "A celebration of the passion, resilience, and creative energy shaping the next generation of African innovation.",
        highlights: [
            "Expanded from a single-day event into a week-long festival",
            "Government-endorsed programming",
            "Activities across five programming pillars",
            "Film screenings",
            "Panel discussions",
            "Fashion showcases and runway presentations",
            "Featured designers: I.N Official, LFJ Official, TJ-Who",
            "Performances by: Ayanfe, Caleboniel"
        ],
        legacy: "VVS evolved from a convention into a city-wide cultural festival, significantly expanding its scale, programming, and influence."
    },
    {
        year: "2026",
        title: "AFROMODERNISM"
    }
];

interface OurStoryProps {
    theme?: "light" | "dark";
}

export default function OurStory({ theme = "dark" }: OurStoryProps) {
    const isDark = theme === "dark";

    return (
        <section className={`py-32 relative ${isDark ? "bg-black" : "bg-white"}`}>
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Mission Block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em] mb-4">
                            About VVS
                        </p>
                        <h2 className={`text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-tight ${
                            isDark ? "text-white" : "text-black"
                        }`}>
                            Our Mission is to liberate African creatives.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col justify-center"
                    >
                        <p className={`font-mono uppercase tracking-widest text-xs mb-6 ${
                            isDark ? "text-white/50" : "text-black/50"
                        }`}>
                            How we do it:
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Elevating cultural standards",
                                "Building creative communities",
                                "Improving access to capital",
                                "Improving access to opportunities",
                                "Building creative infrastructure"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                                    <span className={`text-lg ${
                                        isDark ? "text-white/80" : "text-black/80"
                                    }`}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Timeline Block */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className={`text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-4 ${
                            isDark ? "text-white" : "text-black"
                        }`}>
                            Our <span className="text-[#c5a059]">Evolution</span>
                        </h2>
                    </motion.div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Vertical Line */}
                        <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 ${
                            isDark ? "bg-white/10" : "bg-black/10"
                        }`} />

                        {timeline.map((item, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <motion.div
                                    key={item.year}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className={`relative flex flex-col md:flex-row mb-16 md:mb-24 ${
                                        isEven ? "md:justify-start" : "md:justify-end"
                                    }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 top-4 md:top-2 w-3 h-3 rounded-full bg-[#c5a059] -translate-x-1/2 shadow-[0_0_15px_rgba(197,160,89,0.5)] z-10" />

                                    {/* Content Card */}
                                    <div className={`ml-12 md:ml-0 w-full md:w-1/2 ${isEven ? "md:pr-12 md:text-right" : "md:pl-12 text-left"}`}>
                                        <span className="text-[#c5a059] font-mono text-xl md:text-2xl font-bold tracking-widest block mb-2">
                                            {item.year}
                                        </span>
                                        <h3 className={`text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-4 ${
                                            isDark ? "text-white" : "text-black"
                                        }`}>
                                            {item.title}
                                        </h3>
                                        
                                        {/* Details */}
                                        <div className={`space-y-4 font-medium ${isDark ? "text-white/60" : "text-black/60"}`}>
                                            {(item.date || item.dates) && (
                                                <p><strong className={isDark ? "text-white/80" : "text-black/80"}>{item.date ? "Date:" : "Dates:"}</strong> {item.date || item.dates}</p>
                                            )}
                                            {(item.venue || item.venues) && (
                                                <p><strong className={isDark ? "text-white/80" : "text-black/80"}>{item.venue ? "Venue:" : "Venues:"}</strong> {item.venue || item.venues}</p>
                                            )}
                                            {item.themeVision && (
                                                <p><strong className={isDark ? "text-white/80" : "text-black/80"}>Theme & Vision:</strong> {item.themeVision}</p>
                                            )}
                                            {item.theme && (
                                                <p><strong className={isDark ? "text-white/80" : "text-black/80"}>Theme:</strong> {item.theme}</p>
                                            )}
                                            {item.focus && (
                                                <p><strong className={isDark ? "text-white/80" : "text-black/80"}>Focus:</strong> {item.focus}</p>
                                            )}
                                            
                                            {item.highlights && (
                                                <div className="mt-4">
                                                    <strong className={`block mb-2 ${isDark ? "text-white/80" : "text-black/80"}`}>Highlights:</strong>
                                                    <ul className={`space-y-1 ${isEven ? "md:text-right" : "text-left"}`}>
                                                        {item.highlights.map((hl, i) => (
                                                            <li key={i} className="text-sm">- {hl}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {item.legacy && (
                                                <div className="mt-4 p-4 rounded-xl border bg-black/5 border-white/10 dark:bg-white/5 dark:border-white/10">
                                                    <strong className={`block mb-1 text-sm ${isDark ? "text-[#c5a059]" : "text-[#8c6d3e]"}`}>Legacy</strong>
                                                    <p className="text-sm">{item.legacy}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
                
            </div>
        </section>
    );
}
