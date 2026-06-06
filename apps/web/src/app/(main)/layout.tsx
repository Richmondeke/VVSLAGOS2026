"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { href: "/discover", label: "Discover", icon: "✨" },
    { href: "/feed", label: "Feed", icon: "📰" },
    { href: "/listings", label: "Marketplace", icon: "🛍️" },
    { href: "/social", label: "Social", icon: "💬" },
    { href: "/profile", label: "Profile", icon: "⚡" },
] as const;

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
                            <img
                                src="https://www.vvslagos.com/assets/VVSMASCOT7.png"
                                alt="VVS Mascot"
                                className="h-full w-full object-contain"
                            />
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
                        className="rounded-full p-2 text-text-muted hover:text-text-primary hover:bg-tag-bg transition-all cursor-pointer"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>

                    {/* XP pill */}
                    {user && (
                        <div className="hidden sm:flex items-center gap-2 bg-tag-bg rounded-full px-3 py-1.5">
                            <span className="text-xs font-medium text-text-primary flex items-center gap-1">
                                🔥 <span className="font-semibold">{user.streak ?? 3}D</span>
                            </span>
                            <div className="h-3 w-px bg-text-secondary/15" />
                            <span className="text-[11px] font-semibold text-vvs-gold">
                                {user.xp ?? 450} XP
                            </span>
                        </div>
                    )}

                    {/* Notifications */}
                    <Link
                        href="/notifications"
                        className="relative rounded-full p-2 text-text-muted hover:text-text-primary hover:bg-tag-bg transition-all"
                        title="Alerts"
                    >
                        <span className="text-lg">🔔</span>
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vvs-accent opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-vvs-accent" />
                        </span>
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={() => logout()}
                        title="Sign Out"
                        className="rounded-full p-2 text-text-muted hover:text-vvs-accent hover:bg-tag-bg transition-all cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-24 md:pb-12 max-w-7xl mx-auto w-full px-5 md:px-10 transition-colors duration-300">{children}</main>

            {/* Bottom tab navigation — Mobile Only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-center justify-around border-t border-text-secondary/8 bg-vvs-bg/85 backdrop-blur-xl pb-2 px-2 transition-colors duration-300">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium tracking-wide transition-all ${
                                isActive
                                    ? "text-vvs-accent font-semibold"
                                    : "text-text-muted"
                            }`}
                        >
                            <span className={`text-xl transition-all duration-200 ${isActive ? "" : "opacity-60"}`}>
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
