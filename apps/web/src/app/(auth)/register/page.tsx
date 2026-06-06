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
            setError("PLEASE PROVIDE A VALID REFERRAL KEY");
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
                setError(err.message.toUpperCase());
            } else {
                setError("REGISTRATION CRITICAL FAULT // RETRY");
            }
        } finally {
            setLoading(false);
        }
    }

    if (step === "pending") {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vvs-gold/10 border border-vvs-gold/20 text-vvs-gold text-2xl animate-bounce">
                    ⚡
                </div>
                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-text-primary uppercase tracking-wider">SECURE LINK PENDING</h1>
                    <p className="mono-caps text-[9px] text-vvs-gold tracking-widest">DECRYPTING CREATIVE CREDENTIALS</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed px-2">
                    Your application packet has been registered under access key <span className="font-mono text-text-primary bg-text-secondary/5 px-1.5 py-0.5 rounded border border-text-secondary/10">{inviteCode}</span>. VVS node validators are examining your professional reputation.
                </p>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="inline-block w-full text-center rounded-vvs-md bg-vvs-accent hover:shadow-[0_0_15px_rgba(255,59,92,0.3)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-primary transition-all"
                    >
                        RETURN TO LOGIN
                    </Link>
                </div>
            </div>
        );
    }

    if (step === "invite") {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold text-text-primary uppercase tracking-tight">VERIFY INVITATION KEY</h1>
                    <p className="text-xs text-text-secondary">Enter your selective referral code to open credentials setup.</p>
                </div>

                {error && (
                    <div className="relative overflow-hidden rounded-vvs-md border border-vvs-accent/20 bg-vvs-accent/5 px-4 py-3 text-xs text-vvs-accent font-mono tracking-wide flex gap-2 items-center">
                        <span className="animate-pulse">●</span> {error}
                    </div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="inviteCode" className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">
                            DECRYPT ACCESS KEY
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full rounded-vvs-md glass-input px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono uppercase tracking-widest text-center"
                            placeholder="VVS-XXXX-XXXX"
                        />
                    </div>

                    <button
                        type="submit"
                        className="relative w-full overflow-hidden rounded-vvs-md bg-vvs-accent px-4 py-3 font-semibold text-xs tracking-wider uppercase text-text-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,59,92,0.4)] active:scale-[0.98]"
                    >
                        CONTINUE REGISTRATION
                    </button>
                </form>

                <p className="text-center text-xs text-text-secondary">
                    Already authenticated?{" "}
                    <Link href="/login" className="text-vvs-accent hover:underline font-semibold tracking-wide">
                        SIGN IN
                    </Link>
                </p>
            </div>
        );
    }

    // step === "account"
    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-text-primary uppercase tracking-tight">CREATE MEMBER PROFILE</h1>
                <p className="text-xs text-text-secondary">Establish your credentials on the network.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-vvs-md border border-vvs-accent/20 bg-vvs-accent/5 px-4 py-3 text-xs text-vvs-accent font-mono tracking-wide flex gap-2 items-center">
                    <span className="animate-pulse">●</span> {error}
                </div>
            )}

            <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="email" className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">
                        SECURE TERMINAL EMAIL
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-vvs-md glass-input px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono"
                        placeholder="yourname@vvs.co"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="password" className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">
                        PASSPHRASE ENCRYPTION
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-vvs-md glass-input px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono"
                        placeholder="At least 8 characters"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden rounded-vvs-md bg-vvs-accent px-4 py-3 font-semibold text-xs tracking-wider uppercase text-text-primary transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,59,92,0.4)] active:scale-[0.98] disabled:opacity-50"
                >
                    <span className="relative z-10">{loading ? "PROCESSING HANDSHAKE..." : "INITIALIZE MEMBERSHIP"}</span>
                </button>
            </form>

            <button
                onClick={() => setStep("invite")}
                className="w-full text-center text-xs text-text-muted hover:text-text-secondary mono-caps tracking-widest"
            >
                ← BACK TO DECRYPT KEY
            </button>
        </div>
    );
}

