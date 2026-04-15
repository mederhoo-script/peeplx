import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

/**
 * Protected route prefixes — any pathname starting with one of these
 * requires a valid access token (or at least a refresh token).
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/sell',
  '/escrow',
  '/profile',
  '/payment/callback',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // If there is no token at all but there is a refresh token, let the
  // page load — the client-side code will call /api/auth/refresh or
  // redirect to login when the API returns 401.
  if (!token && refreshToken) {
    return NextResponse.next()
  }

  // No credentials at all → redirect straight to login.
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await verifyTokenEdge(token)
    return NextResponse.next()
  } catch {
    // Access token invalid/expired.
    if (refreshToken) {
      // Refresh token still present → let the page load; the client
      // will hit the API, receive 401, and redirect to login.
      return NextResponse.next()
    }

    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sell/:path*',
    '/escrow/:path*',
    '/profile/:path*',
    '/payment/callback/:path*',
  ],
}
