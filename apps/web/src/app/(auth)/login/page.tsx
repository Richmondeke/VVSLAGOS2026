"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-vvs-accent border-t-transparent" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/discover";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            router.push(redirect);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 401 ? "INVALID CREDENTIALS // DOUBLE CHECK ENTRY" : err.message);
            } else {
                setError("SYSTEM TIMEOUT // ATTEMPT RE-ENTRY");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold tracking-tight text-white uppercase">AUTHENTICATE MEMBER</h2>
                <p className="text-xs text-text-secondary">Enter your registered details to establish terminal handshake.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-vvs-md border border-vvs-accent/20 bg-vvs-accent/5 px-4 py-3 text-xs text-vvs-accent font-mono tracking-wide flex gap-2 items-center">
                    <span className="animate-pulse">●</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="email" className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">
                        TERMINAL EMAIL
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-vvs-md glass-input px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono"
                        placeholder="identity@vvs.co"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">
                            DECRYPT PASSWORD
                        </label>
                        <Link href="/forgot-password" className="text-[10px] font-medium text-vvs-accent/80 hover:text-vvs-accent hover:underline tracking-wide">
                            FORGOT?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-vvs-md glass-input px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono"
                        placeholder="••••••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden rounded-vvs-md bg-vvs-accent px-4 py-3 font-semibold text-xs tracking-wider uppercase text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,59,92,0.4)] active:scale-[0.98] disabled:opacity-50"
                >
                    <span className="relative z-10">{loading ? "ESTABLISHING HANDSHAKE..." : "INITIALIZE SIGN IN"}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
            </form>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] mono-caps text-text-muted tracking-[0.25em]">OR ACCESS SYSTEM</span>
                <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Exclusive Invite-Only Prompt */}
            <div className="rounded-vvs-lg border border-vvs-blue/10 bg-vvs-blue/5 p-4 space-y-2.5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-vvs-blue/5 blur-2xl rounded-full group-hover:bg-vvs-blue/10 transition-colors" />
                <div className="flex items-start gap-2.5 z-10 relative">
                    <span className="text-vvs-blue text-base mt-0.5 animate-pulse">✦</span>
                    <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white tracking-wide uppercase">CULTURALLY DRIVEN REFERRAL SYSTEM</h4>
                        <p className="text-[11px] text-text-secondary leading-relaxed">VVS operates on an exclusive invite pool. Enter your personal code or request an authorization key from active members.</p>
                    </div>
                </div>
                <Link
                    href="/register"
                    className="block w-full text-center rounded-vvs-md border border-vvs-blue/20 hover:border-vvs-blue/40 bg-transparent px-4 py-2 text-[10px] mono-caps font-bold text-vvs-blue transition-all"
                >
                    VERIFY KEY / ENTER CODE
                </Link>
            </div>
        </div>
    );
}

