import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-vvs-black flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
            {/* Background mascot */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
                <img
                    src="/assets/VVSMASCOT2.webp"
                    alt=""
                    className="max-w-md w-full object-contain"
                />
            </div>

            <div className="relative z-10 max-w-lg">
                <img
                    src="/assets/VVSMASCOT7.png"
                    alt="VVS Mascot"
                    className="w-24 h-24 mx-auto mb-8 object-contain"
                />
                <h1 className="text-6xl sm:text-8xl font-serif font-extrabold text-vvs-gold tracking-tighter mb-4">
                    404
                </h1>
                <p className="text-vvs-white/50 text-sm sm:text-base font-sans font-light mb-8 leading-relaxed">
                    This page doesn&apos;t exist. The runway you&apos;re looking for may have moved or never existed.
                </p>
                <Link
                    href="/"
                    className="inline-block px-8 py-4 bg-vvs-gold text-vvs-black text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white transition-all transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
