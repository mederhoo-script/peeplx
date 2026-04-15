import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase'
import { setAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { data: user, error: userError } = await supabase
      .from('User')
      .insert({
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
      })
      .select('id, email, firstName, lastName, role')
      .single()

    if (userError || !user) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }

    // Create wallet and trust score in parallel; clean up the user if either fails
    const [walletResult, trustResult] = await Promise.all([
      supabase.from('Wallet').insert({
        userId: user.id,
        availableBalance: 0,
        escrowLockedBalance: 0,
        pendingBalance: 0,
        currency: 'NGN',
      }),
      supabase.from('TrustScore').insert({
        userId: user.id,
        score: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        disputeCount: 0,
        cancelledCount: 0,
        emailVerified: false,
        phoneVerified: false,
        idVerified: false,
        bvnVerified: false,
        ninVerified: false,
        faceVerified: false,
        addressVerified: false,
      }),
    ])

    if (walletResult.error || trustResult.error) {
      console.error('Setup error — cleaning up user:', walletResult.error ?? trustResult.error)
      await supabase.from('User').delete().eq('id', user.id)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }

    await setAuthCookies({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
