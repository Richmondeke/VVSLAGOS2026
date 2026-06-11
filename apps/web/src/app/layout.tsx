import type { Metadata } from "next";
import { Syne, Outfit, Space_Mono } from "next/font/google";
import localFont from "next/font/local";
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

const satoshi = localFont({
    src: [
        {
            path: "../../public/fonts/Satoshi-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../../public/fonts/Satoshi-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../../public/fonts/Satoshi-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../../public/fonts/Satoshi-Black.woff2",
            weight: "900",
            style: "normal",
        },
    ],
    variable: "--font-satoshi",
});

export const metadata: Metadata = {
    title: "VVS Members",
    description: "Referral-only marketplace for verified professionals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${syne.variable} ${outfit.variable} ${spaceMono.variable} ${satoshi.variable}`}>
            <body className="min-h-screen bg-black text-text-primary antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

