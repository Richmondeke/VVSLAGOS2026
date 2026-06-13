"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api-client";

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    if (!token) {
        return (
            <div className="text-center space-y-6 text-white">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-2xl animate-pulse">
                    ⚠️
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// INVALID_LINK</h1>
                    <p className="text-xs text-text-muted">This reset link is invalid or has expired.</p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/forgot-password"
                        className="inline-block w-full text-center rounded-full bg-white hover:bg-white/90 px-4 py-3 text-xs font-bold text-black transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError(null);
        setLoading(true);

        try {
            await apiClient("/auth/reset-password", {
                method: "POST",
                body: { token, password },
            });
            router.push("/login?reset=success");
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

    return (
        <div className="space-y-6 text-white">
            <div className="text-center space-y-1">
                <h1 className="text-lg font-bold text-white uppercase tracking-widest font-mono">// NEW_PASSWORD</h1>
                <p className="text-xs text-text-secondary">Enter a new secure decryption key.</p>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium tracking-wide flex gap-2 items-center">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                        New Password
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

                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block font-mono">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all"
                        placeholder="Confirm password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                    {loading ? "Decrypting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}
