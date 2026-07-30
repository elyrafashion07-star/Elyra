import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every image slot is declared in lib/imageSizes.ts. These breakpoints are
    // tuned to the widths those slots actually render at.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [96, 150, 200, 300, 400, 600, 800],
  },
};

export default nextConfig;
