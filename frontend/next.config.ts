import type { NextConfig } from "next";

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
          source: "/grpc/:path*",
          destination: "http://backend:9000/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
