import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

const publicPaths = ['/auth/login', '/auth/register', '/']
const authPaths = ['/auth/login', '/auth/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path)) && !pathname.startsWith('/dashboard')) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (authPaths.some(path => pathname.startsWith(path))) {
      const token = request.cookies.get('token')?.value
      
      if (token) {
        try {
          await verifyTokenEdge(token)
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } catch (error) {
          // Token invalid, allow access to auth pages
        }
      }
    }
    return NextResponse.next()
  }
  
  // Check for authentication token
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  try {
    // Verify token
    const payload = await verifyTokenEdge(token)
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Token is invalid or expired
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(url)
    
    // Clear invalid token
    response.cookies.delete('token')
    
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/escrow/:path*',
    '/api/escrow/:path*',
    '/api/user/:path*',
    '/api/payment/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
