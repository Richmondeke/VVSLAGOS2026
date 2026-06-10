"use client";

import React from "react";
import { triggerHaptic } from "@/utils/haptic";

export default function RSVPBanner() {
    return (
        <section className="w-full py-16 sm:py-24 bg-white relative overflow-hidden flex justify-center items-center">
            {/* Banner Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6">
                <span className="text-[#1a1a1a] text-xs sm:text-sm uppercase tracking-[0.4em] mb-3 sm:mb-4 block font-mono font-bold">
                    Join The Experience
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold text-[#1a1a1a] uppercase tracking-tighter mb-4 sm:mb-6">
                    RSVP
                </h2>
                <p className="text-[#1a1a1a]/70 text-sm sm:text-base font-sans font-light mb-8 sm:mb-10 max-w-md leading-relaxed">
                    Secure your spot for an unforgettable celebration of culture, design, and Afrofuturism.
                </p>
                <button
                    id="rsvp-trigger-page"
                    onClick={() => { triggerHaptic("medium"); window.dispatchEvent(new Event("open-rsvp")); }}
                    className="px-8 sm:px-10 py-3 sm:py-4 bg-[#111111] text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-black/80 transition-all transform hover:scale-[1.02] shadow-xl"
                >
                    Reserve Your Ticket
                </button>
            </div>
        </section>
    );
}
