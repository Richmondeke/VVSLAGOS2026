import type { Metadata } from "next";
import { Jost, Space_Mono } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VVS Lagos | Afromodernism",
  description: "Experience the 5th edition of VVS Lagos - Art, Fashion, and Cultural Extravaganza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-vvs-black text-vvs-white">
        {children}
      </body>
    </html>
  );
}
