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
    variant?: "compact" | "hero" | "banner";
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
                <span className="font-mono font-extrabold text-xs">00:00:00:00</span>
            </div>
        );
    }

    if (timeLeft.past) {
        return (
            <span className="text-vvs-gold-muted text-[10px] uppercase tracking-widest font-mono font-bold">
                Event Started
            </span>
        );
    }

    if (variant === "banner") {
        return (
            <div className={`inline-flex items-center gap-3 text-vvs-black/90 ${className}`}>
                {[
                    { label: "d", value: timeLeft.days },
                    { label: "h", value: timeLeft.hours },
                    { label: "m", value: timeLeft.minutes },
                    { label: "s", value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                    <React.Fragment key={label}>
                        <span className="flex items-baseline gap-0.5">
                            <span className="font-mono font-black text-sm md:text-base tabular-nums tracking-tight">
                                {pad(value)}
                            </span>
                            <span className="text-[9px] uppercase font-mono font-bold opacity-70">
                                {label}
                            </span>
                        </span>
                        {i < 3 && (
                            <span className="text-vvs-black/20 text-xs select-none">|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    if (variant === "hero") {
        return (
            <div className={`inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full border border-vvs-white/10 bg-vvs-white/5 backdrop-blur-md ${className}`}>
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hrs", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Sec", value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                    <React.Fragment key={label}>
                        <span className="flex items-center">
                            <span className="font-mono font-black text-xs sm:text-sm tabular-nums tracking-tight text-vvs-white">
                                {pad(value)}
                            </span>
                            <span className="text-vvs-gold text-[7px] sm:text-[8px] uppercase tracking-widest ml-1 font-mono font-bold opacity-80">
                                {label}
                            </span>
                        </span>
                        {i < 3 && (
                            <span className="text-vvs-white/20 text-xs select-none font-light">|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {[
                { label: "D", value: timeLeft.days },
                { label: "H", value: timeLeft.hours },
                { label: "M", value: timeLeft.minutes },
                { label: "S", value: timeLeft.seconds },
            ].map(({ label, value }, i) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <span className="text-vvs-gold font-mono font-extrabold text-[11px] leading-none tabular-nums">
                            {pad(value)}
                        </span>
                        <span className="text-vvs-white/40 text-[7px] font-mono leading-none mt-[2px] tracking-wider">
                            {label}
                        </span>
                    </div>
                    {i < 3 && (
                        <span className="text-vvs-gold/30 font-mono font-bold text-[10px] pb-[3px]">:</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
