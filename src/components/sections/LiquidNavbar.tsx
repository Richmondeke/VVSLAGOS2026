"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionValue, useMotionValueEvent } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";
import { X, Smartphone, Layers, Compass, Calendar, Award, Menu } from "lucide-react";

import { usePathname } from "next/navigation";

interface LiquidNavbarProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    scrollYProgress: MotionValue<number>;
}

export default function LiquidNavbar({ containerRef, scrollYProgress }: LiquidNavbarProps) {
    const pathname = usePathname();
    const isRsvpPage = pathname === "/rsvp";
    const isHomePage = pathname === "/";
    
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<"labs" | "app" | null>(null);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        setIsScrolled(latest > 0.04);
        // Automatically close the menu on scroll
        if (latest > 0.08 && isMenuOpen) {
            setIsMenuOpen(false);
        }
    });

    const handleMenuToggle = () => {
        triggerHaptic("medium");
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCardClick = (action: () => void) => {
        triggerHaptic("success");
        setIsMenuOpen(false);
        action();
    };

    const scrollToPercent = (progress: number) => {
        if (containerRef.current) {
            const total = containerRef.current.scrollHeight - containerRef.current.clientHeight;
            containerRef.current.scrollTo({
                top: total * progress,
                behavior: "smooth",
            });
        }
    };

    const openModal = (type: "labs" | "app") => {
        triggerHaptic("medium");
        setIsMenuOpen(false);
        setActiveModal(type);
    };

    const closeModal = () => {
        triggerHaptic("light");
        setActiveModal(null);
    };

    // Staggered navigation cards
    const navItems = [
        { 
            label: "Our Journey", 
            sub: "VVS Evolution", 
            image: "/assets/evolution/VVS2022.png", 
            action: () => scrollToPercent(0.20), 
            icon: <Layers size={14} className="text-vvs-gold" /> 
        },
        { 
            label: "The Festival", 
            sub: "July 7 - 11", 
            image: "/assets/evolution/VVS2024.png", 
            action: () => scrollToPercent(0.58), 
            icon: <Calendar size={14} className="text-vvs-gold" /> 
        },
        { 
            label: "Future Labs", 
            sub: "Incubator", 
            image: "/assets/VVSMASCOT7.png", 
            action: () => { window.location.href = "/future-labs"; }, 
            icon: <Award size={14} className="text-vvs-gold" /> 
        },
        { 
            label: "Style Match", 
            sub: "Find your twin", 
            image: "/assets/VVSMASCOT1.webp", 
            action: () => { window.location.href = "/style-quiz"; }, 
            icon: <Smartphone size={14} className="text-vvs-gold" /> 
        },
    ];

    // Animation Variants
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.06,
            }
        }
    };

    const cardVariants = {
        hidden: { 
            y: 80, 
            scale: 0.85, 
            opacity: 0,
            transition: {
                type: "spring",
                stiffness: 220,
                damping: 25
            }
        },
        visible: { 
            y: 0, 
            scale: 1, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 180,
                damping: 18
            }
        }
    };

    return (
        <>
            {/* SVG filter definition for gooey/liquid effect */}
            <svg className="absolute w-0 h-0 hidden" aria-hidden="true">
                <defs>
                    <filter id="gooey-nav">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 18 -9" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            {/* Mobile Top-Right Hamburger Button */}
            <div className="fixed top-8 right-6 z-[100] sm:hidden pointer-events-auto flex items-center gap-3">
                <motion.button
                    onClick={handleMenuToggle}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-black border border-white/10 rounded-full flex justify-center items-center shadow-lg text-white hover:bg-white/10 transition-colors"
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className="fixed top-24 right-6 w-[calc(100vw-3rem)] max-w-[300px] sm:hidden z-[95] pointer-events-none">
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="flex flex-col gap-2 w-full p-4 pointer-events-auto bg-black/95 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl origin-top-right"
                        >
                            {navItems.map((item, idx) => (
                                <motion.div
                                    key={`mob-${idx}`}
                                    onClick={() => handleCardClick(item.action)}
                                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all hover:bg-white/5"
                                >
                                    <div className="bg-white/10 p-2 rounded-lg text-vvs-gold">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-mono font-bold text-[11px] tracking-wider text-white uppercase">{item.label}</h4>
                                        <p className="font-sans font-light text-[9px] text-white/50">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* RSVP Button in Mobile Menu */}
                            {!isRsvpPage && (
                                <motion.div
                                    onClick={() => {
                                        triggerHaptic("medium");
                                        if (isHomePage) {
                                            window.dispatchEvent(new Event("open-rsvp"));
                                        } else {
                                            window.location.href = "/rsvp";
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full mt-2 bg-vvs-gold text-black rounded-2xl p-4 flex justify-center items-center cursor-pointer active:scale-[0.98] transition-all font-bold uppercase tracking-[0.2em] text-[11px]"
                                >
                                    RSVP Now
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Floating Wrapper (Desktop Bottom Dock) */}
            {!isRsvpPage && (
                <div className="fixed inset-x-0 bottom-0 pointer-events-none z-[90] hidden sm:flex flex-col items-center justify-end pb-8 overflow-visible">
                    
                    {/* Horizontal row of Cards above dock (Desktop) */}
                    <div 
                        className="w-full flex justify-center overflow-visible mb-6"
                        style={{ filter: "url(#gooey-nav)" }}
                    >
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="flex flex-col gap-2 w-[300px] p-4 pointer-events-auto bg-black/95 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl mb-4 origin-bottom mx-auto"
                                >
                                    {navItems.map((item, idx) => (
                                        <motion.div
                                            key={`desk-${idx}`}
                                            variants={cardVariants as any}
                                            onClick={() => handleCardClick(item.action)}
                                            className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all hover:bg-white/5 hover:border-vvs-gold/50 group"
                                        >
                                            <div className="bg-white/5 p-2 rounded-lg text-white group-hover:text-vvs-gold transition-colors">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-mono font-bold text-[12px] tracking-wider text-white uppercase group-hover:text-vvs-gold transition-colors">{item.label}</h4>
                                                <p className="font-sans font-light text-[10px] text-white/50 group-hover:text-white/80 transition-colors">{item.sub}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Floating Dock / Morphing Navbar */}
                    <motion.div
                        layout
                        className={`pointer-events-auto flex items-center transition-all duration-500 ease-out bg-black/90 border border-white/10 rounded-full px-5 py-2.5 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.8)]`}
                    >
                        {/* Explore / Navigation Trigger */}
                        <motion.button
                            layout
                            onClick={handleMenuToggle}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            className={`font-bold uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center gap-2 px-5 py-2 bg-vvs-gold text-vvs-black text-[9px] sm:text-[10px] rounded-full hover:bg-white`}
                        >
                            <Compass size={14} className={isMenuOpen ? "rotate-45 transition-transform" : "transition-transform"} />
                            {isMenuOpen ? "Close Menu" : "Explore"}
                        </motion.button>

                        {/* RSVP Trigger */}
                        <motion.button
                            layout
                            onClick={() => {
                                triggerHaptic("medium");
                                window.dispatchEvent(new Event("open-rsvp"));
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            className={`font-bold uppercase tracking-[0.2em] transition-all cursor-pointer px-5 py-2 bg-transparent border border-white/20 text-white hover:bg-white/10 text-[9px] sm:text-[10px] rounded-full`}
                        >
                            RSVP
                        </motion.button>
                    </motion.div>
                </div>
            )}

            {/* Subtle background overlay when menu is open */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[80] pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            {/* Modals Section */}
            <AnimatePresence>
                {activeModal === "labs" && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 22
                                }
                            }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-vvs-black border border-vvs-gold/20 rounded-3xl z-[101] overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.15)]"
                        >
                            <div className="relative p-8 sm:p-12 text-vvs-white">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-6 right-6 text-vvs-white/50 hover:text-vvs-gold transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <span className="text-vvs-gold text-xs uppercase tracking-[0.4em] mb-3 block font-mono font-bold">
                                    VVS INNOVATION
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-serif font-extrabold uppercase tracking-tight mb-6 text-vvs-white">
                                    Future <span className="text-vvs-gold">Labs</span>
                                </h3>

                                <div className="space-y-6 text-vvs-white/70 font-sans text-sm sm:text-base font-light leading-relaxed">
                                    <p>
                                        <strong className="text-vvs-white font-medium">Future Labs</strong> is the digital incubator program of VVS Lagos 2026. Sited at the intersection of cultural heritage, high-luxury fashion, and next-generation tech, the lab operates as a runway for ideas that shape the global creative workspace.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                        <div className="border border-vvs-gold/10 p-5 rounded-2xl bg-vvs-white/[0.02] hover:bg-vvs-gold/[0.02] transition-colors">
                                            <h4 className="font-serif font-bold text-vvs-white text-base mb-2">Digital Fashion & AI</h4>
                                            <p className="text-xs leading-normal text-vvs-white/50">Incubating virtual showcases, generative fabrics, and smart apparel combining indigenous motifs with machine learning models.</p>
                                        </div>
                                        <div className="border border-vvs-gold/10 p-5 rounded-2xl bg-vvs-white/[0.02] hover:bg-vvs-gold/[0.02] transition-colors">
                                            <h4 className="font-serif font-bold text-vvs-white text-base mb-2">Creative Tech Hack</h4>
                                            <p className="text-xs leading-normal text-vvs-white/50">Bringing together developers, artists, and sound designers to build immersive WebGL spaces, AR filters, and digital collectibles.</p>
                                        </div>
                                    </div>
                                    
                                    <p className="pt-4 text-xs font-mono text-vvs-gold uppercase tracking-widest text-center">
                                        ✨ LAB SESSIONS COMMENCE JULY 8TH, John Randle Museum ✨
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeModal === "app" && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 22
                                }
                            }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-vvs-black border border-vvs-gold/20 rounded-3xl z-[101] overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.15)]"
                        >
                            <div className="relative p-8 sm:p-12 text-vvs-white flex flex-col md:flex-row items-center gap-8">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-6 right-6 text-vvs-white/50 hover:text-vvs-gold transition-colors z-10"
                                >
                                    <X size={24} />
                                </button>

                                {/* Left Content */}
                                <div className="flex-1">
                                    <span className="text-vvs-gold text-xs uppercase tracking-[0.4em] mb-3 block font-mono font-bold">
                                        GET CONNECTED
                                    </span>
                                    <h3 className="text-3xl sm:text-4xl font-serif font-extrabold uppercase tracking-tight mb-4 text-vvs-white">
                                        VVS <span className="text-vvs-gold">App</span>
                                    </h3>
                                    <p className="text-vvs-white/70 font-sans text-xs sm:text-sm font-light leading-relaxed mb-6">
                                        Unlock the ultimate festival companion. Claim exclusive digital collectible mascots, manage ticketing passes, explore live schedules, and interact with geolocation art exhibitions in Lagos.
                                    </p>
                                    
                                    <div className="flex flex-col gap-3">
                                        <button className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-bold transition-all text-xs justify-center shadow-lg">
                                            <span></span> Download on App Store
                                        </button>
                                        <button className="flex items-center gap-3 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-bold transition-all text-xs justify-center">
                                            <span>▶</span> Download on Google Play
                                        </button>
                                    </div>
                                </div>

                                {/* Right Mockup */}
                                <div className="w-48 h-80 shrink-0 border-[6px] border-vvs-white/20 rounded-[2.5rem] bg-black relative p-3 overflow-hidden shadow-2xl flex flex-col justify-between">
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-vvs-white/20 rounded-b-xl" />
                                    
                                    <div className="flex justify-between items-center text-[8px] font-mono text-vvs-white/40 mt-1">
                                        <span>9:41</span>
                                        <span>5G</span>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                                        <div className="w-16 h-16 relative mb-3">
                                            <img
                                                src="/assets/VVSMASCOT7.png"
                                                alt="Mascot"
                                                className="w-full h-full object-contain animate-bounce"
                                                style={{ animationDuration: "3s" }}
                                            />
                                        </div>
                                        <h4 className="text-[10px] font-mono font-bold tracking-widest text-vvs-gold mb-1">VVS COLLECTIVE</h4>
                                        <p className="text-[8px] text-vvs-white/60 leading-normal max-w-[120px]">Scan physical codes to mint your digital mascot passes.</p>
                                    </div>

                                    <div className="bg-vvs-gold/15 border border-vvs-gold/30 rounded-xl p-2 text-center text-vvs-gold font-mono text-[8px] tracking-widest font-bold">
                                        TICKET #2026-ACTIVE
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
