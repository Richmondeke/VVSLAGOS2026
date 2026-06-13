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
            <AuthForm defaultTab="login" />
        </Suspense>
    );
}

interface AuthFormProps {
    defaultTab?: "login" | "signup";
}

export function AuthForm({ defaultTab = "login" }: AuthFormProps) {
    const { login, register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/discover";

    const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Clear messages when switching tabs
    const handleTabChange = (tab: "login" | "signup") => {
        setActiveTab(tab);
        setError(null);
        setSuccessMessage(null);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (activeTab === "login") {
                await login(email, password);
                const isOnboardingComplete = localStorage.getItem("vvs_onboarding_complete") === "true";
                if (isOnboardingComplete) {
                    router.push(redirect);
                } else {
                    router.push("/welcome");
                }
            } else {
                if (!inviteCode.trim()) {
                    setError("Please enter a valid invite code.");
                    setLoading(false);
                    return;
                }
                await register(email, password, inviteCode);
                setSuccessMessage("Account created successfully. You can now log in.");
                setActiveTab("login");
                setPassword("");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(activeTab === "login" && err.status === 401 
                    ? "Incorrect email or password. Please try again." 
                    : err.message
                );
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 text-white font-sans">
            {/* Simple Alternating Tabs */}
            <div className="flex border-b border-white/5 mb-6">
                <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        activeTab === "login"
                            ? "text-white border-b-2 border-vvs-gold"
                            : "text-text-muted hover:text-white"
                    }`}
                >
                    Log In
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        activeTab === "signup"
                            ? "text-white border-b-2 border-vvs-gold"
                            : "text-text-muted hover:text-white"
                    }`}
                >
                    Sign Up
                </button>
            </div>

            {error && (
                <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 font-medium tracking-wide flex gap-2 items-center">
                    <span>⚠️</span> {error}
                </div>
            )}

            {successMessage && (
                <div className="relative overflow-hidden rounded-2xl border border-vvs-gold/20 bg-vvs-gold/10 px-4 py-3 text-xs text-vvs-gold font-medium tracking-wide flex gap-2 items-center">
                    <span>⚡</span> {successMessage}
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
                        {activeTab === "login" && (
                            <Link href="/forgot-password" className="text-xs font-bold text-vvs-gold hover:text-vvs-gold-muted transition-colors font-mono">
                                Forgot?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={activeTab === "signup" ? 8 : undefined}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full glass-input px-4 py-3 text-sm placeholder:text-white/20 transition-all"
                        placeholder={activeTab === "signup" ? "At least 8 characters" : "••••••••••••"}
                    />
                </div>

                {activeTab === "signup" && (
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
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full pill-btn pill-btn-primary py-4 justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
                >
                    {loading 
                        ? (activeTab === "login" ? "Logging In..." : "Signing Up...") 
                        : (activeTab === "login" ? "Log In" : "Sign Up")
                    }
                </button>
            </form>
        </div>
    );
}
