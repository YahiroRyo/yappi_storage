import type { NextConfig } from "next";

/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://backend:8000/:path*",
        },
        {
          source: "/static/:path*",
          destination: "http://backend:8000/static/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
