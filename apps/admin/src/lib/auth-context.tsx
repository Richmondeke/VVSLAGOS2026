"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient, setAccessToken, ApiError } from "./api-client";

type AdminUser = {
    id: string;
    email: string;
    status: string;
    role?: string;
};

type AuthState = {
    user: AdminUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<{ user: AdminUser; accessToken: string }>("/auth/refresh", {
                    method: "POST",
                });
                setAccessToken(data.accessToken);
                setUser(data.user);
                document.cookie = "vvs_admin_logged_in=1; path=/; max-age=2592000";
            } catch {
                setAccessToken(null);
                setUser(null);
                document.cookie = "vvs_admin_logged_in=; path=/; max-age=0";
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiClient<{ user: AdminUser; accessToken: string }>("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        setAccessToken(data.accessToken);
        setUser(data.user);
        document.cookie = "vvs_admin_logged_in=1; path=/; max-age=2592000";
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiClient("/auth/logout", { method: "POST" });
        } catch {
            // ignore
        }
        setAccessToken(null);
        setUser(null);
        document.cookie = "vvs_admin_logged_in=; path=/; max-age=0";
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
