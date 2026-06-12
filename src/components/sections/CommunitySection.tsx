"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CommunitySectionProps {
    theme?: "light" | "dark";
}

export default function CommunitySection({ theme = "dark" }: CommunitySectionProps) {
    const isDark = theme === "dark";

    const roles = [
        "Fashion Designers", "Artists", "Models", "Filmmakers", 
        "Editors", "Animators", "Creative Directors", "Tech Founders",
        "Lawyers", "Investors", "Dealmakers", "DJs", "A&R Professionals"
    ];

    const benefits = [
        "Exclusive Events", "Collaborations", "Hiring Opportunities",
        "Creator Resources", "Community Access", "Industry Network"
    ];

    return (
        <section className={`py-32 border-y relative overflow-hidden ${
            isDark ? "bg-[#111111] border-white/5" : "bg-[#FAF7F2] border-black/5"
        }`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c5a059]/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    
                    {/* Left Column */}
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[#c5a059] font-mono text-xs uppercase tracking-[0.3em] mb-4"
                        >
                            The Network
                        </motion.p>
                        
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 ${
                                isDark ? "text-white" : "text-black"
                            }`}
                        >
                            1500+ <br /> Members
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className={`text-xl md:text-2xl leading-relaxed mb-12 max-w-lg ${
                                isDark ? "text-white/70" : "text-black/70"
                            }`}
                        >
                            A network of creators, founders, investors and cultural leaders shaping Africa&apos;s creative economy.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className={`font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-4 ${
                                isDark ? "text-white" : "text-black"
                            }`}>
                                Benefits <span className={`flex-1 h-[1px] ${
                                    isDark ? "bg-white/10" : "bg-black/10"
                                }`} />
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/30">
                                            <Check className="w-3 h-3 text-[#c5a059]" />
                                        </div>
                                        <span className={`font-medium text-sm ${
                                            isDark ? "text-white/80" : "text-black/80"
                                        }`}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Who It's For */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={`border p-8 md:p-12 rounded-3xl ${
                            isDark ? "bg-black/50 border-white/5" : "bg-white/50 border-black/5"
                        }`}
                    >
                        <h3 className={`font-extrabold uppercase tracking-tight text-3xl mb-8 ${
                            isDark ? "text-white" : "text-black"
                        }`}>
                            Who It&apos;s For
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {roles.map((role, idx) => (
                                <span 
                                    key={idx}
                                    className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors cursor-default ${
                                        isDark 
                                            ? "bg-white/5 border-white/10 text-white/80 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 hover:text-white" 
                                            : "bg-black/5 border-black/10 text-black/80 hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 hover:text-black"
                                    }`}
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                        
                        <div className={`mt-12 pt-8 border-t ${
                            isDark ? "border-white/10" : "border-black/10"
                        }`}>
                            <button className={`w-full py-4 font-bold uppercase tracking-widest text-sm rounded-full transition-colors duration-300 ${
                                isDark 
                                    ? "bg-white text-black hover:bg-[#c5a059]" 
                                    : "bg-black text-white hover:bg-[#c5a059]"
                            }`}>
                                Apply to Join
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
