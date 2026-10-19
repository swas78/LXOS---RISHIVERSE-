import type { NextConfig } from "next";

// Local dev: the frontend calls same-origin /api/v1/* (see @/lib/axios).
// The demo/item module is served by in-kit mock route handlers.
// LX modules are proxied to the real backend kit (localhost:3010) so we develop
// against the actual API. In RishiVerse, NEXT_PUBLIC_API_URL points at the real gateway.
const LX_BACKEND_URL = process.env.LX_BACKEND_URL || "http://localhost:3010";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return {
            afterFiles: [
                {
                    source: "/api/v1/lx/:path*",
                    destination: `${LX_BACKEND_URL}/api/v1/lx/:path*`,
                },
            ],
        };
    },
};

export default nextConfig;
