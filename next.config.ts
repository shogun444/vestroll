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
  // @ts-ignore: NextConfig type in v16 might have changed or is experiencing a regression
  eslint: {
    ignoreDuringBuilds: true,
  },
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
