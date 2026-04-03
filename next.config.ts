import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    domains: [],
    remotePatterns: [],
  },
}

export default nextConfig
