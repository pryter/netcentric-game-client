import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"],
    unoptimized: true,
  },
  output: "export",
  assetPrefix: "./", // <--- crucial
};

export default nextConfig;
