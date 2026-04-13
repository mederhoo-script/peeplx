import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import type { UserStatus, UserRole, IdVerificationStatus } from '@/types'

interface UserUpdatePayload {
  status?: UserStatus
  role?: UserRole
  idVerificationStatus?: IdVerificationStatus
}

async function requireAdmin() {
  const tokenPayload = await getCurrentUser()
  if (!tokenPayload) return null
  if (tokenPayload.role !== 'ADMIN') return null
  return tokenPayload
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createServerClient()

    const [{ data: user }, { data: trustScore }, { data: wallet }, { count: escrowCount }] = await Promise.all([
      supabase
        .from('User')
        .select('id, email, firstName, lastName, username, phone, role, status, isEmailVerified, idVerificationStatus, trustScore, createdAt, updatedAt')
        .eq('id', id)
        .single(),
      supabase.from('TrustScore').select('*').eq('userId', id).maybeSingle(),
      supabase.from('Wallet').select('*').eq('userId', id).maybeSingle(),
      supabase.from('EscrowTransaction').select('*', { count: 'exact', head: true }).or(`buyerId.eq.${id},sellerId.eq.${id}`),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { ...user, trustScoreData: trustScore, wallet, escrowCount: escrowCount ?? 0 },
    })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, role, idVerificationStatus } = body

    const updateData: UserUpdatePayload = {}
    if (status) updateData.status = status as UserStatus
    if (role) updateData.role = role as UserRole
    if (idVerificationStatus) updateData.idVerificationStatus = idVerificationStatus as IdVerificationStatus

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select('id, email, firstName, lastName, role, status, idVerificationStatus, trustScore')
      .single()

    if (error || !user) {
      throw error || new Error('User not found')
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
