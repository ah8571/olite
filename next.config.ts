import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/compliance-foundations",
        destination: "/what-olite-checks",
        permanent: true
      }
    ];
  }
};

export default nextConfig;