"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type WalletData = {
    availableKobo: number;
    inOrdersKobo: number;
};

type Transaction = {
    id: string;
    type: string;
    amountKobo: number;
    description: string;
    createdAt: string;
};

export default function WalletPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [w, t] = await Promise.all([
                    apiClient<WalletData>("/finance/wallet"),
                    apiClient<{ items: Transaction[] }>("/finance/wallet/transactions"),
                ]);
                setWallet(w);
                setTransactions(t.items ?? []);
            } catch {
                // handled
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <LoadingSkeleton className="h-32" />
                <LoadingSkeleton className="h-48" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="mb-6 text-2xl font-bold text-vvs-primary">Wallet</h1>

            {/* Balance cards */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4 border border-gray-200">
                    <div className="text-sm text-gray-500">Available</div>
                    <div className="text-2xl font-bold text-vvs-primary">
                        &#8358;{((wallet?.availableKobo ?? 0) / 100).toLocaleString()}
                    </div>
                </div>
                <div className="rounded-lg bg-white p-4 border border-gray-200 group relative">
                    <div className="text-sm text-gray-500">
                        In Active Orders
                        <span className="ml-1 cursor-help text-gray-400" title="Held safely until work is approved">ⓘ</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">
                        &#8358;{((wallet?.inOrdersKobo ?? 0) / 100).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mb-6 flex gap-3">
                <button className="flex-1 rounded-lg bg-vvs-accent px-4 py-3 font-medium text-white hover:bg-vvs-accent/90">
                    Add Funds
                </button>
                <button className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50">
                    Withdraw
                </button>
            </div>

            {/* Transaction history */}
            <h2 className="mb-3 font-semibold">Transaction History</h2>
            {transactions.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">No transactions yet.</p>
            ) : (
                <div className="space-y-2">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between rounded-lg bg-white p-3 border border-gray-200">
                            <div>
                                <div className="text-sm font-medium">{tx.description}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={`font-medium ${tx.amountKobo > 0 ? "text-green-600" : "text-red-600"}`}>
                                {tx.amountKobo > 0 ? "+" : ""}&#8358;{(Math.abs(tx.amountKobo) / 100).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
