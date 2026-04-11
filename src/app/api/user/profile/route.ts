import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

interface ProfileUpdatePayload {
  firstName?: string
  lastName?: string
  username?: string
  phone?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient()

    const [{ data: user }, { data: wallet }, { data: trustScoreData }] = await Promise.all([
      supabase
        .from('User')
        .select('id, email, firstName, lastName, username, phone, role, status, isEmailVerified, idVerificationStatus, trustScore, createdAt, updatedAt')
        .eq('id', tokenPayload.userId)
        .single(),
      supabase
        .from('Wallet')
        .select('*')
        .eq('userId', tokenPayload.userId)
        .maybeSingle(),
      supabase
        .from('TrustScore')
        .select('*')
        .eq('userId', tokenPayload.userId)
        .maybeSingle(),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { user: { ...user, wallet, trustScoreData } },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, username, phone } = body
    const updateData: ProfileUpdatePayload = {}

    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (username) updateData.username = username
    if (phone !== undefined) updateData.phone = phone || null

    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', tokenPayload.userId)
      .select('id, email, firstName, lastName, username, phone, role, status, isEmailVerified, idVerificationStatus, trustScore, updatedAt')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Username or phone already taken' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
