"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function RSVPBanner() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isModalOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since backend isn't wired up yet, we'll just show the success state
        setIsSubmitted(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsSubmitted(false);
        }, 3000);
    };

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
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 sm:px-10 py-3 sm:py-4 bg-[#111111] text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-black/80 transition-all transform hover:scale-[1.02] shadow-xl"
                >
                    Reserve Your Ticket
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="relative p-6 sm:p-12">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-black/50 hover:text-black transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-black uppercase tracking-tight mb-2 pr-8">
                                    RSVP
                                </h3>
                                <p className="text-black/60 font-sans text-xs sm:text-sm mb-6 sm:mb-8">
                                    Please fill out your details to secure your spot.
                                </p>

                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 flex flex-col items-center text-center"
                                    >
                                        <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                                            <span className="text-2xl">✨</span>
                                        </div>
                                        <h4 className="text-xl font-serif font-bold text-black mb-2">
                                            Request Received
                                        </h4>
                                        <p className="text-black/60 text-sm">
                                            We'll be in touch with your confirmation details soon.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Full Name"
                                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/5 border border-black/10 rounded-xl text-black text-sm font-sans placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                required
                                                placeholder="Email Address"
                                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/5 border border-black/10 rounded-xl text-black text-sm font-sans placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="tel"
                                                placeholder="Phone Number (Optional)"
                                                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/5 border border-black/10 rounded-xl text-black text-sm font-sans placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 sm:py-4 mt-2 sm:mt-4 bg-[#111] text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-black/80 transition-all shadow-lg"
                                        >
                                            Confirm Attendance
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
