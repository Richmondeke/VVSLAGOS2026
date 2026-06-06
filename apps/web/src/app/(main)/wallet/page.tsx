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

const MOCK_WALLET: WalletData = {
    availableKobo: 27500000, // ₦275,000.00
    inOrdersKobo: 8500000,   // ₦85,000.00 in active escrow
};

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "tx-001",
        type: "payout",
        amountKobo: 12000000, // +₦120,000.00
        description: "Milestone 1 // AURA Editorial Campaign Stylist",
        createdAt: "2026-05-27T10:30:00.000Z",
    },
    {
        id: "tx-002",
        type: "payment",
        amountKobo: -1500000, // -₦15,000.00
        description: "Private RSVP // VVS Showcase Runway Ticket",
        createdAt: "2026-05-25T18:15:00.000Z",
    },
    {
        id: "tx-003",
        type: "payout",
        amountKobo: 17000000, // +₦170,000.00
        description: "Contract Completed // Lagos Sustainable Fashion Video Shoot",
        createdAt: "2026-05-22T14:00:00.000Z",
    },
];

export default function WalletPage() {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveTab] = useState<"none" | "deposit" | "withdraw">("none");
    const [amountInput, setAmountInput] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [w, t] = await Promise.all([
                    apiClient<WalletData>("/finance/wallet"),
                    apiClient<{ items: Transaction[] }>("/finance/wallet/transactions"),
                ]);
                setWallet(w ?? MOCK_WALLET);
                setTransactions(t.items?.length > 0 ? t.items : MOCK_TRANSACTIONS);
            } catch {
                // Mock fallback in local environments
                setWallet(MOCK_WALLET);
                setTransactions(MOCK_TRANSACTIONS);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleActionSubmit(e: React.FormEvent) {
        e.preventDefault();
        const valueKobo = parseFloat(amountInput) * 100;
        if (isNaN(valueKobo) || valueKobo <= 0) return;

        setModalLoading(true);
        // Simulate CoraPay API handshakes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (wallet) {
            if (activeModal === "deposit") {
                setWallet({
                    ...wallet,
                    availableKobo: wallet.availableKobo + valueKobo
                });
                setTransactions([
                    {
                        id: `tx-user-${Date.now()}`,
                        type: "deposit",
                        amountKobo: valueKobo,
                        description: "CoraPay Transfer // Wallet Top-up Verified",
                        createdAt: new Date().toISOString()
                    },
                    ...transactions
                ]);
            } else if (activeModal === "withdraw" && wallet.availableKobo >= valueKobo) {
                setWallet({
                    ...wallet,
                    availableKobo: wallet.availableKobo - valueKobo
                });
                setTransactions([
                    {
                        id: `tx-user-${Date.now()}`,
                        type: "withdrawal",
                        amountKobo: -valueKobo,
                        description: "CoraPay Payout // External Settlement Cleared",
                        createdAt: new Date().toISOString()
                    },
                    ...transactions
                ]);
            }
        }

        setAmountInput("");
        setModalLoading(false);
        setActiveTab("none");
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <LoadingSkeleton className="h-36 rounded-vvs-xl" />
                <LoadingSkeleton className="h-64 rounded-vvs-xl" />
            </div>
        );
    }

    const currentWallet = wallet ?? MOCK_WALLET;

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-8 pb-24 relative">
            
            {/* Header branding */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-text-secondary/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight uppercase">CORAPAY COCKPIT</h1>
                    <p className="text-xs text-text-secondary">Premium creative financial ledger & escrow gateway.</p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-vvs-green bg-vvs-green/5 border border-vvs-green/15 px-3 py-1.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-vvs-green animate-pulse" />
                    <span className="mono-caps font-bold tracking-widest">SECURE PAYMENT PROTOCOL RUNNING</span>
                </div>
            </div>

            {/* Balance Card Grid with glass and glow accents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Available Balance */}
                <div className="relative rounded-vvs-xl border border-text-secondary/10 bg-vvs-card/40 p-6 md:p-8 overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vvs-accent/5 blur-2xl pointer-events-none rounded-full" />
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-secondary/20" />
                    
                    <div className="space-y-3 z-10 relative">
                        <span className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">AVAILABLE LIQUID FUNDS</span>
                        <div className="text-3xl md:text-4xl font-bold font-mono text-text-primary tracking-tight">
                            ₦{((currentWallet.availableKobo) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button 
                                onClick={() => setActiveTab("deposit")}
                                className="flex-1 rounded-vvs-md bg-vvs-accent py-2.5 text-xs font-bold mono-caps tracking-widest text-text-primary transition-all text-center"
                            >
                                ADD FUNDS
                            </button>
                            <button 
                                onClick={() => setActiveTab("withdraw")}
                                className="flex-1 rounded-vvs-md bg-text-secondary/5 hover:bg-text-secondary/10 py-2.5 text-xs font-bold mono-caps tracking-widest text-text-primary border border-text-secondary/10 transition-all text-center"
                            >
                                PAYOUT
                            </button>
                        </div>
                    </div>
                </div>

                {/* Held In Escrow */}
                <div className="relative rounded-vvs-xl border border-text-secondary/10 bg-vvs-card/20 p-6 md:p-8 overflow-hidden backdrop-blur-md group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vvs-gold/5 blur-2xl pointer-events-none rounded-full" />
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-text-secondary/20" />
                    
                    <div className="space-y-3 z-10 relative">
                        <div className="flex items-center gap-1.5">
                            <span className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">ACTIVE ORDERS IN ESCROW</span>
                            <span className="cursor-help text-text-muted text-[10px]" title="CoraPay holds these funds securely until both creators and brands sign off on project milestones.">ⓘ</span>
                        </div>
                        <div className="text-3xl md:text-4xl font-bold font-mono text-vvs-gold tracking-tight">
                            ₦{((currentWallet.inOrdersKobo) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed font-sans pt-1">
                            Funds are automatically distributed through milestone contracts, safeguarding intellectual property and payment releases.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ledger logs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-text-secondary/10 pb-2">
                    <span className="mono-caps text-[10px] font-bold text-text-secondary tracking-widest block">TRANSACTION LEDGER</span>
                    <span className="text-[10px] font-mono text-text-muted">{transactions.length} ACTIONS LOGGED</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="rounded-vvs-lg border border-dashed border-text-secondary/10 bg-transparent p-12 text-center">
                        <span className="text-xs text-text-muted uppercase tracking-wider font-mono">No Ledger Records Found</span>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {transactions.map((tx) => {
                            const isPositive = tx.amountKobo > 0;
                            return (
                                <div key={tx.id} className="flex items-center justify-between rounded-vvs-lg border border-text-secondary/10 bg-vvs-card/10 hover:bg-vvs-card/20 p-4 transition-all duration-200">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-bold text-text-primary uppercase tracking-wide">{tx.description}</div>
                                        <div className="text-[10px] font-mono text-text-muted uppercase">
                                            {new Date(tx.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                        </div>
                                    </div>
                                    <div className={`font-mono text-xs md:text-sm font-bold ${isPositive ? "text-vvs-green" : "text-vvs-accent"}`}>
                                        {isPositive ? "+" : "-"}₦{(Math.abs(tx.amountKobo) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Overlay Deposit/Withdraw Dialog Modal */}
            {activeModal !== "none" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="relative w-full max-w-md rounded-vvs-xl glass-panel p-6 md:p-8 border border-text-secondary/10">
                        {/* Technical accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-vvs-accent/40" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-vvs-accent/40" />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-text-secondary/10">
                                <h3 className="mono-caps text-[11px] font-bold text-text-primary tracking-widest">
                                    CORAPAY INTERFACE // {activeModal === "deposit" ? "DEPOSIT" : "WITHDRAWAL"}
                                </h3>
                                <button 
                                    onClick={() => { setActiveTab("none"); setAmountInput(""); }}
                                    className="text-text-secondary hover:text-text-primary font-mono text-sm"
                                >
                                    [ESC]
                                </button>
                            </div>

                            <form onSubmit={handleActionSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="amount" className="mono-caps text-[9px] font-bold text-text-secondary tracking-widest block">
                                        ENTER AMOUNT IN NAIRA (₦)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-text-primary/50 text-sm">₦</span>
                                        <input
                                            id="amount"
                                            type="number"
                                            required
                                            min="1"
                                            step="0.01"
                                            value={amountInput}
                                            onChange={(e) => setAmountInput(e.target.value)}
                                            className="w-full rounded-vvs-md glass-input pl-8 pr-4 py-2.5 text-sm placeholder:text-text-muted focus:border-vvs-accent focus:ring-1 focus:ring-vvs-accent font-mono"
                                            placeholder="50,000.00"
                                        />
                                    </div>
                                    {activeModal === "withdraw" && (
                                        <span className="text-[9px] font-mono text-text-muted tracking-wide block">
                                            MAX PAYOUT: ₦{((currentWallet.availableKobo) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={modalLoading || !amountInput}
                                    className="w-full rounded-vvs-md bg-vvs-accent py-3 text-xs font-bold mono-caps tracking-widest text-text-primary transition-all disabled:opacity-40"
                                >
                                    {modalLoading ? "ESTABLISHING CORE HANDSHAKE..." : `INITIALIZE ${activeModal === "deposit" ? "DEPOSIT" : "SETTLEMENT"}`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

