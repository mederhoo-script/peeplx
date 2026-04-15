import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

interface UserShape {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServerClient()
    const userId = tokenPayload.userId

    // userId is a CUID from a verified JWT — safe to use in the or() filter
    const filter = `buyerId.eq.${userId},sellerId.eq.${userId}`

    const [{ data: escrows }, { count }] = await Promise.all([
      supabase
        .from('EscrowTransaction')
        .select('*')
        .or(filter)
        .order('createdAt', { ascending: false })
        .range(from, to),
      supabase
        .from('EscrowTransaction')
        .select('*', { count: 'exact', head: true })
        .or(filter),
    ])

    // Enrich with buyer/seller user data
    const userIds = [...new Set((escrows || []).flatMap((e) => [e.buyerId, e.sellerId].filter(Boolean)))]
    let userMap: Record<string, UserShape> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('User')
        .select('id, email, firstName, lastName, username')
        .in('id', userIds)

      userMap = Object.fromEntries((users || []).map((u: UserShape) => [u.id, u]))
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
    console.error('Get escrows error:', error)
    return NextResponse.json({ error: 'Failed to fetch escrows' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      sellerEmail,
      sellerId: sellerIdDirect,
      amount,
      currency,
      transactionType,
      deliveryDays,
      terms,
      // When role='seller', the authenticated user IS the seller creating a listing
      role,
    } = body

    if (!title || !amount || !transactionType) {
      return NextResponse.json({ error: 'Missing required fields: title, amount, transactionType' }, { status: 400 })
    }

    const supabase = createServerClient()

    // ── Seller-initiated listing ──────────────────────────────────────────────
    if (role === 'seller') {
      const buyerLinkToken = crypto.randomUUID()

      const { data: escrow, error: escrowError } = await supabase
        .from('EscrowTransaction')
        .insert({
          title,
          description: description || null,
          buyerId: null,
          sellerId: tokenPayload.userId,
          amount: Number(amount),
          currency: currency || 'NGN',
          transactionType: transactionType || 'GOODS',
          deliveryDays: deliveryDays ? Number(deliveryDays) : null,
          terms: terms || null,
          status: 'PENDING',
          sellerInitiated: true,
          buyerLinkToken,
        })
        .select('*')
        .single()

      if (escrowError || !escrow) {
        console.error('Create seller listing error:', escrowError)
        return NextResponse.json(
          {
            error: 'Failed to create listing',
            detail: escrowError?.message ?? null,
            hint: escrowError?.hint ?? null,
          },
          { status: 500 }
        )
      }

      const { data: seller } = await supabase
        .from('User')
        .select('id, email, firstName, lastName')
        .eq('id', tokenPayload.userId)
        .single()

      return NextResponse.json({
        success: true,
        data: { ...escrow, buyer: null, seller },
        buyerLink: `${process.env.NEXT_PUBLIC_APP_URL || ''}/product/${buyerLinkToken}`,
      })
    }

    // ── Buyer-initiated escrow (original flow) ────────────────────────────────
    let sellerId: string | null = sellerIdDirect || null

    if (!sellerId && sellerEmail) {
      const { data: sellerUser } = await supabase
        .from('User')
        .select('id')
        .eq('email', sellerEmail)
        .maybeSingle()

      if (!sellerUser) {
        return NextResponse.json(
          { error: `No user found with email: ${sellerEmail}. They must register on PeeplX first.` },
          { status: 404 }
        )
      }
      if (sellerUser.id === tokenPayload.userId) {
        return NextResponse.json({ error: 'You cannot create an escrow with yourself' }, { status: 400 })
      }
      sellerId = sellerUser.id
    }

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller email or ID is required' }, { status: 400 })
    }

    const { data: escrow, error: escrowError } = await supabase
      .from('EscrowTransaction')
      .insert({
        title,
        description: description || null,
        buyerId: tokenPayload.userId,
        sellerId,
        amount: Number(amount),
        currency: currency || 'NGN',
        transactionType: transactionType || 'GOODS',
        deliveryDays: deliveryDays ? Number(deliveryDays) : null,
        terms: terms || null,
        status: 'PENDING',
        sellerInitiated: false,
      })
      .select('*')
      .single()

    if (escrowError || !escrow) {
      console.error('Create escrow error:', escrowError)
      return NextResponse.json(
        {
          error: 'Failed to create escrow',
          detail: escrowError?.message ?? null,
          hint: escrowError?.hint ?? null,
        },
        { status: 500 }
      )
    }

    const { data: users } = await supabase
      .from('User')
      .select('id, email, firstName, lastName')
      .in('id', [tokenPayload.userId, sellerId])

    const userMap: Record<string, UserShape> = Object.fromEntries(
      (users || []).map((u: UserShape) => [u.id, u])
    )

    return NextResponse.json({
      success: true,
      data: {
        ...escrow,
        buyer: userMap[escrow.buyerId],
        seller: userMap[escrow.sellerId],
      },
    })
  } catch (error) {
    console.error('Create escrow error:', error)
    return NextResponse.json({ error: 'Failed to create escrow' }, { status: 500 })
  }
}
