"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

type Step = "invite" | "account" | "pending";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState<Step>("invite");
    const [inviteCode, setInviteCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleInviteSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteCode.trim()) {
            setError("Please enter a valid invite code.");
            return;
        }
        setError(null);
        setStep("account");
    }

    async function handleAccountSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await register(email, password, inviteCode);
            setStep("pending");
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

    if (step === "pending") {
        return (
            <div className="text-center space-y-6 text-white">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vvs-gold/10 border border-vvs-gold/20 text-vvs-gold text-2xl animate-bounce">
                    ⚡
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// ACCESS_PENDING</h1>
                    <p className="text-xs text-vvs-gold font-mono uppercase tracking-wider">Verifying invitation packet...</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed px-2">
                    Your key <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{inviteCode}</span> has been staged. Complete the registration sequence to proceed.
                </p>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="inline-block w-full text-center rounded-full bg-white hover:bg-white/90 px-4 py-3 text-xs font-bold text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (step === "invite") {
        return (
            <div className="space-y-6 text-white">
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// ACCESS_CODE</h1>
                    <p className="text-xs text-text-secondary">VVS Lagos is currently invite-only. Enter invite key.</p>
                </div>

                {error && (
                    <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium tracking-wide flex gap-2 items-center">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="inviteCode" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                            Invite Key
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all font-mono uppercase tracking-widest text-center"
                            placeholder="VVS-XXXX-XXXX"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        Continue
                    </button>
                </form>

                <p className="text-center text-xs text-text-secondary">
                    Already have an account?{" "}
                    <Link href="/login" className="text-vvs-gold hover:text-vvs-gold-muted transition-colors font-bold font-mono">
                        Log In
                    </Link>
                </p>
            </div>
        );
    }

    // step === "account"
    return (
        <div className="space-y-6 text-white">
            <div className="text-center space-y-1">
                <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// ACCOUNT_SETUP</h1>
                <p className="text-xs text-text-secondary">Set up your credentials to join VVS.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium tracking-wide flex gap-2 items-center">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleAccountSubmit} className="space-y-4">
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
                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all"
                        placeholder="At least 8 characters"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <button
                onClick={() => setStep("invite")}
                className="w-full text-center text-xs text-text-secondary hover:text-white transition-colors font-bold uppercase tracking-widest font-mono"
            >
                ← Back
            </button>
        </div>
    );
}
