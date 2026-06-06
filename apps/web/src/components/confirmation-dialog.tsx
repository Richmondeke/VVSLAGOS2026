"use client";

type Variant = "default" | "destructive" | "money";

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
    amount?: number; // kobo, for money variant
    loading?: boolean;
};

const VARIANT_STYLES: Record<Variant, { button: string; border: string }> = {
    default: {
        button: "bg-vvs-accent hover:bg-vvs-accent/90 text-text-primary",
        border: "border-gray-200",
    },
    destructive: {
        button: "bg-red-600 hover:bg-red-700 text-text-primary",
        border: "border-red-200",
    },
    money: {
        button: "bg-vvs-green hover:bg-vvs-green/90 text-text-primary",
        border: "border-green-200",
    },
};

export function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    amount,
    loading = false,
}: Props) {
    if (!open) return null;

    const styles = VARIANT_STYLES[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-sm rounded-xl border bg-white p-6 shadow-lg ${styles.border}`}>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mb-4 text-sm text-gray-600">{message}</p>

                {variant === "money" && amount != null && (
                    <div className="mb-4 rounded-lg bg-green-50 p-3 text-center">
                        <span className="text-2xl font-bold text-green-700">
                            &#8358;{(amount / 100).toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles.button}`}
                    >
                        {loading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
