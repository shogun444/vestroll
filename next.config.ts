import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  serverExternalPackages: ["ioredis"],
  turbopack: {
    root: join(__dirname), // Set the root to the current directory dynamically
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  allowedDevOrigins: ["10.199.228.216"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path((?!v1/).*)",
        destination: "/api/v1/:path",
      },
    ];
  },
};

export default nextConfig;
