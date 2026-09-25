import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.phototourl.com",
      },
    ],
  },
};

export default nextConfig;
