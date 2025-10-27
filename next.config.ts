import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // experimental: {
  //   globalNotFound: true,
  // },
// next.config.js


  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://15.164.100.73/api/v1/:path*", // bypass corws
      },
    ];
  },
  webpack(config) {
    // webpack 설정 (개발 환경에서 사용)
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
