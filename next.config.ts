import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Geen image optimization nodig (PWA met eigen assets)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
