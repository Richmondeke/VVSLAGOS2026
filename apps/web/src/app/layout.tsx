import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
    title: "VVS Members",
    description: "Referral-only marketplace for verified professionals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
