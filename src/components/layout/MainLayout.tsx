import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCountdown from "../ui/FloatingCountdown";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <Navbar />
            <FloatingCountdown />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </>
    );
}
