export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#000000] p-6 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-vvs-accent/5 blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-vvs-blue/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "3s" }} />
            
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Container Card */}
            <div className="relative w-full max-w-md rounded-vvs-xl glass-panel p-8 md:p-10 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/5 overflow-hidden">
                {/* Tech corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-vvs-accent/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-vvs-accent/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-vvs-accent/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-vvs-accent/30" />

                {/* VVS Branding Header */}
                <div className="mb-8 text-center flex flex-col items-center">
                    <span className="text-vvs-accent text-3xl font-black tracking-widest leading-none drop-shadow-[0_0_15px_rgba(255,59,92,0.4)] mb-1">V V S</span>
                    <span className="mono-caps text-[9px] text-vvs-blue tracking-[0.3em] font-bold">OPERATING SYSTEM // V1</span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}

