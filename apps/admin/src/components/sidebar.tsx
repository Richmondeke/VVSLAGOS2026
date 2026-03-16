"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: "grid" },
    { href: "/members", label: "Members", icon: "users" },
    { href: "/orders", label: "Orders", icon: "package" },
    { href: "/disputes", label: "Disputes", icon: "alert-triangle" },
    { href: "/finance", label: "Finance", icon: "wallet" },
    { href: "/settings", label: "Settings", icon: "cog" },
];

const ICONS: Record<string, string> = {
    grid: "\u25A6",
    users: "\u2B24",
    package: "\u25A3",
    "alert-triangle": "\u26A0",
    wallet: "\u2B1A",
    cog: "\u2699",
};

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="flex h-screen w-60 flex-col border-r border-admin-border bg-white">
            <div className="border-b border-admin-border p-4">
                <h1 className="text-lg font-bold text-admin-primary">VVS Admin</h1>
                <p className="text-xs text-admin-muted">Platform Operations</p>
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
                <div className="mb-2 text-xs text-admin-muted">
                    {user?.email ?? "Admin"}
                </div>
                <button
                    onClick={() => {
                        logout();
                        window.location.href = "/login";
                    }}
                    className="text-xs text-admin-danger hover:underline"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
