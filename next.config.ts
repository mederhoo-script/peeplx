import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Proxy: when NEXT_PUBLIC_API_URL is set to an external backend, all
  // /api/* requests are forwarded there instead of being handled by the
  // built-in Next.js API routes.  Leave the variable unset (or point it
  // to the same origin) to keep the default behaviour.
  async rewrites() {
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!externalApiUrl) return []

    return [
      {
        source: '/api/:path*',
        destination: `${externalApiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
