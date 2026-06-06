export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#F9F6EE] p-6 overflow-hidden text-vvs-black font-sans">
            {/* Container Card */}
            <div className="relative w-full max-w-md bg-white rounded-3xl p-8 md:p-10 border border-black/5 shadow-xl">
                {/* VVS Branding Header */}
                <div className="mb-8 text-center flex flex-col items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-vvs-gold/25 p-0.5 bg-white shadow-sm">
                        <img 
                            src="https://www.vvslagos.com/assets/VVSMASCOT7.png" 
                            alt="VVS Mascot" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-[10px] text-vvs-gold tracking-widest font-extrabold uppercase">VVS Lagos</span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}

