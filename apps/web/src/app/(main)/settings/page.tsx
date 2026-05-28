"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="relative min-h-[80vh] px-6 py-12 overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vvs-accent/5 blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-vvs-blue/5 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1s" }} />

            <div className="mx-auto max-w-2xl relative space-y-8">
                {/* Tech Telemetry Header */}
                <div>
                    <span className="mono-caps text-xs text-vvs-accent font-semibold tracking-widest">SYSTEM_PREFERENCES</span>
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight">CONTROL CENTER</h1>
                    <p className="mt-2 text-text-secondary text-sm">Configure your credentials, identity verification levels, and billing routes.</p>
                </div>

                <div className="space-y-6">
                    {/* Account section */}
                    <section className="glass-panel rounded-xl p-6 border border-white/5 relative">
                        {/* decorative corner ticks */}
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 -translate-x-[1px] -translate-y-[1px]" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 translate-x-[1px] -translate-y-[1px]" />

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-sm tracking-wide text-white uppercase mono-caps">CREATIVE IDENTITY credentials</h2>
                            <span className="text-[9px] text-vvs-blue mono-caps font-bold">SECURE_VAULT</span>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-text-secondary font-medium">Synced Email</span>
                                <span className="font-mono text-white text-xs">{user?.email || "anonymous@vvs.network"}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-text-secondary font-medium">Access Key Password</span>
                                <button className="text-xs font-bold text-vvs-accent hover:underline mono-caps tracking-wider cursor-pointer">
                                    [ RESET_KEY ]
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Verification & Status */}
                    <section className="glass-panel rounded-xl p-6 border border-white/5 relative">
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 -translate-x-[1px] -translate-y-[1px]" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 translate-x-[1px] -translate-y-[1px]" />

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-sm tracking-wide text-white uppercase mono-caps">VERIFICATION STATUS</h2>
                            <span className="text-[9px] text-vvs-gold mono-caps font-bold">KYC_LEVEL_1</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <span className="text-text-secondary text-xs">Verify your official regional document details to unlock booking contracts.</span>
                            </div>
                            <Link 
                                href="/verify-identity" 
                                className="text-xs font-bold text-vvs-gold hover:underline mono-caps tracking-wider shrink-0 ml-4"
                            >
                                [ VERIFY_NOW ]
                            </Link>
                        </div>
                    </section>

                    {/* Wallet & CoraPay billing */}
                    <section className="glass-panel rounded-xl p-6 border border-white/5 relative">
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 -translate-x-[1px] -translate-y-[1px]" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 translate-x-[1px] -translate-y-[1px]" />

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-sm tracking-wide text-white uppercase mono-caps">FINANCIAL CORAPAY ROUTES</h2>
                            <span className="text-[9px] text-vvs-green mono-caps font-bold">LEDGER_ACTIVE</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <span className="text-text-secondary text-xs">Sync and configure direct local bank details for secure automated escrow payouts.</span>
                            </div>
                            <button className="text-xs font-bold text-vvs-green hover:underline mono-caps tracking-wider shrink-0 ml-4 cursor-pointer">
                                [ ADD_BANK_ACCOUNT ]
                            </button>
                        </div>
                    </section>

                    {/* Privacy */}
                    <section className="glass-panel rounded-xl p-6 border border-white/5 relative">
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10 -translate-x-[1px] -translate-y-[1px]" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/10 translate-x-[1px] -translate-y-[1px]" />

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-extrabold text-sm tracking-wide text-white uppercase mono-caps">PRIVACY & DIRECTORY</h2>
                            <span className="text-[9px] text-text-secondary mono-caps font-bold">CONFIG</span>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-text-secondary">Show profile in active discovery catalog</span>
                                <input type="checkbox" defaultChecked className="rounded border-white/10 bg-black text-vvs-accent focus:ring-vvs-accent" />
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-text-secondary">Allow direct messenger handshakes from non-verified links</span>
                                <input type="checkbox" defaultChecked className="rounded border-white/10 bg-black text-vvs-accent focus:ring-vvs-accent" />
                            </div>
                        </div>
                    </section>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="w-full rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 py-4 text-xs font-bold text-red-500 transition-all duration-300 cursor-pointer mono-caps tracking-widest"
                    >
                        [ SIGN_OUT_OF_SECURE_VAULT ]
                    </button>
                </div>
            </div>
        </div>
    );
}
