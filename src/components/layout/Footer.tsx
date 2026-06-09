"use client";

import { motion } from "framer-motion";
import { Instagram, Twitter, Mail, ArrowUp } from "lucide-react";

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-vvs-black border-t border-vvs-gold/10 pt-20 pb-10 relative overflow-hidden">
            {/* Background Grain/Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-4 mb-8">
                            <img src="/assets/VVSMASCOT7.png" alt="VVS Mascot" className="w-12 h-12 object-contain" />
                            <span className="text-2xl font-serif font-extrabold text-vvs-white tracking-widest uppercase">VVS LAGOS</span>
                        </div>
                        <p className="text-vvs-white/50 text-sm max-w-sm leading-relaxed mb-8 font-sans">
                            The definitive intersection of fashion, art, and technology in Africa.
                            Join the movement as we redefine the continental aesthetic for a global audience.
                        </p>
                        <div className="flex space-x-6">
                            <a href="https://instagram.com/vvslagos" target="_blank" rel="noopener noreferrer" className="text-vvs-white/40 hover:text-vvs-gold transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="https://x.com/vvslagos" target="_blank" rel="noopener noreferrer" className="text-vvs-white/40 hover:text-vvs-gold transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="mailto:vvslagos@gmail.com" className="text-vvs-white/40 hover:text-vvs-gold transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-vvs-white font-mono font-bold text-xs uppercase tracking-[0.3em] mb-8">Event</h4>
                        <ul className="space-y-4 text-sm text-vvs-white/50 font-sans">
                            <li><a href="#theme" className="hover:text-vvs-gold transition-colors">The 05 Theme</a></li>
                            <li><a href="#journey" className="hover:text-vvs-gold transition-colors">Our Evolution</a></li>
                            <li><a href="#calendar" className="hover:text-vvs-gold transition-colors">2026 Calendar</a></li>
                            <li><a href="#designers" className="hover:text-vvs-gold transition-colors">Designers</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-vvs-white font-mono font-bold text-xs uppercase tracking-[0.3em] mb-8">Legal</h4>
                        <ul className="space-y-4 text-sm text-vvs-white/50 font-sans">
                            <li><a href="#" className="hover:text-vvs-gold transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-vvs-gold transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-vvs-gold transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-vvs-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-vvs-white/30 text-[10px] uppercase tracking-widest font-mono">
                        © 2026 VVS LAGOS. ALL RIGHTS RESERVED. CRAFTED BY VVS LABS.
                    </p>

                    <button
                        onClick={scrollToTop}
                        className="group flex items-center space-x-3 text-vvs-gold text-[10px] uppercase tracking-widest font-bold"
                    >
                        <span>Back to Top</span>
                        <div className="p-2 border border-vvs-gold/20 rounded-full group-hover:bg-vvs-gold/10 transition-all">
                            <ArrowUp size={14} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Half Mascot Watermark on the Right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 pointer-events-none select-none opacity-30">
                <img src="/assets/VVSMASCOT7.png" alt="" className="w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] object-contain translate-x-1/2" />
            </div>
        </footer>
    );
};

export default Footer;
