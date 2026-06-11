"use client";

import React, { useEffect } from "react";
import QuizFlow from "@/components/quiz/QuizFlow";
import LiquidNavbar from "@/components/sections/LiquidNavbar";
import { useScroll, useSpring } from "framer-motion";

export default function StyleQuizPage() {
    // For LiquidNavbar to attach its scroll progress
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-[#111111]">
            <LiquidNavbar scrollYProgress={smoothProgress} containerRef={{ current: null }} />
            <QuizFlow />
        </main>
    );
}
