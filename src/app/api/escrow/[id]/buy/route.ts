import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { monnifyClient } from '@/lib/monnify'
import { createServerClient } from '@/lib/supabase'
import { generateReference } from '@/lib/utils'

/**
 * POST /api/escrow/[id]/buy
 *
 * Authenticated buyer claims a seller-initiated listing and initialises payment.
 * Sets buyerId on the EscrowTransaction and immediately kicks off Monnify checkout.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: escrow } = await supabase
      .from('EscrowTransaction')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!escrow) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!escrow.sellerInitiated) {
      return NextResponse.json({ error: 'This escrow is not a seller listing' }, { status: 400 })
    }

    if (escrow.buyerId) {
      return NextResponse.json({ error: 'This listing has already been claimed by a buyer' }, { status: 409 })
    }

    if (escrow.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot purchase a listing with status: ${escrow.status}` }, { status: 400 })
    }

    if (escrow.sellerId === tokenPayload.userId) {
      return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })
    }

    // Claim the listing by setting buyerId
    const { data: claimedEscrow, error: claimError } = await supabase
      .from('EscrowTransaction')
      .update({ buyerId: tokenPayload.userId })
      .eq('id', id)
      .is('buyerId', null) // optimistic lock — only update if still unclaimed
      .select('id')
      .maybeSingle()

    if (claimError) {
      console.error('Claim escrow error:', claimError)
      return NextResponse.json({ error: 'Failed to claim listing' }, { status: 500 })
    }

    if (!claimedEscrow) {
      return NextResponse.json({ error: 'This listing has just been claimed by another buyer' }, { status: 409 })
    }

    // Fetch buyer details for Monnify
    const { data: buyer } = await supabase
      .from('User')
      .select('id, firstName, lastName, email')
      .eq('id', tokenPayload.userId)
      .single()

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    const escrowAmountNaira = Number(escrow.amount)
    const serviceFee = escrowAmountNaira * 0.015
    const totalAmount = escrowAmountNaira + serviceFee

    const reference = generateReference('ESCROW')

    const { data: payment, error: paymentError } = await supabase
      .from('Payment')
      .insert({
        escrowId: id,
        userId: tokenPayload.userId,
        amount: escrow.amount,
        reference,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError)
      // Roll back the buyer claim if payment creation fails
      await supabase.from('EscrowTransaction').update({ buyerId: null }).eq('id', id)
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
    }

    const monnifyResponse = await monnifyClient.initializePayment({
      amount: totalAmount,
      customerName: `${buyer.firstName} ${buyer.lastName}`,
      customerEmail: buyer.email,
      paymentReference: reference,
      paymentDescription: `PeeplX Escrow: ${escrow.title}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback?ref=${reference}&escrowId=${id}`,
      metadata: {
        escrowId: id,
        paymentId: payment.id,
        buyerId: tokenPayload.userId,
      },
    })

    if (!monnifyResponse.requestSuccessful) {
      await supabase.from('Payment').delete().eq('id', payment.id)
      await supabase.from('EscrowTransaction').update({ buyerId: null }).eq('id', id)
      throw new Error(monnifyResponse.responseMessage)
    }

    await supabase
      .from('Payment')
      .update({ monnifyReference: monnifyResponse.responseBody.transactionReference })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: monnifyResponse.responseBody.checkoutUrl,
        reference,
        paymentId: payment.id,
        escrowId: id,
      },
    })
  } catch (error: any) {
    console.error('Buy listing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
