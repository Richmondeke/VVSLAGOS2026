"use client";

import Countdown from "@/components/countdown";
import { useAuth } from "@/lib/auth-context";
import { CURRENT_EVENTS, EventItem, getStoredRSVPs, saveRSVP, removeRSVP } from "@/lib/events";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

function SocialPageContent() {
    const { user, addXp } = useAuth();
    const searchParams = useSearchParams();
    const [events] = useState<EventItem[]>(CURRENT_EVENTS);
    const [activeTab, setActiveTab] = useState<"events" | "tickets">("events");
    const [myTickets, setMyTickets] = useState<string[]>([]);
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    // RSVP Modal State
    const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventItem | null>(null);
    const [rsvpName, setRsvpName] = useState("");
    const [rsvpEmail, setRsvpEmail] = useState("");
    const [rsvpAttendance, setRsvpAttendance] = useState("yes");
    const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
    const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState<string | null>(null);

    // Load registered tickets from local storage on mount
    useEffect(() => {
        setMyTickets(getStoredRSVPs());

        const tab = searchParams?.get("tab");
        if (tab === "tickets") {
            setActiveTab("tickets");
        }

        const eventId = searchParams?.get("event");
        if (eventId) {
            const ev = CURRENT_EVENTS.find((e) => e.id === eventId || e.slug === eventId);
            if (ev) {
                setSelectedEventForRsvp(ev);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            if (user.name && !rsvpName) setRsvpName(user.name);
            if (user.email && !rsvpEmail) setRsvpEmail(user.email);
        }
    }, [user, rsvpName, rsvpEmail]);

    const openRsvpModal = (event: EventItem) => {
        setSelectedEventForRsvp(event);
        setRsvpSuccessMessage(null);
    };

    const handleConfirmRSVP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedEventForRsvp) return;

        setIsSubmittingRsvp(true);
        try {
            // Attempt backend API RSVP call if available
            try {
                await apiClient("/api/content/rsvp", {
                    method: "POST",
                    body: {
                        name: rsvpName || user?.name || "VVS Member",
                        email: rsvpEmail || user?.email || "member@vvslagos.com",
                        attendance: rsvpAttendance,
                        events: [selectedEventForRsvp.id],
                    },
                });
            } catch (err) {
                // Backend not connected or mock mode — locally saved RSVP takes precedence
                console.info("Using local RSVP storage for pass confirmation.");
            }

            const updated = saveRSVP(selectedEventForRsvp.id);
            setMyTickets(updated);
            addXp(100);

            setRsvpSuccessMessage(`RSVP confirmed for ${selectedEventForRsvp.title}!`);
            setTimeout(() => {
                setSelectedEventForRsvp(null);
                setRsvpSuccessMessage(null);
                setActiveTab("tickets");
            }, 1200);
        } finally {
            setIsSubmittingRsvp(false);
        }
    };

    const handleCancelRSVP = (eventId: string) => {
        const updated = removeRSVP(eventId);
        setMyTickets(updated);
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
                        Discover upcoming events, launch parties, and experiences. RSVP to reserve
                        your spot and view your access passes.
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

                                    <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
                                        {event.description}
                                    </p>

                                    {/* Activities chips */}
                                    <div className="flex flex-wrap gap-2 pt-1">
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
                                            onClick={() => {
                                                if (hasPass) {
                                                    setActiveTab("tickets");
                                                } else {
                                                    openRsvpModal(event);
                                                }
                                            }}
                                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                                                hasPass
                                                    ? "bg-vvs-green/10 border border-vvs-green/30 text-vvs-green hover:bg-vvs-green/20 cursor-pointer"
                                                    : "bg-text-primary text-vvs-bg hover:bg-vvs-gold hover:text-text-primary cursor-pointer shadow-md"
                                            }`}
                                        >
                                            {hasPass ? "View Pass ✓" : "RSVP Now"}
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
                                No active passes yet
                            </h3>
                            <p className="text-xs text-text-secondary mt-1">
                                You haven't RSVP'd to any events yet. Browse the schedule to claim your spot.
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveTab("events")}
                                className="mt-5 px-6 py-2.5 bg-text-primary text-vvs-bg text-xs font-bold rounded-full hover:bg-vvs-gold transition-colors cursor-pointer"
                            >
                                Browse Events Schedule
                            </button>
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
                                                <span className="text-xs text-text-muted font-mono">
                                                    Pass ID: #{ev.id.toUpperCase().slice(0, 10)}
                                                </span>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-y-4 text-xs">
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        GUEST NAME
                                                    </span>
                                                    <span className="font-bold text-text-primary">
                                                        {user?.name || rsvpName || "VVS Member"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-[8px] text-text-muted uppercase tracking-wider">
                                                        STATUS
                                                    </span>
                                                    <span className="font-bold text-vvs-green uppercase tracking-wide">
                                                        ✓ RSVP CONFIRMED
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
                                                        VENUE
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
                                                        DIGITAL PASS
                                                    </span>
                                                    <span className="font-mono text-base md:text-lg leading-none tracking-widest text-text-primary select-none opacity-80">
                                                        ||||| ||| || ||||| |
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelRSVP(ev.id)}
                                                    className="text-[10px] font-bold text-text-muted hover:text-vvs-accent transition-colors cursor-pointer"
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

            {/* RSVP Confirmation Modal */}
            {selectedEventForRsvp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg rounded-2xl bg-vvs-card border border-text-secondary/15 p-6 md:p-8 shadow-2xl">
                        {rsvpSuccessMessage ? (
                            <div className="text-center py-6 space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vvs-gold/15 text-3xl text-vvs-gold">
                                    ✓
                                </div>
                                <h3 className="text-xl font-bold text-text-primary">
                                    RSVP Confirmed!
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    {rsvpSuccessMessage}
                                </p>
                                <p className="text-xs text-vvs-gold font-mono">
                                    Taking you to your pass...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleConfirmRSVP} className="space-y-5">
                                <div className="flex items-start justify-between border-b border-text-secondary/10 pb-4">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-vvs-gold font-bold">
                                            Reserve Access Pass
                                        </span>
                                        <h2 className="text-xl font-serif font-bold text-text-primary mt-1">
                                            {selectedEventForRsvp.title}
                                        </h2>
                                        <p className="text-xs text-text-secondary mt-1">
                                            📅 {selectedEventForRsvp.date} @ {selectedEventForRsvp.time} • 📍 {selectedEventForRsvp.venue}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEventForRsvp(null)}
                                        className="text-text-muted hover:text-text-primary text-xl font-bold p-1 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-secondary">
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={rsvpName}
                                            onChange={(e) => setRsvpName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full rounded-xl bg-black/20 border border-text-secondary/20 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-vvs-gold transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-secondary">
                                            Email Address
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={rsvpEmail}
                                            onChange={(e) => setRsvpEmail(e.target.value)}
                                            placeholder="your.email@example.com"
                                            className="w-full rounded-xl bg-black/20 border border-text-secondary/20 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-vvs-gold transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-secondary">
                                            Attendance Confirmation
                                        </label>
                                        <select
                                            value={rsvpAttendance}
                                            onChange={(e) => setRsvpAttendance(e.target.value)}
                                            className="w-full rounded-xl bg-black/20 border border-text-secondary/20 px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-vvs-gold transition-colors"
                                        >
                                            <option value="yes">Yes, I will attend</option>
                                            <option value="maybe">Interested (Keep me updated)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEventForRsvp(null)}
                                        className="flex-1 py-3 px-4 rounded-xl border border-text-secondary/20 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingRsvp}
                                        className="flex-1 py-3 px-4 rounded-xl bg-text-primary text-vvs-bg text-xs font-bold hover:bg-vvs-gold hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmittingRsvp ? "Reserving..." : "Confirm RSVP"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SocialPage() {
    return (
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><span className="text-2xl animate-pulse">⚡</span></div>}>
            <SocialPageContent />
        </Suspense>
    );
}
