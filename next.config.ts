import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hatscripts.github.io",
        pathname: "/circle-flags/flags/*.svg",
      },
    ],
  },
};

export default nextConfig;
