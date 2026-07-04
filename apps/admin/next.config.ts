import type { NextConfig } from "next";

import path from "path";

const nextConfig = {
    transpilePackages: ["@vvs/contracts"],
    outputFileTracingRoot: path.resolve(__dirname, "../.."),
    turbopack: {
        root: path.resolve(__dirname, "../.."),
    },
} as NextConfig;

export default nextConfig;
