import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { recalculateUserTrustScore } from '@/lib/trust-score'
import type { VerificationType } from '@/types'

// Maps VerificationType to the TrustScore column name
const VERIFICATION_COLUMN: Record<VerificationType, string> = {
  email: 'emailVerified',
  phone: 'phoneVerified',
  bvn: 'bvnVerified',
  nin: 'ninVerified',
  face: 'faceVerified',
  address: 'addressVerified',
  id: 'idVerified',
}

/**
 * POST /api/user/verify
 *
 * Marks one or more verification items as submitted for the current user.
 * In a production system each item would require backend document/data
 * verification before being marked true. For now it is self-attested so
 * the system records the submission and recalculates the trust score.
 *
 * Body: { type: VerificationType }
 */
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body as { type: VerificationType }

    if (!type || !VERIFICATION_COLUMN[type]) {
      return NextResponse.json(
        { error: `Invalid verification type. Must be one of: ${Object.keys(VERIFICATION_COLUMN).join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Ensure TrustScore row exists
    const { data: existing } = await supabase
      .from('TrustScore')
      .select('id')
      .eq('userId', tokenPayload.userId)
      .maybeSingle()

    if (!existing) {
      await supabase.from('TrustScore').insert({ userId: tokenPayload.userId })
    }

    const column = VERIFICATION_COLUMN[type]

    await supabase
      .from('TrustScore')
      .update({ [column]: true })
      .eq('userId', tokenPayload.userId)

    // Also update User.isEmailVerified for email type
    if (type === 'email') {
      await supabase
        .from('User')
        .update({ isEmailVerified: true })
        .eq('id', tokenPayload.userId)
    }

    const newScore = await recalculateUserTrustScore(tokenPayload.userId)

    return NextResponse.json({
      success: true,
      data: { type, verified: true, trustScore: newScore },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

/**
 * GET /api/user/verify
 * Returns the current user's verification status.
 */
export async function GET(_request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: ts } = await supabase
      .from('TrustScore')
      .select('emailVerified, phoneVerified, idVerified, bvnVerified, ninVerified, faceVerified, addressVerified, score')
      .eq('userId', tokenPayload.userId)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      data: ts || {
        emailVerified: false,
        phoneVerified: false,
        idVerified: false,
        bvnVerified: false,
        ninVerified: false,
        faceVerified: false,
        addressVerified: false,
        score: 0,
      },
    })
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
  }
}
