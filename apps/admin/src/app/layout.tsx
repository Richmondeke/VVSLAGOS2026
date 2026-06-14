import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
    title: "VVS Admin",
    description: "VVS Platform Administration Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-admin-surface text-gray-900 antialiased relative">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
