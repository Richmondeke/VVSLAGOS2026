"use client";

import React, { useState, useEffect } from "react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    past: boolean;
}

function calcTimeLeft(targetDate: string): TimeLeft {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        past: false,
    };
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

interface CountdownProps {
    targetDate: string;
    className?: string;
    variant?: "compact" | "hero";
}

export default function Countdown({ targetDate, className = "", variant = "compact" }: CountdownProps) {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTimeLeft(calcTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) {
        return (
            <div className={`flex items-center gap-1 opacity-0 ${className}`}>
                <span className="font-mono font-extrabold">00:00:00:00</span>
            </div>
        );
    }

    if (timeLeft.past) {
        return (
            <span className="text-vvs-gold/40 text-[10px] uppercase tracking-widest font-mono">
                Event Started
            </span>
        );
    }

    if (variant === "hero" || variant === "hero-light") {
        const isLight = variant === "hero-light";
        return (
            <div className={`inline-flex items-center justify-center gap-3 md:gap-6 px-6 py-3 rounded-full border ${isLight ? 'border-black/10 bg-black/5 shadow-none' : 'border-vvs-white/10 bg-vvs-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'} backdrop-blur-md ${className}`}>
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hrs", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Sec", value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                    <React.Fragment key={label}>
                        <span className="flex items-center">
                            <span className={`font-mono font-black ${isLight ? 'text-black' : 'text-vvs-white'} text-sm sm:text-base md:text-lg tabular-nums tracking-tight`}>
                                {pad(value)}
                            </span>
                            <span className={`text-vvs-gold text-[8px] sm:text-[9px] uppercase tracking-widest ml-1 md:ml-1.5 font-mono font-bold ${isLight ? 'opacity-100' : 'opacity-80'}`}>
                                {label}
                            </span>
                        </span>
                        {i < 3 && (
                            <span className={`${isLight ? 'text-black/20' : 'text-vvs-white/20'} text-xs sm:text-sm select-none font-light`}>|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[
                { label: "D", value: timeLeft.days },
                { label: "H", value: timeLeft.hours },
                { label: "M", value: timeLeft.minutes },
                { label: "S", value: timeLeft.seconds },
            ].map(({ label, value }, i) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <span className="text-vvs-gold font-mono font-extrabold text-xs leading-none tabular-nums">
                            {pad(value)}
                        </span>
                        <span className="text-vvs-white/30 text-[8px] font-mono leading-none mt-[2px]">
                            {label}
                        </span>
                    </div>
                    {i < 3 && (
                        <span className="text-vvs-gold/50 font-mono font-bold text-xs pb-[4px]">:</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
