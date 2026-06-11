"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Check, Send } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    past: boolean;
}

function calcTimeLeft(targetDate: string): TimeLeft {
    const target = new Date(targetDate).getTime();
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

export default function TypeBLandingPage() {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isRSVPOpen, setIsRSVPOpen] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    const [rsvpData, setRsvpData] = useState<{
        name: string;
        email: string;
        attendance: string;
        events: string[];
    }>({ name: "", email: "", attendance: "yes", events: ["JULY 5"] });
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

    // Countdown target date (VVS Lagos 2026 Kickoff - July 5th, 2026)
    const targetDate = "2026-07-05T19:00:00";
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

    // Scroll listener for navbar background blur
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Simulated preloader progress
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 800);
                    return 100;
                }
                const increment = Math.floor(Math.random() * 6) + 2;
                return Math.min(prev + increment, 100);
            });
        }, 70);
        return () => clearInterval(interval);
    }, []);

    // Countdown timer interval
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calcTimeLeft(targetDate));
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    // Optimized event dates for VVS Lagos 2026 - featuring the Innovators
    const optimizedEvents = useMemo(() => [
        {
            date: "July 5, 2026",
            shortDate: "JULY 5",
            time: "7:00 PM WAT",
            title: "VVS Opening Gala & 5th Anniversary Celebration",
            venue: "British or Canadian Residence, Ikoyi",
            category: "Gala & Awards",
            description: "An exclusive celebration commemorating 5 years of VVS creative boundary-pushing, honoring our 11 selected VVS Innovators. Features the honorary VVS awards, anniversary recap films, curated dinner, live comedy, and dress-coded theme party for 100 guests.",
            image: "/assets/ONALAJA.webp"
        },
        {
            date: "July 6, 2026",
            shortDate: "JULY 6",
            time: "10:00 AM WAT",
            title: "VVS Conversations & Panel Sessions",
            venue: "Alliance Française, Lagos",
            category: "Conversations & Panels",
            description: "Five panel sessions on design, creative industry strategies, and technology integrations. Featuring fireside sessions with Korede Roberts, Tega Mavin, Aisha Augie. Panel insights on sustainability with Zara Odu, Kelvin Bumpa, Reni Folawiyo, Florentyna, Tolu Coye, Bola PSD, Wale Davies, Sade Okoya, and Mutesi Jolly. 120 guests.",
            image: "/assets/FRUCHE.webp"
        },
        {
            date: "July 7, 2026",
            shortDate: "JULY 7",
            time: "2:00 PM WAT",
            title: "VVS Collectors Day Preview",
            venue: "Windsor Gallery, Lagos",
            category: "Private Viewing",
            description: "A private curated viewing for VIP art collectors and international buyers, showcasing exclusive work from our VVS Innovator collective. Features detailed artist explanations of their work, a curatorial introduction speech, and drinks. 150 HNIs.",
            image: "/assets/PIECE ET PATCH.webp"
        },
        {
            date: "July 8 - 11, 2026",
            shortDate: "JULY 8-11",
            time: "12:00 PM WAT",
            title: "VVS Pop Up & Art Exhibition Public Opening",
            venue: "A White Space Ikoyi & Windsor Gallery",
            category: "Public Showcase",
            description: "The official public trunk show pop-up at A White Space Ikoyi presenting retail collections of the 11 VVS Innovator brands (including Hertunba, Onalaja, Fruché, I.N Official, TJ-Who), alongside the contemporary art exhibition extending at Windsor. 150 daily visitors.",
            image: "/assets/TJ WHO.webp"
        },
        {
            date: "July 11, 2026",
            shortDate: "JULY 11",
            time: "2:00 PM WAT",
            title: "VVS Film Experience & Panel Discussions",
            venue: "Alliance Française, Lagos",
            category: "Cinema & Storytelling",
            description: "Co-hosted in partnership with AFRIFF. Cinematic panel sessions discussing digital storytelling and film archives. Screening the brand narrative 'Descendants' short film, live plays, and cultural documentaries celebrating VVS Innovators.",
            image: "/assets/LFJ OFFICIAL.webp"
        },
        {
            date: "July 12, 2026",
            shortDate: "JULY 12",
            time: "5:00 PM WAT",
            title: "VVS Runway Presentation",
            venue: "Falomo Under the Bridge",
            category: "Haute Couture",
            description: "The main fashion runway showcase of VVS Lagos 2026. Afromodernist haute couture collections designed by our selected Innovators, presented under the iconic Falomo bridge structure in a raw, concrete architectural setting.",
            image: "/assets/IN OFFICIAL.png"
        },
        {
            date: "July 12, 2026",
            shortDate: "JULY 12",
            time: "10:00 PM WAT",
            title: "VVS Closing Party",
            venue: "Rooftop at Club 245, Ikoyi",
            category: "Afterparty",
            description: "The final celebratory gathering. Bringing together VVS Innovators, partners, model cohorts, sponsors, and guests for a rooftop celebration. Curated DJ sets, drinks, and networking for 150 people.",
            image: "/assets/TZAR STUDIOS.webp"
        }
    ], []);

    const innovators = useMemo(() => [
        {
            name: "IN OFFICIAL",
            image: "/assets/IN OFFICIAL.png",
            category: "STREETWEAR ARCHIVE",
            description: "Deconstructive utility and streetwear infused with traditional West African aesthetics. Redefining modern urban silhouettes."
        },
        {
            name: "HERTUNBA",
            image: "/assets/HERTUNBA.avif",
            category: "QUIET LUXURY / COUTURE",
            description: "Strong, empowering silhouettes designed for the modern woman. Blending traditional craftsmanship with sleek, minimal forms."
        },
        {
            name: "LFJ OFFICIAL",
            image: "/assets/LFJ OFFICIAL.webp",
            category: "AVANT-GARDE / WEARABLE ART",
            description: "Sculptural silhouettes and structured drapery. Challenging conventional tailoring rules with experimental fabrications."
        },
        {
            name: "TJ-WHO",
            image: "/assets/TJ WHO.webp",
            category: "CONTEMPORARY TAILORING",
            description: "Minimalist cross-cultural menswear. Bridging the gap between strict architectural cuts and soft fluid shapes."
        },
        {
            name: "PIECE ET PATCH",
            image: "/assets/PIECE ET PATCH.webp",
            category: "UPCYCLED STREETWEAR",
            description: "Artisanal patchwork and reconstructed denim. Merging eco-conscious design processes with high-energy Lagos youth culture."
        },
        {
            name: "FRUCHÉ",
            image: "/assets/FRUCHE.webp",
            category: "AFROPOLITAN MODERNISM",
            description: "A bold mixture of past, present, and future Nigerian culture. Creating progressive luxury garments with historical undertones."
        },
        {
            name: "ONALAJA",
            image: "/assets/ONALAJA.webp",
            category: "HIGH CRAFT / BEADING",
            description: "Fusing traditional Nigerian crafts with contemporary luxury. Internationally celebrated for intricate beading, texture play, and knitwear."
        },
        {
            name: "RE LAGOS",
            image: "/assets/RE LAGOS.webp",
            category: "SUSTAINABLE HERITAGE",
            description: "A circular fashion label reimagining handwoven Aso-Oke and local fabrics. Fostering heritage preservation and local community craft."
        },
        {
            name: "TOKYO JAMES",
            image: "/assets/TOKYO JAMEs.webp",
            category: "MENSWEAR / AVANT-GARDE",
            description: "Sartorial edge meets bold, unconventional textures. Renowned globally for setting new standards in tailoring and gender-fluid silhouettes."
        },
        {
            name: "I AM ISIGO",
            image: "/assets/IAM ISIGO.webp",
            category: "ETHICAL / WEARABLE ART",
            description: "A textile-focused brand celebrating African myths and cultures. Translating rich historical research into raw, textured luxury wear."
        },
        {
            name: "TZAR STUDIOS",
            image: "/assets/TZAR STUDIOS.webp",
            category: "PREMIUM CASUALWEAR",
            description: "Exploring subversion of classic menswear forms. Infusing vibrant prints, modern proportions, and elevated daily-wear structures."
        }
    ], []);

    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollCarousel = (direction: "left" | "right") => {
        triggerHaptic("light");
        if (carouselRef.current) {
            const scrollAmount = 340;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    const handleRSVPSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerHaptic("success");
        setRsvpSubmitted(true);
        setTimeout(() => {
            setIsRSVPOpen(false);
            setRsvpSubmitted(false);
            setRsvpData({ name: "", email: "", attendance: "yes", events: [] });
        }, 2500);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            triggerHaptic("success");
            setNewsletterSubmitted(true);
            setNewsletterEmail("");
            setTimeout(() => {
                setNewsletterSubmitted(false);
            }, 5000);
        }
    };

    const toggleTheme = () => {
        triggerHaptic("light");
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const scrollSection = (id: string) => {
        triggerHaptic("medium");
        setIsMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Calculate anim phases for the preloader
    const preloaderLeftX = useMemo(() => {
        if (progress < 25) return "-25vw"; // Separated
        if (progress >= 25 && progress < 60) {
            const p = (progress - 25) / 35;
            return `calc(-25vw + (${p} * 25vw))`; // Merging
        }
        if (progress >= 60 && progress < 85) return "0vw"; // Merged
        // Splitting
        const p = (progress - 85) / 15;
        return `calc(${p} * -35vw)`;
    }, [progress]);

    const preloaderRightX = useMemo(() => {
        if (progress < 25) return "25vw"; // Separated
        if (progress >= 25 && progress < 60) {
            const p = (progress - 25) / 35;
            return `calc(25vw - (${p} * 25vw))`; // Merging
        }
        if (progress >= 60 && progress < 85) return "0vw"; // Merged
        // Splitting
        const p = (progress - 85) / 15;
        return `calc(${p} * 35vw)`;
    }, [progress]);

    const showText = progress >= 85;

    return (
        <div className={`min-h-screen transition-colors duration-700 font-sans ${theme === "dark" ? "bg-black text-white" : "bg-[#F5F0E8] text-black"}`}>
            
            {/* 1. Preloader Screen (Dynamic Assembling and Splitting Mask Circles) */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-[#0A0A0A] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
                    >
                        {/* Status Label */}
                        <span className="text-[#c5a059] font-mono text-[9px] uppercase tracking-[0.4em]">
                            System Launching
                        </span>

                        {/* Central Animation Area */}
                        <div className="relative w-full max-w-lg flex flex-col items-center justify-center flex-1">
                            
                            {/* Two Mask Circles Container */}
                            <div className="relative w-full h-40 flex items-center justify-center">
                                
                                {/* Left Mask Circle (Dark Background, White Mask) */}
                                <div 
                                    className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-lg transition-all"
                                    style={{ transform: `translateX(${preloaderLeftX})` }}
                                >
                                    <img
                                        src="/assets/VVSWhiteMAsk.png"
                                        alt="White Mask"
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>

                                {/* Right Mask Circle (White Background, Black Mask) */}
                                <div 
                                    className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-lg transition-all"
                                    style={{ transform: `translateX(${preloaderRightX})` }}
                                >
                                    <img
                                        src="/assets/VVSMASKBLACK.png"
                                        alt="Black Mask"
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>

                                {/* On-Brand Center Text (revealed when circles split) */}
                                <AnimatePresence>
                                    {showText && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute flex flex-col items-center text-center pointer-events-none"
                                        >
                                            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-[#c5a059] uppercase leading-none">
                                                VVS LAGOS
                                            </h1>
                                            <span className="text-white text-[10px] font-mono tracking-[0.4em] uppercase mt-1.5">
                                                2026 EDITION
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>

                        {/* Loading progress bar & percentage */}
                        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                            <div className="w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#c5a059]" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                            <span className="font-mono text-[10px] tracking-widest text-[#c5a059] font-bold">{progress} %</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Top Navbar (Logo & Mode-based) */}
            <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-4 ${
                scrolled 
                    ? theme === "dark" 
                        ? "bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
                        : "bg-[#F5F0E8]/85 backdrop-blur-xl border-b border-black/10 shadow-xl" 
                    : "bg-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
                    
                    {/* Left Navigation Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button onClick={() => scrollSection("about")} className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">About</button>
                        <button onClick={() => scrollSection("schedule")} className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">Schedule</button>
                        <button onClick={() => scrollSection("countdown")} className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">Kickoff</button>
                        <button onClick={() => scrollSection("calendar")} className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">Events</button>
                    </div>

                    {/* Center Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="flex items-center justify-center w-14 h-14 relative"
                        >
                            <img
                                src={theme === "dark" ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                alt="VVS Mask Logo"
                                className="w-12 h-12 object-contain transition-transform duration-500 hover:scale-110"
                            />
                        </button>
                    </div>

                    {/* Right Navigation Links & Controls */}
                    <div className="flex items-center gap-4 ml-auto lg:ml-0">
                        <div className="hidden lg:flex items-center gap-6 mr-4">
                            <a href="/style-quiz" className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">Style Quiz</a>
                            <a href="/strategy" className="text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#c5a059] transition-colors">Strategy</a>
                        </div>

                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className={`p-2 rounded-full border transition-all ${
                                theme === "dark" 
                                    ? "border-white/10 hover:bg-white/10 text-white" 
                                    : "border-black/10 hover:bg-black/5 text-black"
                            }`}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                        </button>

                        {/* RSVP Action Button */}
                        <button
                            onClick={() => { triggerHaptic("medium"); setIsRSVPOpen(true); }}
                            className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-extrabold transition-all shadow-md active:scale-95 ${
                                theme === "dark" 
                                    ? "bg-white text-black hover:bg-[#c5a059] hover:text-white" 
                                    : "bg-black text-white hover:bg-[#c5a059]"
                            }`}
                        >
                            RSVP NOW
                        </button>

                        {/* Mobile Hamburger Toggle */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2"
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`fixed top-[72px] inset-x-0 z-[90] lg:hidden p-6 border-b flex flex-col gap-4 ${
                            theme === "dark" 
                                ? "bg-black/95 border-white/10 text-white" 
                                : "bg-[#F5F0E8]/95 border-black/10 text-black"
                        }`}
                    >
                        <button onClick={() => scrollSection("about")} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">About</button>
                        <button onClick={() => scrollSection("schedule")} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">Schedule</button>
                        <button onClick={() => scrollSection("countdown")} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">Kickoff Countdown</button>
                        <button onClick={() => scrollSection("calendar")} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">Upcoming Events</button>
                        <a href="/style-quiz" className="text-[12px] uppercase tracking-widest font-bold py-2">Style Quiz</a>
                        <a href="/strategy" className="text-[12px] uppercase tracking-widest font-bold py-2">Internal Strategy</a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Hero Section (Mirrored Mascot Heads flanking central logo) */}
            <section id="about" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-6">
                
                {/* Giant typography behind mascot heads */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none z-0">
                    <h1 className={`text-[12vw] font-black uppercase tracking-tighter leading-none text-center ${
                        theme === "dark" 
                            ? "text-white/[0.03] stroke-white stroke-[1px]" 
                            : "text-black/[0.03] stroke-black stroke-[1px]"
                    }`}
                    style={{ WebkitTextStroke: theme === "dark" ? "1px rgba(255,255,255,0.06)" : "1px rgba(0,0,0,0.05)" }}
                    >
                        VVS LAGOS<br />2026
                    </h1>
                </div>

                {/* Mascot heads floating layer */}
                <div className="relative z-10 w-full max-w-5xl aspect-video sm:aspect-[2.4/1] flex items-center justify-center gap-6 sm:gap-12 mt-12">
                    
                    {/* Head Left (VVSMASCOT1) */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1/4 sm:w-1/5 relative cursor-pointer"
                        whileHover={{ scale: 1.08 }}
                    >
                        <img
                            src="/assets/VVSMASCOT1.webp"
                            alt="VVS Mascot Head Left"
                            className="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                        />
                    </motion.div>

                    {/* Head Center */}
                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="w-1/3 sm:w-1/4 relative cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                    >
                        <img
                            src={theme === "dark" ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                            alt="VVS Mascot Head Center"
                            className="w-full h-auto object-contain filter drop-shadow-[0_25px_50px_rgba(197,160,89,0.3)]"
                        />
                    </motion.div>

                    {/* Head Right (Mirrored / Horizontally Flipped version of VVSMASCOT1) */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1/4 sm:w-1/5 relative cursor-pointer"
                        whileHover={{ scale: 1.08 }}
                    >
                        <img
                            src="/assets/VVSMASCOT1.webp"
                            alt="VVS Mascot Head Right Flipped"
                            className="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                            style={{ transform: "scaleX(-1)" }}
                        />
                    </motion.div>
                </div>

                {/* Event Intro and Details */}
                <div className="relative z-10 text-center max-w-2xl mt-8">
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-3">5th Anniversary Edition</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase mb-4">Afromodernism</h2>
                    <p className={`text-sm sm:text-base font-light leading-relaxed mb-6 ${theme === "dark" ? "text-white/70" : "text-black/70"}`}>
                        The conscious reconstruction of African identities using the tools of the future, while remaining deeply rooted in the soil of our past. Collaborating fashion, digital art, film, and strategy.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
                        <span className={`px-4 py-2 rounded-full border ${theme === "dark" ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>✦ JULY 5 - 12, 2026</span>
                        <span className={`px-4 py-2 rounded-full border ${theme === "dark" ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>✦ LAGOS, NIGERIA</span>
                    </div>
                </div>
            </section>

            {/* 4. Countdown Section (Strict Brand Colors: White, Black, Gold, Obsidian) */}
            <section id="countdown" className={`py-24 border-y relative overflow-hidden ${
                theme === "dark" ? "border-white/10 bg-[#0D0D0D]" : "border-black/10 bg-[#F5F0E8]"
            }`}>
                
                {/* Checkered pattern background using gold / white / obsidian check border cells */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none grid grid-cols-12 grid-rows-6">
                    {Array.from({ length: 72 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`border ${
                                theme === "dark" ? "border-white/50" : "border-black/50"
                            } ${i % 9 === 0 ? "bg-[#c5a059]/30" : ""}`} 
                        />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
                    
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.5em] uppercase block mb-4">Countdown Track</span>
                    
                    <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight mb-12">
                        UNTIL VVS LAGOS 2026 KICKOFF
                    </h2>

                    {/* Countdown Display grid */}
                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-6">
                        {[
                            { label: "Days", value: timeLeft.days },
                            { label: "Hours", value: timeLeft.hours },
                            { label: "Minutes", value: timeLeft.minutes },
                            { label: "Seconds", value: timeLeft.seconds }
                        ].map((timeUnit, index) => (
                            <React.Fragment key={timeUnit.label}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-20 sm:w-28 aspect-square rounded-xl flex items-center justify-center font-mono font-black text-3xl sm:text-5xl shadow-lg border transition-all ${
                                        theme === "dark" 
                                            ? "bg-[#151515] border-white/10 text-white" 
                                            : "bg-white border-black/10 text-[#c5a059]"
                                    }`}>
                                        {pad(timeUnit.value)}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold mt-2 opacity-60">
                                        {timeUnit.label}
                                    </span>
                                </div>
                                {index < 3 && (
                                    <div className="text-3xl sm:text-5xl font-black text-[#c5a059] opacity-80 select-none pb-4">:</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <p className="text-xs font-mono opacity-50 mt-4">OFFICIAL INVITATION SENT DATE: JUNE 10TH, 2026</p>
                </div>
            </section>

            {/* 5. Match Schedule Layout */}
            <section id="schedule" className="py-24 max-w-7xl mx-auto px-6">
                
                <div className="mb-14 text-center lg:text-left">
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-2">VVS Calendar</span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tighter">EVENT SCHEDULE IN LAGOS</h2>
                    <p className="opacity-50 text-sm mt-2">Strategized flow of locations and events. July 5 - 12, 2026.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {optimizedEvents.map((event, idx) => (
                        <div
                            key={idx}
                            className={`p-5 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:-translate-y-1 ${
                                theme === "dark" 
                                    ? "bg-white/[0.02] border-white/10 hover:border-[#c5a059]/40 hover:bg-white/[0.04]" 
                                    : "bg-white border-black/10 hover:border-[#c5a059]/40 hover:bg-[#FDFBF7]"
                            }`}
                        >
                            {/* Date Column */}
                            <div className="flex flex-col min-w-[120px]">
                                <span className="font-mono text-xs font-black tracking-widest text-[#c5a059] uppercase">{event.shortDate}</span>
                                <span className="text-[11px] opacity-50 mt-1">{event.time}</span>
                            </div>

                            {/* Title & Venue info */}
                            <div className="flex-1 min-w-0">
                                <span className={`text-[10px] uppercase font-mono tracking-widest font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-2 ${
                                    theme === "dark" ? "bg-white/10 text-white" : "bg-black/5 text-black"
                                }`}>
                                    {event.category}
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight uppercase leading-snug break-words">{event.title}</h3>
                                <p className="text-xs opacity-50 flex items-center gap-1.5 mt-1.5">
                                    <MapPin size={12} className="text-[#c5a059]" /> {event.venue}
                                </p>
                            </div>

                            {/* Description block */}
                            <div className="lg:max-w-md">
                                <p className="text-xs opacity-60 leading-relaxed font-light">{event.description}</p>
                            </div>

                            {/* CTA Action button */}
                            <div className="shrink-0 flex items-center">
                                <button
                                    onClick={() => {
                                        triggerHaptic("medium");
                                        setRsvpData(prev => ({ ...prev, events: [event.shortDate] }));
                                        setIsRSVPOpen(true);
                                    }}
                                    className={`w-full lg:w-auto px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-sm hover:scale-[1.03] transition-all active:scale-[0.98] bg-[#c5a059] text-black hover:bg-white hover:text-black`}
                                >
                                    Get Invitation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Upcoming Events Calendar Slider (Featuring VVS Innovators, strict gold/white/obsidian highlights) */}
            <section id="calendar" className={`py-24 border-t ${theme === "dark" ? "border-white/10 bg-white/[0.01]" : "border-black/10 bg-black/[0.01]"}`}>
                <div className="max-w-7xl mx-auto px-6">
                    
                    {/* Header with Navigation Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
                        <div>
                            <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-2">VVS Collective</span>
                            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">THE INNOVATORS</h2>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <button
                                onClick={() => scrollSection("schedule")}
                                className={`px-4 py-2 border rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                                    theme === "dark" 
                                        ? "border-white/15 text-white hover:bg-white hover:text-black" 
                                        : "border-black/15 text-black hover:bg-black hover:text-white"
                                }`}
                            >
                                View Schedule
                            </button>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => scrollCarousel("left")}
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                                        theme === "dark" ? "border-white/15 hover:bg-white/10 text-white" : "border-black/15 hover:bg-black/5 text-black"
                                    }`}
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => scrollCarousel("right")}
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                                        theme === "dark" ? "border-white/15 hover:bg-white/10 text-white" : "border-black/15 hover:bg-black/5 text-black"
                                    }`}
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
 
                    {/* Scrolling Track Container */}
                    <div 
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {innovators.map((innovator, idx) => (
                            <div 
                                key={idx} 
                                className="w-[300px] sm:w-[320px] shrink-0 snap-start flex flex-col group cursor-pointer"
                                onClick={() => {
                                    triggerHaptic("light");
                                    setRsvpData(prev => ({ ...prev, events: ["JULY 8-11"] }));
                                    setIsRSVPOpen(true);
                                }}
                            >
                                {/* Innovator Image Container */}
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 relative mb-4">
                                    <img
                                        src={innovator.image}
                                        alt={innovator.name}
                                        className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-85 group-hover:opacity-30 transition-opacity pointer-events-none" />
                                </div>
 
                                {/* Innovator details */}
                                <div>
                                    <h3 className="text-lg font-extrabold tracking-tight uppercase leading-snug mb-3 group-hover:text-[#c5a059] transition-colors line-clamp-1">
                                        {innovator.name}
                                    </h3>
                                    <div className={`flex items-center justify-between pt-3 border-t ${
                                        theme === "dark" ? "border-white/10" : "border-black/10"
                                    }`}>
                                        <span className="text-[10px] font-mono opacity-50">
                                            VVS COHORT 2026
                                        </span>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c5a059] group-hover:translate-x-1 transition-transform">
                                            RSVP TO POP-UP →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Subscribe to Newsletter Section (New) */}
            <section className={`py-20 md:py-28 relative overflow-hidden border-t ${
                theme === "dark" ? "border-white/10 bg-[#0d0d0d]" : "border-black/10 bg-[#FAF7F2]"
            }`}>
                {/* Background glow in theme accent colors */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#c5a059]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-full max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] mb-4 block">
                            STAY CONNECTED
                        </span>
                        
                        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-4">
                            JOIN THE <span className="text-[#c5a059]">VVS SOCIETY</span>
                        </h2>
                        
                        <p className={`text-xs sm:text-sm font-light mb-8 leading-relaxed max-w-md mx-auto ${
                            theme === "dark" ? "text-white/50" : "text-black/50"
                        }`}>
                            Subscribe to receive early calendar priority codes, private designer collections drop notifications, and cultural briefs.
                        </p>

                        {newsletterSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-4 px-6 border border-[#c5a059]/30 rounded-2xl bg-[#c5a059]/5 max-w-md mx-auto"
                            >
                                <span className="text-[#c5a059] font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                    ✦ You are on the VIP registry
                                </span>
                            </motion.div>
                        ) : (
                            <form 
                                onSubmit={handleNewsletterSubmit} 
                                className={`flex flex-col sm:flex-row gap-2 max-w-md mx-auto rounded-xl p-1.5 border ${
                                    theme === "dark" ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                }`}
                            >
                                <input
                                    type="email"
                                    required
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className={`flex-1 px-4 py-3 bg-transparent rounded-lg text-xs font-mono placeholder:opacity-45 focus:outline-none ${
                                        theme === "dark" ? "text-white placeholder:text-white/40" : "text-black placeholder:text-black/40"
                                    }`}
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#c5a059] text-black text-[10px] uppercase tracking-[0.2em] font-extrabold rounded-lg hover:bg-white transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                                >
                                    Subscribe <Send size={11} />
                                </button>
                            </form>
                        )}
                        
                        <p className={`text-[9px] font-mono mt-4 uppercase tracking-widest opacity-45`}>
                            NO SPAM. UNSUBSCRIBE ANYTIME.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-12 border-t text-center text-xs opacity-50 ${theme === "dark" ? "border-white/10 bg-black" : "border-black/10 bg-[#F5F0E8]"}`}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img
                            src={theme === "dark" ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                            alt="Logo"
                            className="w-6 h-6 object-contain"
                        />
                        <span className="font-bold tracking-wider">VVS LAGOS 2026</span>
                    </div>
                    <p>© 2026 VERY VERY SPECIAL. ALL RIGHTS RESERVED. DESIGNED WITH SATOSHI.</p>
                </div>
            </footer>

            {/* RSVP MODAL FORM */}
            <AnimatePresence>
                {isRSVPOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsRSVPOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${
                                theme === "dark" ? "bg-black border-white/15 text-white" : "bg-[#F5F0E8] border-black/15 text-black"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsRSVPOpen(false)}
                                className={`absolute top-4 right-4 p-1 rounded-full ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"}`}
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6">
                                <span className="text-[#c5a059] text-xs font-mono tracking-widest font-bold uppercase block mb-1">Invitation Request</span>
                                <h3 className="text-2xl font-extrabold uppercase">VVS Lagos RSVP</h3>
                                <p className="text-xs opacity-50 mt-1">Submit request for invitations to VVS Lagos 2026 events.</p>
                            </div>

                            {rsvpSubmitted ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
                                        <Check size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold uppercase">RSVP Submitted</h4>
                                    <p className="text-xs opacity-60 max-w-[280px]">Your invitation request has been logged. We will review details and follow up shortly.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleRSVPSubmit} className="space-y-4 font-sans">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={rsvpData.name}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, name: e.target.value }))}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                theme === "dark" ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-black"
                                            }`}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={rsvpData.email}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                theme === "dark" ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-black"
                                            }`}
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2">Target Events (Select all that apply)</label>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
                                            {[
                                                { value: "JULY 5", label: "July 5 - VVS Opening Gala" },
                                                { value: "JULY 6", label: "July 6 - VVS Panel Sessions" },
                                                { value: "JULY 7", label: "July 7 - Collectors Day Preview" },
                                                { value: "JULY 8-11", label: "July 8-11 - Pop Up Exhibition" },
                                                { value: "JULY 11", label: "July 11 - Film Experience" },
                                                { value: "JULY 12", label: "July 12 - Runway Show & Afterparty" },
                                            ].map((opt) => {
                                                const isSelected = rsvpData.events.includes(opt.value);
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            triggerHaptic("light");
                                                            setRsvpData(prev => {
                                                                const alreadySelected = prev.events.includes(opt.value);
                                                                const nextEvents = alreadySelected
                                                                    ? prev.events.filter(e => e !== opt.value)
                                                                    : [...prev.events, opt.value];
                                                                return { ...prev, events: nextEvents };
                                                            });
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                                            isSelected
                                                                ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_12px_rgba(197,160,89,0.15)]"
                                                                : theme === "dark"
                                                                ? "border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/[0.02]"
                                                                : "border-black/10 hover:border-black/30 hover:bg-black/5 bg-black/[0.02]"
                                                        }`}
                                                    >
                                                        <span className="text-xs font-medium uppercase tracking-wide">
                                                            {opt.label}
                                                        </span>
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                                            isSelected
                                                                ? "bg-[#c5a059] border-[#c5a059] text-black"
                                                                : theme === "dark"
                                                                ? "border-white/30"
                                                                : "border-black/30"
                                                        }`}>
                                                            {isSelected && <Check size={10} strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {rsvpData.events.length === 0 && (
                                            <p className="text-[10px] text-red-500 font-mono mt-1">
                                                * Please select at least one event.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Can you attend?</label>
                                        <div className="flex gap-4 mt-1">
                                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="attendance"
                                                    value="yes"
                                                    checked={rsvpData.attendance === "yes"}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                    className="accent-[#c5a059]"
                                                />
                                                Yes, absolutely
                                            </label>
                                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="attendance"
                                                    value="no"
                                                    checked={rsvpData.attendance === "no"}
                                                    onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                    className="accent-[#c5a059]"
                                                />
                                                Maybe / Remote
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={rsvpData.events.length === 0}
                                        className={`w-full py-4 mt-4 bg-[#c5a059] text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white hover:text-black transition-all ${
                                            rsvpData.events.length === 0 ? "opacity-45 cursor-not-allowed" : "active:scale-[0.98] hover:scale-[1.01]"
                                        }`}
                                    >
                                        Submit Request
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
