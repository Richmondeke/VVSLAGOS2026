"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Countdown from "../ui/Countdown";

const TICKET_URL = "https://www.pv.rsvp/vvs-fashion-show";

const events = [
    {
        fullDate: "2026-07-06T16:00:00",
        date: "July 6",
        venue: "Alliance Francais, Ikoyi Lagos",
        title: "VVS Founders Reception",
        time: "4:00 PM",
        category: "Opening & Awards",
        note: "Official Opening and luminary awards event • By Invitation Only. RSVP By email or filling the form attached and ensure your confirmation",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-07T12:00:00",
        date: "July 7 – 11",
        venue: "Mikano 65 Adeola Odeku, Victoria Island",
        title: "VVS Lagos 2026 Pop Up",
        time: "12:00 PM",
        category: "Public Showcase",
        note: "Pop Up Trunk Show Showcase",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-08T12:00:00",
        date: "July 8 – 12",
        venue: "Blank Space, Grace Arena Plaza VI",
        title: "VVS Lagos 2026 Art Exhibition",
        time: "12:00 PM",
        category: "Public Showcase",
        note: "Curated Art Exhibition Showcase",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-09T12:00:00",
        date: "July 9",
        venue: "Yenwa Gallery",
        title: "Future Labs (Art Exhibition)",
        time: "12:00 PM",
        category: "Art Exhibition",
        note: "Future Labs Art Showcase",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-09T21:00:00",
        date: "July 9",
        venue: "Octo Lagos, Musa Yaradua VI Lagos",
        title: "VVS Album Release Party",
        time: "9:00 PM",
        category: "Music & Celebration",
        note: "Official VVS Album Release Event",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-10T12:00:00",
        date: "July 10",
        venue: "British Council",
        title: "Future Labs (Fashion Exhibition)",
        time: "12:00 PM",
        category: "Fashion Exhibition",
        note: "Future Labs Creative Runway & Tech-Fashion Showcase",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-11T14:00:00",
        date: "July 11",
        venue: "Alliance Francais, Lagos",
        title: "VVS Film Experience with AFRIFF",
        time: "2:00 PM",
        category: "Cinema & Storytelling",
        note: "Partnership with AFRIFF • High-Level Film & Storytelling Panel Conversations • 'Descendants' Short Film Screening & Live Play",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-11T21:00:00",
        date: "July 11",
        venue: "Fomo Lagos",
        title: "VVS Fashion Night Out",
        time: "9:00 PM",
        category: "Celebration",
        note: "Fashion Night Out Celebration",
        ticketUrl: null,
    },
    {
        fullDate: "2026-07-12T17:00:00",
        date: "July 12",
        venue: "234 Adeola Odeku VI",
        title: "VVS Runway Show",
        time: "5:00 PM",
        category: "Haute Couture",
        note: "Model Runway Presentation • Featured Designer Brand Showcases",
        ticketUrl: TICKET_URL,
    },
];

// Returns short day name e.g. "SUN", "MON"
function getDayLabel(isoDate: string): string {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const d = new Date(isoDate);
    return days[d.getDay()];
}

function EventCard({ event, index, mounted }: { event: typeof events[0]; index: number; mounted: boolean }) {
    const [isHovered, setIsHovered] = useState(false);

    // Split event.note into distinct activities
    const activities = event.note ? event.note.split("•").map((act) => act.trim()) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative overflow-hidden"
        >
            <div className="p-4 sm:p-6 md:p-8 bg-vvs-white/5 border border-vvs-gold/10 hover:border-vvs-gold/40 transition-all rounded-xl relative z-10 cursor-pointer">
                {/* Desktop: side-by-side | Mobile: stacked */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">

                    {/* ── Main content ── */}
                    <div className="min-w-0 flex-1">
                        {/* Top meta row: DAY · Date · Category */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                            <span className="text-vvs-gold text-sm sm:text-base md:text-lg font-mono font-extrabold leading-none">
                                {mounted ? getDayLabel(event.fullDate) : "---"}
                            </span>
                            <span className="h-1 w-1 bg-vvs-gold/40 rounded-full" />
                            <span className="text-vvs-white/50 text-xs font-sans">{event.date}</span>
                            {'venue' in event && event.venue && (
                                <>
                                    <span className="h-1 w-1 bg-vvs-gold/40 rounded-full" />
                                    <span className="text-vvs-white/70 text-xs font-sans italic">{event.venue}</span>
                                </>
                            )}
                            <span className="h-1 w-1 bg-vvs-gold/40 rounded-full" />
                            <span className="text-vvs-gold/70 text-[10px] uppercase tracking-widest font-mono font-bold">
                                {event.category}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold text-vvs-white group-hover:text-vvs-gold transition-colors uppercase tracking-tight leading-snug">
                            {event.title}
                        </h3>

                        {/* Smoothly expanded activity minicards on hover */}
                        {activities.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ 
                                    height: isHovered ? "auto" : 0, 
                                    opacity: isHovered ? 1 : 0,
                                    marginTop: isHovered ? 16 : 0
                                }}
                                transition={{ duration: 0.35, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {activities.map((activity, aIdx) => (
                                        <motion.div 
                                            key={aIdx}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: isHovered ? 1 : 0.9, opacity: isHovered ? 1 : 0 }}
                                            transition={{ delay: isHovered ? aIdx * 0.04 : 0 }}
                                            className="px-3 py-1.5 border border-vvs-gold/15 bg-vvs-white/[0.03] hover:border-vvs-gold/30 hover:bg-vvs-gold/5 rounded-lg text-[10px] sm:text-xs font-mono text-vvs-white/80 uppercase tracking-wider transition-all"
                                        >
                                            ✦ {activity}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Right column: time + ticket/countdown ── */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:gap-2 pt-3 md:pt-0 border-t border-vvs-gold/10 md:border-t-0 shrink-0">
                        <span className="text-vvs-white text-sm sm:text-base md:text-lg font-mono font-bold tracking-tighter">{event.time}</span>
                        {event.ticketUrl ? (
                            <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vvs-gold text-vvs-black text-[10px] uppercase tracking-[0.2em] font-extrabold hover:bg-white transition-colors shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                            >
                                Buy Tickets
                            </a>
                        ) : (
                            <Countdown targetDate={event.fullDate} variant="hero" className="scale-90 md:scale-95 origin-right" />
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Background Glow */}
            <div className="absolute inset-0 bg-vvs-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0 pointer-events-none" />
        </motion.div>
    );
}

export default function EventsCalendar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section id="events" className="py-20 md:py-32 bg-vvs-black relative overflow-hidden">
            {/* Mascot Accent */}
            <div className="absolute left-0 bottom-20 w-80 h-80 opacity-5 pointer-events-none -translate-x-1/2">
                <img
                    src="/assets/VVSMASCOT5.avif"
                    alt=""
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                <div className="mb-10 md:mb-16">
                    <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                        2026 CALENDAR
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-extrabold text-vvs-white uppercase tracking-tighter">
                        OUR <span className="text-vvs-gold">CALENDAR</span>
                    </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {events.map((event, index) => (
                        <EventCard key={index} event={event} index={index} mounted={mounted} />
                    ))}
                </div>
            </div>
        </section>
    );
}
