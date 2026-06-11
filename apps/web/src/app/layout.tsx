import type { Metadata } from "next";
import { Syne, Outfit, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const syne = Syne({
    variable: "--font-syne",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "700"],
});

export const metadata: Metadata = {
    title: "VVS Members",
    description: "Referral-only marketplace for verified professionals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${syne.variable} ${outfit.variable} ${spaceMono.variable}`}>
            <head>
                <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen bg-black text-text-primary antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

