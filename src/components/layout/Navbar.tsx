"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
    { name: "Theme", href: "#theme" },
    { name: "Journey", href: "#journey" },
    { name: "Events", href: "#events" },
    { name: "Designers", href: "#designers" },
];

const triggerHaptic = (type: "light" | "medium") => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
            if (type === "light") navigator.vibrate(15);
            else if (type === "medium") navigator.vibrate(30);
        } catch (e) {
            console.warn("Haptic feedback not supported or blocked by browser:", e);
        }
    }
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        triggerHaptic("light");
        setIsOpen(false);
        const el = document.querySelector(href);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const scrollToSection = (id: string) => {
        triggerHaptic("medium");
        const el = document.querySelector(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
                ? "py-4 bg-vvs-black/80 backdrop-blur-md border-b border-vvs-gold/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                : "py-8 bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); triggerHaptic("light"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex items-center space-x-4 group"
                >
                    <div className="w-10 h-10 relative">
                        <img
                            src="/assets/VVSMASCOT7.png"
                            alt="VVS Mascot Logo"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-vvs-white uppercase font-serif">
                        VVS <span className="text-vvs-gold">LAGOS</span>
                    </span>
                </a>


                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="text-sm uppercase tracking-widest text-vvs-white/70 hover:text-vvs-gold transition-colors font-medium cursor-pointer"
                        >
                            {link.name}
                        </a>
                    ))}
                    <button
                        onClick={() => scrollToSection("#events")}
                        className="px-6 py-2 bg-vvs-gold text-vvs-black text-xs uppercase tracking-widest font-bold rounded-full hover:bg-white transition-all transform hover:scale-105"
                    >
                        Get Tickets
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-vvs-white"
                    onClick={() => { triggerHaptic("light"); setIsOpen(!isOpen); }}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full glass md:hidden pb-8 pt-4 px-6 flex flex-col space-y-6"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-lg uppercase tracking-widest text-vvs-white hover:text-vvs-gold transition-colors cursor-pointer"
                            >
                                {link.name}
                            </a>
                        ))}
                        <button
                            onClick={() => { setIsOpen(false); scrollToSection("#events"); }}
                            className="w-full py-4 bg-vvs-gold text-vvs-black text-sm uppercase tracking-widest font-bold rounded-full"
                        >
                            Get Tickets
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
