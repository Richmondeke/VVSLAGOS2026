"use client";

import { useAuth } from "@/lib/auth-context";
import ThemeLogo from "@/components/theme-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    {
        href: "/discover",
        label: "Discover",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2 L21 11 L12 20 L3 11 Z" />
                <path d="M12 2 L12 20" className="opacity-40" />
                <path d="M3 11 L21 11" className="opacity-40" />
            </svg>
        ),
    },
    {
        href: "/feed",
        label: "Feed",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
            </svg>
        ),
    },
    {
        href: "/social",
        label: "Social",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
    },
    {
        href: "/profile",
        label: "Profile",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [theme, setTheme] = useState<"dark" | "light">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("vvs-theme") as "dark" | "light";
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
        setTheme(initialTheme);
        if (initialTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("vvs-theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-vvs-bg text-text-primary selection:bg-vvs-accent/20 transition-colors duration-300">
            {/* Top header — Clean editorial nav */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-text-secondary/8 bg-vvs-bg/80 backdrop-blur-xl px-6 md:px-10 transition-colors duration-300">
                <div className="flex items-center gap-8 lg:gap-10">
                    {/* Mascot Logo */}
                    <Link href="/discover" className="flex items-center group" title="VVS Lagos">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-vvs-card transition-all duration-300 group-hover:scale-105">
                            <ThemeLogo />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-200 ${
                                        isActive
                                            ? "text-text-primary bg-tag-bg font-semibold"
                                            : "text-text-secondary hover:text-text-primary"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-full p-2 text-text-muted hover:text-text-primary hover:bg-tag-bg transition-all cursor-pointer flex items-center justify-center w-9 h-9"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {/* Notifications */}
                    <Link
                        href="/notifications"
                        className="relative rounded-full p-2 text-text-muted hover:text-text-primary hover:bg-tag-bg transition-all flex items-center justify-center w-9 h-9"
                        title="Alerts"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vvs-accent opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-vvs-accent" />
                        </span>
                    </Link>

                    <button
                        onClick={async () => {
                            await logout();
                            window.location.href = "/";
                        }}
                        title="Sign Out"
                        className="rounded-full p-2 text-text-muted hover:text-vvs-accent hover:bg-tag-bg transition-all cursor-pointer flex items-center justify-center w-9 h-9"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-24 md:pb-12 max-w-7xl mx-auto w-full px-5 md:px-10 transition-colors duration-300">
                {children}
            </main>

            {/* Bottom tab navigation — Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around border-t border-text-secondary/8 bg-vvs-bg/85 backdrop-blur-xl pb-2 px-2 transition-colors duration-300">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium tracking-wide transition-all ${
                                isActive ? "text-vvs-accent font-semibold" : "text-text-muted"
                            }`}
                        >
                            <span
                                className={`transition-all duration-200 ${isActive ? "" : "opacity-60"}`}
                            >
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
