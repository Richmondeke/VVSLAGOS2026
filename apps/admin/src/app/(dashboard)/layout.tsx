"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-admin-muted">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

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
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden w-full h-screen">
                {/* Mobile Header */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-admin-border bg-admin-surface px-4 md:hidden">
                    <div className="text-lg font-bold text-admin-primary">VVS Admin</div>
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="text-admin-primary p-2 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
