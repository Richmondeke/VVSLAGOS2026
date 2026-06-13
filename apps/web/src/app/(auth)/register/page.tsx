"use client";

import { Suspense } from "react";
import { AuthForm } from "../login/page";

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-vvs-accent border-t-transparent" />
            </div>
        }>
            <AuthForm defaultTab="signup" />
        </Suspense>
    );
}
