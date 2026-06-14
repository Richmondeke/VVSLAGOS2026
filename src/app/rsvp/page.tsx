"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LiquidNavbar from "@/components/sections/LiquidNavbar";
import { triggerHaptic } from "@/utils/haptic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RSVPContent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    
    const searchParams = useSearchParams();
    const referredBy = searchParams.get("ref");
    
    const [rsvpData, setRsvpData] = useState({
        name: "",
        email: "",
        events: [] as string[],
        attendance: "yes",
    });
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    
    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from("rsvps").insert([{
                name: rsvpData.name.trim(),
                email: rsvpData.email.trim(),
                attendance: rsvpData.attendance,
                events: rsvpData.events,
                referred_by_admin: referredBy || null,
                created_at: new Date().toISOString()
            }]);

            if (error) {
                console.error("Supabase RSVP Error:", error);
            }
        } catch (err) {
            console.error("Failed to submit RSVP to Supabase:", err);
        }

        triggerHaptic("success");
        setRsvpSubmitted(true);
    };

    return (
        <div ref={containerRef} className="bg-black text-white min-h-screen relative overflow-y-auto w-full selection:bg-[#c5a059]/30 font-sans">
            {/* Navigation */}
            <LiquidNavbar containerRef={containerRef} scrollYProgress={scrollYProgress} />

            {/* Main Content Area */}
            <div className="pt-32 pb-24 px-6 min-h-[100dvh] flex items-center justify-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border shadow-2xl relative bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 text-white"
                >
                    <div className="text-center mb-8">
                        <span className="text-[#c5a059] text-xs font-mono tracking-widest font-bold uppercase block mb-2">Invitation Request</span>
                        <h3 className="text-3xl font-extrabold uppercase mb-2">VVS Lagos RSVP</h3>
                        <p className="text-sm opacity-50">Submit request for invitations to VVS Lagos 2026 events.</p>
                    </div>

                    {rsvpSubmitted ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-16 flex flex-col items-center justify-center text-center gap-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
                                <Check size={40} />
                            </div>
                            <h4 className="text-2xl font-bold uppercase">RSVP Submitted</h4>
                            <p className="text-sm opacity-60 max-w-[320px]">Your invitation request has been logged. We will review details and follow up shortly.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleRSVPSubmit} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={rsvpData.name}
                                    onChange={(e) => setRsvpData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-5 py-4 rounded-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={rsvpData.email}
                                    onChange={(e) => setRsvpData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-5 py-4 rounded-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-3">Target Events (Select all that apply)</label>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-none">
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
                                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                                    isSelected
                                                        ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                                                        : "border-white/5 hover:border-white/20 hover:bg-white/5 bg-white/[0.02]"
                                                }`}
                                            >
                                                <span className="text-sm font-medium uppercase tracking-wide">
                                                    {opt.label}
                                                </span>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                                    isSelected
                                                        ? "bg-[#c5a059] border-[#c5a059] text-black"
                                                        : "border-white/20"
                                                }`}>
                                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {rsvpData.events.length === 0 && (
                                    <p className="text-[11px] text-red-500 font-mono mt-2">
                                        * Please select at least one event.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-3">Can you attend?</label>
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
                                            value="no"
                                            checked={rsvpData.attendance === "no"}
                                            onChange={(e) => setRsvpData(prev => ({ ...prev, attendance: e.target.value }))}
                                            className="accent-[#c5a059] w-4 h-4"
                                        />
                                        Maybe / Remote
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={rsvpData.events.length === 0}
                                className={`w-full py-5 mt-6 bg-[#c5a059] text-black text-sm uppercase tracking-widest font-bold rounded-xl hover:bg-white hover:text-black transition-all ${
                                    rsvpData.events.length === 0 ? "opacity-45 cursor-not-allowed" : "active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-[#c5a059]/20"
                                }`}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-black to-[#0a0a0a]" />
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#c5a059]/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>
        </div>
    );
}

export default function RSVPPage() {
    return (
        <Suspense fallback={<div className="bg-black min-h-screen text-white flex items-center justify-center font-mono text-sm tracking-widest uppercase">Loading...</div>}>
            <RSVPContent />
        </Suspense>
    );
}
