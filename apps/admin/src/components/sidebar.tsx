"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

import { 
    LayoutGrid, 
    Calendar, 
    Users, 
    FileText, 
    Briefcase 
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard", icon: "grid" },
    { href: "/events", label: "Events", icon: "calendar" },
    { href: "/news", label: "News", icon: "fileText" },
    { href: "/opportunities", label: "Opportunities", icon: "briefcase" },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    grid: LayoutGrid,
    calendar: Calendar,
    users: Users,
    fileText: FileText,
    briefcase: Briefcase,
};

export function Sidebar({ 
    onClose, 
    isDark, 
    toggleTheme 
}: { 
    onClose?: () => void;
    isDark: boolean;
    toggleTheme: () => void;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="flex h-screen w-60 flex-col border-r border-admin-border bg-admin-surface z-50">
            <div className="border-b border-admin-border p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded flex-shrink-0">
                        <Image 
                            src={isDark ? "/assets/VVSMASKBLACK.png" : "/assets/VVSWhiteMAsk.png"} 
                            alt="VVS Logo" 
                            fill 
                            className="object-contain" 
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-admin-primary">VVS Admin</h1>
                        <p className="text-[10px] uppercase tracking-wider text-admin-muted font-bold">Platform Ops</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-admin-muted hover:text-admin-primary p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    const IconComponent = ICONS[item.icon];

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()}
                            className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? "bg-admin-accent/10 font-medium text-admin-accent"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {IconComponent && <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-admin-accent" : "text-gray-500"}`} />}
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
                        className="text-[10px] font-bold uppercase tracking-wider text-admin-muted hover:text-admin-primary focus:outline-none transition-colors border border-admin-border px-3 py-1.5 rounded-lg hover:bg-admin-surface"
                    >
                        {isDark ? "Light Mode" : "Dark Mode"}
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
