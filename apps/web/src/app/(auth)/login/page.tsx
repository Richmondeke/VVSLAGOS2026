"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
    return (
        <Suspense>
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
            router.push(redirect);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.status === 401 ? "Invalid email or password" : err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1 className="mb-6 text-center text-2xl font-bold text-vvs-primary">Sign In</h1>

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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-vvs-accent focus:outline-none focus:ring-1 focus:ring-vvs-accent"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-vvs-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-vvs-accent/90 disabled:opacity-50"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-4 flex justify-between text-sm">
                <Link href="/forgot-password" className="text-vvs-accent hover:underline">
                    Forgot password?
                </Link>
                <Link href="/register" className="text-vvs-accent hover:underline">
                    Have an invite? Register
                </Link>
            </div>
        </>
    );
}
