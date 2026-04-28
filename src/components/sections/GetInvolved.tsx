"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Sparkles } from "lucide-react";
import VendorModal from "@/components/modals/VendorModal";
import SponsorModal from "@/components/modals/SponsorModal";

const cards = [
    {
        icon: Briefcase,
        label: "FOR BRANDS & VENDORS",
        title: "Register as a Vendor",
        description:
            "Showcase your brand to Africa's most discerning creative community. Secure your booth, pop-up, or activation space at VVS Lagos 2026.",
        cta: "Apply Now",
        modal: "vendor" as const,
    },
    {
        icon: Sparkles,
        label: "FOR PARTNERS",
        title: "Become a Sponsor",
        description:
            "Align your brand with the cutting edge of African fashion and culture. Sponsorship packages include branding, activations, and bespoke experiences.",
        cta: "Get in Touch",
        modal: "sponsor" as const,
    },
];

export default function GetInvolved() {
    const [vendorOpen, setVendorOpen] = useState(false);
    const [sponsorOpen, setSponsorOpen] = useState(false);

    function handleClick(modal: "vendor" | "sponsor") {
        if (modal === "vendor") setVendorOpen(true);
        else setSponsorOpen(true);
    }

    return (
        <>
            <section id="get-involved" className="py-20 md:py-28 bg-vvs-black relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vvs-gold/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <span className="text-vvs-gold text-sm uppercase tracking-[0.4em] mb-4 block font-mono font-bold">
                            COLLABORATE WITH US
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-vvs-white uppercase tracking-tighter">
                            GET <span className="text-vvs-gold">INVOLVED</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                        {cards.map((card, i) => (
                            <motion.button
                                key={card.title}
                                onClick={() => handleClick(card.modal)}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="group border border-vvs-gold/15 rounded-2xl p-6 sm:p-8 bg-vvs-white/[0.02] hover:border-vvs-gold/40 hover:bg-vvs-white/[0.04] transition-all duration-500 flex flex-col text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 rounded-xl bg-vvs-gold/10 border border-vvs-gold/20">
                                        <card.icon size={20} className="text-vvs-gold" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-vvs-white/40 font-mono font-bold">
                                        {card.label}
                                    </span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-vvs-white uppercase tracking-tight mb-3 group-hover:text-vvs-gold transition-colors">
                                    {card.title}
                                </h3>

                                <p className="text-vvs-white/50 text-sm font-sans font-light leading-relaxed mb-6 flex-1">
                                    {card.description}
                                </p>

                                <div className="flex items-center gap-2 text-vvs-gold text-xs uppercase tracking-[0.2em] font-bold group-hover:gap-3 transition-all">
                                    <span>{card.cta}</span>
                                    <span className="text-base">→</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modals */}
            <VendorModal open={vendorOpen} onClose={() => setVendorOpen(false)} />
            <SponsorModal open={sponsorOpen} onClose={() => setSponsorOpen(false)} />
        </>
    );
}
