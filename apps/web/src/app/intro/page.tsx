"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeLogo from "@/components/theme-logo";

const AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "/VVSMASKBLACK.png",
];

export default function IntroPage() {
    const router = useRouter();
    const [introSlide, setIntroSlide] = useState<1 | 2 | 3>(1);

    const handleNext = () => {
        if (introSlide < 3) {
            setIntroSlide((s) => (s + 1) as 1 | 2 | 3);
        } else {
            router.push("/login");
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-10 bg-[#F9F6EE] text-vvs-black font-sans">
            {/* Top Indicator bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-4">
                <button
                    onClick={() => {
                        if (introSlide > 1) setIntroSlide((s) => (s - 1) as 1 | 2 | 3);
                        else router.push("/");
                    }}
                    className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-vvs-black font-bold"
                >
                    ←
                </button>
                <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-2.5 h-1 rounded-full transition-all duration-300 ${
                                s <= introSlide ? "bg-vvs-gold w-5" : "bg-black/10"
                            }`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => router.push("/login")}
                    className="text-xs font-bold text-vvs-black/60 hover:text-vvs-black transition-all cursor-pointer"
                >
                    Skip
                </button>
            </div>

            {/* Slides container */}
            <div className="w-full max-w-md space-y-6 my-auto text-center">
                <div className="relative h-64 w-full flex items-center justify-center">
                    {/* Inner and Outer Orbit Lines */}
                    <div className="absolute w-52 h-52 rounded-full border border-black/5" />
                    <div className="absolute w-36 h-36 rounded-full border border-black/5" />

                    {/* Center Avatar Container */}
                    <div className="relative z-10 w-24 h-24 rounded-[32px] bg-white border border-black/5 flex items-center justify-center shadow-lg overflow-hidden p-2 transform transition-transform duration-500 hover:scale-105">
                        <ThemeLogo forceTheme="light" />
                    </div>

                    {/* Slide 1 Visuals */}
                    {introSlide === 1 && (
                        <div className="absolute inset-0 w-full h-full animate-orbit-container pointer-events-none">
                            {AVATARS.map((url, index) => {
                                const angle = (index * 360) / AVATARS.length;
                                return (
                                    <div
                                        key={index}
                                        className="absolute w-10 h-10 rounded-xl bg-white border border-black/5 shadow-md overflow-hidden p-0.5"
                                        style={{
                                            top: "calc(50% - 20px)",
                                            left: "calc(50% - 20px)",
                                            transform: `rotate(${angle}deg) translate(95px) rotate(-${angle}deg)`,
                                        }}
                                    >
                                        <div className="w-full h-full rounded-lg overflow-hidden animate-counter-rotate">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Slide 2 Visuals */}
                    {introSlide === 2 && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            {AVATARS.map((url, index) => {
                                const angle = (index * 360) / AVATARS.length;
                                const dist = 75;
                                return (
                                    <div key={index} className="absolute inset-0 w-full h-full flex items-center justify-center">
                                        <div
                                            className="absolute h-[2px] bg-dashed bg-vvs-gold/45 origin-left"
                                            style={{
                                                width: `${dist}px`,
                                                transform: `rotate(${angle}deg) translateX(12px)`,
                                            }}
                                        />
                                        <div
                                            className="absolute w-10 h-10 rounded-xl bg-white border border-black/10 shadow-lg overflow-hidden p-0.5 animate-float-slow"
                                            style={{
                                                transform: `rotate(${angle}deg) translate(${dist}px) rotate(-${angle}deg)`,
                                                animationDelay: `${index * 0.4}s`,
                                            }}
                                        >
                                            <img src={url} alt="" className="w-full h-full rounded-lg object-cover" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Slide 3 Visuals */}
                    {introSlide === 3 && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                            {AVATARS.map((url, index) => {
                                const angle = (index * 360) / AVATARS.length;
                                const dist = 90;
                                return (
                                    <div key={index} className="absolute inset-0 w-full h-full flex items-center justify-center">
                                        <div
                                            className="absolute w-12 h-8 rounded-lg bg-white border-2 border-dashed border-vvs-gold/30 shadow-md flex items-center justify-center p-1 animate-float-slow"
                                            style={{
                                                transform: `rotate(${angle}deg) translate(${dist}px) rotate(-${angle}deg) rotate(15deg)`,
                                                animationDelay: `${index * 0.5}s`,
                                            }}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-vvs-gold absolute -left-1" />
                                            <img src={url} alt="" className="w-6 h-6 rounded-md object-cover" />
                                            <div className="w-2 h-2 rounded-full bg-vvs-gold absolute -right-1" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-3 px-4">
                    {introSlide === 1 && (
                        <>
                            <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                Discover
                            </h1>
                            <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                Discover grants and opportunities exclusive to community members only.
                            </p>
                        </>
                    )}
                    {introSlide === 2 && (
                        <>
                            <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                Collaborate
                            </h1>
                            <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                Collaborate with other creatives who need your skills.
                            </p>
                        </>
                    )}
                    {introSlide === 3 && (
                        <>
                            <h1 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">
                                Stay Connected
                            </h1>
                            <p className="text-vvs-black/60 text-sm leading-relaxed max-w-sm mx-auto">
                                Stay Connected, Attend Events, Enter Contests and Win prizes.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom action button */}
            <div className="w-full max-w-md px-4">
                <button
                    onClick={handleNext}
                    className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide shadow-md cursor-pointer text-center"
                >
                    {introSlide === 3 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
    );
}
