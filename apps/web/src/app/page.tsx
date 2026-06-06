"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEnterApp = () => {
        setLoading(true);
        setTimeout(() => {
            router.push("/login");
        }, 1200);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F6EE] flex flex-col items-center justify-center p-6 text-vvs-black">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-vvs-gold/30 p-1 bg-white shadow-md animate-bounce">
                        <img 
                            src="https://www.vvslagos.com/assets/VVSMASCOT7.png" 
                            alt="VVS Mascot" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="space-y-2 text-center">
                        <h3 className="text-xl font-bold tracking-tight font-serif text-vvs-black">Loading</h3>
                        <div className="flex justify-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-vvs-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-vvs-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-vvs-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6EE] text-vvs-black flex flex-col items-center justify-between p-6 md:p-10 font-sans pb-16">
            {/* Top Logo */}
            <div className="w-full max-w-md flex items-center justify-center pt-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-vvs-gold/25 p-0.5 bg-white shadow-sm">
                        <img 
                            src="https://www.vvslagos.com/assets/VVSMASCOT7.png" 
                            alt="VVS Mascot" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-[10px] text-vvs-gold tracking-widest font-extrabold uppercase">VVS Lagos</span>
                </div>
            </div>

            {/* Hero Main Content */}
            <div className="w-full max-w-md space-y-6 text-left py-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-vvs-black font-serif">
                    Connect with creators
                </h1>
                <p className="text-vvs-black/60 text-sm leading-relaxed">
                    Access design briefs, find castings, and collaborate with creative minds across the continent.
                </p>
                
                {/* Features Section */}
                <div className="pt-4 space-y-4">
                    <div className="border-t border-black/5 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-vvs-black/40 mb-3">What we offer</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-lg">💼</span>
                                <div>
                                    <h4 className="text-sm font-bold text-vvs-black">Creative Jobs</h4>
                                    <p className="text-xs text-vvs-black/60">Find styling, directing, design, and production opportunities.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-lg">🤝</span>
                                <div>
                                    <h4 className="text-sm font-bold text-vvs-black">Direct Collaboration</h4>
                                    <p className="text-xs text-vvs-black/60">Match with like-minded creators to build events and runway collections.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-lg">🔒</span>
                                <div>
                                    <h4 className="text-sm font-bold text-vvs-black">Secure Payments</h4>
                                    <p className="text-xs text-vvs-black/60">Get paid safely and easily for listings and contracts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        onClick={handleEnterApp}
                        className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide shadow-md cursor-pointer text-center"
                    >
                        Enter App
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full max-w-md text-center text-[10px] text-vvs-black/40 uppercase tracking-widest pt-4">
                © 2026 VVS Lagos. All rights reserved.
            </div>
        </div>
    );
}
