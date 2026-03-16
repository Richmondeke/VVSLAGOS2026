"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient, setAccessToken, getAccessToken, ApiError } from "./api-client";

type User = {
    id: string;
    email: string;
    status: string;
};

type AuthState = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, inviteCode: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Try to restore session on mount
    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<{ user: User; accessToken: string }>("/auth/refresh", {
                    method: "POST",
                });
                setAccessToken(data.accessToken);
                setUser(data.user);
                document.cookie = "vvs_logged_in=1; path=/; max-age=2592000";
            } catch {
                setAccessToken(null);
                setUser(null);
                document.cookie = "vvs_logged_in=; path=/; max-age=0";
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiClient<{ user: User; accessToken: string }>("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        setAccessToken(data.accessToken);
        setUser(data.user);
        // Set indicator cookie for middleware (not httpOnly — readable by Next.js middleware)
        document.cookie = "vvs_logged_in=1; path=/; max-age=2592000"; // 30 days
    }, []);

    const register = useCallback(async (email: string, password: string, inviteCode: string) => {
        const data = await apiClient<{ user: User; accessToken?: string }>("/auth/register", {
            method: "POST",
            body: { email, password, inviteCode },
        });
        if (data.accessToken) {
            setAccessToken(data.accessToken);
        }
        setUser(data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiClient("/auth/logout", { method: "POST" });
        } catch {
            // ignore
        }
        setAccessToken(null);
        setUser(null);
        document.cookie = "vvs_logged_in=; path=/; max-age=0"; // clear indicator
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
