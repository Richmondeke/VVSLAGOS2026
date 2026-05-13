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

    if (variant === "hero") {
        return (
            <div className={`flex items-center gap-4 sm:gap-8 ${className}`}>
                {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Mins", value: timeLeft.minutes },
                    { label: "Secs", value: timeLeft.seconds },
                ].map(({ label, value }, i) => (
                    <div key={label} className="flex flex-col items-center">
                        <span className="text-vvs-white text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold tabular-nums tracking-tighter">
                            {pad(value)}
                        </span>
                        <span className="text-vvs-gold text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold mt-2">
                            {label}
                        </span>
                    </div>
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
