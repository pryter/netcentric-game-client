import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [    {
      protocol: "https",
      hostname: "*", // Allow images from all domains
    }],
    unoptimized: true,
  },
  output: "export",
  distDir: "electron/out",
  assetPrefix: "./",
};

export default nextConfig;
