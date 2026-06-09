"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { designers, DesignerCard } from "@/components/sections/Designers";
import { timelineData } from "@/components/sections/Journey";
import Countdown from "@/components/ui/Countdown";
import Footer from "@/components/layout/Footer";
import RSVPBanner from "@/components/sections/RSVPBanner";

// Config for deterministic item positioning to avoid SSR hydration mismatch
const INNER_COUNT = 12;
const OUTER_COUNT = 12;
const INNER_RADIUS = 750;
const OUTER_RADIUS = 1100;

const triggerHaptic = (type: "light" | "medium" | "success") => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
            if (type === "light") navigator.vibrate(15);
            else if (type === "medium") navigator.vibrate(30);
            else if (type === "success") navigator.vibrate([40, 40, 40]);
        } catch (e) {
            console.warn("Haptic feedback not supported or blocked by browser:", e);
        }
    }
};

export default function GuestsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const hasClickedHaptic = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [maxScrollDistance, setMaxScrollDistance] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const calculateDistance = () => {
            if (trackRef.current && viewportRef.current) {
                const trackWidth = trackRef.current.scrollWidth;
                const viewportWidth = viewportRef.current.clientWidth;
                // Add some extra padding on the right before it clicks
                const extraPadding = window.innerWidth * 0.15; // 15vw
                setMaxScrollDistance(Math.max(0, trackWidth - viewportWidth + extraPadding));
            }
        };

        const timer = setTimeout(calculateDistance, 150);
        window.addEventListener("resize", calculateDistance);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", calculateDistance);
        };
    }, [mounted]);

    // Scroll progress bindings for merge transition
    const { scrollYProgress } = useScroll({ container: containerRef });
    
    // Smooth scroll progress for premium spring physics
    const smoothProgress = useSpring(scrollYProgress, {
        damping: 30,
        stiffness: 150,
        mass: 0.6
    });

    // Orbits scale down and merge into the center
    const orbitsScale = useTransform(smoothProgress, [0, 0.08], [1, 0]);
    const orbitsOpacity = useTransform(smoothProgress, [0, 0.066], [1, 0]);

    // Hero content fades out smoothly instead of sliding
    const heroOpacity = useTransform(smoothProgress, [0.02, 0.08], [1, 0]);

    // Merged mascot scales up in the center
    const mergedScale = useTransform(smoothProgress, [0.033, 0.093], [0, 1.8]);
    const mergedOpacity = useTransform(smoothProgress, [0.033, 0.08], [0, 1]);
    const mergedRotate = useTransform(smoothProgress, [0.033, 0.093], [0, 360]);

    // Mascot splits and moves to edges, then slides out
    const splitLeftX = useTransform(smoothProgress, [0.473, 0.566, 0.6, 0.666], ["0vw", "-50vw", "-50vw", "-100vw"]);
    const splitRightX = useTransform(smoothProgress, [0.473, 0.566, 0.6, 0.666], ["0vw", "50vw", "50vw", "100vw"]);
    const splitWidth = useTransform(smoothProgress, [0.473, 0.566], ["0vw", "100vw"]);
    
    // Black layer morphs to fill the screen vertically in Section 4
    const blackLayerScaleY = useTransform(smoothProgress, [0.033, 0.093, 0.5, 0.566], [0, 1.8, 1.8, 15]);

    const glitchOpacity = useTransform(smoothProgress, [0.533, 0.566, 0.6, 0.633], [0, 1, 1, 0]);

    // Timeline visibility
    const timelineOpacity = useTransform(smoothProgress, [0.08, 0.093, 0.453, 0.473], [0, 1, 1, 0]);

    // Horizontal scroll for designers in Section 4 (ends at 0.93 to allow resting/padding before unpinning)
    const designersX = useTransform(smoothProgress, (value) => {
        const start = 0.666;
        const end = 0.93;
        if (value <= start) return 0;
        if (value >= end) return -maxScrollDistance;
        const p = (value - start) / (end - start);
        return -p * maxScrollDistance;
    });

    const [activeTimelineIndex, setActiveTimelineIndex] = useState(0);
    const [isMerged, setIsMerged] = useState(false);
    const [showEventCalendar, setShowEventCalendar] = useState(false);

    useMotionValueEvent(smoothProgress, "change", (latest) => {
        if (latest < 0.165) setActiveTimelineIndex(0);
        else if (latest >= 0.165 && latest < 0.237) setActiveTimelineIndex(1);
        else if (latest >= 0.237 && latest < 0.309) setActiveTimelineIndex(2);
        else if (latest >= 0.309 && latest < 0.381) setActiveTimelineIndex(3);
        else setActiveTimelineIndex(4);

        if (latest >= 0.453) setIsMerged(true);
        else setIsMerged(false);

        if (latest >= 0.52 && latest < 0.66) setShowEventCalendar(true);
        else setShowEventCalendar(false);

        // Haptic click when reaching the end of the designers scroll track
        const threshold = 0.93;
        if (latest >= threshold && !hasClickedHaptic.current) {
            triggerHaptic("medium");
            hasClickedHaptic.current = true;
        } else if (latest < threshold - 0.02 && hasClickedHaptic.current) {
            triggerHaptic("light");
            hasClickedHaptic.current = false;
        }
    });

    const handleReset = () => {
        containerRef.current?.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleStartClick = () => {
        triggerHaptic("medium");
        containerRef.current?.scrollTo({
            top: window.innerHeight,
            behavior: "smooth"
        });
    };

    // Generate inner orbit items deterministically
    const innerItems = useMemo(() => {
        return Array.from({ length: INNER_COUNT }).map((_, i) => {
            const angle = (i * 360) / INNER_COUNT;
            const angleRad = (angle * Math.PI) / 180;
            const tilt = -25 + ((i * 13) % 51); // Deterministic tilt between -25 and +25 deg
            const scale = 0.8 + ((i * 7) % 8) * 0.05; // Deterministic scale 0.8 to 1.15
            return {
                x: Math.cos(angleRad) * INNER_RADIUS,
                y: Math.sin(angleRad) * INNER_RADIUS,
                tilt,
                size: Math.round(90 * scale),
                delay: ((i * 3) % 8) * 0.6,
            };
        });
    }, []);

    // Generate outer orbit items deterministically
    const outerItems = useMemo(() => {
        return Array.from({ length: OUTER_COUNT }).map((_, i) => {
            const angle = (i * 360) / OUTER_COUNT;
            const angleRad = (angle * Math.PI) / 180;
            const tilt = -35 + ((i * 19) % 71); // Deterministic tilt between -35 and +35 deg
            const scale = 0.95 + ((i * 5) % 9) * 0.05; // Deterministic scale 0.95 to 1.35
            return {
                x: Math.cos(angleRad) * OUTER_RADIUS,
                y: Math.sin(angleRad) * OUTER_RADIUS,
                tilt,
                size: Math.round(115 * scale),
                delay: ((i * 4) % 12) * 0.5,
            };
        });
    }, []);

    return (
        <div className="w-screen h-screen overflow-hidden bg-white text-black relative select-none">
            {/* Global Keyframe Animations injected directly */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spinClockwise {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes keepUprightCounterClockwise {
                    from { transform: translate(-50%, -50%) rotate(0deg); }
                    to { transform: translate(-50%, -50%) rotate(-360deg); }
                }
                @keyframes floatPulse {
                    0%, 100% { transform: rotate(var(--tilt)) scale(0.85); opacity: 0.75; }
                    50% { transform: rotate(var(--tilt)) scale(1.05); opacity: 0.95; }
                }
                .orbits-container {
                    transform: translate(-50%, -50%) scale(1);
                }
                @media (max-width: 1200px) {
                    .orbits-container {
                        transform: translate(-50%, -50%) scale(0.75);
                    }
                }
                @media (max-width: 768px) {
                    .orbits-container {
                        transform: translate(-50%, -50%) scale(0.55);
                    }
                }
                @media (max-width: 480px) {
                    .orbits-container {
                        transform: translate(-50%, -50%) scale(0.35);
                    }
                }
                @keyframes mascotGlitch {
                    0% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg) saturate(1); }
                    2% { transform: translate(-4px, 2px) skew(3deg); filter: hue-rotate(90deg) saturate(3); }
                    4% { transform: translate(4px, -2px) skew(-3deg); filter: hue-rotate(-90deg) saturate(0); }
                    6% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg) saturate(1); }
                    50% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg) saturate(1); }
                    52% { transform: translate(2px, -4px) skew(-2deg); filter: brightness(1.5) invert(0.2); }
                    54% { transform: translate(-2px, 4px) skew(2deg); filter: brightness(0.5) invert(0); }
                    56% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg) saturate(1); }
                    100% { transform: translate(0, 0) skew(0deg); filter: hue-rotate(0deg) saturate(1); }
                }
                .glitch-effect-1 {
                    animation: mascotGlitch 2.5s infinite;
                }
                .glitch-effect-2 {
                    animation: mascotGlitch 3.1s infinite;
                    animation-delay: 1.2s;
                }
            `}} />

            {/* Top Fixed Logo */}
            <header className="fixed top-12 left-0 w-full z-20 flex justify-center pointer-events-none">
                <div 
                    onClick={() => { triggerHaptic("light"); handleReset(); }}
                    className="bg-black p-[10px] rounded-full aspect-square cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto flex items-center justify-center"
                >
                    <img 
                        src="/assets/VVSLAGOSLOGO.png" 
                        alt="VVS Lagos" 
                        className="h-10 sm:h-12 w-auto object-contain"
                    />
                </div>
            </header>

            {/* Bottom Fixed Languages */}
            <footer className="fixed bottom-12 left-0 w-full z-20 flex justify-center pointer-events-none">
                <div className="flex items-center space-x-6 text-[10px] tracking-[0.2em] text-[#888888] font-mono font-bold pointer-events-auto">
                    <span className="relative pb-0.5 cursor-pointer text-black border-b border-red-600" onClick={() => triggerHaptic("light")}>EN</span>
                    <span className="cursor-pointer hover:text-black transition-colors" onClick={() => triggerHaptic("light")}>YO</span>
                    <span className="cursor-pointer hover:text-black transition-colors" onClick={() => triggerHaptic("light")}>HA</span>
                    <span className="cursor-pointer hover:text-black transition-colors" onClick={() => triggerHaptic("light")}>IG</span>
                </div>
            </footer>

            {/* Fixed Hero Content (fades out on scroll, does not slide up) */}
            <motion.div 
                style={{ opacity: heroOpacity }}
                className="fixed inset-0 w-full h-full z-10 flex flex-col justify-between py-12 px-6 pointer-events-none"
            >
                {/* Header Spacer */}
                <div className="h-12" />

                {/* Centered Content */}
                <div className="flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto text-center gap-8 px-4 pointer-events-auto">
                    <div className="space-y-4 max-w-lg z-10 relative mt-8 sm:mt-12">
                        <h1 className="text-4xl sm:text-5xl font-light text-[#1a1a1a] tracking-tight leading-tight select-text uppercase">
                            Welcome to <br className="hidden sm:block" />
                            <span className="font-semibold text-black font-serif">VVS LAGOS 2026</span>
                        </h1>
                        <p className="text-sm sm:text-base font-light text-[#444444] leading-relaxed mx-auto max-w-md">
                            <span className="font-bold text-black tracking-widest uppercase block mb-1">AFRO MODERNISM:</span>
                            The Intersection of Ancient Narrative and Futuristic Vision. A Celebration of Cultural Identity in the heart of Lagos.
                        </p>
                    </div>

                    {/* Countdown */}
                    <div className="z-10 relative">
                        <Countdown targetDate="2026-07-05T19:00:00" variant="hero-light" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 z-10 relative">
                        <motion.button
                            onClick={handleStartClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-6 py-3 bg-[#111111] hover:bg-black text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded-sm cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                            Discover the legacy
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-8 py-3 bg-transparent border border-[#111111] text-[#111111] hover:bg-black/5 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded-sm cursor-pointer transition-all"
                        >
                            RSVP
                        </motion.button>
                    </div>
                </div>

                {/* Footer Spacer */}
                <div className="h-12" />
            </motion.div>

            {/* Background revolving concentric circles & single merged mascot */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-white">
                <div className="absolute top-1/2 left-1/2 w-0 h-0 orbits-container transition-transform duration-500">
                    
                    {mounted && (
                        <>
                            {/* Rotating Concentric Orbits (scales down and fades out on scroll) */}
                            <motion.div
                                style={{
                                    scale: orbitsScale,
                                    opacity: orbitsOpacity,
                                }}
                                className="absolute top-0 left-0 w-0 h-0"
                            >
                                {/* Inner Orbit Circle */}
                                <div
                                    className="absolute top-0 left-0 w-0 h-0"
                                    style={{ animation: "spinClockwise 55s linear infinite" }}
                                >
                                    {innerItems.map((item, idx) => (
                                        <div
                                            key={`inner-${idx}`}
                                            className="absolute"
                                            style={{
                                                left: `${item.x}px`,
                                                top: `${item.y}px`,
                                                width: `${item.size}px`,
                                                height: `${item.size}px`,
                                                animation: `keepUprightCounterClockwise 55s linear infinite`,
                                            }}
                                        >
                                            <img
                                                src="/assets/VVSMASCOT7.png"
                                                alt=""
                                                className="object-contain"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    maxWidth: "none",
                                                    animation: `floatPulse 9s ease-in-out infinite`,
                                                    animationDelay: `${item.delay}s`,
                                                    ["--tilt" as any]: `${item.tilt}deg`,
                                                    filter: "blur(6px) brightness(0.85)",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Outer Orbit Circle */}
                                <div
                                    className="absolute top-0 left-0 w-0 h-0"
                                    style={{ animation: "spinClockwise 35s linear infinite" }}
                                >
                                    {outerItems.map((item, idx) => (
                                        <div
                                            key={`outer-${idx}`}
                                            className="absolute"
                                            style={{
                                                left: `${item.x}px`,
                                                top: `${item.y}px`,
                                                width: `${item.size}px`,
                                                height: `${item.size}px`,
                                                animation: `keepUprightCounterClockwise 35s linear infinite`,
                                            }}
                                        >
                                            <img
                                                src="/assets/VVSMASCOT7.png"
                                                alt=""
                                                className="object-contain"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    maxWidth: "none",
                                                    animation: `floatPulse 7s ease-in-out infinite`,
                                                    animationDelay: `${item.delay}s`,
                                                    ["--tilt" as any]: `${item.tilt}deg`,
                                                    filter: "blur(2px) brightness(0.95)",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Centering Container */}
                            <div className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center">
                                
                                {/* Extra Timeline Mascots */}
                                {Array.from({ length: 4 }).map((_, i) => {
                                    const extraIndex = i + 1; // 1, 2, 3, 4
                                    const isVisible = activeTimelineIndex >= extraIndex && !isMerged;
                                    
                                    const positions = [
                                        // 1 mascot (index 0)
                                        [{x: 0}, {x: 0}, {x: 0}, {x: 0}, {x: 0}], 
                                        // 2 mascots (index 1)
                                        [{x: 0}, {x: -150}, {x: 0}, {x: 0}, {x: 0}],
                                        // 3 mascots (index 2)
                                        [{x: 0}, {x: -280}, {x: 280}, {x: 0}, {x: 0}],
                                        // 4 mascots (index 3)
                                        [{x: 0}, {x: -150}, {x: 420}, {x: -420}, {x: 0}],
                                        // 5 mascots (index 4)
                                        [{x: 0}, {x: -280}, {x: 280}, {x: -500}, {x: 500}],
                                    ];

                                    const scales = [
                                        [0, 0, 0, 0, 0],
                                        [0, 1.2, 0, 0, 0],
                                        [0, 1.1, 1.1, 0, 0],
                                        [0, 1.3, 0.9, 0.9, 0],
                                        [0, 1.1, 1.1, 0.7, 0.7],
                                    ];
                                    
                                    return (
                                        <motion.div
                                            key={`extra-mascot-${i}`}
                                            className="absolute w-80 h-80"
                                            initial={{ opacity: 0, scale: 0, x: 0 }}
                                            animate={{ 
                                                opacity: isVisible ? 1 : 0, 
                                                scale: isVisible ? (scales[activeTimelineIndex]?.[extraIndex] || 0) : 0,
                                                x: isMerged ? 0 : (positions[activeTimelineIndex]?.[extraIndex]?.x || 0)
                                            }}
                                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                        >
                                            <img
                                                src="/assets/VVSMASCOT7.png"
                                                alt=""
                                                className="w-full h-full object-contain"
                                            />
                                        </motion.div>
                                    );
                                })}

                                {/* Single Merged Mascot (Splits in Section 3) */}
                                <motion.div 
                                    className="absolute w-80 h-80"
                                    animate={{
                                        x: isMerged ? 0 : [
                                            0,
                                            150,
                                            0,
                                            150,
                                            0
                                        ][activeTimelineIndex],
                                        scale: isMerged ? 1 : (
                                            [1.5, 1.2, 1.5, 1.3, 1.5][activeTimelineIndex] / 1.8
                                        )
                                    }}
                                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                >
                                    {/* Black stretch layer */}
                                    <motion.div
                                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full bg-black"
                                        style={{
                                            width: splitWidth,
                                            scaleY: blackLayerScaleY,
                                        }}
                                    />
                                    {/* Left Half */}
                                    <motion.div
                                        style={{
                                            scale: mergedScale,
                                            opacity: mergedOpacity,
                                            rotate: mergedRotate,
                                            x: splitLeftX,
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src="/assets/VVSMASCOT7.png"
                                            alt="Merged Mascot Left"
                                            className="w-full h-full object-contain absolute inset-0"
                                            style={{ maxWidth: "none", clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
                                        />
                                        <motion.img
                                            src="/assets/VVSMASCOT7.png"
                                            alt=""
                                            className="w-full h-full object-contain absolute inset-0 glitch-effect-1"
                                            style={{ maxWidth: "none", clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)", opacity: glitchOpacity }}
                                        />
                                    </motion.div>

                                    {/* Right Half */}
                                    <motion.div
                                        style={{
                                            scale: mergedScale,
                                            opacity: mergedOpacity,
                                            rotate: mergedRotate,
                                            x: splitRightX,
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src="/assets/VVSMASCOT7.png"
                                            alt="Merged Mascot Right"
                                            className="w-full h-full object-contain absolute inset-0"
                                            style={{ maxWidth: "none", clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
                                        />
                                        <motion.img
                                            src="/assets/VVSMASCOT7.png"
                                            alt=""
                                            className="w-full h-full object-contain absolute inset-0 glitch-effect-2"
                                            style={{ maxWidth: "none", clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)", opacity: glitchOpacity }}
                                        />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Scrollable Layout Container */}
            <main 
                ref={containerRef}
                className="w-full h-full overflow-y-auto overflow-x-hidden snap-y relative z-10 scrollbar-none"
                style={{ scrollbarWidth: "none" }}
            >
                {/* Section 1: Hero Landing View Spacer */}
                <section className="w-full h-screen snap-start" />

                {/* Section 2: Timeline (0.14 to 0.71) */}
                <section className="w-full h-[400vh] snap-start relative z-20">
                    <motion.div 
                        style={{ opacity: timelineOpacity }}
                        className="fixed inset-0 w-full h-full flex flex-col justify-end items-center px-4 pointer-events-none pb-20 sm:pb-32 z-20"
                    >
                        {/* Centered Text under Mascots */}
                        <div className="flex flex-col items-center max-w-2xl text-center">
                            <AnimatePresence mode="wait">
                                {timelineData[activeTimelineIndex] && (
                                    <motion.div
                                        key={`text-${activeTimelineIndex}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col items-center"
                                    >
                                        <p className="text-[10px] sm:text-xs text-[#c5a059] uppercase tracking-widest font-mono font-bold mb-2">
                                            {timelineData[activeTimelineIndex].year}
                                        </p>
                                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold text-black tracking-tight mb-2 leading-none uppercase">
                                            Edition {activeTimelineIndex + 1}
                                        </h2>
                                        <p className="text-sm sm:text-xl md:text-2xl font-light text-black/70 tracking-wide uppercase">
                                            {timelineData[activeTimelineIndex].theme}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </section>

                {/* Section 3: Event Calendar Scroll Spacer */}
                <section className="w-full h-[150vh] snap-start relative z-10" />

                <AnimatePresence>
                    {showEventCalendar && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-0 w-full h-full flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6 pointer-events-none z-20"
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-col items-center text-center space-y-4 sm:space-y-6 max-w-3xl pointer-events-auto"
                            >
                                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight uppercase">
                                    Event Calendar
                                </h2>
                                <p className="text-white/80 font-sans text-sm sm:text-lg leading-relaxed max-w-2xl font-light">
                                    Join us for an immersive 7-day experience celebrating the intersection of African culture, luxury, and the future. From exclusive previews to vibrant pop-ups, discover the events shaping the <span className="text-white font-medium">5th Edition</span>.
                                </p>
                            </motion.div>

                            <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-5xl pointer-events-auto">
                                {[
                                    { date: "JULY 5", title: "Grand Opening Night", time: "7:00 PM", venue: "Nahous, Lagos" },
                                    { date: "JULY 6", title: "Business & Culture Day", time: "10:00 AM", venue: "Yoga Center" },
                                    { date: "JULY 7", title: "Collectors Preview", time: "2:00 PM", venue: "Private Venue" },
                                    { date: "JULY 8", title: "Public Opening", time: "12:00 PM", venue: "Nahous, Lagos" },
                                    { date: "JULY 9-10", title: "Pop-Ups & Exhibitions", time: "11:00 AM", venue: "Nahous, Lagos" },
                                    { date: "JULY 11", title: "Film Day", time: "2:00 PM", venue: "Nahous, Lagos" }
                                ].map((event, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-vvs-gold/40 hover:bg-white/10 rounded-sm p-4 sm:p-5 text-left transition-all group"
                                    >
                                        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-2 gap-1">
                                            <p className="text-vvs-gold text-[10px] sm:text-xs font-mono font-bold tracking-widest">{event.date}</p>
                                            <p className="text-white/40 text-[9px] sm:text-[10px] font-mono whitespace-nowrap">{event.time}</p>
                                        </div>
                                        <h3 className="text-white text-sm sm:text-base font-semibold leading-snug group-hover:text-vvs-gold transition-colors">{event.title}</h3>
                                        <p className="text-white/50 text-xs mt-2 hidden sm:block font-sans">{event.venue}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4) Designers (0.66 to 1.0) */}
                <section className="w-full h-[400vh] relative z-30 bg-black">
                    <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10 pt-20 flex-shrink-0">
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
                        </div>
                        
                        <div ref={viewportRef} className="w-full relative z-10 overflow-hidden">
                            <motion.div 
                                ref={trackRef}
                                className="flex gap-4 sm:gap-6 pb-32 w-max pl-5 sm:pl-8 xl:pl-[calc((100vw-80rem)/2+2rem)] pr-5 sm:pr-8 xl:pr-[calc((100vw-80rem)/2+2rem)]"
                                style={{ x: designersX }}
                            >
                                {designers.map((designer, index) => (
                                    <div key={index} className="w-[70vw] sm:w-[40vw] lg:w-[25vw] shrink-0">
                                        <DesignerCard designer={designer} index={index} />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                <RSVPBanner />
                {/* Section 5: Footer */}
                <section className="w-full relative z-30 snap-start bg-vvs-black text-vvs-white">
                    <Footer />
                </section>
            </main>
        </div>
    );
}
