import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: process.env.CODESPACES
        ? [
            `*.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? "app.github.dev"}`,
            "localhost:3000",
            "127.0.0.1:3000",
          ]
        : undefined,
    },
  },
};

export default nextConfig;
