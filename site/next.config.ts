import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://assets.aceternity.com/**"),
      {
        protocol: "https",
        hostname: "ofpovz6nk9.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "qr8srv4laj.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;
