import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Extra origins allowed to load dev assets (Cloud previews need this).
  allowedDevOrigins: process.env.NEXT_DEV_ORIGIN ? [process.env.NEXT_DEV_ORIGIN] : [],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
