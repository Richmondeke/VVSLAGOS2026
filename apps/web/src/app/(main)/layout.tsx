"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/discover", label: "Discover", icon: "🔍" },
    { href: "/orders", label: "Orders", icon: "📦" },
    { href: "/messages", label: "Messages", icon: "💬" },
    { href: "/wallet", label: "Wallet", icon: "💰" },
    { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen flex-col">
            {/* Top header */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
                <Link href="/discover" className="text-lg font-bold text-vvs-primary">
                    VVS
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/notifications"
                        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    >
                        <span className="text-xl">🔔</span>
                    </Link>
                    <Link
                        href="/settings"
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                    >
                        <span className="text-xl">⚙️</span>
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pb-16">{children}</main>

            {/* Bottom tab navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                                isActive ? "text-vvs-accent" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
