"use client";

import { useEffect, useState } from "react";

export function ConnectionStatusBanner() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        function handleOnline() { setOnline(true); }
        function handleOffline() { setOnline(false); }

        setOnline(navigator.onLine);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (online) return null;

    return (
        <div className="fixed left-0 right-0 top-14 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-white">
            You&#39;re offline. Some features may be unavailable.
        </div>
    );
}
