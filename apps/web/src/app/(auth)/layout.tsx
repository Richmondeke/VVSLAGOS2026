"use client";

import ThemeLogo from "@/components/theme-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="dark relative flex min-h-screen items-center justify-center bg-[#020202] p-6 overflow-hidden text-white font-sans">
            {/* Subtle Ambient Radial Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#c5a059]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FF3B5C]/5 blur-[120px] pointer-events-none" />
            
            {/* Micro Tech Grid in background */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

            {/* Container Card */}
            <div className="relative w-full max-w-md bg-[#090A0D]/90 rounded-3xl p-8 md:p-10 border border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
                {/* Tech Corner Accents */}
                <div className="absolute top-3 left-3 font-mono text-[8px] text-white/20 select-none">// AUTH.NODE_07</div>
                <div className="absolute top-3 right-3 font-mono text-[8px] text-vvs-gold/40 select-none">SYS.ACTIVE //</div>
                <div className="absolute bottom-3 left-3 font-mono text-[8px] text-[#FF3B5C]/40 select-none">VVS_MEMBERS_V1</div>
                <div className="absolute bottom-3 right-3 font-mono text-[8px] text-white/20 select-none">© 2026</div>

                {/* VVS Branding Header */}
                <div className="mb-8 text-center flex flex-col items-center gap-3 relative z-10">
                    <div className="relative h-18 w-18 overflow-hidden rounded-full border border-vvs-gold/20 p-0.5 bg-black/40 shadow-sm flex items-center justify-center group">
                        {/* Pulsing Aura */}
                        <div className="absolute inset-0 rounded-full bg-vvs-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
                        <ThemeLogo forceTheme="dark" className="h-full w-full object-contain filter drop-shadow-[0_4px_12px_rgba(197,160,89,0.3)] transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="text-[10px] text-vvs-gold tracking-[0.2em] font-extrabold uppercase font-mono">VVS Lagos</span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}


