"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
    id: string;
    type: ToastType;
    message: string;
};

type ToastContextType = {
    toast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TYPE_STYLES: Record<ToastType, string> = {
    success: "bg-green-600 text-text-primary",
    error: "bg-red-600 text-text-primary",
    info: "bg-gray-800 text-text-primary",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((type: ToastType, message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto-dismiss after 4s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-80">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`rounded-lg px-4 py-3 text-sm shadow-lg ${TYPE_STYLES[t.type]}`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
