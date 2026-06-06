"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient, setAccessToken, getAccessToken, ApiError } from "./api-client";

type User = {
    id: string;
    email: string;
    status: string;
    name?: string;
    reputationLevel?: string;
    discipline?: string;
    streak?: number;
    xp?: number;
    avatarUrl?: string;
    bio?: string;
    links?: Array<{ title: string; url: string; type?: "link" | "file" | "pdf" }>;
};

type AuthState = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, inviteCode: string) => Promise<void>;
    logout: () => Promise<void>;
    addXp: (amount: number) => void;
    xp: number;
    updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [xp, setXp] = useState(6420);

    // Initialize XP from localStorage on client side
    useEffect(() => {
        const storedXp = localStorage.getItem("vvs_xp");
        if (storedXp) {
            setXp(Number(storedXp));
        }
    }, []);

    // Try to restore session on mount
    useEffect(() => {
        (async () => {
            try {
                try {
                    const data = await apiClient<{ user: User; accessToken: string }>("/auth/refresh", {
                        method: "POST",
                    });
                    setAccessToken(data.accessToken);
                    setUser(data.user);
                    document.cookie = "vvs_logged_in=1; path=/; max-age=2592000";
                } catch (err) {
                    console.warn("Session restore from backend failed. Trying local storage mock session.", err);
                    // Check localStorage for mock session fallback
                    const mockSession = localStorage.getItem("mock_session");
                    if (mockSession) {
                        const parsed = JSON.parse(mockSession);
                        if (!parsed.avatarUrl) {
                            parsed.avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                            localStorage.setItem("mock_session", JSON.stringify(parsed));
                        }
                        setUser(parsed);
                        document.cookie = "vvs_logged_in=1; path=/; max-age=2592000";
                    } else {
                        setAccessToken(null);
                        setUser(null);
                        document.cookie = "vvs_logged_in=; path=/; max-age=0";
                    }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const data = await apiClient<{ user: User; accessToken: string }>("/auth/login", {
                method: "POST",
                body: { email, password },
            });
            setAccessToken(data.accessToken);
            setUser(data.user);
            // Set indicator cookie for middleware (not httpOnly — readable by Next.js middleware)
            document.cookie = "vvs_logged_in=1; path=/; max-age=2592000"; // 30 days
        } catch (err) {
            console.warn("Backend login failed. Falling back to Mock Mode.", err);
            // Mock Login Success for local testing/presentation
            const mockUser: User = {
                id: "mock-user-id",
                email: email || "mock@example.com",
                status: "approved",
                name: "Amina Osei",
                reputationLevel: "Visionary",
                discipline: "Editorial Director & Fashion Designer",
                streak: 18,
                xp: 6420,
                avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            };
            setUser(mockUser);
            document.cookie = "vvs_logged_in=1; path=/; max-age=2592000";
            localStorage.setItem("mock_session", JSON.stringify(mockUser));
        }
    }, []);

    const register = useCallback(async (email: string, password: string, inviteCode: string) => {
        try {
            const data = await apiClient<{ user: User; accessToken?: string }>("/auth/register", {
                method: "POST",
                body: { email, password, inviteCode },
            });
            if (data.accessToken) {
                setAccessToken(data.accessToken);
            }
            setUser(data.user);
        } catch (err) {
            console.warn("Backend registration failed. Falling back to Mock Mode.", err);
            const mockUser: User = {
                id: "mock-user-id",
                email: email || "mock@example.com",
                status: "approved",
                name: "Amina Osei",
                reputationLevel: "Visionary",
                discipline: "Editorial Director & Fashion Designer",
                streak: 18,
                xp: 6420,
                avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            };
            setUser(mockUser);
            document.cookie = "vvs_logged_in=1; path=/; max-age=2592000";
            localStorage.setItem("mock_session", JSON.stringify(mockUser));
        }
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
        localStorage.removeItem("mock_session");
    }, []);

    const addXp = useCallback((amount: number) => {
        setXp((prev) => {
            const next = prev + amount;
            localStorage.setItem("vvs_xp", String(next));
            return next;
        });
    }, []);

    const updateUser = useCallback((updates: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const next = { ...prev, ...updates };
            localStorage.setItem("mock_session", JSON.stringify(next));
            return next;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, addXp, xp, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
