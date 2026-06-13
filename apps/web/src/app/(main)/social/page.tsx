"use client";

import Countdown from "@/components/countdown";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

type EventItem = {
    id: string;
    fullDate: string;
    date: string;
    title: string;
    venue: string;
    time: string;
    category: string;
    note: string;
    xpCost?: number;
};

const MOCK_EVENTS: EventItem[] = [
    {
        id: "ev-1",
        fullDate: "2026-07-05T19:00:00",
        date: "July 5",
        title: "VVS Convention — Opening Night",
        venue: "British/Canadian Residence, Lagos",
        time: "7:00 PM",
        category: "Opening Gala",
        note: "Honorary Awards • Recap Videos • Performances • Dinner • Comedy • 5th Anniversary Celebration",
        xpCost: 200,
    },
    {
        id: "ev-2",
        fullDate: "2026-07-06T10:00:00",
        date: "July 6",
        title: "VVS Convention — Panel Sessions",
        venue: "Alliance Française Lagos",
        time: "10:00 AM",
        category: "Panel Discussion",
        note: "5 Sessions • Industry Panelists • Networking • Q&A",
        xpCost: 50,
    },
    {
        id: "ev-3",
        fullDate: "2026-07-07T09:00:00",
        date: "July 7 – 12",
        title: "VVS Convention Week",
        venue: "Multiple Venues, Lagos",
        time: "9:00 AM",
        category: "Convention",
        note: "Workshops • Themed Events • Dress Code Parties • Creative Sessions • Networking",
        xpCost: 100,
    },
    {
        id: "ev-4",
        fullDate: "2026-07-08T11:00:00",
        date: "July 8 – 10",
        title: "VVS Convention — Pop-Up Shop",
        venue: "Convention Hall, Lagos",
        time: "11:00 AM",
        category: "Pop-Up",
        note: "Exclusive Merch • Limited Drops • Brand Collaborations",
        xpCost: 0,
    },
    {
        id: "ev-5",
        fullDate: "2026-07-10T19:00:00",
        date: "July 10",
        title: "VVS Convention — Showcase Night",
        venue: "Convention Hall, Lagos",
        time: "7:00 PM",
        category: "Showcase",
        note: "Creative Showcases • Live Performances • Brand Reveals",
        xpCost: 100,
    },
    {
        id: "ev-6",
        fullDate: "2026-07-12T18:00:00",
        date: "July 12",
        title: "VVS Convention — Closing Ceremony",
        venue: "Convention Hall, Lagos",
        time: "6:00 PM",
        category: "Closing Event",
        note: "Awards Recap • Final Performances • Afterparty",
        xpCost: 150,
    },
];

export default function SocialPage() {
    const { user, addXp } = useAuth();
    const [events] = useState<EventItem[]>(MOCK_EVENTS);
    const [activeTab, setActiveTab] = useState<"events" | "tickets">("events");
    const [myTickets, setMyTickets] = useState<string[]>([]);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    // Load registered tickets from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("vvs-rsvps");
        if (saved) {
            try {
                setMyTickets(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse tickets", e);
            }
        }
    }, []);

    const handleRSVP = (eventId: string) => {
        if (myTickets.includes(eventId)) return;

        const updated = [...myTickets, eventId];
        setMyTickets(updated);
        localStorage.setItem("vvs-rsvps", JSON.stringify(updated));

        // Reward user for getting a pass
        addXp(100);
    };

    const handleCancelRSVP = (eventId: string) => {
        const updated = myTickets.filter((id) => id !== eventId);
        setMyTickets(updated);
        localStorage.setItem("vvs-rsvps", JSON.stringify(updated));
    };

    // Helper to get day name label
    const getDayLabel = (isoDate: string): string => {
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const d = new Date(isoDate);
        return days[d.getDay()];
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-0 space-y-10">
            {/* Page Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-text-secondary/15 pb-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl text-text-primary uppercase leading-none font-serif">
                        Events
                    </h1>
                    <p className="text-text-secondary max-w-2xl text-sm leading-relaxed">
                        Secure your entry passes to showrooms, casting calls, and exclusive design
                        summits. RSVP to redeem your digital access passes.
                    </p>
                </div>

                {/* Sub Tab Switcher */}
                <div className="flex bg-vvs-card rounded-full p-1.5 w-fit border border-text-secondary/5">
                    <button
                        type="button"
                        onClick={() => setActiveTab("events")}
                        className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                            activeTab === "events"
                                ? "bg-text-primary text-vvs-bg shadow-sm font-black"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        Schedule
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("tickets")}
                        className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer relative ${
                            activeTab === "tickets"
                                ? "bg-text-primary text-vvs-bg shadow-sm font-black"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        My Passes
                        {myTickets.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-vvs-gold text-[9px] text-white font-bold leading-none">
                                {myTickets.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* TAB 1: Events Calendar Schedule */}
            {activeTab === "events" && (
                <div className="space-y-4">
                    {events.map((event) => {
                        const hasPass = myTickets.includes(event.id);
                        const isHovered = hoveredEventId === event.id;
                        const activities = event.note
                            ? event.note.split("•").map((a) => a.trim())
                            : [];

                        return (
                            <div
                                key={event.id}
                                onMouseEnter={() => setHoveredEventId(event.id)}
                                onMouseLeave={() => setHoveredEventId(null)}
                                className="group relative overflow-hidden rounded-2xl border border-vvs-gold/10 hover:border-vvs-gold/40 bg-vvs-card/45 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 hover:shadow-lg cursor-pointer"
                            >
                                {/* Left Content Section */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                        <span className="text-vvs-gold text-sm font-mono font-extrabold tracking-widest leading-none">
                                            {getDayLabel(event.fullDate)}
                                        </span>
                                        <span className="h-1.5 w-1.5 bg-vvs-gold/40 rounded-full" />
                                        <span className="text-text-secondary font-medium font-mono">
                                            {event.date}
                                        </span>
                                        <span className="h-1.5 w-1.5 bg-vvs-gold/40 rounded-full" />
                                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-vvs-gold/80">
                                            {event.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-serif font-extrabold text-text-primary uppercase tracking-tight group-hover:text-vvs-gold transition-colors leading-snug">
                                        {event.title}
                                    </h3>

                                    {/* Activities expansion with pure CSS transitions */}
                                    <div
                                        className={`transition-all duration-300 overflow-hidden flex flex-wrap gap-2 ${
                                            isHovered
                                                ? "max-h-20 opacity-100 mt-3"
                                                : "max-h-0 opacity-0 mt-0"
                                        }`}
                                    >
                                        {activities.map((act, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 bg-text-primary/5 border border-text-secondary/10 text-[10px] font-mono uppercase tracking-wider text-text-secondary rounded-lg"
                                            >
                                                ✦ {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Content Section (Venue, Timing, Countdown & CTA) */}
                                <div className="flex flex-col md:items-end justify-between gap-4 border-t border-text-secondary/15 md:border-t-0 pt-4 md:pt-0 shrink-0 min-w-[200px]">
                                    <div className="text-left md:text-right">
                                        <span className="block text-sm font-mono font-bold text-text-primary tracking-tight">
                                            {event.time}
                                        </span>
                                        <span className="block text-xs uppercase tracking-wider text-vvs-gold font-semibold">
                                            {event.venue}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                        {/* Countdown Timer */}
                                        <Countdown
                                            targetDate={event.fullDate}
                                            variant="hero"
                                            className="scale-90"
                                        />

                                        {/* RSVP Action */}
                                        <button
                                            type="button"
                                            onClick={() => handleRSVP(event.id)}
                                            disabled={hasPass}
                                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                                hasPass
                                                    ? "bg-vvs-green/10 border border-vvs-green/30 text-vvs-green cursor-not-allowed"
                                                    : "bg-text-primary text-vvs-bg hover:bg-vvs-gold hover:text-text-primary cursor-pointer shadow-md"
                                            }`}
                                        >
                                            {hasPass ? "Pass Claimed ✓" : "Claim Pass"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB 2: Access Passes & Tickets */}
            {activeTab === "tickets" && (
                <div className="space-y-6">
                    {myTickets.length === 0 ? (
                        <div className="glass-panel text-center py-20 rounded-2xl max-w-xl mx-auto border border-text-secondary/5">
                            <span className="text-5xl">🎟️</span>
                            <h3 className="text-base font-bold mt-4 text-text-primary">
                                No access passes active
                            </h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Claim entry passes to showroom previews and roundtables from the
                                schedule list.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {myTickets.map((id) => {
                                const ev = events.find((item) => item.id === id);
                                if (!ev) return null;

                                return (
                                    <div
                                        key={ev.id}
                                        className="relative bg-vvs-card border border-text-secondary/15 rounded-3xl overflow-hidden shadow-md"
                                    >
                                        {/* Golden ticket header */}
                                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-vvs-gold via-vvs-gold-muted to-vvs-gold" />

                                        <div className="p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between border-b border-text-secondary/10 pb-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-vvs-gold px-2.5 py-0.5 rounded bg-vvs-gold/10 border border-vvs-gold/20">
                                                        VVS ACCESS PASS
                                                    </span>
                                                    <h3 className="text-lg font-serif font-black text-text-primary uppercase leading-tight pt-1">
                                                        {ev.title}
                                                    </h3>
                                                </div>
                                                <span className="text-xs text-text-muted">
                                                    Pass ID: #{ev.id.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-y-4 text-xs">
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        MEMBER NAME
                                                    </span>
                                                    <span className="font-bold text-text-primary">
                                                        {user?.name || "Verified vanguard"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        STATUS
                                                    </span>
                                                    <span className="font-bold text-vvs-green uppercase tracking-wide">
                                                        ✓ VERIFIED VISITOR
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        DATE & TIME
                                                    </span>
                                                    <span className="font-mono font-bold text-text-primary">
                                                        {ev.date} @ {ev.time}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        LOCATION VENUE
                                                    </span>
                                                    <span className="font-bold text-text-primary uppercase leading-tight">
                                                        {ev.venue}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Barcode & Cancel Option */}
                                            <div className="border-t border-text-secondary/10 pt-4 flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <span className="block text-[7px] text-text-muted font-mono tracking-widest leading-none">
                                                        BARCODE SECURED
                                                    </span>
                                                    <span className="font-mono text-base md:text-lg leading-none tracking-widest text-text-primary select-none opacity-80">
                                                        ||||| ||| || ||||| |
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelRSVP(ev.id)}
                                                    className="text-[10px] font-bold text-text-muted hover:text-vvs-accent transition-colors"
                                                >
                                                    Cancel RSVP
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
