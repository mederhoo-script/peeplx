import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken, verifyRefreshToken, setAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const payload = await verifyRefreshToken(refreshToken)

    await setAuthCookies(payload)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    )
  }
}
