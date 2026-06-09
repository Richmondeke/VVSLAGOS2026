"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    past: boolean;
}

const TARGET_DATE = "2026-07-05T19:00:00";

function calcTimeLeft(): TimeLeft {
    const target = new Date(TARGET_DATE).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        past: false,
    };
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

export default function FloatingCountdown() {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft());
    const [activeSection, setActiveSection] = useState("hero");

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calcTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { id: "hero", el: document.querySelector("section:first-of-type") },
                { id: "highlights", el: document.querySelector("section:nth-of-type(2)") },
                { id: "theme", el: document.getElementById("theme") },
                { id: "journey", el: document.getElementById("journey") },
                { id: "events", el: document.getElementById("events") },
                { id: "designers", el: document.getElementById("designers") },
                { id: "get-involved", el: document.getElementById("get-involved") },
                { id: "newsletter", el: document.querySelector("section:last-of-type") }
            ];

            let current = "hero";
            const threshold = window.innerHeight * 0.4; // 40% from top viewport boundary

            for (const item of sections) {
                if (item.el) {
                    const rect = item.el.getBoundingClientRect();
                    if (rect.top <= threshold && rect.bottom >= threshold) {
                        current = item.id;
                        break;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted || timeLeft.past) return null;

    // Get position styling configuration dynamically
    const getDockConfig = (section: string) => {
        switch (section) {
            case "hero":
                return {
                    opacity: 0,
                    positionClass: "top-8 right-8 pointer-events-none scale-75",
                    styleClass: "bg-transparent border-transparent text-transparent",
                    layout: "horizontal" as const
                };
            case "highlights":
                return {
                    opacity: 1,
                    positionClass: "top-6 right-6 scale-90 md:scale-100",
                    styleClass: "bg-vvs-black border border-vvs-gold/45 text-vvs-gold shadow-[0_4px_30px_rgba(0,0,0,0.6)]",
                    layout: "horizontal" as const
                };
            case "theme":
                return {
                    opacity: 1,
                    positionClass: "top-1/2 -translate-y-1/2 right-6 scale-90 md:scale-100",
                    styleClass: "bg-vvs-white/5 backdrop-blur-md border border-vvs-gold/25 text-vvs-white shadow-[0_10px_35px_rgba(0,0,0,0.6)]",
                    layout: "vertical" as const
                };
            case "journey":
                return {
                    opacity: 1,
                    positionClass: "bottom-8 right-6 scale-90 md:scale-100",
                    styleClass: "bg-vvs-white/10 backdrop-blur-md border border-vvs-gold/30 text-vvs-white shadow-[0_10px_30px_rgba(197,160,89,0.15)]",
                    layout: "horizontal" as const
                };
            case "events":
                // Fades out near events calendar to prevent overlap with the event card countdowns
                return {
                    opacity: 0,
                    positionClass: "bottom-8 right-6 pointer-events-none scale-75",
                    styleClass: "bg-transparent border-transparent text-transparent",
                    layout: "horizontal" as const
                };
            case "designers":
                return {
                    opacity: 1,
                    positionClass: "top-6 right-6 scale-90 md:scale-100",
                    styleClass: "bg-vvs-white/5 backdrop-blur-md border border-vvs-gold/25 text-vvs-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
                    layout: "horizontal" as const
                };
            case "get-involved":
            case "newsletter":
                return {
                    opacity: 1,
                    positionClass: "bottom-8 right-6 scale-90 md:scale-100",
                    styleClass: "bg-vvs-white/5 backdrop-blur-md border border-vvs-gold/20 text-vvs-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
                    layout: "horizontal" as const
                };
            default:
                return {
                    opacity: 0,
                    positionClass: "top-6 right-6 pointer-events-none",
                    styleClass: "bg-transparent border-transparent text-transparent",
                    layout: "horizontal" as const
                };
        }
    };

    const config = getDockConfig(activeSection);
    const isVertical = config.layout === "vertical";

    return (
        <motion.div
            layout
            animate={{ opacity: config.opacity }}
            transition={{ 
                type: "spring", 
                stiffness: 90, 
                damping: 15,
                layout: { duration: 0.55, type: "spring", stiffness: 120, damping: 18 }
            }}
            className={`fixed z-40 transition-all duration-500 rounded-full sm:rounded-2xl ${config.positionClass}`}
        >
            <div className={`p-2.5 sm:p-3.5 rounded-full sm:rounded-2xl flex ${isVertical ? "flex-col items-center gap-2" : "items-center gap-2 md:gap-3"} transition-colors duration-500 ${config.styleClass}`}>
                {[
                    { label: "D", value: timeLeft.days },
                    { label: "H", value: timeLeft.hours },
                    { label: "M", value: timeLeft.minutes },
                    { label: "S", value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                    <React.Fragment key={label}>
                        <div className={`flex ${isVertical ? "flex-col" : "items-center"} items-center`}>
                            <span className="font-mono font-black tabular-nums tracking-tight leading-none text-xs sm:text-sm md:text-base">
                                {pad(value)}
                            </span>
                            <span className={`text-[7px] sm:text-[8px] uppercase tracking-widest font-mono font-bold opacity-60 ${isVertical ? "mt-1 leading-none" : "ml-1"}`}>
                                {label}
                            </span>
                        </div>
                        {i < 3 && !isVertical && (
                            <span className="opacity-20 text-[10px] select-none">|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
}
