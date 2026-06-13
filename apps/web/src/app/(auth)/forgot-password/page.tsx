"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiClient("/auth/forgot-password", {
                method: "POST",
                body: { email },
            });
            setSent(true);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="text-center space-y-6 text-white">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vvs-gold/10 border border-vvs-gold/20 text-vvs-gold text-2xl animate-pulse">
                    ✉️
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// SIGNAL_TRANSMITTED</h1>
                    <p className="text-xs text-vvs-gold font-mono uppercase tracking-wider">Check your inbox</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed px-2">
                    If an account exists for <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{email}</span>, we have sent password reset instructions.
                </p>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="inline-block w-full text-center rounded-full bg-white hover:bg-white/90 px-4 py-3 text-xs font-bold text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-white">
            <div className="text-center space-y-1">
                <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// RESET_PASSWORD</h1>
                <p className="text-xs text-text-secondary">Enter your email to receive a decryption key.</p>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                    {loading ? "Transmitting..." : "Send Reset Link"}
                </button>
            </form>

            <p className="text-center text-xs">
                <Link href="/login" className="text-vvs-gold hover:text-vvs-gold-muted transition-colors font-bold font-mono uppercase tracking-wider">
                    ← Back to Sign In
                </Link>
            </p>
        </div>
    );
}
