"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="mx-auto max-w-2xl p-4">
            <h1 className="mb-6 text-2xl font-bold text-vvs-primary">Settings</h1>

            <div className="space-y-4">
                {/* Account */}
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-3 font-semibold">Account</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span>{user?.email}</span>
                        </div>
                        <button className="text-vvs-accent hover:underline text-sm">
                            Change Password
                        </button>
                    </div>
                </section>

                {/* Identity & Tier */}
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-3 font-semibold">Identity & Tier</h2>
                    <Link href="/verify-identity" className="text-sm text-vvs-accent hover:underline">
                        Verify Identity
                    </Link>
                </section>

                {/* Payment Methods */}
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-3 font-semibold">Payment Methods</h2>
                    <button className="text-sm text-vvs-accent hover:underline">
                        Add Bank Account
                    </button>
                </section>

                {/* Privacy */}
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-3 font-semibold">Privacy</h2>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <span>Show profile in search</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Allow messages from non-contacts</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                    </div>
                </section>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
