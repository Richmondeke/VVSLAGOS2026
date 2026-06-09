"use client";

import React, { useEffect, useRef } from "react";

// Authentic, simplified Nsibidi symbols represented as SVG path strings (designed on an 80x80 canvas grid)
const NSIBIDI_PATHS = [
    // 1. Unity / Union (conjoined loops / circles)
    "M 15 40 C 15 25, 25 15, 40 15 C 55 15, 65 25, 65 40 C 65 55, 55 65, 40 65 C 25 65, 15 55, 15 40 Z M 25 40 C 25 48, 32 55, 40 55 C 48 55, 55 48, 55 40 C 55 32, 48 25, 40 25 C 32 25, 25 32, 25 40 Z",
    // 2. Love / Conjoined Hearts
    "M 25 45 C 25 30, 40 30, 40 45 C 40 60, 25 70, 25 70 C 25 70, 10 60, 10 45 C 10 30, 25 30, 25 45 Z M 55 45 C 55 30, 70 30, 70 45 C 70 60, 55 70, 55 70 C 55 70, 40 60, 40 45 C 40 30, 55 30, 55 45 Z",
    // 3. Mirror / Soul (Diamond within diamond)
    "M 40 10 L 70 40 L 40 70 L 10 40 Z M 40 22 L 58 40 L 40 58 L 22 40 Z",
    // 4. Journey / Path (Wavy line with end nodes)
    "M 15 40 Q 30 15, 45 40 T 75 40 M 15 40 A 4 4 0 1 1 15 39.9 M 75 40 A 4 4 0 1 1 75 39.9",
    // 5. Speech / Voice (Double nested crescent / arcs)
    "M 40 10 A 30 30 0 0 1 70 40 A 30 30 0 0 1 40 70 A 30 30 0 0 1 10 40 A 30 30 0 0 1 40 10 Z M 40 20 A 20 20 0 0 0 20 40 A 20 20 0 0 0 40 60 A 20 20 0 0 0 60 40 A 20 20 0 0 0 40 20 Z",
    // 6. Creator / Sun (Sunburst / Cross)
    "M 40 10 L 40 70 M 10 40 L 70 40 M 18 18 L 62 62 M 18 62 L 62 18",
    // 7. Fire / Light (Triangular flame-like motif)
    "M 40 10 L 60 55 L 40 45 L 20 55 Z M 40 25 L 50 50 L 40 42 L 30 50 Z"
];

export default function NsibidiRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize handler to fit container bounds
        const resizeCanvas = () => {
            const rect = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Precompile Path2D objects for high performance
        const compiledPaths = NSIBIDI_PATHS.map((p) => new Path2D(p));

        // Setup columns
        const fontSize = 24;
        const columnsCount = Math.floor(canvas.width / fontSize) + 1;
        
        interface RainDrop {
            x: number;
            y: number;
            speed: number;
            symbols: number[]; // Sequence of symbol indices falling
            size: number;
            opacity: number;
            glow: boolean;
            depth: number; // 3D depth layer factor (0.2 to 1.0)
        }

        const streams: RainDrop[] = [];

        // Initialize streams with 3D depth layering
        for (let i = 0; i < columnsCount; i++) {
            const depth = Math.random() * 0.8 + 0.2; // depth layer (0.2 = background, 1.0 = foreground)
            const size = depth * 14 + 10; // size based on depth (12.8px to 24px)
            const speed = depth * 2.5 + 1.0; // speed based on depth (1.5px to 3.5px per frame)
            const opacity = depth * 0.35 + 0.1; // opacity based on depth

            streams.push({
                x: i * fontSize + (Math.random() * 6 - 3),
                y: Math.random() * -canvas.height - 100,
                speed,
                symbols: Array.from({ length: 15 }, () => Math.floor(Math.random() * compiledPaths.length)),
                size,
                opacity,
                glow: depth > 0.8 && Math.random() > 0.7, // Only foreground drops can glow
                depth
            });
        }

        let animationFrameId: number;
        let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
        let scrollSpeed = 0;

        // Draw loop
        const draw = () => {
            // Calculate scroll speed for velocity acceleration
            const currentScrollY = typeof window !== "undefined" ? window.scrollY : 0;
            const deltaScroll = Math.abs(currentScrollY - lastScrollY);
            scrollSpeed = scrollSpeed * 0.9 + deltaScroll * 0.1; // Smooth decay
            lastScrollY = currentScrollY;

            // Clear canvas with trail overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Compute dynamic 3D scroll shift
            const scrollOffset = -currentScrollY;

            streams.forEach((stream) => {
                // Mutate symbol sequence for organic feel
                if (Math.random() > 0.98) {
                    stream.symbols.shift();
                    stream.symbols.push(Math.floor(Math.random() * compiledPaths.length));
                }

                // Scroll shift scales with column depth (deeper elements move slower)
                const streamScrollShift = scrollOffset * stream.depth * 0.45;

                // Draw symbols
                stream.symbols.forEach((symbolIdx, depthIndex) => {
                    const symbolY = (stream.y - depthIndex * (stream.size * 1.3)) + streamScrollShift;
                    if (symbolY < -50 || symbolY > canvas.height + 50) return;

                    ctx.save();
                    ctx.translate(stream.x, symbolY);
                    
                    // Center the scaling of the 80x80 design grid
                    const scale = stream.size / 80;
                    ctx.scale(scale, scale);

                    // Fade symbols at the top of the trail
                    const trailFade = 1 - depthIndex / stream.symbols.length;
                    const finalOpacity = stream.opacity * trailFade;

                    ctx.fillStyle = `rgba(197, 160, 89, ${finalOpacity})`; // Gold: #C5A059
                    
                    if (stream.glow && depthIndex === 0) {
                        ctx.shadowColor = "#c5a059";
                        ctx.shadowBlur = 12;
                    }

                    ctx.fill(compiledPaths[symbolIdx]);
                    ctx.restore();
                });

                // Acceleration draft proportional to scroll velocity and depth
                const dynamicSpeed = stream.speed + (scrollSpeed * 0.12 * stream.depth);
                stream.y += dynamicSpeed;

                // Reset stream to top of viewport when it falls past screen bounds
                const topSymbolY = stream.y - stream.symbols.length * (stream.size * 1.3) + streamScrollShift;
                if (topSymbolY > canvas.height) {
                    stream.y = -streamScrollShift - 100;
                    stream.speed = stream.depth * 2.5 + 1.0;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
            style={{
                maskImage: "linear-gradient(to bottom, black 50%, rgba(0,0,0,0.3) 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 50%, rgba(0,0,0,0.3) 80%, transparent 100%)"
            }}
        />
    );
}
