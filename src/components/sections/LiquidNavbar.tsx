"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionValue, useMotionValueEvent } from "framer-motion";
import { triggerHaptic } from "@/utils/haptic";
import { X, Smartphone, Layers, Compass, Calendar, Award, Menu, Users } from "lucide-react";

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


    // Staggered navigation cards
    const navItems = [
        { 
            label: "Our Journey", 
            sub: "VVS Evolution", 
            image: "/assets/evolution/VVS2022.png", 
            action: () => isHomePage ? scrollToPercent(0.20) : (window.location.href = "/#journey"), 
            icon: <Layers size={14} className="text-vvs-gold" /> 
        },
        { 
            label: "The Festival", 
            sub: "July 7 - 11", 
            image: "/assets/evolution/VVS2024.png", 
            action: () => isHomePage ? scrollToPercent(0.58) : (window.location.href = "/#festival"), 
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
            label: "VVS Awards", 
            sub: "Vote & Get VVS Pass", 
            image: "/assets/VVSMASCOT1.webp", 
            action: () => { window.location.href = "/awards"; }, 
            icon: <Smartphone size={14} className="text-vvs-gold" /> 
        },
        { 
            label: "Community", 
            sub: "Join the movement", 
            image: "/assets/VVSWhiteMAsk.png", 
            action: () => { window.location.href = "/community"; }, 
            icon: <Users size={14} className="text-vvs-gold" /> 
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
            </AnimatePresence>
        </>
    );
}
