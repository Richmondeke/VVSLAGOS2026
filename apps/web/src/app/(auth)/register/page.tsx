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
            setError("Please enter your invite code");
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
            <>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-vvs-accent/10 text-3xl">
                        ⏳
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-vvs-primary">Approval Pending</h1>
                    <p className="mb-6 text-gray-600">
                        Your account has been created. You&#39;ll receive a notification once your
                        membership is approved.
                    </p>
                    <Link
                        href="/login"
                        className="text-vvs-accent hover:underline"
                    >
                        Back to sign in
                    </Link>
                </div>
            </>
        );
    }

    if (step === "invite") {
        return (
            <>
                <h1 className="mb-2 text-center text-2xl font-bold text-vvs-primary">Join VVS</h1>
                <p className="mb-6 text-center text-sm text-gray-600">
                    VVS is referral-only. Enter the invite code you received.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="inviteCode" className="mb-1 block text-sm font-medium text-gray-700">
                            Invite Code
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            required
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                            placeholder="Enter your invite code"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90"
                    >
                        Continue
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-vvs-accent hover:underline">
                        Sign in
                    </Link>
                </p>
            </>
        );
    }

    // step === "account"
    return (
        <>
            <h1 className="mb-2 text-center text-2xl font-bold text-vvs-primary">Create Account</h1>
            <p className="mb-6 text-center text-sm text-gray-600">
                Set up your credentials to continue.
            </p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                        placeholder="At least 8 characters"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <button
                onClick={() => setStep("invite")}
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
                Back
            </button>
        </>
    );
}
