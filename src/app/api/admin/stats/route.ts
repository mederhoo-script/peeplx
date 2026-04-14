import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

async function requireAdmin() {
  const tokenPayload = await getCurrentUser()
  if (!tokenPayload) return null
  if (tokenPayload.role !== 'ADMIN') return null
  return tokenPayload
}

export async function GET(_request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = createServerClient()

    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalEscrows },
      { count: completedEscrows },
      { count: disputedEscrows },
      { count: pendingEscrows },
    ] = await Promise.all([
      supabase.from('User').select('*', { count: 'exact', head: true }),
      supabase.from('User').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('EscrowTransaction').select('*', { count: 'exact', head: true }),
      supabase.from('EscrowTransaction').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      supabase.from('EscrowTransaction').select('*', { count: 'exact', head: true }).eq('status', 'DISPUTED'),
      supabase.from('EscrowTransaction').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    ])

    // Total platform volume
    const { data: volumeData } = await supabase
      .from('EscrowTransaction')
      .select('amount')
      .eq('status', 'COMPLETED')

    const totalVolume = (volumeData || []).reduce((sum, e) => sum + Number(e.amount), 0)

    return NextResponse.json({
      success: true,
      data: {
        users: { total: totalUsers ?? 0, active: activeUsers ?? 0 },
        escrows: {
          total: totalEscrows ?? 0,
          completed: completedEscrows ?? 0,
          disputed: disputedEscrows ?? 0,
          pending: pendingEscrows ?? 0,
        },
        totalVolume,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
