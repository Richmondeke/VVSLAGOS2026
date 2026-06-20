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
        phone: "",
        gender: "",
        occupation: "",
        company: "",
        role: "",
        heard_about: "",
        attendance: "yes",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    
    const handleRSVPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("rsvps").insert([{
                name: rsvpData.name.trim(),
                email: rsvpData.email.trim(),
                phone: rsvpData.phone.trim() || null,
                gender: rsvpData.gender || null,
                occupation: rsvpData.occupation.trim() || null,
                company: rsvpData.company.trim() || null,
                role: rsvpData.role.trim() || null,
                heard_about: rsvpData.heard_about || null,
                attendance: rsvpData.attendance,
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
        setIsSubmitting(false);
        setRsvpSubmitted(true);
    };

    const inputClass = "w-full px-5 py-4 rounded-xl border text-sm focus:outline-none focus:border-[#c5a059] bg-white/5 border-white/10 text-white placeholder-white/20 transition-colors";
    const labelClass = "text-[11px] font-mono uppercase tracking-widest font-bold opacity-60 block mb-2";

    return (
        <div ref={containerRef} className="bg-black text-white min-h-screen relative overflow-y-auto w-full selection:bg-[#c5a059]/30 font-sans">
            {/* Navigation */}
            <LiquidNavbar containerRef={containerRef} scrollYProgress={scrollYProgress} />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-black to-[#0a0a0a]" />
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#c5a059]/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>

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
                        <form onSubmit={handleRSVPSubmit} className="space-y-5">
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

                            {/* Gender */}
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

                            {/* Phone */}
                            <div>
                                <label className={labelClass}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={rsvpData.phone}
                                    onChange={(e) => setRsvpData(prev => ({ ...prev, phone: e.target.value }))}
                                    className={inputClass}
                                    placeholder="+234 000 0000 000"
                                />
                            </div>

                            {/* Email Address */}
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

                            {/* Occupation */}
                            <div>
                                <label className={labelClass}>Occupation</label>
                                <input
                                    type="text"
                                    value={rsvpData.occupation}
                                    onChange={(e) => setRsvpData(prev => ({ ...prev, occupation: e.target.value }))}
                                    className={inputClass}
                                    placeholder="e.g. Creative Director, Entrepreneur"
                                />
                            </div>

                            {/* Company & Role — side by side on larger screens */}
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

                            {/* How did you hear about us */}
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

                            {/* Can you attend */}
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
                                disabled={isSubmitting}
                                className={`w-full py-5 mt-2 bg-[#c5a059] text-black text-sm uppercase tracking-widest font-bold rounded-xl transition-all ${
                                    isSubmitting
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:bg-white hover:text-black active:scale-[0.98] hover:scale-[1.01] shadow-lg shadow-[#c5a059]/20"
                                }`}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </form>
                    )}
                </motion.div>
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
