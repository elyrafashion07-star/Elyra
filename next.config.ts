import type { NextConfig } from "next";

/**
 * Product photos are served from the Supabase Storage bucket, and next/image
 * refuses any remote host that is not listed below. Derived from the env var so
 * this keeps working when the project ref changes between environments.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https" as const,
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Every image slot is declared in lib/imageSizes.ts. These breakpoints are
    // tuned to the widths those slots actually render at.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [96, 150, 200, 300, 400, 600, 800],
  },
};

export default nextConfig;
