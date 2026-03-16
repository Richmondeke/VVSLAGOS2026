const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return null;
        const data = await res.json();
        accessToken = data.accessToken;
        return accessToken;
    } catch {
        return null;
    }
}

export async function apiClient<T = unknown>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const reqHeaders: Record<string, string> = {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
    };

    if (accessToken) {
        reqHeaders.Authorization = `Bearer ${accessToken}`;
    }

    let res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    });

    if (res.status === 401 && accessToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            reqHeaders.Authorization = `Bearer ${newToken}`;
            res = await fetch(`${API_BASE}${path}`, {
                method,
                headers: reqHeaders,
                body: body ? JSON.stringify(body) : undefined,
                credentials: "include",
            });
        }
    }

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: "Request failed" }));
        throw new ApiError(res.status, errorBody.message ?? "Request failed", errorBody);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public body?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}
