import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Proxy: transparently forward /api/* requests to the Next.js API routes.
  // Swap the destination with an external base URL to route to a separate
  // backend without changing any client-side fetch calls.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

export default nextConfig
