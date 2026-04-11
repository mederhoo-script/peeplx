import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { setAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from('User')
      .select('id, email, passwordHash, firstName, lastName, role, status, loginAttempts, lockedUntil')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked. Please try again later.' },
        { status: 403 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Account is ${user.status.toLowerCase()}` },
        { status: 403 }
      )
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash)

    if (!passwordValid) {
      const newAttempts = user.loginAttempts + 1
      const failUpdates: { loginAttempts: number; lockedUntil?: string } = { loginAttempts: newAttempts }

      if (newAttempts >= 5) {
        failUpdates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }

      await supabase.from('User').update(failUpdates).eq('id', user.id)

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await supabase.from('User').update({
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date().toISOString(),
    }).eq('id', user.id)

    await setAuthCookies({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
