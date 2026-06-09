"use client";

import React, { useState, useEffect, useRef } from "react";

// Ideographic symbols resembling Nsibidi characters (Unicode Nsibidi blocks combined with graphic ideographs)
const NSIBIDI_GLYPHS = [
    "𖩠", "𖩡", "𖩢", "𖩣", "𖩤", "𖩥", "𖩦", "𖩧", "𖩨", "𖩩", "𖩪", "𖩫", "𖩬", "𖩭", "𖩮", "𖩯",
    "𖢞", "𖣔", "𖤏", "𖦹", "𖧡", "𖧹", "✦", "✧", "❈", "𖧞", "𖧪"
];

interface ScrambleTextProps {
    text: string;
    className?: string;
}

export default function ScrambleText({ text, className = "" }: ScrambleTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startScramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(
                text
                    .split("")
                    .map((char) => {
                        if (char === " ") return " ";
                        return NSIBIDI_GLYPHS[Math.floor(Math.random() * NSIBIDI_GLYPHS.length)];
                    })
                    .join("")
            );
        }, 80);
    };

    const stopScramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        let iteration = 0;
        intervalRef.current = setInterval(() => {
            setDisplayText(
                text
                    .split("")
                    .map((char, index) => {
                        if (char === " ") return " ";
                        if (index < iteration) {
                            return text[index];
                        }
                        return NSIBIDI_GLYPHS[Math.floor(Math.random() * NSIBIDI_GLYPHS.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayText(text);
            }
            iteration += 1 / 2; // Resolves 2 characters per tick for a smooth transition
        }, 30);
    };

    useEffect(() => {
        // Synchronize display text when the text prop changes
        setDisplayText(text);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text]);

    return (
        <span
            onMouseEnter={startScramble}
            onMouseLeave={stopScramble}
            className={`cursor-default select-none ${className}`}
        >
            {displayText}
        </span>
    );
}
