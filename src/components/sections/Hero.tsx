"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Countdown from "../ui/Countdown";
import NsibidiRain from "../ui/NsibidiRain";
import ScrambleText from "../ui/ScrambleText";

export default function Hero() {
    const ref = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Parallax transforms — elements move at different rates as you scroll
    const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
    const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
    const bgGlowY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const mascotY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

    // Staggered top-to-bottom scroll fade opacities (stays active when scrolling back up)
    const countdownOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const labelOpacity = useTransform(scrollYProgress, [0.15, 0.4], [1, 0]);
    const titleOpacity = useTransform(scrollYProgress, [0.3, 0.55], [1, 0]);
    const subtitleOpacity = useTransform(scrollYProgress, [0.45, 0.7], [1, 0]);
    const ctaOpacity = useTransform(scrollYProgress, [0.6, 0.85], [1, 0]);
    const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <section
            ref={ref}
            className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden"
        >
            {/* Animated Nsibidi Digital Rain */}
            <NsibidiRain />

            {/* Background gold glow — moves slowest */}
            <motion.div
                style={{ y: bgGlowY }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-vvs-gold/5 blur-[140px] rounded-full pointer-events-none"
            />

            <motion.div
                className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10 flex flex-col items-center overflow-hidden"
            >
                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ opacity: countdownOpacity }}
                    className="mb-12"
                >
                    <Countdown targetDate="2026-07-05T19:00:00" variant="hero" />
                </motion.div>

                {/* Label */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ y: subtitleY, opacity: labelOpacity }}
                >
                    <span className="text-vvs-gold text-xs md:text-sm uppercase tracking-[0.4em] mb-6 block text-center font-mono font-bold">
                        VVS LAGOS 2026 • 5TH EDITION
                    </span>
                </motion.div>

                {/* Title — moves fastest for deepest parallax feel */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                    style={{ y: titleY, opacity: titleOpacity }}
                    className="text-[clamp(2rem,9vw,9rem)] font-serif font-extrabold text-vvs-white lg:leading-tight mb-8 tracking-tighter text-center leading-[1.1] w-full"
                >
                    <ScrambleText text="AFRO" /><br />
                    <ScrambleText text="MODERNISM" className="text-vvs-gold font-bold" />
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ y: subtitleY, opacity: subtitleOpacity }}
                    className="text-vvs-white/60 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-light mb-12 text-center"
                >
                    The Intersection of Ancient Narrative and Futuristic Vision.
                    A Celebration of Cultural Identity in the heart of Lagos.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    style={{ y: subtitleY, opacity: ctaOpacity }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
                >
                    <motion.button
                        onClick={() => document.querySelector('#journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(197, 160, 89, 0.6)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-10 py-4 bg-vvs-gold text-vvs-black text-xs uppercase tracking-[0.2em] font-bold rounded-full cursor-pointer transition-colors shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                    >
                        Discover the Legacy
                    </motion.button>
                    <motion.button
                        onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        whileHover={{ scale: 1.05, borderColor: "rgba(197, 160, 89, 0.6)", color: "#c5a059", backgroundColor: "rgba(197,160,89,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-10 py-4 border border-white/20 text-vvs-white text-xs uppercase tracking-[0.2em] font-bold rounded-full cursor-pointer transition-colors"
                    >
                        View Calendar
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                style={{ opacity: scrollIndicatorOpacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
            >
                <span className="text-[8px] uppercase tracking-[0.3em] text-vvs-white/40 mb-3 font-bold font-mono">Scroll</span>
                <div className="w-[1px] h-10 bg-vvs-white/10 relative overflow-hidden">
                    <motion.div
                        animate={{
                            y: ["-100%", "100%"]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute left-0 top-0 w-full h-1/2 bg-gradient-to-b from-vvs-gold to-transparent"
                    />
                </div>
            </motion.div>

            {/* Side decorative */}
            <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden lg:block">
                <div className="flex flex-col space-y-12 items-center">
                    <div className="w-[1px] h-32 bg-white/10" />
                    <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-[0.5em] text-vvs-white/20 whitespace-nowrap font-mono">
                        ART • FASHION • CULTURE
                    </span>
                    <div className="w-[1px] h-32 bg-white/10" />
                </div>
            </div>
        </section>
    );
}
