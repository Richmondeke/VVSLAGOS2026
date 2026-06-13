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
            const isOnboardingComplete = localStorage.getItem("vvs_onboarding_complete") === "true";
            if (isOnboardingComplete) {
                router.push(redirect);
            } else {
                router.push("/welcome");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 401 ? "Incorrect email or password. Please try again." : err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 text-white">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-wider text-white font-serif uppercase">// SECURE_LOGIN</h2>
                <p className="text-xs text-text-secondary">Enter your credentials to enter the void.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium tracking-wide flex gap-2 items-center">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all"
                        placeholder="yourname@email.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs font-bold text-vvs-gold hover:text-vvs-gold-muted transition-colors font-mono">
                            Forgot?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all"
                        placeholder="••••••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                    {loading ? "Decrypting..." : "Log In"}
                </button>
            </form>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em]">New Member?</span>
                <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Exclusive Invite-Only Prompt */}
            <div className="rounded-2xl border border-vvs-gold/15 bg-vvs-gold/5 p-5 space-y-3 relative overflow-hidden text-left">
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-vvs-gold uppercase tracking-widest font-mono">Invite-Only Access</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">VVS Lagos is currently invite-only. Please enter your invite code to sign up.</p>
                </div>
                <Link
                    href="/register"
                    className="block w-full text-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                >
                    Enter Invite Code
                </Link>
            </div>
        </div>
    );
}

