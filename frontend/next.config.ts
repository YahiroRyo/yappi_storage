import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rules: {
    "@next/next/no-img-element": "off",
  },
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
          source: "/storage/:path*",
          destination: "http://backend:8000/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
