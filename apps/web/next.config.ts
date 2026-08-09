import type { NextConfig } from "next";

const internalApiUrl =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
