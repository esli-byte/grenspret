import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Geen image optimization bij static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
