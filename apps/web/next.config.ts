import type { NextConfig } from "next";

const internalApiUrl = process.env.INTERNAL_API_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,

  async rewrites() {
    if (!internalApiUrl) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
