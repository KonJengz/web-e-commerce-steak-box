import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  reactCompiler: true,
};

export default nextConfig;
