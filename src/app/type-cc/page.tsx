"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { Compass, Calendar as CalendarIcon, X } from "lucide-react";
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

type EventInfo = { date: string, title: string, time: string, venue: string, isMain?: boolean, description?: string };

const EventCard = ({ event, i, onClick }: { event: EventInfo, i: number, onClick: (e: EventInfo) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
        timerRef.current = setTimeout(() => {
            onClick(event);
            setIsHovered(false);
        }, 3000);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    return (
        <motion.div
            layoutId={`event-${event.title}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(event)}
            className={`cursor-pointer relative overflow-hidden bg-white/5 backdrop-blur-sm border hover:border-vvs-gold/40 hover:bg-white/10 rounded-sm p-4 sm:p-5 text-left transition-all group ${event.isMain ? 'border-vvs-gold shadow-[0_0_15px_rgba(197,160,89,0.3)] col-span-2 md:col-span-3' : 'border-white/10'}`}
        >
            {/* Background Video */}
            {isHovered && (
                <video 
                    src="https://www.w3schools.com/html/mov_bbb.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
                />
            )}
            
            {/* Loading Overlay */}
            {isHovered && (
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="absolute top-0 left-0 h-full bg-vvs-gold/20 z-0"
                />
            )}

            <div className="relative z-10 pointer-events-none">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-2 gap-1">
                    <p className="text-vvs-gold text-[10px] sm:text-xs font-mono font-bold tracking-widest">{event.date}</p>
                    <p className="text-white/40 text-[9px] sm:text-[10px] font-mono whitespace-nowrap">{event.time}</p>
                </div>
                <h3 className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${event.isMain ? 'text-vvs-gold group-hover:text-vvs-gold/80' : 'text-white group-hover:text-vvs-gold'}`}>{event.title}</h3>
                <p className="text-white/50 text-xs mt-2 hidden sm:block font-sans">{event.venue}</p>
            </div>
        </motion.div>
    );
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
    const [expandedEvent, setExpandedEvent] = useState<EventInfo | null>(null);
    const [rsvpPhase, setRsvpPhase] = useState<"idle" | "assembling" | "splitting">("idle");
    const [isRSVPSubmitted, setIsRSVPSubmitted] = useState(false);

    useEffect(() => {
        const handleOpen = () => {
            if (rsvpPhase !== "idle") return;
            setRsvpPhase("assembling");
            setTimeout(() => {
                setRsvpPhase("splitting");
            }, 800);
        };
        const handleClose = () => {
            setRsvpPhase("idle");
        };
        window.addEventListener("open-rsvp", handleOpen);
        window.addEventListener("close-rsvp", handleClose);
        return () => {
            window.removeEventListener("open-rsvp", handleOpen);
            window.removeEventListener("close-rsvp", handleClose);
        };
    }, [rsvpPhase]);

    const isRSVPActive = rsvpPhase !== "idle";
    const isRSVPSplitting = rsvpPhase === "splitting";
    const effectiveIsMerged = isMerged || isRSVPActive;

    const [rsvpData, setRsvpData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        occupation: "",
        company: "",
        role: "",
        heard_about: "",
        attendance: "yes",
        events: ["JULY 12"],
    });

    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        triggerHaptic("success");
        try {
            await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...rsvpData,
                    event_type: "type_cc_rsvp",
                }),
            });
        } catch (err) {
            console.error(err);
        }
        setIsRSVPSubmitted(true);
        setTimeout(() => {
            setRsvpPhase("idle");
            setIsRSVPSubmitted(false);
            setRsvpData({
                name: "",
                email: "",
                phone: "",
                gender: "",
                occupation: "",
                company: "",
                role: "",
                heard_about: "",
                attendance: "yes",
                events: ["JULY 12"],
            });
        }, 3000);
    };

    const eventsList: EventInfo[] = useMemo(() => [
        { date: "JULY 5", title: "Opening Event", time: "7:00 PM", venue: "British/Canadian Residence", description: "Grand kickoff featuring honorary awards, recap videos, curated performances, dinner, and a 5th anniversary celebration party." },
        { date: "JULY 6", title: "VVS Panel Sessions", time: "10:00 AM", venue: "Alliance Française, Lagos", description: "Five panel sessions including Fireside with Korede Roberts, Tega Mavin, Aisha Augie. Sustainability with Zara Odu, Kelvin Bumpa, Reni Folawiyo, Florentyna, Tolu Coye, and more. Brand building with Sade Okoya & Mutesi Jolly." },
        { date: "JULY 7", title: "Collectors Day", time: "2:00 PM", venue: "Windsor Gallery", description: "Invite-only artists work explanation, curatorial introduction speech, and drinks for HNIs and buyers." },
        { date: "JULY 8-11", title: "Pop Up & Art Exhibition", time: "12:00 PM", venue: "A White Space & Windsor Gallery", description: "Trunk show pop-up at A White Space Ikoyi. Public opening of the art exhibition at Windsor Gallery (extending to end of the month)." },
        { date: "JULY 11", title: "VVS Film Experience", time: "2:00 PM", venue: "Alliance Française, Lagos", description: "High-level panel conversations around film and storytelling in partnership with AFRIFF. Screening 'Descendants' short film and documentary." },
        { date: "JULY 12", title: "VVS Runway Show", time: "5:00 PM", venue: "Falomo Under the Bridge", description: "Model runway presentation showcasing selected fashion brands under the bridge." },
        { date: "JULY 12", title: "VVS Afterparty", time: "10:00 PM", venue: "Rooftop at Club 245", isMain: true, description: "Grand closing afterparty at Club 245 rooftop." }
    ], []);

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
            <header className="fixed top-8 sm:top-12 left-0 w-full z-[100] flex justify-start sm:justify-center pointer-events-none px-6 sm:px-0">
                <div 
                    onClick={() => { triggerHaptic("light"); handleReset(); }}
                    className="bg-black p-[8px] sm:p-[10px] rounded-full aspect-square cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto flex items-center justify-center shadow-lg border border-white/10"
                >
                    <img 
                        src="/assets/VVSLAGOSLOGO.png" 
                        alt="VVS Lagos" 
                        className="h-8 sm:h-12 w-auto object-contain"
                    />
                </div>
            </header>

            {/* Bottom Fixed Languages */}
            <footer className="fixed bottom-12 left-0 w-full z-20 flex justify-center pointer-events-none">
                <div className="hidden sm:flex items-center space-x-6 text-[10px] tracking-[0.2em] text-[#888888] font-mono font-bold pointer-events-auto">
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
                        <h1 className="font-light text-[#1a1a1a] tracking-tight select-text uppercase flex flex-col items-center">
                            <span className="text-2xl sm:text-3xl mb-2 sm:mb-4">Welcome to</span>
                            <span className="font-normal text-black font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none mt-2">VVS LAGOS 2026</span>
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
                                style={!isRSVPActive ? {
                                    scale: orbitsScale,
                                    opacity: orbitsOpacity,
                                } : undefined}
                                animate={isRSVPActive ? { scale: 0, opacity: 0 } : undefined}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
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
                                    const isVisible = activeTimelineIndex >= extraIndex && !effectiveIsMerged;
                                    
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
                                                x: effectiveIsMerged ? 0 : (positions[activeTimelineIndex]?.[extraIndex]?.x || 0),
                                                y: 0
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
                                        x: effectiveIsMerged ? 0 : [
                                            0,
                                            150,
                                            0,
                                            150,
                                            0
                                        ][activeTimelineIndex],
                                        y: 0,
                                        scale: effectiveIsMerged ? 1 : (
                                            [1.5, 1.2, 1.5, 1.3, 1.5][activeTimelineIndex] / 1.8
                                        )
                                    }}
                                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                >
                                    {/* Black stretch layer */}
                                    <motion.div
                                        className="absolute top-0 left-1/2 -translate-x-1/2 h-full bg-black"
                                        style={!isRSVPActive ? {
                                            width: splitWidth,
                                            scaleY: blackLayerScaleY,
                                        } : undefined}
                                        animate={isRSVPActive ? {
                                            width: isRSVPSplitting ? "100vw" : "0vw",
                                            scaleY: isRSVPSplitting ? 15 : 1.8,
                                        } : undefined}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                    />
                                    {/* Left Half */}
                                    <motion.div
                                        style={!isRSVPActive ? {
                                            scale: mergedScale,
                                            opacity: mergedOpacity,
                                            rotate: mergedRotate,
                                            x: splitLeftX,
                                        } : undefined}
                                        animate={isRSVPActive ? {
                                            scale: 1.8,
                                            opacity: 1,
                                            rotate: 0,
                                            x: isRSVPSplitting ? "-45vw" : "0vw",
                                        } : undefined}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
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
                                            style={!isRSVPActive ? { maxWidth: "none", clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)", opacity: glitchOpacity } : { maxWidth: "none", clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
                                            animate={isRSVPActive ? { opacity: isRSVPSplitting ? [0, 1, 1, 0] : 0 } : undefined}
                                            transition={{ duration: 0.6, times: [0, 0.2, 0.8, 1], ease: "linear" }}
                                        />
                                    </motion.div>

                                    {/* Right Half */}
                                    <motion.div
                                        style={!isRSVPActive ? {
                                            scale: mergedScale,
                                            opacity: mergedOpacity,
                                            rotate: mergedRotate,
                                            x: splitRightX,
                                        } : undefined}
                                        animate={isRSVPActive ? {
                                            scale: 1.8,
                                            opacity: 1,
                                            rotate: 0,
                                            x: isRSVPSplitting ? "45vw" : "0vw",
                                        } : undefined}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
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
                                            style={!isRSVPActive ? { maxWidth: "none", clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)", opacity: glitchOpacity } : { maxWidth: "none", clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
                                            animate={isRSVPActive ? { opacity: isRSVPSplitting ? [0, 1, 1, 0] : 0 } : undefined}
                                            transition={{ duration: 0.6, times: [0, 0.2, 0.8, 1], ease: "linear" }}
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
                        className="fixed inset-0 w-full h-full flex flex-col justify-end items-center px-4 pointer-events-none pb-28 sm:pb-32 z-20"
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
                <section className="w-full h-[150vh] snap-start relative z-10 hidden sm:block" />

                {/* Mobile Static Event Calendar */}
                <section className="w-full bg-[#0a0a0a] py-20 px-5 sm:hidden relative z-20">
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <h2 className="text-3xl font-serif font-bold text-white tracking-tight leading-tight uppercase">
                            Event Calendar
                        </h2>
                        <p className="text-white/80 font-sans text-sm leading-relaxed font-light">
                            Join us for an immersive 7-day experience celebrating the intersection of African culture, luxury, and the future.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        {[
                            { date: "JULY 5", title: "Grand Opening Night", time: "7:00 PM", venue: "Nahous, Lagos" },
                            { date: "JULY 6", title: "Business & Culture Day", time: "10:00 AM", venue: "Yoga Center" },
                            { date: "JULY 7", title: "Collectors Preview", time: "2:00 PM", venue: "Private Venue" },
                            { date: "JULY 8", title: "Public Opening", time: "12:00 PM", venue: "Nahous, Lagos" },
                            { date: "JULY 9-10", title: "Pop-Ups & Exhibitions", time: "11:00 AM", venue: "Nahous, Lagos" },
                            { date: "JULY 11", title: "Film Day", time: "2:00 PM", venue: "Nahous, Lagos" },
                            { date: "JULY 12", title: "VVS Main Day", time: "All Day", venue: "Nahous, Lagos", isMain: true }
                        ].map((event, i) => (
                            <div key={`mob-evt-${i}`} className={`bg-white/5 border rounded-xl p-4 flex flex-col gap-1 ${event.isMain ? 'border-vvs-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'border-white/10'}`}>
                                <div className="flex justify-between items-center">
                                    <p className="text-vvs-gold text-[10px] font-mono font-bold tracking-widest">{event.date}</p>
                                    <p className="text-white/40 text-[9px] font-mono">{event.time}</p>
                                </div>
                                <h3 className={`text-sm font-semibold ${event.isMain ? 'text-vvs-gold' : 'text-white'}`}>{event.title}</h3>
                                <p className="text-white/50 text-[10px] font-sans">{event.venue}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <AnimatePresence>
                    {showEventCalendar && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-0 w-full h-full hidden sm:flex flex-col justify-center items-center py-6 sm:py-12 px-4 sm:px-6 pointer-events-none z-20"
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-col items-center text-center space-y-4 sm:space-y-6 max-w-3xl pointer-events-auto"
                            >
                                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-vvs-gold tracking-tight leading-tight uppercase">
                                    Event Calendar
                                </h2>
                                <p className="text-white/80 font-sans text-sm sm:text-lg leading-relaxed max-w-2xl font-light">
                                    Join us for an immersive 7-day experience celebrating the intersection of African culture, luxury, and the future. From exclusive previews to vibrant pop-ups, discover the events shaping the <span className="text-white font-medium">5th Edition</span>.
                                </p>
                            </motion.div>

                            <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-5xl pointer-events-auto pb-28 sm:pb-0">
                                {eventsList.map((event, i) => (
                                    <EventCard key={i} event={event} i={i} onClick={setExpandedEvent} />
                                ))}
                            </div>

                            <AnimatePresence>
                                {expandedEvent && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
                                        onClick={() => setExpandedEvent(null)}
                                    >
                                        <motion.div 
                                            layoutId={`event-${expandedEvent.title}`}
                                            className="bg-[#0a0a0a] border border-vvs-gold shadow-[0_0_30px_rgba(197,160,89,0.3)] rounded-lg p-6 sm:p-10 max-w-2xl w-full relative overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Background Video */}
                                            <video 
                                                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                                                autoPlay 
                                                loop 
                                                muted 
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
                                            />

                                            <div className="relative z-10 flex flex-col h-full">
                                                <button 
                                                    onClick={() => setExpandedEvent(null)}
                                                    className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors p-2 z-20"
                                                >
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-2 pt-2">
                                                    <div>
                                                        <p className="text-vvs-gold text-sm font-mono font-bold tracking-widest">{expandedEvent.date}</p>
                                                        <p className="text-white/40 text-xs font-mono">{expandedEvent.time}</p>
                                                    </div>
                                                    <p className="text-white/50 text-sm font-sans flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {expandedEvent.venue}
                                                    </p>
                                                </div>
                                                
                                                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-6 leading-tight">{expandedEvent.title}</h3>
                                                
                                                <div className="bg-black/40 border border-white/10 rounded p-4 mb-6">
                                                    <p className="text-white/80 font-sans leading-relaxed text-sm sm:text-base">
                                                        {expandedEvent.description}
                                                    </p>
                                                </div>
                                                
                                                <button 
                                                    className="mt-auto bg-vvs-gold text-black font-bold uppercase tracking-widest py-3 px-6 rounded-sm hover:bg-white transition-colors self-start"
                                                    onClick={() => setExpandedEvent(null)}
                                                >
                                                    RSVP NOW
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4) Designers (0.66 to 1.0) */}
                <section className="w-full h-auto sm:h-[400vh] relative z-30 bg-black">
                    <div className="relative sm:sticky top-0 h-auto sm:h-screen w-full flex flex-col justify-center overflow-hidden py-24 sm:py-0">
                        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10 pt-10 sm:pt-20 flex-shrink-0">
                            <div className="mb-8 sm:mb-16">
                                <span className="text-vvs-gold text-xs sm:text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                                    VVS COLLECTIVE
                                </span>
                                <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-extrabold text-vvs-white uppercase tracking-tighter">
                                    THE <span className="text-vvs-gold">INNOVATORS</span>
                                </h2>
                                <p className="text-vvs-white/50 mt-4 max-w-2xl font-sans font-light text-sm sm:text-lg">
                                    Visionary designers selected for VVS Lagos 2026, each telling a uniquely African story through the lens of tomorrow.
                                </p>
                            </div>
                        </div>
                        
                        <div ref={viewportRef} className="w-full relative z-10 overflow-hidden">
                            {/* Desktop scroll jacked track */}
                            <motion.div 
                                ref={trackRef}
                                className="hidden sm:flex gap-4 sm:gap-6 pb-32 w-max pl-5 sm:pl-8 xl:pl-[calc((100vw-80rem)/2+2rem)] pr-5 sm:pr-8 xl:pr-[calc((100vw-80rem)/2+2rem)]"
                                style={{ x: designersX }}
                            >
                                {designers.map((designer, index) => (
                                    <div key={index} className="w-[70vw] sm:w-[40vw] lg:w-[25vw] shrink-0">
                                        <DesignerCard designer={designer} index={index} />
                                    </div>
                                ))}
                            </motion.div>

                            {/* Mobile native horizontal scroll */}
                            <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-8 px-5 w-full scrollbar-none" style={{ touchAction: 'pan-x' }}>
                                {designers.map((designer, index) => (
                                    <div key={`mob-des-${index}`} className="w-[85vw] shrink-0 snap-center">
                                        <DesignerCard designer={designer} index={index} />
                                    </div>
                                ))}
                                {/* Extra padding element so the last item can be scrolled fully into view */}
                                <div className="w-[10vw] shrink-0" />
                            </div>
                        </div>
                    </div>
                </section>

                <RSVPBanner />
                {/* Section 5: Footer */}
                <section className="w-full relative z-30 snap-start bg-vvs-black text-vvs-white pb-28 sm:pb-0">
                    <Footer />
                </section>
            </main>

            {/* RSVP Form Overlay */}
            <AnimatePresence>
                {isRSVPSplitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.4 } }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto"
                    >
                        <div className="relative w-[90%] max-w-lg z-[101]">
                            <div className="relative p-6 sm:p-12 text-center text-vvs-white">
                                <button
                                    onClick={() => { triggerHaptic("light"); window.dispatchEvent(new Event("close-rsvp")); }}
                                    className="absolute top-0 right-0 sm:top-6 sm:right-6 text-vvs-white/50 hover:text-vvs-gold transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-tight mb-2 text-vvs-gold">
                                    RSVP
                                </h3>
                                <p className="font-sans text-xs sm:text-sm mb-6 sm:mb-8 text-vvs-white/80">
                                    Please fill out your details to secure your spot.
                                </p>

                                {isRSVPSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-vvs-gold/10 rounded-full flex items-center justify-center mb-4">
                                            <span className="text-2xl">✨</span>
                                        </div>
                                        <h4 className="text-xl font-serif font-bold mb-2 text-vvs-gold">
                                            Request Received
                                        </h4>
                                        <p className="text-vvs-white/60 text-sm">
                                            We'll be in touch with your confirmation details soon.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleRSVPSubmit} className="space-y-4 text-left max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={rsvpData.name}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={rsvpData.email}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={rsvpData.phone}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                placeholder="+234..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                    Gender
                                                </label>
                                                <select
                                                    value={rsvpData.gender}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, gender: e.target.value }))}
                                                    className="w-full bg-black border-b border-vvs-white/20 px-0 py-2 text-vvs-white focus:outline-none focus:border-vvs-gold transition-all"
                                                >
                                                    <option value="" disabled>Select gender</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Non-binary">Non-binary</option>
                                                    <option value="Prefer not to say">Prefer not to say</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                    Occupation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rsvpData.occupation}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, occupation: e.target.value }))}
                                                    className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                    placeholder="e.g. Designer"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rsvpData.company}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, company: e.target.value }))}
                                                    className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                    placeholder="Company"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                    Role
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rsvpData.role}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, role: e.target.value }))}
                                                    className="w-full bg-transparent border-b border-vvs-white/20 px-0 py-2 text-vvs-white placeholder:text-vvs-white/30 focus:outline-none focus:border-vvs-gold transition-all"
                                                    placeholder="Role"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                How did you hear about us?
                                            </label>
                                            <select
                                                value={rsvpData.heard_about}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, heard_about: e.target.value }))}
                                                className="w-full bg-black border-b border-vvs-white/20 px-0 py-2 text-vvs-white focus:outline-none focus:border-vvs-gold transition-all"
                                            >
                                                <option value="" disabled>Select an option</option>
                                                <option value="Social Media">Social Media</option>
                                                <option value="Friend">Friend</option>
                                                <option value="Press">Press</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-vvs-white/60 mb-2">
                                                Can you attend?
                                            </label>
                                            <div className="flex gap-4 mt-1">
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="attendance"
                                                        value="yes"
                                                        checked={rsvpData.attendance === "yes"}
                                                        onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                        className="accent-vvs-gold"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="attendance"
                                                        value="no"
                                                        checked={rsvpData.attendance === "no"}
                                                        onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                        className="accent-vvs-gold"
                                                    />
                                                    Maybe / Remote
                                                </label>
                                            </div>
                                        </div>
                                        <div className="pt-8">
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-vvs-gold text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors border border-transparent"
                                            >
                                                Submit Request
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
