"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Upload, X, Camera } from "lucide-react";
import { triggerHaptic } from "@/utils/haptic";
import { supabase } from "@/lib/supabase";

interface EventRSVPFormProps {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    eventDescription: string;
    eventType: string;
    preSelectedEvents: string[];
    ticketUrl?: string;
    showEventSelection?: boolean;
}

type FormPhase = "rsvp" | "submitting" | "success" | "community" | "community_submitting" | "community_done";

const EVENT_OPTIONS = [
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
];

const COUNTRY_CODES = [
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+1", flag: "🇨🇦", name: "Canada" }
];

const CITY_OPTIONS = [
    "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano",
    "London", "New York", "Paris", "Dubai", "Accra", "Other"
];

export default function EventRSVPForm({
    eventTitle,
    eventDate,
    eventTime,
    eventVenue,
    eventDescription,
    eventType,
    preSelectedEvents,
    ticketUrl,
    showEventSelection = false,
}: EventRSVPFormProps) {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    // RSVP form state
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
        events: preSelectedEvents,
    });

    // Community form extra fields
    const [communityData, setCommunityData] = useState({
        age: "",
        city: "",
        customCity: "",
        interests: [] as string[],
        selfieFile: null as File | null,
        selfiePreview: "",
    });

    const [phase, setPhase] = useState<FormPhase>("rsvp");
    const [error, setError] = useState<string | null>(null);

    // ─── RSVP Submit ─────────────────────────────
    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setPhase("submitting");
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
                    company: rsvpData.company,
                    role: rsvpData.role,
                    heard_about: rsvpData.heard_about,
                    attendance: rsvpData.attendance,
                    events: rsvpData.events,
                    event_type: eventType,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to submit RSVP");
            }

            setPhase("success");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(msg);
            setPhase("rsvp");
        }
    };

    // ─── Community Submit ────────────────────────
    const handleCommunitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const finalCity = communityData.city === "Other" ? communityData.customCity.trim() : communityData.city;
        if (!communityData.age || !finalCity || !communityData.city) {
            setError("Please fill in age and city.");
            return;
        }

        setPhase("community_submitting");

        try {
            // Upload selfie if provided
            let selfieUrl: string | null = null;
            if (communityData.selfieFile) {
                const fileExt = communityData.selfieFile.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `community/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("selfies")
                    .upload(filePath, communityData.selfieFile, {
                        contentType: communityData.selfieFile.type,
                        upsert: false,
                    });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from("selfies").getPublicUrl(filePath);
                    selfieUrl = urlData?.publicUrl ?? null;
                }
            }

            // Submit via community-signup API
            const res = await fetch("/api/community-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: rsvpData.name,
                    age: parseInt(communityData.age),
                    email: rsvpData.email,
                    occupation: rsvpData.occupation,
                    city: finalCity,
                    gender: rsvpData.gender,
                    interests: communityData.interests,
                    selfie_url: selfieUrl,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to join community");
            }

            setPhase("community_done");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(msg);
            setPhase("community");
        }
    };

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCommunityData(prev => ({
                ...prev,
                selfieFile: file,
                selfiePreview: URL.createObjectURL(file),
            }));
        }
    };

    const inputClass = "w-full px-5 py-4 rounded-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors";
    const labelClass = "text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2";

    const INTEREST_OPTIONS = ["Fashion", "Art", "Music", "Film", "Tech", "Business", "Culture", "Photography", "Design", "Sustainability"];

    return (
        <div className="bg-black text-white min-h-screen relative overflow-y-auto w-full selection:bg-[#c5a059]/30 font-sans">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-black to-[#0a0a0a]" />
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#c5a059]/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            <div className="pt-32 pb-24 px-6 min-h-[100dvh] flex items-center justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border shadow-2xl relative bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 text-white"
                >
                    {/* Event Header */}
                    <div className="text-center mb-8">
                        <span className="text-[#c5a059] text-xs font-mono tracking-widest font-bold uppercase block mb-2">
                            {eventDate} · {eventTime}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold uppercase mb-2 leading-tight">{eventTitle}</h3>
                        {showEventSelection && <p className="text-sm opacity-50 mb-1">{eventVenue}</p>}
                        <p className="text-xs opacity-40 max-w-md mx-auto leading-relaxed mt-2">{eventDescription}</p>
                        {ticketUrl && (
                            <a
                                href={ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full text-[#c5a059] text-[11px] font-mono uppercase tracking-widest hover:bg-[#c5a059]/20 transition-colors"
                            >
                                Get Tickets <ArrowRight size={12} />
                            </a>
                        )}
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {/* ────── RSVP FORM ────── */}
                        {(phase === "rsvp" || phase === "submitting") && (
                            <motion.form
                                key="rsvp-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRSVPSubmit}
                                className="space-y-5"
                            >
                                {/* Full Name */}
                                <div>
                                    <label className={labelClass}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={rsvpData.name}
                                        onChange={(e) => setRsvpData(prev => ({ ...prev, name: e.target.value }))}
                                        className={inputClass}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={rsvpData.email}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                                            className={inputClass}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className={labelClass}>Phone Number</label>
                                        <div className="flex relative">
                                            {/* Flag Selector Dropdown Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => { triggerHaptic("light"); setShowCountryDropdown(!showCountryDropdown); }}
                                                className="flex items-center gap-1.5 px-3.5 bg-white/5 border border-white/10 rounded-l-xl text-sm border-r-0 hover:bg-white/10 transition-colors focus:outline-none"
                                            >
                                                <span className="text-lg leading-none inline-block filter saturate-[1.2]">{selectedCountry.flag}</span>
                                                <span className="text-xs text-white/50">{selectedCountry.code}</span>
                                                <span className="text-[10px] opacity-30">▼</span>
                                            </button>

                                            {/* Phone Input Field */}
                                            <input
                                                type="tel"
                                                value={rsvpData.phone}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-5 py-4 rounded-r-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors"
                                                placeholder="000 000 0000"
                                            />

                                            {/* Absolute Dropdown List */}
                                            {showCountryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                                                    <div className="absolute top-[105%] left-0 z-50 w-64 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0a] p-1.5 shadow-2xl backdrop-blur-xl scrollbar-none">
                                                        {COUNTRY_CODES.map((c) => (
                                                            <button
                                                                key={c.code + c.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    triggerHaptic("light");
                                                                    setSelectedCountry(c);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-xs hover:bg-white/5 transition-colors text-white"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <span className="text-base leading-none">{c.flag}</span>
                                                                    <span>{c.name}</span>
                                                                </span>
                                                                <span className="text-white/50 font-mono">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Gender & Occupation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Gender</label>
                                        <select
                                            value={rsvpData.gender}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, gender: e.target.value }))}
                                            className={`${inputClass} cursor-pointer`}
                                            style={{ background: "rgba(255,255,255,0.05)" }}
                                        >
                                            <option value="" disabled style={{ background: "#111" }}>Select gender</option>
                                            <option value="Male" style={{ background: "#111" }}>Male</option>
                                            <option value="Female" style={{ background: "#111" }}>Female</option>
                                            <option value="Non-binary" style={{ background: "#111" }}>Non-binary</option>
                                            <option value="Prefer not to say" style={{ background: "#111" }}>Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Occupation</label>
                                        <input
                                            type="text"
                                            value={rsvpData.occupation}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, occupation: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g. Creative Director"
                                        />
                                    </div>
                                </div>

                                {/* Company & Role */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Company / Brand</label>
                                        <input
                                            type="text"
                                            value={rsvpData.company}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, company: e.target.value }))}
                                            className={inputClass}
                                            placeholder="Company name"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Your Role</label>
                                        <input
                                            type="text"
                                            value={rsvpData.role}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, role: e.target.value }))}
                                            className={inputClass}
                                            placeholder="e.g. Founder, Designer"
                                        />
                                    </div>
                                </div>

                                {/* How did you hear */}
                                <div>
                                    <label className={labelClass}>How did you hear about VVS Lagos?</label>
                                    <select
                                        value={rsvpData.heard_about}
                                        onChange={(e) => setRsvpData(prev => ({ ...prev, heard_about: e.target.value }))}
                                        className={`${inputClass} cursor-pointer`}
                                        style={{ background: "rgba(255,255,255,0.05)" }}
                                    >
                                        <option value="" disabled style={{ background: "#111" }}>Select an option</option>
                                        <option value="Social Media" style={{ background: "#111" }}>Social Media (Instagram, X, etc.)</option>
                                        <option value="Friend / Referral" style={{ background: "#111" }}>Friend / Referral</option>
                                        <option value="Press / Media" style={{ background: "#111" }}>Press / Media</option>
                                        <option value="Previous Attendee" style={{ background: "#111" }}>Previous Attendee</option>
                                        <option value="Brand Partner" style={{ background: "#111" }}>Brand Partner</option>
                                        <option value="Other" style={{ background: "#111" }}>Other</option>
                                    </select>
                                </div>

                                {/* Target Events */}
                                {showEventSelection && (
                                    <div>
                                        <label className={labelClass}>Target Events</label>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-none">
                                            {EVENT_OPTIONS.map((opt) => {
                                                const isSelected = rsvpData.events.includes(opt.value);
                                                const isDisabled = 'disabled' in opt && opt.disabled;
                                                return (
                                                    <div
                                                        key={opt.value}
                                                        onClick={() => {
                                                            if (isDisabled) return;
                                                            triggerHaptic("light");
                                                            setRsvpData(prev => {
                                                                const next = prev.events.includes(opt.value)
                                                                    ? prev.events.filter(e => e !== opt.value)
                                                                    : [...prev.events, opt.value];
                                                                return { ...prev, events: next };
                                                            });
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                            isDisabled
                                                                ? "border-white/5 bg-white/[0.005] opacity-40 cursor-not-allowed"
                                                                : isSelected
                                                                    ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_12px_rgba(197,160,89,0.15)] cursor-pointer"
                                                                    : "border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/[0.02] cursor-pointer"
                                                        }`}
                                                    >
                                                        <span className={`text-xs font-medium uppercase tracking-wide ${isDisabled ? "text-white/40" : ""}`}>{opt.label}</span>
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                                            isDisabled
                                                                ? "border-white/10"
                                                                : isSelected
                                                                    ? "bg-[#c5a059] border-[#c5a059] text-black"
                                                                    : "border-white/30"
                                                        }`}>
                                                            {isSelected && !isDisabled && <Check size={10} strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Attendance */}
                                <div>
                                    <label className={labelClass}>Can you attend?</label>
                                    <div className="flex gap-6 mt-2">
                                        <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-[#c5a059] transition-colors">
                                            <input
                                                type="radio"
                                                name="attendance"
                                                value="yes"
                                                checked={rsvpData.attendance === "yes"}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                className="accent-[#c5a059] w-4 h-4"
                                            />
                                            Yes, absolutely
                                        </label>
                                        <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-[#c5a059] transition-colors">
                                            <input
                                                type="radio"
                                                name="attendance"
                                                value="maybe"
                                                checked={rsvpData.attendance === "maybe"}
                                                onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                                className="accent-[#c5a059] w-4 h-4"
                                            />
                                            Maybe / Remote
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={phase === "submitting"}
                                    className={`w-full py-5 mt-2 bg-[#c5a059] text-black text-sm uppercase tracking-widest font-bold rounded-xl transition-all ${
                                        phase === "submitting"
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:bg-white hover:text-black active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-[#c5a059]/20"
                                    }`}
                                >
                                    {phase === "submitting" ? "Submitting..." : "Submit Request"}
                                </button>
                            </motion.form>
                        )}

                        {/* ────── SUCCESS + COMMUNITY UPSELL ────── */}
                        {phase === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="py-12 flex flex-col items-center justify-center text-center gap-6"
                            >
                                <div className="w-20 h-20 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
                                    <Check size={40} />
                                </div>
                                <h4 className="text-2xl font-bold uppercase">RSVP Submitted</h4>
                                <p className="text-sm opacity-60 max-w-[320px]">
                                    Your invitation request has been logged. We will review details and follow up shortly.
                                </p>

                                {/* Community Upsell */}
                                <div className="mt-6 w-full p-6 rounded-2xl border border-[#c5a059]/20 bg-[#c5a059]/5">
                                    <p className="text-[#c5a059] text-xs font-mono uppercase tracking-widest font-bold mb-3">
                                        ✦ One More Step
                                    </p>
                                    <h5 className="text-lg font-bold uppercase mb-2">Join the VVS Community</h5>
                                    <p className="text-xs opacity-50 mb-5 leading-relaxed">
                                        Get exclusive access to our creative directory, event updates, and connect with other visionaries. Your details are already pre-filled.
                                    </p>
                                    <button
                                        onClick={() => { triggerHaptic("medium"); setPhase("community"); setError(null); }}
                                        className="w-full py-4 bg-[#c5a059] text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        Join Community <ArrowRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => window.location.href = "/"}
                                        className="w-full py-3 mt-3 text-white/40 text-[11px] uppercase tracking-widest hover:text-white/60 transition-colors"
                                    >
                                        No thanks, return home
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ────── COMMUNITY FORM ────── */}
                        {(phase === "community" || phase === "community_submitting") && (
                            <motion.form
                                key="community-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCommunitySubmit}
                                className="space-y-5"
                            >
                                <div className="text-center mb-4">
                                    <span className="text-[#c5a059] text-xs font-mono tracking-widest font-bold uppercase block mb-2">Community</span>
                                    <h4 className="text-xl font-bold uppercase">Join the VVS Community</h4>
                                    <p className="text-xs opacity-50 mt-2">A few more details to complete your profile.</p>
                                </div>

                                {/* Pre-filled fields (read-only display) */}
                                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                                    <p className="text-[10px] font-mono uppercase text-white/40 mb-2">Pre-filled from RSVP</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div><span className="text-[#c5a059] font-mono">Name:</span> {rsvpData.name}</div>
                                        <div><span className="text-[#c5a059] font-mono">Email:</span> {rsvpData.email}</div>
                                        {rsvpData.gender && <div><span className="text-[#c5a059] font-mono">Gender:</span> {rsvpData.gender}</div>}
                                        {rsvpData.occupation && <div><span className="text-[#c5a059] font-mono">Occupation:</span> {rsvpData.occupation}</div>}
                                    </div>
                                </div>

                                {/* Age */}
                                <div>
                                    <label className={labelClass}>Age</label>
                                    <input
                                        type="number"
                                        required
                                        min="16"
                                        max="99"
                                        value={communityData.age}
                                        onChange={(e) => setCommunityData(prev => ({ ...prev, age: e.target.value }))}
                                        className={inputClass}
                                        placeholder="Your age"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className={labelClass}>City</label>
                                    <select
                                        required
                                        value={communityData.city}
                                        onChange={(e) => setCommunityData(prev => ({ ...prev, city: e.target.value }))}
                                        className={`${inputClass} cursor-pointer`}
                                        style={{ background: "rgba(255,255,255,0.05)" }}
                                    >
                                        <option value="" disabled style={{ background: "#111" }}>Select your city</option>
                                        {CITY_OPTIONS.map(c => (
                                            <option key={c} value={c} style={{ background: "#111" }}>{c}</option>
                                        ))}
                                    </select>
                                    {communityData.city === "Other" && (
                                        <input
                                            type="text"
                                            required
                                            value={communityData.customCity}
                                            onChange={(e) => setCommunityData(prev => ({ ...prev, customCity: e.target.value }))}
                                            className={`${inputClass} mt-2`}
                                            placeholder="Enter your city"
                                        />
                                    )}
                                </div>

                                {/* Interests */}
                                <div>
                                    <label className={labelClass}>Interests (select all that apply)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_OPTIONS.map(interest => {
                                            const isSelected = communityData.interests.includes(interest);
                                            return (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    onClick={() => {
                                                        triggerHaptic("light");
                                                        setCommunityData(prev => ({
                                                            ...prev,
                                                            interests: isSelected
                                                                ? prev.interests.filter(i => i !== interest)
                                                                : [...prev.interests, interest],
                                                        }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider border transition-all ${
                                                        isSelected
                                                            ? "bg-[#c5a059]/20 border-[#c5a059]/50 text-[#c5a059]"
                                                            : "border-white/10 text-white/50 hover:border-white/30"
                                                    }`}
                                                >
                                                    {interest}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Selfie Upload */}
                                <div>
                                    <label className={labelClass}>Profile Photo (optional)</label>
                                    <div className="flex items-center gap-4">
                                        {communityData.selfiePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={communityData.selfiePreview}
                                                    alt="Selfie preview"
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-[#c5a059]/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCommunityData(prev => ({ ...prev, selfieFile: null, selfiePreview: "" }))}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-[#c5a059]/30 transition-colors text-xs text-white/50">
                                                <Camera size={16} />
                                                Upload selfie
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleSelfieChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={phase === "community_submitting"}
                                    className={`w-full py-5 mt-2 bg-[#c5a059] text-black text-sm uppercase tracking-widest font-bold rounded-xl transition-all ${
                                        phase === "community_submitting"
                                            ? "opacity-60 cursor-not-allowed"
                                            : "hover:bg-white hover:text-black active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-[#c5a059]/20"
                                    }`}
                                >
                                    {phase === "community_submitting" ? "Joining..." : "Join Community"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPhase("success")}
                                    className="w-full py-3 text-white/40 text-[11px] uppercase tracking-widest hover:text-white/60 transition-colors"
                                >
                                    ← Back
                                </button>
                            </motion.form>
                        )}

                        {/* ────── COMMUNITY DONE ────── */}
                        {phase === "community_done" && (
                            <motion.div
                                key="community-done"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 flex flex-col items-center justify-center text-center gap-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 bg-[#c5a059]/10 border border-[#c5a059] rounded-full flex items-center justify-center text-[#c5a059]"
                                >
                                    <Check size={40} />
                                </motion.div>
                                <h4 className="text-2xl font-bold uppercase text-[#c5a059]">Welcome to VVS</h4>
                                <p className="text-sm opacity-60 max-w-[320px]">
                                    You&apos;re now part of the VVS Community. We&apos;ll be in touch with exclusive updates and event details.
                                </p>
                                <a
                                    href="/"
                                    className="mt-4 px-8 py-4 bg-[#c5a059] text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white transition-all"
                                >
                                    Return Home
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
