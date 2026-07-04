import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const oldEnglish = localFont({
  src: "./fonts/Blackiron.ttf",
  variable: "--font-old-english",
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
      className={`${oldEnglish.variable} h-full antialiased`}
    >
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c5a059" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VVS Lagos" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-vvs-black text-vvs-white font-sans">
        {children}
      </body>
    </html>
  );
}
