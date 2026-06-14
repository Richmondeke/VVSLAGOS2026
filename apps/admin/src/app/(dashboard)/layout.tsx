"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-admin-muted">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (user.role !== "admin" && user.role !== "super_admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-admin-surface dark">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-red-500">Unauthorized Access</h1>
                    <p className="text-admin-muted">You do not have administrator privileges.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-admin-surface">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar (Mobile sliding + Desktop fixed) */}
            <div className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <Sidebar onClose={() => setSidebarOpen(false)} isDark={isDark} toggleTheme={toggleTheme} />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden w-full h-screen">
                {/* Mobile Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-admin-border bg-admin-surface px-4 md:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative rounded flex-shrink-0">
                            <Image 
                                src={isDark ? "/assets/VVSMASKBLACK.png" : "/assets/VVSWhiteMAsk.png"} 
                                alt="VVS Logo" 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                        <div className="text-lg font-bold text-admin-primary">VVS Admin</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleTheme}
                            className="text-admin-muted hover:text-admin-primary focus:outline-none p-2"
                            aria-label="Toggle Theme"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="text-admin-primary p-2 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
