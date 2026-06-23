"use client";

import React from "react";
import VVSFutureLabs from "@/components/sections/VVSFutureLabs";

export default function FutureLabsPage() {
    return (
        <div className="bg-black text-white min-h-screen relative overflow-y-auto w-full selection:bg-[#c5a059]/30 font-sans">
            {/* Future Labs Section */}
            <div className="pt-20">
                <VVSFutureLabs theme="dark" />
            </div>

            {/* Footer */}
            <footer className="py-12 border-t text-center text-xs opacity-50 border-white/10 bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/assets/VVSWhiteMAsk.png" alt="Logo" className="w-6 h-6 object-contain" />
                        <span className="font-bold tracking-wider">VVS LAGOS 2026</span>
                    </div>
                    <p>© 2026 VERY VERY SPECIAL. ALL RIGHTS RESERVED. DESIGNED WITH SATOSHI.</p>
                </div>
            </footer>
        </div>
    );
}
