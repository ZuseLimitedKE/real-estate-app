import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ofpovz6nk9.ufs.sh",
      },
    ],
  },
  serverExternalPackages: ['bcrypt', 'mongodb'],
}

export default nextConfig