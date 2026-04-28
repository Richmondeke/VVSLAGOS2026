"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const events = [
    {
        fullDate: "2026-07-05T19:00:00",
        date: "July 5",
        title: "Grand Opening Night",
        venue: "Nahous, Lagos",
        time: "7:00 PM",
        category: "Opening Gala",
        note: "Gemstone Awards Ceremony • Curated Performances • Afterparty @ Bar 77",
    },
    {
        fullDate: "2026-07-06T10:00:00",
        date: "July 6",
        title: "Business & Culture Day",
        venue: "Yoga Center",
        time: "10:00 AM",
        category: "Panels & Exhibitions",
        note: "Theater Panels • Chess for Kids • Pop-Up & Exhibition Preview • Afterparty @ Bar 77",
    },
    {
        fullDate: "2026-07-07T14:00:00",
        date: "July 7",
        title: "Collectors Preview",
        venue: "Private Venue, Lagos",
        time: "2:00 PM",
        category: "Private Day",
        note: "Curated Preview for Collectors, Art Patrons & Industry Leaders",
    },
    {
        fullDate: "2026-07-08T12:00:00",
        date: "July 8",
        title: "Public Opening",
        venue: "Nahous, Lagos",
        time: "12:00 PM",
        category: "Public Launch",
        note: "Pop-Ups • Art Exhibition • Streaming • Panels @ 3 PM • Afterparty @ Bar 77",
    },
    {
        fullDate: "2026-07-09T11:00:00",
        date: "July 9 – 10",
        title: "Pop-Ups & Exhibitions",
        venue: "Nahous, Lagos",
        time: "11:00 AM – 10:00 PM",
        category: "Exhibition Days",
        note: "Daily Afternoon Panels • Creator Moments • Performances • Afterparty @ Bar 77",
    },
    {
        fullDate: "2026-07-11T14:00:00",
        date: "July 11",
        title: "Film Day",
        venue: "Nahous, Lagos",
        time: "2:00 PM",
        category: "Film & Cinema",
        note: "Film Screenings • Filmmaker Panels • Evening Afterparty @ Bar 77",
    },
];

// Returns short day name e.g. "SUN", "MON"
function getDayLabel(isoDate: string): string {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const d = new Date(isoDate);
    return days[d.getDay()];
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    past: boolean;
}

function calcTimeLeft(isoDate: string): TimeLeft {
    const target = new Date(isoDate).getTime();
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

function CountdownTimer({ isoDate }: { isoDate: string }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(isoDate));

    useEffect(() => {
        const id = setInterval(() => setTimeLeft(calcTimeLeft(isoDate)), 1000);
        return () => clearInterval(id);
    }, [isoDate]);

    if (timeLeft.past) {
        return (
            <span className="text-vvs-gold/40 text-[10px] uppercase tracking-widest font-mono">
                Concluded
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1 mt-1">
            {[
                { label: "D", value: timeLeft.days },
                { label: "H", value: timeLeft.hours },
                { label: "M", value: timeLeft.minutes },
                { label: "S", value: timeLeft.seconds },
            ].map(({ label, value }, i) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <span className="text-vvs-gold font-mono font-extrabold text-xs leading-none tabular-nums">
                            {pad(value)}
                        </span>
                        <span className="text-vvs-white/30 text-[8px] font-mono leading-none mt-[2px]">
                            {label}
                        </span>
                    </div>
                    {i < 3 && (
                        <span className="text-vvs-gold/50 font-mono font-bold text-xs pb-[4px]">:</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function EventsCalendar() {
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
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative overflow-hidden"
                        >
                            <div className="p-4 sm:p-6 md:p-8 bg-vvs-white/5 border border-vvs-gold/10 hover:border-vvs-gold/40 transition-all rounded-xl relative z-10">
                                {/* Desktop: side-by-side | Mobile: stacked */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">

                                    {/* ── Main content ── */}
                                    <div className="min-w-0 flex-1">
                                        {/* Top meta row: DAY · Date · Category */}
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                                            <span className="text-vvs-gold text-sm sm:text-base md:text-lg font-mono font-extrabold leading-none">
                                                {getDayLabel(event.fullDate)}
                                            </span>
                                            <span className="h-1 w-1 bg-vvs-gold/40 rounded-full" />
                                            <span className="text-vvs-white/50 text-xs font-sans">{event.date}</span>
                                            <span className="h-1 w-1 bg-vvs-gold/40 rounded-full" />
                                            <span className="text-vvs-gold/70 text-[10px] uppercase tracking-widest font-mono font-bold">
                                                {event.category}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-extrabold text-vvs-white group-hover:text-vvs-gold transition-colors uppercase tracking-tight leading-snug">
                                            {event.title}
                                        </h3>

                                        {/* Note */}
                                        {event.note && (
                                            <p className="text-vvs-white/30 text-[11px] sm:text-xs font-mono mt-2 leading-relaxed break-words">
                                                {event.note}
                                            </p>
                                        )}
                                    </div>

                                    {/* ── Right column: time, venue, countdown ── */}
                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:gap-1 pt-3 md:pt-0 border-t border-vvs-gold/10 md:border-t-0 shrink-0">
                                        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-0">
                                            <span className="text-vvs-white text-sm sm:text-base md:text-lg font-mono font-bold tracking-tighter">{event.time}</span>
                                            <span className="text-vvs-gold/60 text-[10px] sm:text-xs uppercase tracking-widest font-mono">{event.venue}</span>
                                        </div>
                                        <CountdownTimer isoDate={event.fullDate} />
                                    </div>
                                </div>
                            </div>

                            {/* Hover Background Glow */}
                            <div className="absolute inset-0 bg-vvs-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
