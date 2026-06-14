"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: "grid" },
    { href: "/rsvps", label: "RSVPs", icon: "inbox" },
    { href: "/members", label: "Members", icon: "users" },
];

const ICONS: Record<string, string> = {
    grid: "\u25A6",
    inbox: "\u2709", // envelope/inbox
    users: "\u2B24",
    package: "\u25A3",
    "alert-triangle": "\u26A0",
    wallet: "\u2B1A",
    cog: "\u2699",
};

import { useState, useEffect } from "react";
import Image from "next/image";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDarkMode = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
            setIsDark(isDarkMode);
            if (isDarkMode) document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = !isDark;
        setIsDark(nextTheme);
        if (nextTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <aside className="flex h-screen w-60 flex-col border-r border-admin-border bg-admin-surface z-50">
            <div className="border-b border-admin-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
                    <Image 
                        src={isDark ? "/assets/VVSMASKBLACK.png" : "/assets/VVSWhiteMAsk.png"} 
                        alt="VVS Logo" 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-admin-primary">VVS Admin</h1>
                    <p className="text-[10px] uppercase tracking-wider text-admin-muted font-bold">Platform Ops</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? "bg-admin-accent/10 font-medium text-admin-accent"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <span className="text-base">{ICONS[item.icon]}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-admin-border p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-admin-primary">Theme</span>
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-5 bg-admin-border rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-admin-accent/50"
                    >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-admin-surface rounded-full transition-transform shadow-sm ${isDark ? 'translate-x-5' : ''}`} />
                    </button>
                </div>
                <div className="mb-2 text-xs text-admin-muted font-mono truncate">
                    {user?.email ?? "Admin"}
                </div>
                <button
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                    className="text-xs text-admin-danger hover:underline font-bold tracking-wide"
                >
                    SIGN OUT
                </button>
            </div>
        </aside>
    );
}
