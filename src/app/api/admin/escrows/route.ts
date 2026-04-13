import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

async function requireAdmin() {
  const tokenPayload = await getCurrentUser()
  if (!tokenPayload) return null
  if (tokenPayload.role !== 'ADMIN') return null
  return tokenPayload
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServerClient()

    let query = supabase
      .from('EscrowTransaction')
      .select('id, title, amount, currency, status, transactionType, sellerId, buyerId, sellerInitiated, createdAt, updatedAt', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)

    const { data: escrows, count, error } = await query

    if (error) throw error

    // Enrich with user names
    const userIds = [...new Set((escrows || []).flatMap((e) => [e.buyerId, e.sellerId].filter(Boolean)))]
    let userMap: Record<string, { id: string; firstName: string; lastName: string; email: string }> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('User')
        .select('id, firstName, lastName, email')
        .in('id', userIds)
      userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))
    }

    const enriched = (escrows || []).map((e) => ({
      ...e,
      buyer: e.buyerId ? userMap[e.buyerId] : null,
      seller: userMap[e.sellerId],
    }))

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin list escrows error:', error)
    return NextResponse.json({ error: 'Failed to fetch escrows' }, { status: 500 })
  }
}
