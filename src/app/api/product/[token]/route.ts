import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Public endpoint — no authentication required.
 * Returns product/listing details for a seller-initiated escrow via its unique buyer link token.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: escrow } = await supabase
      .from('EscrowTransaction')
      .select('id, title, description, amount, currency, status, transactionType, deliveryDays, terms, sellerId, sellerInitiated, createdAt')
      .eq('buyerLinkToken', token)
      .eq('sellerInitiated', true)
      .maybeSingle()

    if (!escrow) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: seller } = await supabase
      .from('User')
      .select('id, firstName, lastName, trustScore')
      .eq('id', escrow.sellerId)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        ...escrow,
        seller,
      },
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
