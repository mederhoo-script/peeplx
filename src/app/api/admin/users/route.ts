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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServerClient()

    let query = supabase
      .from('User')
      .select('id, email, firstName, lastName, username, phone, role, status, isEmailVerified, idVerificationStatus, trustScore, createdAt', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    if (status) query = query.eq('status', status)
    if (search) {
      query = query.or(`email.ilike.%${search}%,firstName.ilike.%${search}%,lastName.ilike.%${search}%`)
    }

    const { data: users, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: users || [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin list users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
