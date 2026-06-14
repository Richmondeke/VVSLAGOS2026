"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#020202] dark">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-accent border-t-transparent" />
            </div>
        }>
            <div className="dark relative flex min-h-screen items-center justify-center bg-[#020202] p-6 overflow-hidden text-white font-sans">
                {/* Subtle Ambient Radial Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-admin-accent/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#FF3B5C]/5 blur-[120px] pointer-events-none" />
                
                {/* Micro Tech Grid in background */}
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

                {/* Container Card */}
                <div className="relative w-full max-w-md bg-[#090A0D]/90 rounded-3xl p-8 md:p-10 border border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden z-10">
                    <div className="mb-6 text-center flex flex-col items-center justify-center relative z-10">
                        <h1 className="text-2xl font-bold tracking-widest text-admin-accent uppercase">VVS Admin</h1>
                    </div>

                    <div className="relative z-10">
                        <AuthForm defaultTab="login" />
                    </div>
                </div>
            </div>
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
    const redirect = searchParams.get("redirect") ?? "/";

    const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
                router.push(redirect);
            } else {
                if (!inviteCode.trim()) {
                    setError("Please enter a valid invite code.");
                    setLoading(false);
                    return;
                }
                await register(email, password, inviteCode);
                setSuccessMessage("Account created successfully. Logging in...");
                setTimeout(() => {
                    router.push(redirect);
                }, 1000);
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
            <div className="flex border-b border-white/5 mb-6">
                <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        activeTab === "login"
                            ? "text-white border-b-2 border-admin-accent"
                            : "text-white/50 hover:text-white"
                    }`}
                >
                    Log In
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        activeTab === "signup"
                            ? "text-white border-b-2 border-admin-accent"
                            : "text-white/50 hover:text-white"
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
                <div className="relative overflow-hidden rounded-2xl border border-admin-accent/20 bg-admin-accent/10 px-4 py-3 text-xs text-admin-accent font-medium tracking-wide flex gap-2 items-center">
                    <span>⚡</span> {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-white/50 block font-mono">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all focus:outline-none focus:border-admin-accent focus:bg-black/60"
                        placeholder="yourname@email.com"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-white/50 block font-mono">
                            Password
                        </label>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={activeTab === "signup" ? 8 : undefined}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all focus:outline-none focus:border-admin-accent focus:bg-black/60"
                        placeholder={activeTab === "signup" ? "At least 8 characters" : "••••••••••••"}
                    />
                </div>

                {activeTab === "signup" && (
                    <div className="space-y-1.5">
                        <label htmlFor="inviteCode" className="text-[10px] font-bold uppercase tracking-widest text-white/50 block font-mono">
                            Invite Key
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all focus:outline-none focus:border-admin-accent focus:bg-black/60 font-mono uppercase tracking-widest text-center"
                            placeholder="VVS-XXXX-XXXX"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-admin-accent hover:bg-admin-accent-hover text-white py-4 flex justify-center text-sm font-bold tracking-wide mt-6 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50 transition-colors"
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
