import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </>
    );
}
