"use client";

import { useEffect, useState } from "react";

interface LogoProps {
    className?: string;
    alt?: string;
    forceTheme?: "light" | "dark";
}

export default function ThemeLogo({ className = "h-full w-full object-contain", alt = "VVS Mascot", forceTheme }: LogoProps) {
    const [logoSrc, setLogoSrc] = useState(forceTheme === "dark" ? "/VVSwhitemask.png" : "/VVSMASKBLACK.png");

    useEffect(() => {
        if (forceTheme) {
            setLogoSrc(forceTheme === "dark" ? "/VVSwhitemask.png" : "/VVSMASKBLACK.png");
            return;
        }

        // Function to update logo source based on current theme class
        const updateLogo = () => {
            const isDark = document.documentElement.classList.contains("dark");
            setLogoSrc(isDark ? "/VVSwhitemask.png" : "/VVSMASKBLACK.png");
        };

        // Run once on mount
        updateLogo();

        // Observe documentElement for class shifts
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === "class") {
                    updateLogo();
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, [forceTheme]);

    return (
        <img
            src={logoSrc}
            alt={alt}
            className={className}
        />
    );
}
