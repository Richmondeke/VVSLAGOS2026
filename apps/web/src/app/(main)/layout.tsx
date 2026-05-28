"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
    { href: "/discover", label: "Discover", icon: "💎" },
    { href: "/listings", label: "Market", icon: "🛍️" },
    { href: "/messages", label: "Inbox", icon: "✉️" },
    { href: "/wallet", label: "CoraPay", icon: "💳" },
    { href: "/profile", label: "Profile", icon: "⚡" },
] as const;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            {/* Top header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-md px-6">
                <Link href="/discover" className="flex items-center gap-2">
                    <span className="mono-caps text-lg font-bold tracking-[0.25em] text-vvs-accent">VVS</span>
                    <span className="text-[10px] mono-caps border border-vvs-accent/30 text-vvs-accent/80 px-1.5 py-0.5 rounded-sm">V1</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    {/* User Gamification Indicator */}
                    {user && (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-3 py-1">
                            <span className="text-xs font-semibold text-vvs-gold flex items-center gap-1">
                                🔥 <span className="text-white font-mono">{user.streak ?? 3}D</span>
                            </span>
                            <div className="h-3 w-[1px] bg-white/10" />
                            <span className="text-[10px] font-bold text-vvs-blue tracking-wider font-mono">
                                {user.xp ?? 450} XP
                            </span>
                        </div>
                    )}

                    <Link
                        href="/notifications"
                        className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <span className="text-lg">🔔</span>
                        {/* Notification Dot */}
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vvs-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-vvs-accent"></span>
                        </span>
                    </Link>
                    
                    <button
                        onClick={() => logout()}
                        title="Logout"
                        className="rounded-full p-2 text-gray-400 hover:text-vvs-accent hover:bg-white/5 transition-all text-sm"
                    >
                        ❌
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-24 md:pb-6">{children}</main>

            {/* Bottom tab navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t border-white/5 bg-black/65 backdrop-blur-lg pb-4 px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1.5 px-4 py-2 text-[10px] tracking-widest mono-caps transition-all ${
                                isActive 
                                    ? "text-vvs-accent font-bold scale-105" 
                                    : "text-text-secondary hover:text-white hover:scale-102"
                            }`}
                        >
                            <span className={`text-xl transition-all duration-300 ${isActive ? "drop-shadow-[0_0_10px_rgba(255,59,92,0.4)]" : "opacity-70"}`}>
                                {item.icon}
                            </span>
                            <span className={isActive ? "text-vvs-accent" : "text-text-secondary"}>{item.label}</span>
                            {isActive && (
                                <span className="h-1 w-1 rounded-full bg-vvs-accent animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
