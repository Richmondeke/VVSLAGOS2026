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
            <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-vvs-primary">Check Your Email</h1>
                <p className="mb-6 text-gray-600">
                    If an account exists for {email}, we&#39;ve sent password reset instructions.
                </p>
                <Link href="/login" className="text-vvs-accent hover:underline">
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <>
            <h1 className="mb-2 text-center text-2xl font-bold text-vvs-primary">Reset Password</h1>
            <p className="mb-6 text-center text-sm text-gray-600">
                Enter your email and we&#39;ll send you a reset link.
            </p>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-text-primary transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <p className="mt-4 text-center text-sm">
                <Link href="/login" className="text-vvs-accent hover:underline">
                    Back to sign in
                </Link>
            </p>
        </>
    );
}
