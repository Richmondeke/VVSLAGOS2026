"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/listings");
    }, [router]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-10 w-10 border-2 border-vvs-accent border-t-transparent animate-spin rounded-full mx-auto" />
                <p className="text-xs text-text-secondary font-mono tracking-widest uppercase">
                    LOADING VVS MARKETPLACE...
                </p>
            </div>
        </div>
    );
}
