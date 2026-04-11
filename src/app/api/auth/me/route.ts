import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const [{ data: user }, { data: wallet }, { data: trustScoreData }] = await Promise.all([
      supabase
        .from('User')
        .select('id, email, firstName, lastName, username, phone, role, status, isEmailVerified, idVerificationStatus, trustScore, createdAt')
        .eq('id', tokenPayload.userId)
        .single(),
      supabase
        .from('Wallet')
        .select('id, availableBalance, escrowLockedBalance, pendingBalance, currency')
        .eq('userId', tokenPayload.userId)
        .maybeSingle(),
      supabase
        .from('TrustScore')
        .select('score, totalTransactions, completedTransactions, disputeCount')
        .eq('userId', tokenPayload.userId)
        .maybeSingle(),
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { ...user, wallet, trustScoreData },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
