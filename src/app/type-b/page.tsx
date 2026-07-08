"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ChevronLeft, ChevronRight, ChevronDown, Calendar, Clock, MapPin, Check, Send, Play } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";
import { supabase } from "@/lib/supabase";
import PastPartners from "@/components/sections/PastPartners";

const AWARDS_TEASER_DATA = [
  {
    id: "fashion",
    categoryName: "Fashion Designer Excellence",
    folder: "FASHION DESIGNER EXCLLENCE AWARD",
    winnerName: "Floryntina Agu (Hertunba)",
    winnerImage: "Floryntina Agu (Hertunba).jpg",
    nominees: [
      "Adebayo Oke-Lawal (Orange Culture) .jpg",
      "Bubu Ogisi (IAMISIGO) .jpg",
      "Floryntina Agu (Hertunba).jpg"
    ]
  },
  {
    id: "visual_arts",
    categoryName: "Contemporary Visual Artist",
    folder: "CONTEMPORARY VISUAL ARTIST OF THE YEAR AWARD",
    winnerName: "Anthony Azekwoh",
    winnerImage: "Anthony Azekwoh.jpg",
    nominees: [
      "Anthony Azekwoh.jpg",
      "Ken Nwadiogbu.webp",
      "Modupe Fadugba  .jpg"
    ]
  },
  {
    id: "leadership",
    categoryName: "Visionary Leadership",
    folder: "VISIONARY LEADERSHIP AWARD",
    winnerName: "Chioma Ude",
    winnerImage: "Chioma Ude.webp",
    nominees: [
      "Akarachi Amadi .webp",
      "Chioma Ude.webp",
      "Juliet Olanipekun  .jpg"
    ]
  },
  {
    id: "tech",
    categoryName: "Innovation & Technology Excellence",
    folder: "INNOVATION & TECHNOLOGY EXCELLENCE AWARD",
    winnerName: "Big Cabal (Tomiwa Aladekomo)",
    winnerImage: "Big Cabal (Tomiwa Aladekomo) .jpg",
    nominees: [
      "Big Cabal (Tomiwa Aladekomo) .jpg",
      "Bumpa (Kelvin Umechukwu)  .jpg",
      "Moniepoint (Tosin Eniolorunda) .jpg"
    ]
  },
  {
    id: "music",
    categoryName: "Emerging Music Artist of the Year",
    folder: "EMERGING MUSIC ARTIST OF THE YEAR",
    winnerName: "Fimi",
    winnerImage: "Fimi.jpg",
    nominees: [
      "Amaeya.jpg",
      "Egertton.jpg",
      "Esoterica.jpg"
    ]
  },
  {
    id: "creator",
    categoryName: "Digital Creator of the Year",
    folder: "DIGITAL CREATOR OF THE YEAR",
    winnerName: "Dezny",
    winnerImage: "Dezny.jpg",
    nominees: [
      "Creatorium (Salem & Ada).png",
      "Dele’s Life.jpg",
      "Dezny.jpg"
    ]
  },
  {
    id: "film_storytelling",
    categoryName: "Excellence in Film & Screen Storytelling",
    folder: "EXCELLENCE IN FILM & SCREEN STORYTELLING",
    winnerName: "Kemi Adetiba (To Kill a Monkey)",
    winnerImage: "Kemi Adetiba — To Kill a Monkey.jpg",
    nominees: [
      "Dammy Twitch — Call of My Life .jpg",
      "Kemi Adetiba — To Kill a Monkey.jpg",
      "Wale & Akinola Davies and Funmbi Ogunbanwo — My Father’s Shadow .jpg"
    ]
  }
];

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
    }>({ name: "", email: "", attendance: "yes", events: ["JULY 6"] });
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
    const [activeMask, setActiveMask] = useState<"white" | "black">("white");
    const [rotationOffset, setRotationOffset] = useState(0);
    const [scheduleView, setScheduleView] = useState<"calendar" | "list">("calendar");
    const [activeDropdown, setActiveDropdown] = useState<"explore" | "program" | null>(null);
    const [concludedEvents, setConcludedEvents] = useState<Record<string, boolean>>({});



    useEffect(() => {
        const interval = setInterval(() => {
            setRotationOffset(prev => prev + 1);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

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

    // Loading screen mask interchanging interval
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveMask((prev) => (prev === "white" ? "black" : "white"));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    // Optimized event dates for VVS Lagos 2026 - featuring the Innovators
    const optimizedEvents = useMemo(() => [
        {
            date: "July 6, 2026",
            shortDate: "JULY 6_FOUNDERS",
            time: "5:00 PM - 8:30 PM WAT",
            title: "VVS Founders Reception",
            venue: "Alliance Française, Ikoyi, Lagos",
            category: "Networking & Reception",
            description: "An exclusive gathering of founders, creators, and leaders to kick off VVS Lagos 2026. Network with fellow innovators and enjoy curated hospitality in a premium setting.",
            image: "/assets/ONALAJA.webp",
            gridCol: 1,
            gridSpan: 1,
            gridRow: 1,
            dateLabel: "July 6",
            endsAt: "2026-07-06T23:59:59+01:00",
            disabled: true
        },
        {
            date: "July 7 - 11, 2026",
            shortDate: "JULY 7-11",
            time: "2:00 PM - 8:00 PM WAT",
            title: "VVS Lagos 2026 Pop-Up & Trunk Show",
            venue: "Mikano, 65 Adeola Odeku, VI, Lagos",
            category: "Pop-Up & Retail",
            description: "A premium trunk show featuring retail collections from luxury Nigerian fashion brands and our VVS Innovators.",
            image: "/assets/FRUCHE.webp",
            gridCol: 2,
            gridSpan: 3,
            gridRow: 1,
            dateLabel: "July 7 - 11",
            endsAt: "2026-07-11T23:59:59+01:00",
            path: "/popup"
        },
        {
            date: "July 9, 2026",
            shortDate: "JULY 9_COLLECTORS",
            time: "7:00 PM - 10:00 PM WAT",
            title: "VVS Collectors Day Preview",
            venue: "Private Location, Lagos",
            category: "Exclusive Preview",
            description: "An exclusive preview event for art collectors and patrons, showcasing high luxury design and select curated items.",
            image: "/assets/FRUCHE.webp",
            gridCol: 4,
            gridSpan: 1,
            gridRow: 3,
            dateLabel: "July 9",
            endsAt: "2026-07-09T23:59:59+01:00",
            path: "/collectors-day"
        },
        {
            date: "July 9 - 12, 2026",
            shortDate: "JULY 9-12",
            time: "7:00 PM WAT",
            title: "VVS Lagos 2026 Art Exhibition",
            venue: "Blank Space, Grace Arena Plaza, VI, Lagos",
            category: "Art Exhibition",
            description: "A contemporary art exhibition showcasing boundary-pushing visual works from local and international modern artists, curated by Ifeanyi Nwune and Richard Vedelago.",
            image: "/assets/PIECE ET PATCH.webp",
            gridCol: 4,
            gridSpan: 4,
            gridRow: 2,
            dateLabel: "July 9 - 12",
            endsAt: "2026-07-12T23:59:59+01:00",
            path: "/artexhibition"
        },
        {
            date: "July 9, 2026",
            shortDate: "JULY 9_ART",
            time: "1:00 PM WAT",
            title: "Future Labs Art Exhibition",
            venue: "Yenwa Gallery, VI, Lagos",
            category: "Art Exhibition",
            description: "A specialized exhibition presenting experimental artworks and installations developed under the Future Labs incubator program.",
            image: "/assets/TJ WHO.webp",
            gridCol: 4,
            gridSpan: 1,
            gridRow: 4,
            dateLabel: "July 9",
            endsAt: "2026-07-09T23:59:59+01:00"
        },
        {
            date: "July 9, 2026",
            shortDate: "JULY 9_ALBUM",
            time: "10:00 PM - 3:00 AM WAT",
            title: "VVS Album Release Party",
            venue: "Octo Lagos, Musa Yar'Adua, VI, Lagos",
            category: "Album Release & Party",
            description: "An exclusive celebration for the release of the official VVS Lagos album, featuring guest DJ sets and live performances.",
            image: "/assets/TZAR STUDIOS.webp",
            gridCol: 4,
            gridSpan: 1,
            gridRow: 5,
            dateLabel: "July 9",
            endsAt: "2026-07-10T04:00:00+01:00",
            path: "/albumrelease"
        },
        {
            date: "July 10, 2026",
            shortDate: "JULY 10",
            time: "3:00 PM - 7:00 PM WAT",
            title: "Future Labs Fashion Exhibition",
            venue: "British Council, Ikoyi, Lagos",
            category: "Fashion Exhibition",
            description: "A showcase of new collections created by rising fashion designers in the Future Labs incubator program, highlighting British Council support.",
            image: "/assets/HERTUNBA.avif",
            gridCol: 5,
            gridSpan: 1,
            gridRow: 1,
            dateLabel: "July 10",
            endsAt: "2026-07-10T23:59:59+01:00"
        },
        {
            date: "July 11, 2026",
            shortDate: "JULY 11_FILM",
            time: "4:00 PM - 8:00 PM WAT",
            title: "VVS Film Experience with AFRIFF",
            venue: "Film One Landmark, VI, Lagos",
            category: "Film & Cinema",
            description: "A curated series of screenings, short films, and panel discussions on new-age African cinema, presented in partnership with AFRIFF at Landmark Filmhouse.",
            image: "/assets/LFJ OFFICIAL.webp",
            gridCol: 6,
            gridSpan: 1,
            gridRow: 1,
            dateLabel: "July 11",
            endsAt: "2026-07-11T23:59:59+01:00",
            path: "/film-experience"
        },
        {
            date: "July 11, 2026",
            shortDate: "JULY 11_FASHION",
            time: "10:00 PM WAT",
            title: "VVS Fashion Night Out",
            venue: "FOMO Lagos, VI, Lagos",
            category: "Nightlife & Party",
            description: "An electric night of music, style, and celebration, co-hosted at FOMO Lagos for fashion creatives and enthusiasts.",
            image: "/assets/IN OFFICIAL.png",
            gridCol: 6,
            gridSpan: 1,
            gridRow: 3,
            dateLabel: "July 11",
            endsAt: "2026-07-12T04:00:00+01:00"
        },
        {
            date: "July 12, 2026",
            shortDate: "JULY 12",
            time: "5:00 PM WAT",
            title: "VVS Runway Show (Main Event)",
            venue: "Club 245, VI, Lagos",
            category: "Haute Couture Runway",
            description: "The official runway show presenting Abigail Ajobi, Oshobor (VVS New Designer), Lai Labode Couture, and I.N Official.",
            image: "/assets/IN OFFICIAL.png",
            gridCol: 7,
            gridSpan: 1,
            gridRow: 1,
            dateLabel: "July 12",
            endsAt: "2026-07-12T23:59:59+01:00",
            ticketUrl: "https://www.pv.rsvp/vvs-fashion-show",
            path: "/runway"
        }
    ], []);

    useEffect(() => {
        const now = new Date();
        const concluded: Record<string, boolean> = {};
        optimizedEvents.forEach(event => {
            if (event.endsAt) {
                concluded[event.shortDate] = new Date(event.endsAt) < now;
            }
        });
        setConcludedEvents(concluded);
    }, [optimizedEvents]);

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

    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        triggerHaptic("success");

        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: rsvpData.name,
                    email: rsvpData.email,
                    phone: rsvpData.phone,
                    gender: rsvpData.gender,
                    occupation: rsvpData.occupation,
                    company: rsvpData.companyRole,
                    role: rsvpData.companyRole,
                    heard_about: rsvpData.referral,
                    attendance: rsvpData.attendance,
                    events: rsvpData.events,
                    event_type: "type_b_rsvp",
                }),
            });
            if (!res.ok) {
                console.error("Failed to submit RSVP");
            }
        } catch (err) {
            console.error("Failed to submit RSVP:", err);
        }

        setRsvpSubmitted(true);
        setTimeout(() => {
            setIsRSVPOpen(false);
            setRsvpSubmitted(false);
            setRsvpData({ 
                name: "", 
                email: "", 
                phone: "",
                gender: "",
                occupation: "",
                companyRole: "",
                referral: "",
                attendance: "yes", 
                events: [] 
            });
        }, 2500);
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            triggerHaptic("success");
            try {
                await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: newsletterEmail.trim() }),
                });
            } catch (err) {
                console.error(err);
            }
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

    return (
        <div className={`min-h-screen transition-colors duration-700 font-sans ${theme === "dark" ? "bg-black text-white" : "bg-[#F5F0E8] text-black"}`}>
            
            {/* 1. Preloader Screen (Interchanging Mask Icons simulating a horizontal ad-banner slider) */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-[#0A0A0A] flex flex-col items-center justify-between py-12 px-6 overflow-hidden"
                    >
                        {/* Spacer placeholder to center main content since label is removed */}
                        <div />

                        {/* Central Animation Area */}
                        <div className="relative w-full max-w-lg flex flex-col items-center justify-center flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeMask}
                                    src={activeMask === "white" ? "/assets/VVSWhiteMAsk.png" : "/assets/VVSMASKBLACK.png"}
                                    alt="VVS Mask"
                                    initial={{ x: 70, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -70, opacity: 0 }}
                                    transition={{ duration: 0.45, ease: "easeInOut" }}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-[0_12px_24px_rgba(197,160,89,0.2)]"
                                />
                            </AnimatePresence>
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
                    
                    {/* Left Navigation Links - Spaced out & Dropdown based */}
                    <div className="hidden lg:flex lg:flex-1 justify-start items-center gap-8 z-50">
                        <div 
                            className="relative py-2"
                            onMouseEnter={() => setActiveDropdown("explore")}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-extrabold hover:text-[#c5a059] transition-colors py-1">
                                Explore VVS <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === "explore" ? "rotate-180 text-[#c5a059]" : "opacity-60"}`} />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === "explore" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute left-0 mt-2 w-64 rounded-2xl border p-4 shadow-2xl z-50 backdrop-blur-xl ${
                                            theme === "dark" 
                                                ? "bg-black/90 border-white/10 text-white" 
                                                : "bg-[#F5F0E8]/95 border-black/10 text-black"
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            {[
                                                { title: "About VVS", desc: "The vision, story and mission of VVS Lagos 2026", target: "about" },
                                                { title: "Schedule", desc: "View the official event timeline and interactive calendar", target: "schedule" }
                                            ].map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        scrollSection(item.target);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className={`flex flex-col text-left p-2.5 rounded-xl transition-all ${
                                                        theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
                                                    }`}
                                                >
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">{item.title}</span>
                                                    <span className={`text-[9px] mt-0.5 font-light leading-normal ${
                                                        theme === "dark" ? "text-white/50" : "text-black/50"
                                                    }`}>{item.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Center Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:left-0 lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:flex lg:flex-shrink-0 lg:justify-center lg:items-center lg:w-24">
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
                    <div className="flex items-center gap-4 ml-auto lg:ml-0 lg:flex-1 lg:justify-end z-50">
                        <div className="hidden lg:flex items-center gap-8 mr-4">
                            <div 
                                className="relative py-2"
                                onMouseEnter={() => setActiveDropdown("program")}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-extrabold hover:text-[#c5a059] transition-colors py-1">
                                    Program <ChevronDown size={10} className={`transition-transform duration-300 ${activeDropdown === "program" ? "rotate-180 text-[#c5a059]" : "opacity-60"}`} />
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === "program" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className={`absolute right-0 mt-2 w-72 rounded-2xl border p-4 shadow-2xl z-50 backdrop-blur-xl ${
                                                theme === "dark" 
                                                    ? "bg-black/90 border-white/10 text-white" 
                                                    : "bg-[#F5F0E8]/95 border-black/10 text-black"
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1.5">
                                                {[
                                                    { title: "VVS Awards", desc: "Digital nominees & winners of VVS Lagos 2026", href: "/awards" },
                                                    { title: "VVS Panels", desc: "Explore panel discussions, topics and key speakers", href: "/panels" },
                                                    { title: "VVS Album", desc: "Listen to the official Descendants compilation", href: "/descendants" },
                                                    { title: "Join Community", desc: "Register to join our creative innovator network", href: "/community" }
                                                ].map((item, i) => (
                                                    <a
                                                        key={i}
                                                        href={item.href}
                                                        className={`flex flex-col text-left p-2.5 rounded-xl transition-all ${
                                                            theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
                                                        }`}
                                                    >
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">{item.title}</span>
                                                        <span className={`text-[9px] mt-0.5 font-light leading-normal ${
                                                            theme === "dark" ? "text-white/50" : "text-black/50"
                                                        }`}>{item.desc}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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

                        {/* Join Community Button */}
                        <a
                            href="/community"
                            onClick={() => triggerHaptic("medium")}
                            className={`hidden lg:block px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-extrabold transition-all border shadow-md active:scale-95 ${
                                theme === "dark" 
                                    ? "border-white/20 text-white hover:bg-white hover:text-black hover:border-white" 
                                    : "border-black/20 text-black hover:bg-black hover:text-white hover:border-black"
                            }`}
                        >
                            Join Community
                        </a>

                        {/* RSVP Action Button */}
                        <button
                            onClick={() => { triggerHaptic("medium"); setIsRSVPOpen(true); }}
                            className={`hidden lg:block px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-extrabold transition-all shadow-md active:scale-95 ${
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
                        <button onClick={() => scrollSection("calendar")} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">Upcoming Events</button>
                        <a href="/panels" className="text-[12px] uppercase tracking-widest font-bold py-2">VVS Panels</a>
                        <a href="/descendants" className="text-[12px] uppercase tracking-widest font-bold py-2">VVS Album</a>
                        <a href="/awards" className="text-[12px] uppercase tracking-widest font-bold py-2">VVS Awards</a>
                        <a href="/community" onClick={() => setIsMenuOpen(false)} className="text-[12px] uppercase tracking-widest font-bold py-2 text-[#c5a059]">Join Community</a>
                        <button onClick={() => { setIsMenuOpen(false); setIsRSVPOpen(true); }} className="text-[12px] uppercase tracking-widest font-bold text-left py-2">RSVP NOW</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. Hero Section (Mirrored Mascot Heads flanking central logo) */}
            <section id="about" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-6">
                
                {/* Giant typography behind mascot heads */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center select-none pointer-events-none z-0"
                >
                    <h1 className={`text-[12vw] font-black uppercase tracking-tighter leading-none text-center ${
                        theme === "dark" 
                            ? "text-white/[0.03] stroke-white stroke-[1px]" 
                            : "text-black/[0.03] stroke-black stroke-[1px]"
                    }`}
                    style={{ WebkitTextStroke: theme === "dark" ? "1px rgba(255,255,255,0.06)" : "1px rgba(0,0,0,0.05)" }}
                    >
                        VVS LAGOS<br />2026
                    </h1>
                </motion.div>

                {/* Mascot heads floating layer */}
                <div className="relative z-10 w-full max-w-5xl aspect-video sm:aspect-[2.4/1] flex items-center justify-center gap-6 sm:gap-12 mt-12">
                    
                    {/* Head Left (VVSMASCOT1) */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
                        transition={{
                            opacity: { duration: 0.8, delay: 0.1 },
                            x: { duration: 0.8, delay: 0.1 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
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
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [0, 15, 0] }}
                        transition={{
                            opacity: { duration: 0.8, delay: 0.2 },
                            scale: { duration: 0.8, delay: 0.2 },
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                        }}
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
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
                        transition={{
                            opacity: { duration: 0.8, delay: 0.3 },
                            x: { duration: 0.8, delay: 0.3 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
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
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="relative z-10 text-center max-w-2xl mt-8"
                >
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-3">5th Anniversary Edition</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase mb-4">Afromodernism</h2>
                    <p className={`text-sm sm:text-base font-light leading-relaxed mb-6 ${theme === "dark" ? "text-white/70" : "text-black/70"}`}>
                        The conscious reconstruction of African identities using the tools of the future, while remaining deeply rooted in the soil of our past. Collaborating fashion, digital art, film, and strategy.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs font-mono">
                        <span className={`px-4 py-2 rounded-full border ${theme === "dark" ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>✦ JULY 5 - 12, 2026</span>
                        <span className={`px-4 py-2 rounded-full border ${theme === "dark" ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>✦ LAGOS, NIGERIA</span>
                    </div>
                </motion.div>
            </section>



            {/* 5. Match Schedule Layout */}
            <section id="schedule" className="py-24 max-w-7xl mx-auto px-6">
                
                <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-2">VVS Calendar</span>
                        <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tighter">EVENT SCHEDULE IN LAGOS</h2>
                        <p className="opacity-50 text-sm mt-2">Strategized flow of locations and events. July 6 - 12, 2026.</p>
                    </div>
                    {/* View Switcher Toggle */}
                    <div className={`flex p-1 rounded-xl border self-center lg:self-auto shrink-0 shadow-lg ${
                        theme === "dark" ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                    }`}>
                        <button
                            onClick={() => {
                                triggerHaptic("light");
                                setScheduleView("calendar");
                            }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all ${
                                scheduleView === "calendar"
                                    ? "bg-[#c5a059] text-black shadow-md"
                                    : theme === "dark" 
                                        ? "text-white/60 hover:text-white" 
                                        : "text-black/60 hover:text-black"
                            }`}
                        >
                            Calendar View
                        </button>
                        <button
                            onClick={() => {
                                triggerHaptic("light");
                                setScheduleView("list");
                            }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all ${
                                scheduleView === "list"
                                    ? "bg-[#c5a059] text-black shadow-md"
                                    : theme === "dark" 
                                        ? "text-white/60 hover:text-white" 
                                        : "text-black/60 hover:text-black"
                            }`}
                        >
                            Timeline List
                        </button>
                    </div>
                </div>

                {scheduleView === "calendar" ? (
                    <div className="w-full overflow-x-auto scrollbar-none pb-4">
                        <div className="min-w-[950px] lg:min-w-full">
                            {/* Week days header grid */}
                            <div className="grid grid-cols-7 gap-3 mb-4">
                                {[
                                    { day: "MON", date: "6", active: false },
                                    { day: "TUE", date: "7", active: true },
                                    { day: "WED", date: "8", active: true },
                                    { day: "THU", date: "9", active: true },
                                    { day: "FRI", date: "10", active: true },
                                    { day: "SAT", date: "11", active: true },
                                    { day: "SUN", date: "12", active: true }
                                ].map((d, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            d.active
                                                ? theme === "dark"
                                                    ? "bg-[#c5a059]/10 border-[#c5a059]/30 text-[#c5a059]"
                                                    : "bg-[#c5a059]/15 border-[#c5a059]/40 text-[#a37f3a]"
                                                : theme === "dark"
                                                    ? "bg-white/[0.02] border-white/5 opacity-30 text-white"
                                                    : "bg-black/[0.02] border-black/5 opacity-30 text-black"
                                        }`}
                                    >
                                        <span className="block text-[9px] font-mono tracking-widest font-black uppercase">{d.day}</span>
                                        <span className="block text-lg font-bold font-sans mt-0.5">{d.date}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grid calendar area */}
                            <div className="grid grid-cols-7 grid-rows-5 gap-3 relative min-h-[560px]">
                                {/* Background grid line indicators for calendar look */}
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`absolute top-0 bottom-0 border-l border-dashed pointer-events-none ${
                                            theme === "dark" ? "border-white/5" : "border-black/5"
                                        }`}
                                        style={{ left: `${(i / 7) * 100}%` }}
                                    />
                                ))}

                                {optimizedEvents.map((event, idx) => {
                                    const isMultiDay = event.gridSpan > 1;
                                    const isConcluded = concludedEvents[event.shortDate];
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                gridColumn: `${event.gridCol} / span ${event.gridSpan}`,
                                                gridRow: `${event.gridRow}`,
                                            }}
                                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5 ${
                                                isConcluded
                                                    ? theme === "dark"
                                                        ? "bg-white/[0.002] border-white/5 opacity-30 grayscale hover:opacity-55"
                                                        : "bg-black/[0.002] border-black/5 opacity-35 grayscale hover:opacity-55"
                                                    : isMultiDay
                                                        ? theme === "dark"
                                                            ? "bg-[#c5a059]/5 border-[#c5a059]/35 text-white hover:bg-[#c5a059]/10 hover:shadow-[0_0_20px_rgba(197,160,89,0.15)]"
                                                            : "bg-[#c5a059]/10 border-[#c5a059]/45 text-black hover:bg-[#c5a059]/15 hover:shadow-[0_0_20px_rgba(197,160,89,0.1)]"
                                                        : theme === "dark"
                                                            ? "bg-white/[0.01] border-white/10 text-white hover:bg-white/[0.03] hover:border-[#c5a059]/40 hover:shadow-[0_0_20px_rgba(197,160,89,0.1)]"
                                                            : "bg-black/[0.005] border-black/10 text-black hover:bg-black/[0.015] hover:border-[#c5a059]/40 hover:shadow-[0_0_20px_rgba(197,160,89,0.05)]"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className={`text-[8px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 rounded-full inline-block ${
                                                        isConcluded
                                                            ? theme === "dark" ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                                                            : isMultiDay 
                                                                ? theme === "dark" ? "bg-[#c5a059]/20 text-[#c5a059]" : "bg-[#c5a059]/30 text-[#826122]"
                                                                : theme === "dark" ? "bg-white/10 text-white/70" : "bg-black/10 text-black/70"
                                                    }`}>
                                                        {event.category}
                                                    </span>
                                                    {isConcluded ? (
                                                        <span className="text-[8px] font-mono tracking-widest uppercase font-black opacity-45">
                                                            ✓ PASSED
                                                        </span>
                                                    ) : isMultiDay && (
                                                        <span className={`text-[8px] font-mono tracking-widest uppercase font-black ${
                                                            theme === "dark" ? "text-[#c5a059]" : "text-[#826122]"
                                                        }`}>
                                                            ↔ MULTI-DAY
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className={`text-[11px] sm:text-xs font-bold uppercase tracking-tight leading-snug line-clamp-2 ${
                                                    isConcluded ? "opacity-50" : ""
                                                }`}>
                                                    {event.title}
                                                </h4>
                                                <span className="block text-[9px] font-mono opacity-50 mt-1.5">{event.time}</span>
                                                <span className="block text-[9px] opacity-40 mt-0.5 font-light leading-snug truncate">{event.venue}</span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-2">
                                                {isConcluded ? (
                                                    <span className={`text-[8px] font-mono tracking-wider font-extrabold uppercase border px-2 py-1 rounded ${
                                                        theme === "dark" ? "text-white/30 border-white/5 bg-white/[0.02]" : "text-black/30 border-black/5 bg-black/[0.02]"
                                                    }`}>
                                                        Concluded
                                                    </span>
                                                ) : event.ticketUrl ? (
                                                    <a
                                                        href={event.ticketUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold bg-[#c5a059] text-black hover:bg-white hover:text-black transition-all shadow-md"
                                                    >
                                                        Tickets
                                                    </a>
                                                ) : event.shortDate === "JULY 11" && event.category === "Film & Cinema" ? (
                                                    <a
                                                        href="/panels"
                                                        className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold bg-[#c5a059] text-black hover:bg-white hover:text-black transition-all shadow-md"
                                                    >
                                                        Panels
                                                    </a>
                                                ) : event.shortDate === "JULY 9" && event.category === "Album Release & Party" ? (
                                                    <a
                                                        href="/descendants"
                                                        className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold bg-[#c5a059] text-black hover:bg-white hover:text-black transition-all shadow-md"
                                                    >
                                                        Album
                                                    </a>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            triggerHaptic("medium");
                                                            setRsvpData(prev => ({ ...prev, events: [event.shortDate] }));
                                                            setIsRSVPOpen(true);
                                                        }}
                                                        className={`px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold transition-all ${
                                                            theme === "dark"
                                                                ? "bg-[#c5a059]/25 text-[#c5a059] hover:bg-[#c5a059] hover:text-black"
                                                                : "bg-[#c5a059]/30 text-[#826122] hover:bg-[#c5a059] hover:text-black"
                                                        }`}
                                                    >
                                                        RSVP
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {optimizedEvents.map((event, idx) => {
                            const isConcluded = concludedEvents[event.shortDate];
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className={`p-5 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl hover:-translate-y-1 ${
                                        isConcluded
                                            ? theme === "dark"
                                                ? "bg-white/[0.002] border-white/5 opacity-40 grayscale hover:opacity-60"
                                                : "bg-black/[0.002] border-black/5 opacity-45 grayscale hover:opacity-60"
                                            : theme === "dark" 
                                                ? "bg-white/[0.02] border-white/10 hover:border-[#c5a059]/40 hover:bg-white/[0.04]" 
                                                : "bg-white border-black/10 hover:border-[#c5a059]/40 hover:bg-[#FDFBF7]"
                                    }`}
                                >
                                    {/* Date Column */}
                                    <div className="flex flex-col min-w-[120px]">
                                        <span className="font-mono text-xs font-black tracking-widest text-[#c5a059] uppercase">{event.dateLabel || event.shortDate}</span>
                                        <span className="text-[11px] opacity-50 mt-1">{event.time}</span>
                                    </div>

                                    {/* Title & Venue info */}
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-[10px] uppercase font-mono tracking-widest font-extrabold px-2.5 py-0.5 rounded-full inline-block mb-2 ${
                                            isConcluded
                                                ? theme === "dark" ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
                                                : theme === "dark" ? "bg-white/10 text-white" : "bg-black/5 text-black"
                                        }`}>
                                            {event.category}
                                        </span>
                                        <h3 className={`text-lg sm:text-xl font-bold tracking-tight uppercase leading-snug break-words ${
                                            isConcluded ? "opacity-50 line-through decoration-[#c5a059]/40 text-white/40" : ""
                                        }`}>{event.title}</h3>
                                        <p className="text-xs opacity-50 flex items-center gap-1.5 mt-1.5">
                                            <MapPin size={12} className="text-[#c5a059]" /> {event.venue}
                                        </p>
                                    </div>

                                    {/* Description block */}
                                    <div className="lg:max-w-md">
                                        <p className="text-xs opacity-60 leading-relaxed font-light">{event.description}</p>
                                    </div>

                                    {/* CTA Action button */}
                                    {isConcluded ? (
                                        <div className="shrink-0 flex items-center">
                                            <span className={`text-[9px] font-mono tracking-wider font-extrabold uppercase border px-4 py-2 rounded-xl ${
                                                theme === "dark" ? "text-white/30 border-white/5 bg-white/[0.02]" : "text-black/30 border-black/5 bg-black/[0.02]"
                                            }`}>
                                                Concluded
                                            </span>
                                        </div>
                                    ) : event.ticketUrl ? (
                                        <div className="shrink-0 flex items-center">
                                            <a
                                                href={event.ticketUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-sm hover:scale-[1.03] transition-all active:scale-[0.98] bg-[#c5a059] text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]`}
                                            >
                                                Buy Tickets
                                            </a>
                                        </div>
                                    ) : event.shortDate === "JULY 11" && event.category === "Film & Cinema" ? (
                                        <div className="shrink-0 flex items-center">
                                            <a
                                                href="/panels"
                                                className={`w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-sm hover:scale-[1.03] transition-all active:scale-[0.98] bg-[#c5a059] text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]`}
                                            >
                                                View Panels
                                            </a>
                                        </div>
                                    ) : event.shortDate === "JULY 9" && event.category === "Album Release & Party" ? (
                                        <div className="shrink-0 flex items-center">
                                            <a
                                                href="/descendants"
                                                className={`w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow-sm hover:scale-[1.03] transition-all active:scale-[0.98] bg-[#c5a059] text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]`}
                                            >
                                                Album Details
                                            </a>
                                        </div>
                                    ) : (
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
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 6. Upcoming Events Calendar Slider (Featuring VVS Innovators, strict gold/white/obsidian highlights) */}
            <section id="calendar" className={`py-24 border-t ${theme === "dark" ? "border-white/10 bg-white/[0.01]" : "border-black/10 bg-black/[0.01]"}`}>
                <motion.div 
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto px-6"
                >
                    
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
                </motion.div>
            </section>

            {/* VVS Descendants Album Section */}
            <section id="album-teaser" className={`py-24 border-t relative overflow-hidden ${
                theme === "dark" ? "border-white/10 bg-black" : "border-black/10 bg-white"
            }`}>
                <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7 space-y-6 text-center lg:text-left"
                        >
                            <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block">
                                OFFICIAL SOUNDTRACK
                            </span>
                            <h2 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-tight leading-none">
                                VVS DESCENDANTS
                            </h2>
                            <p className={`text-base font-light leading-relaxed max-w-xl ${
                                theme === "dark" ? "text-white/60" : "text-black/60"
                            }`}>
                                The sound of Afromodernism. VVS Lagos 2026 presents its official audio compilation featuring JERIQ, TRINIDAD JAMES, MINZ, PRETTYBOY DO, WTC, WIZARD CHAN &amp; IJAYA.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                                <a
                                    href="/descendants"
                                    onClick={() => triggerHaptic("medium")}
                                    className={`px-8 py-4 font-extrabold uppercase tracking-widest text-xs rounded-full transition-all ${
                                        theme === "dark"
                                            ? "bg-white text-black hover:bg-[#c5a059] hover:text-white"
                                            : "bg-black text-white hover:bg-[#c5a059] hover:text-black"
                                    }`}
                                >
                                    Explore Album
                                </a>
                                <a
                                    href="https://open.spotify.com/album/60Gx4JgOIF7rpjK1Lz7rn3?si=2cb57f59fe4148de"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => triggerHaptic("medium")}
                                    className="px-8 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 transition-all"
                                >
                                    Spotify Pre-Save
                                </a>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-5 flex justify-center"
                        >
                            <a 
                                href="/descendants"
                                onClick={() => triggerHaptic("medium")}
                                className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 group cursor-pointer bg-black block"
                            >
                                <img
                                    src="/assets/VVS_ALBUM_ART.jpg"
                                    alt="VVS Descendants Album Cover"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
                                        <Play size={20} className="ml-1 fill-black" />
                                    </div>
                                </div>
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Awards Teaser Section */}
            <section id="awards" className={`py-24 border-t ${theme === "dark" ? "border-white/10 bg-black" : "border-black/10 bg-white"}`}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto px-6 text-center"
                >
                    <span className="text-[#c5a059] text-xs font-mono font-bold tracking-[0.4em] uppercase block mb-2">VVS Awards 2026</span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight mb-4">HONORING EXCELLENCE</h2>
                    <p className={`text-xs sm:text-sm max-w-2xl mx-auto mb-12 leading-relaxed ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                        As part of VVS Lagos, 2026, the VVS luminary awards celebrates outstanding Individuals and organizations of Nigerian Descent whose work is shaping the future of African culture, creativity, innovation and storytelling. The awards recognize visionary leaders and changemakers whose impact continues to elevate Africa on the global stage.
                    </p>
                    
                    {/* Category list with cascading stacked nominee cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto justify-center items-stretch text-left">
                        {AWARDS_TEASER_DATA.map((cat, idx) => {
                            const hasWinner = !!cat.winnerName;
                            const idx0 = hasWinner 
                                ? cat.nominees.indexOf(cat.winnerImage!) !== -1 ? cat.nominees.indexOf(cat.winnerImage!) : 0
                                : (rotationOffset) % cat.nominees.length;
                            const idx1 = (rotationOffset + 1) % cat.nominees.length;
                            const idx2 = (rotationOffset + 2) % cat.nominees.length;

                            return (
                                <div 
                                    key={cat.id} 
                                    className={`group flex flex-col justify-between items-center cursor-pointer p-4 rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${
                                        hasWinner 
                                            ? theme === "dark" 
                                                ? "bg-[#c5a059]/[0.02] border-[#c5a059]/30 hover:border-[#c5a059] hover:bg-[#c5a059]/[0.04] shadow-[0_0_15px_rgba(197,160,89,0.08)]"
                                                : "bg-[#c5a059]/[0.04] border-[#c5a059]/40 hover:border-[#c5a059] hover:bg-[#c5a059]/[0.08] shadow-[0_0_15px_rgba(197,160,89,0.08)]"
                                            : "bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                                    }`}
                                    onClick={() => {
                                        triggerHaptic("light");
                                        window.location.href = "/awards";
                                    }}
                                >
                                    <div className="w-full">
                                        {/* Image Stack Container */}
                                        <div className={`w-full aspect-[4/5] rounded-xl relative overflow-hidden flex items-center justify-center mb-4 border ${
                                            hasWinner ? "border-[#c5a059]/30 bg-black/60" : "border-white/10 bg-black/40"
                                        }`}>
                                            
                                            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                                            
                                            {/* Crown/Winner Badge */}
                                            {hasWinner && (
                                                <div className="absolute top-2.5 right-2.5 z-40 bg-[#c5a059] text-black font-mono font-black text-[7px] tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-md flex items-center gap-0.5">
                                                    🏆 Winner
                                                </div>
                                            )}

                                            <div className="relative w-36 h-44 flex items-center justify-center overflow-visible select-none pointer-events-none">
                                                {hasWinner ? (
                                                    // Single Winner Portrait
                                                    <div className="absolute w-[110px] h-[140px] rounded-lg overflow-hidden border-2 border-[#c5a059] bg-black shadow-[0_0_20px_rgba(197,160,89,0.3)] transform scale-105">
                                                        <img
                                                            src={`/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(cat.winnerImage!)}`}
                                                            alt={cat.winnerName}
                                                            className="w-full h-full object-cover transition-all duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                    </div>
                                                ) : (
                                                    // Rotating Stack for Jury Selection
                                                    <>
                                                        <div className="absolute w-[90px] h-[120px] rounded-lg overflow-hidden border border-white/20 bg-black/40 shadow-2xl transition-all duration-500 transform -translate-x-8 -rotate-12 scale-90 z-10 opacity-30">
                                                            <img
                                                                src={`/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(cat.nominees[idx2])}`}
                                                                alt=""
                                                                className="w-full h-full object-cover grayscale"
                                                            />
                                                        </div>
                                                        <div className="absolute w-[90px] h-[120px] rounded-lg overflow-hidden border border-white/20 bg-black/40 shadow-2xl transition-all duration-500 transform translate-x-8 rotate-12 scale-90 z-20 opacity-40">
                                                            <img
                                                                src={`/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(cat.nominees[idx1])}`}
                                                                alt=""
                                                                className="w-full h-full object-cover grayscale"
                                                            />
                                                        </div>
                                                        <div className="absolute w-[105px] h-[135px] rounded-lg overflow-hidden border-2 border-white/30 bg-black shadow-2xl transition-all duration-500 transform rotate-0 scale-100 z-30 opacity-90">
                                                            <img
                                                                src={`/assets/nominees/${encodeURIComponent(cat.folder)}/${encodeURIComponent(cat.nominees[idx0])}`}
                                                                alt=""
                                                                className="w-full h-full object-cover grayscale"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center w-full mt-2">
                                        <span className="text-[9px] font-mono text-[#c5a059] uppercase tracking-widest block mb-1 font-bold">
                                            {cat.id === "tech" || cat.id === "leadership" ? "Jury Selection" : `Category 0${idx + 1}`}
                                        </span>
                                        <h3 className="text-xs font-black uppercase tracking-tight leading-snug text-white/95 group-hover:text-[#c5a059] transition-colors min-h-[32px] flex items-center justify-center">
                                            {cat.categoryName}
                                        </h3>
                                        {hasWinner && (
                                            <p className="text-[10px] text-[#c5a059] font-mono font-bold mt-1 tracking-wider uppercase">
                                                {cat.winnerName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </section>

            <PastPartners theme={theme} />

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
                    <p>© 2026 VERY VERY SPECIAL. ALL RIGHTS RESERVED.</p>
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
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={rsvpData.phone}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                theme === "dark" ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-black"
                                            }`}
                                            placeholder="+234..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Gender</label>
                                            <select
                                                value={rsvpData.gender}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, gender: e.target.value }))}
                                                className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                    theme === "dark" ? "bg-black border-white/15 text-white" : "bg-white border-black/15 text-black"
                                                }`}
                                            >
                                                <option value="" disabled>Select gender</option>
                                                <option value="Female">Female</option>
                                                <option value="Male">Male</option>
                                                <option value="Non-binary">Non-binary</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Occupation</label>
                                            <input
                                                type="text"
                                                value={rsvpData.occupation}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, occupation: e.target.value }))}
                                                className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                    theme === "dark" ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-black"
                                                }`}
                                                placeholder="e.g. Designer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">Company & Role</label>
                                        <input
                                            type="text"
                                            value={rsvpData.companyRole}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, companyRole: e.target.value }))}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                theme === "dark" ? "bg-white/5 border-white/15 text-white" : "bg-black/5 border-black/15 text-black"
                                            }`}
                                            placeholder="e.g. Founder at BrandX"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-1">How did you hear about us?</label>
                                        <select
                                            value={rsvpData.referral}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, referral: e.target.value }))}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-[#c5a059] ${
                                                theme === "dark" ? "bg-black border-white/15 text-white" : "bg-white border-black/15 text-black"
                                            }`}
                                        >
                                            <option value="" disabled>Select an option</option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Friend">Friend</option>
                                            <option value="Press">Press</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2">Target Events (Select all that apply)</label>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
                                            {[
                                                { value: "JULY 6_FOUNDERS", label: "July 6 — VVS Founders Reception @ Alliance Française (Invite Only)", disabled: true },
                                                { value: "JULY 7-11", label: "July 7-11 — VVS Pop-Up & Trunk Show @ Mikano VI" },
                                                { value: "JULY 9_COLLECTORS", label: "July 9 — VVS Collectors Day Preview (Private Location)" },
                                                { value: "JULY 9-12", label: "July 9-12 — VVS Art Exhibition @ Blank Space, Grace Arena Plaza VI" },
                                                { value: "JULY 9_ART", label: "July 9 — Future Labs Art Exhibition @ Yenwa Gallery VI" },
                                                { value: "JULY 9_ALBUM", label: "July 9 — VVS Album Release Party @ Octo Lagos VI" },
                                                { value: "JULY 10", label: "July 10 — Future Labs Fashion Exhibition @ British Council Ikoyi" },
                                                { value: "JULY 11_FILM", label: "July 11 — VVS Film Experience with AFRIFF @ Film One Landmark VI" },
                                                { value: "JULY 11_FASHION", label: "July 11 — VVS Fashion Night Out @ Fomo Lagos" },
                                                { value: "JULY 12", label: "July 12 — VVS Runway Show @ Club 245, VI" },
                                            ].map((opt) => {
                                                const isSelected = rsvpData.events.includes(opt.value);
                                                const isDisabled = 'disabled' in opt && opt.disabled;
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            if (isDisabled) return;
                                                            triggerHaptic("light");
                                                            setRsvpData(prev => {
                                                                const alreadySelected = prev.events.includes(opt.value);
                                                                const nextEvents = alreadySelected
                                                                    ? prev.events.filter(e => e !== opt.value)
                                                                    : [...prev.events, opt.value];
                                                                return { ...prev, events: nextEvents };
                                                            });
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                            isDisabled
                                                                ? "border-white/5 bg-white/[0.005] opacity-40 cursor-not-allowed"
                                                                : isSelected
                                                                ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_12px_rgba(197,160,89,0.15)] cursor-pointer"
                                                                : theme === "dark"
                                                                ? "border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/[0.02] cursor-pointer"
                                                                : "border-black/10 hover:border-black/30 hover:bg-black/5 bg-black/[0.02] cursor-pointer"
                                                        }`}
                                                    >
                                                        <span className={`text-xs font-medium uppercase tracking-wide ${isDisabled ? "text-white/40" : ""}`}>
                                                            {opt.label}
                                                        </span>
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                                            isDisabled
                                                                ? "border-white/10"
                                                                : isSelected
                                                                ? "bg-[#c5a059] border-[#c5a059] text-black"
                                                                : theme === "dark"
                                                                ? "border-white/30"
                                                                : "border-black/30"
                                                        }`}>
                                                            {isSelected && !isDisabled && <Check size={10} strokeWidth={4} />}
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
