import jwt, { type SignOptions } from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'peeplx-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'peeplx-refresh-secret-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: '15m' }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: '7d' }
  return jwt.sign(payload, JWT_REFRESH_SECRET, options)
}

export function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as TokenPayload)
      }
    })
  })
}

export function verifyRefreshToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded as TokenPayload)
      }
    })
  })
}

export async function setAuthCookies(payload: TokenPayload) {
  const token = signToken(payload)
  const refreshToken = signRefreshToken(payload)
  
  const cookieStore = await cookies()
  
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  })
  
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
  
  return { token, refreshToken }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  cookieStore.delete('refreshToken')
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value || null
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('refreshToken')?.value || null
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const token = await getAuthToken()
    if (!token) return null
    
    return await verifyToken(token)
  } catch (error) {
    return null
  }
}
