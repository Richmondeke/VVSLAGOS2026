"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const categories = [
    { icon: "✦", label: "Fashion & Textile" },
    { icon: "◈", label: "Visual Art" },
    { icon: "◎", label: "Design & Architecture" },
    { icon: "▶", label: "Film & Moving Image" },
    { icon: "⊕", label: "Technology & Innovation" },
    { icon: "◆", label: "Music & Sound" },
    { icon: "✿", label: "Cultural Entrepreneurship" },
    { icon: "⬡", label: "Photography" },
    { icon: "⌘", label: "Creative Writing & Poetry" },
];

const accessGaps = [
    { title: "Mentorship", description: "No structured pathways connecting emerging talent to established creative leaders." },
    { title: "Funding", description: "Limited access to early-stage creative capital and grant ecosystems." },
    { title: "Networks", description: "Isolation from global industry networks, buyers, and collaborators." },
    { title: "Visibility", description: "Systemic barriers to reaching international audiences and markets." },
    { title: "Markets", description: "Underdeveloped commercial infrastructure for African creative IP." },
];

const benefits = [
    "Mentorship from established VVS Innovators and industry veterans",
    "Exhibition and showcase opportunities at VVS Lagos events",
    "Access to the VVS creative network across Africa and the diaspora",
    "Production support and studio access",
    "Brand development and business strategy guidance",
    "Introductions to international buyers, galleries, and curators",
    "Digital amplification across VVS platforms and partner channels",
    "Seed funding consideration for high-potential projects",
];

const pipeline = [
    { step: "01", label: "Discover", desc: "Identify emerging talent across Africa" },
    { step: "02", label: "Develop", desc: "Structured mentorship & skill-building" },
    { step: "03", label: "Fund", desc: "Seed capital & resource access" },
    { step: "04", label: "Showcase", desc: "Platform at VVS events & exhibitions" },
    { step: "05", label: "Commercialise", desc: "Market entry & revenue pathways" },
];

const focus2026 = [
    { title: "Labs Residency", description: "A curated 3-month creative development programme for 10 selected talents from across West Africa." },
    { title: "Mentorship Circles", description: "Bi-weekly sessions pairing emerging creatives with VVS Innovators across disciplines." },
    { title: "Prototype Showcase", description: "A dedicated VVS Future Labs presentation stage at VVS Lagos 2026 Week." },
    { title: "Creative Capital Initiative", description: "Partnership with aligned investors to offer micro-grants and resource support to participants." },
];

interface Props {
    theme?: "dark" | "light";
    isSummary?: boolean;
}

export default function VVSFutureLabs({ theme = "dark", isSummary = false }: Props) {
    const [hoveredGap, setHoveredGap] = useState<number | null>(null);
    const isDark = theme === "dark";

    return (
        <section
            id="future-labs"
            className={`py-24 md:py-36 relative overflow-hidden border-t ${
                isDark ? "bg-[#030303] border-white/8" : "bg-[#F5F0E8] border-black/8"
            }`}
        >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c5a059]/[0.04] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#c5a059]/[0.03] blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

                {/* ── Section Label ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${isSummary ? "mb-10" : "mb-16 md:mb-24"}`}
                >
                    <style>{`
                        @keyframes labs-glitch {
                            0% { transform: translate(0); clip-path: inset(0 0 0 0); }
                            5% { transform: translate(-2px, -1px) skewX(2deg); clip-path: inset(8% 0 15% 0); }
                            10% { transform: translate(1px, 2px) skewX(-2deg); clip-path: inset(25% 0 8% 0); }
                            15% { transform: translate(-1px, 0); clip-path: inset(3% 0 50% 0); }
                            20% { transform: translate(2px, -1px) skewX(1deg); clip-path: inset(40% 0 5% 0); }
                            25% { transform: translate(0); clip-path: inset(0 0 0 0); }
                            100% { transform: translate(0); clip-path: inset(0 0 0 0); }
                        }
                        @keyframes labs-split-left {
                            0%, 100% { transform: translate(0); opacity: 0; }
                            8% { transform: translate(-3px, 1px); opacity: 0.6; }
                            12% { transform: translate(2px, -1px); opacity: 0.4; }
                            18% { transform: translate(-1px, 2px); opacity: 0.7; }
                            22% { transform: translate(0); opacity: 0; }
                        }
                        @keyframes labs-split-right {
                            0%, 100% { transform: translate(0); opacity: 0; }
                            5% { transform: translate(3px, -2px); opacity: 0.5; }
                            14% { transform: translate(-2px, 1px); opacity: 0.7; }
                            20% { transform: translate(1px, -1px); opacity: 0.4; }
                            24% { transform: translate(0); opacity: 0; }
                        }
                        .labs-glitch-img {
                            animation: labs-glitch 4s infinite steps(2, start) alternate;
                        }
                        .labs-split-cyan {
                            animation: labs-split-left 4s infinite steps(2, start) alternate;
                            filter: hue-rotate(180deg) saturate(3);
                        }
                        .labs-split-magenta {
                            animation: labs-split-right 4s infinite steps(2, start) alternate;
                            filter: hue-rotate(300deg) saturate(3);
                        }
                    `}</style>

                    <div className="lg:col-span-8">
                        <span className="text-[#c5a059] text-xs uppercase tracking-[0.5em] mb-4 block font-mono font-bold">
                            DEVELOPMENTAL ARM
                        </span>
                        <h2 className={`text-4xl sm:text-5xl md:text-7xl font-serif font-extrabold uppercase tracking-tighter leading-none mb-6 ${
                            isDark ? "text-white" : "text-black"
                        }`}>
                            VVS<br />
                            <span className="text-[#c5a059]">FUTURE</span><br />
                            LABS
                        </h2>
                        <div className={`w-24 h-[1px] mb-8 ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                        <p className={`text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-3xl ${
                            isDark ? "text-white/70" : "text-black/70"
                        }`}>
                            VVS Future Labs is the developmental arm of VVS Lagos — designed to identify, mentor, showcase, and support the next generation of African creative talent across fashion, art, design, film, technology, and cultural entrepreneurship.
                        </p>
                        <p className={`text-sm sm:text-base font-light leading-relaxed max-w-2xl mt-4 ${
                            isDark ? "text-white/50" : "text-black/50"
                        }`}>
                            Established to move beyond celebration and visibility into actual talent development, infrastructure building, and economic empowerment.
                        </p>
                        {isSummary && (
                            <div className="mt-8">
                                <a
                                    href="/future-labs"
                                    className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#c5a059] hover:text-white transition-colors"
                                >
                                    Learn More <span>→</span>
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 flex items-center justify-center pt-6 lg:pt-0">
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 select-none pointer-events-none flex items-center justify-center">
                            <img
                                src={isDark ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                alt=""
                                className="absolute w-4/5 h-4/5 object-contain labs-split-cyan opacity-40"
                            />
                            <img
                                src={isDark ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                alt=""
                                className="absolute w-4/5 h-4/5 object-contain labs-split-magenta opacity-40"
                            />
                            <img
                                src={isDark ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                alt="VVS Mascot Head"
                                className="w-4/5 h-4/5 object-contain labs-glitch-img"
                            />
                        </div>
                    </div>
                </motion.div>

                {!isSummary && (
                    <>

                {/* ── Vision Statement ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`mb-20 p-8 md:p-12 rounded-2xl border relative overflow-hidden ${
                        isDark
                            ? "bg-[#c5a059]/[0.04] border-[#c5a059]/20"
                            : "bg-[#c5a059]/[0.06] border-[#c5a059]/30"
                    }`}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 blur-[80px] rounded-full pointer-events-none" />
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">
                        OUR VISION
                    </span>
                    <p className={`text-xl sm:text-2xl md:text-3xl font-serif font-bold leading-snug tracking-tight ${
                        isDark ? "text-white" : "text-black"
                    }`}>
                        To become Africa&apos;s leading creative incubator —
                        helping emerging creatives transform their talent into
                        sustainable, internationally recognised creative businesses.
                    </p>
                </motion.div>

                {/* ── Why It Exists ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">WHY IT EXISTS</span>
                    <h3 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-tight mb-3 ${isDark ? "text-white" : "text-black"}`}>
                        The Access Gap
                    </h3>
                    <p className={`text-sm leading-relaxed mb-8 max-w-2xl ${isDark ? "text-white/50" : "text-black/50"}`}>
                        Africa has an extraordinary volume of creative talent — but talent alone does not translate to industry presence. The most critical barriers are structural.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {accessGaps.map((gap, i) => (
                            <motion.div
                                key={i}
                                onMouseEnter={() => setHoveredGap(i)}
                                onMouseLeave={() => setHoveredGap(null)}
                                whileHover={{ y: -4 }}
                                className={`p-5 rounded-xl border cursor-default transition-all duration-300 ${
                                    hoveredGap === i
                                        ? "border-[#c5a059]/60 bg-[#c5a059]/8 shadow-[0_0_30px_rgba(197,160,89,0.12)]"
                                        : isDark
                                        ? "border-white/8 bg-white/[0.02]"
                                        : "border-black/8 bg-black/[0.02]"
                                }`}
                            >
                                <span className={`text-[10px] font-mono tracking-widest uppercase font-extrabold block mb-2 ${
                                    hoveredGap === i ? "text-[#c5a059]" : "text-[#c5a059]/60"
                                }`}>
                                    0{i + 1}
                                </span>
                                <h4 className={`text-base font-bold uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                                    {gap.title}
                                </h4>
                                <p className={`text-xs leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
                                    {gap.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── 2026 Focus ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">2026 PROGRAMME</span>
                    <h3 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-tight mb-8 ${isDark ? "text-white" : "text-black"}`}>
                        2026 Focus Areas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {focus2026.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className={`p-6 rounded-xl border transition-all ${
                                    isDark
                                        ? "bg-white/[0.02] border-white/8 hover:border-[#c5a059]/30 hover:bg-white/[0.04]"
                                        : "bg-white border-black/8 hover:border-[#c5a059]/30"
                                }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-[#c5a059] font-mono text-xs font-extrabold tracking-widest">✦</span>
                                    <h4 className={`text-base font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                                        {item.title}
                                    </h4>
                                </div>
                                <p className={`text-sm leading-relaxed ${isDark ? "text-white/55" : "text-black/55"}`}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Categories Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">OPEN TO ALL DISCIPLINES</span>
                    <h3 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-tight mb-8 ${isDark ? "text-white" : "text-black"}`}>
                        Creative Categories
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ scale: 1.04, y: -2 }}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center cursor-default transition-all ${
                                    isDark
                                        ? "border-white/8 bg-white/[0.02] hover:border-[#c5a059]/40 hover:bg-[#c5a059]/5"
                                        : "border-black/8 bg-black/[0.02] hover:border-[#c5a059]/40"
                                }`}
                            >
                                <span className="text-[#c5a059] text-xl">{cat.icon}</span>
                                <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wide leading-tight ${isDark ? "text-white/70" : "text-black/70"}`}>
                                    {cat.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── What Participants Receive ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div>
                            <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">PARTICIPANT BENEFITS</span>
                            <h3 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                                What Participants Receive
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                                        isDark
                                            ? "border-white/8 bg-white/[0.02] hover:border-[#c5a059]/20"
                                            : "border-black/8 bg-black/[0.02] hover:border-[#c5a059]/20"
                                    }`}
                                >
                                    <span className="text-[#c5a059] text-xs mt-0.5 shrink-0 font-bold">✦</span>
                                    <span className={`text-sm leading-relaxed ${isDark ? "text-white/75" : "text-black/75"}`}>
                                        {benefit}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Long-Term Ambition / Pipeline ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20"
                >
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-4">ECOSYSTEM PIPELINE</span>
                    <h3 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-tight mb-8 ${isDark ? "text-white" : "text-black"}`}>
                        Long-Term Ambition
                    </h3>
                    <p className={`text-sm leading-relaxed mb-10 max-w-2xl ${isDark ? "text-white/50" : "text-black/50"}`}>
                        To build Africa&apos;s most comprehensive creative talent-to-market pipeline — where talent is not just celebrated, but converted into economic output, cultural capital, and global industry presence.
                    </p>
                    <div className="relative">
                        {/* Connector line */}
                        <div className={`absolute top-8 left-8 right-8 h-[1px] hidden lg:block ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
                            {pipeline.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center relative"
                                >
                                    <div className="w-16 h-16 rounded-full border-2 border-[#c5a059]/30 bg-[#c5a059]/8 flex items-center justify-center mb-4 relative z-10 backdrop-blur-sm">
                                        <span className="text-[#c5a059] font-mono font-extrabold text-sm">{item.step}</span>
                                    </div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isDark ? "text-white" : "text-black"}`}>
                                        {item.label}
                                    </h4>
                                    <p className={`text-[10px] sm:text-xs leading-relaxed ${isDark ? "text-white/45" : "text-black/45"}`}>
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Positioning Statement + CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`relative p-8 md:p-14 rounded-2xl border overflow-hidden text-center ${
                        isDark
                            ? "bg-[#0a0a0a] border-[#c5a059]/15"
                            : "bg-white border-[#c5a059]/20"
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/4 via-transparent to-transparent pointer-events-none" />
                    <span className="text-[#c5a059] text-[10px] font-mono tracking-[0.5em] uppercase font-bold block mb-6 relative z-10">
                        POSITIONING
                    </span>
                    <blockquote className={`text-xl sm:text-2xl md:text-3xl font-serif font-bold leading-snug tracking-tight mb-8 relative z-10 ${isDark ? "text-white" : "text-black"}`}>
                        &ldquo;VVS Future Labs is not a competition — it is an infrastructure. We are building the ecosystem that African creative talent deserves: funded, mentored, connected, and commercialised.&rdquo;
                    </blockquote>
                    <div className={`w-12 h-[1px] mx-auto mb-8 ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                    <p className={`text-sm mb-10 relative z-10 ${isDark ? "text-white/50" : "text-black/50"}`}>
                        Applications open — VVS Lagos 2026
                    </p>
                    <a
                        href="/future-labs/apply"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#c5a059] text-black text-xs uppercase tracking-[0.3em] font-extrabold rounded-full hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-[0.98] relative z-10"
                    >
                        Apply for VVS Future Labs
                    </a>
                    </motion.div>
                </>
                )}
            </div>
        </section>
    );
}
