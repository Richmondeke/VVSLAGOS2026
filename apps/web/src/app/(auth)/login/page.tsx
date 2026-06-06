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
        <div className="space-y-6 text-vvs-black">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-vvs-black font-serif">Sign in</h2>
                <p className="text-xs text-vvs-black/60">Enter your registered details to access your account.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-600 font-medium tracking-wide flex gap-2 items-center">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-vvs-black/70 block">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                        placeholder="identity@vvs.co"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-vvs-black/70 block">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs font-bold text-vvs-gold hover:underline">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-vvs-black focus:outline-none focus:ring-2 focus:ring-vvs-gold/40 placeholder:text-black/30 transition-all"
                        placeholder="••••••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-vvs-black py-4 font-bold text-white hover:bg-vvs-black/95 transition-all text-sm tracking-wide disabled:opacity-50 cursor-pointer text-center mt-6"
                >
                    {loading ? "Authenticating..." : "Continue"}
                </button>
            </form>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-black/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-vvs-black/40 uppercase tracking-widest">New Member?</span>
                <div className="flex-grow border-t border-black/5"></div>
            </div>

            {/* Exclusive Invite-Only Prompt */}
            <div className="rounded-2xl border border-vvs-gold/20 bg-[#FFFDF6] p-5 space-y-3 relative overflow-hidden text-left shadow-sm">
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-vvs-black uppercase tracking-wide">Referral Access</h4>
                    <p className="text-xs text-vvs-black/60 leading-relaxed">VVS operates on an exclusive invite pool. Verify your access code to initialize register pipeline.</p>
                </div>
                <Link
                    href="/register"
                    className="block w-full text-center rounded-full bg-white border border-black/10 hover:bg-black/5 py-2.5 text-xs font-bold text-vvs-black transition-all cursor-pointer"
                >
                    Verify Invite Code
                </Link>
            </div>
        </div>
    );
}

