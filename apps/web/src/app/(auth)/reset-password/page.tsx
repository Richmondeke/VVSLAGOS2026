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
            <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold text-vvs-primary">Invalid Link</h1>
                <p className="mb-6 text-gray-600">This reset link is invalid or has expired.</p>
                <Link href="/forgot-password" className="text-vvs-accent hover:underline">
                    Request a new link
                </Link>
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
        <>
            <h1 className="mb-6 text-center text-2xl font-bold text-vvs-primary">New Password</h1>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </>
    );
}
