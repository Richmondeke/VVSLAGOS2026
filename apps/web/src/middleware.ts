import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Allow API routes and static assets
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
        return NextResponse.next();
    }

    // Check for refresh token cookie (presence only — validation happens server-side)
    const refreshToken = request.cookies.get("refresh_token");
    if (!refreshToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
