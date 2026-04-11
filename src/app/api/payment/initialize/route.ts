import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { monnifyClient } from '@/lib/monnify'
import { createServerClient } from '@/lib/supabase'
import { generateReference } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { escrowId } = body

    if (!escrowId) {
      return NextResponse.json({ error: 'escrowId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: escrow } = await supabase
      .from('EscrowTransaction')
      .select('*')
      .eq('id', escrowId)
      .single()

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.buyerId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Only the buyer can fund this escrow' }, { status: 403 })
    }

    if (escrow.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot fund an escrow with status: ${escrow.status}` }, { status: 400 })
    }

    const { data: buyer } = await supabase
      .from('User')
      .select('id, firstName, lastName, email')
      .eq('id', escrow.buyerId)
      .single()

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    // Amount comes from escrow record, NOT client input — prevents tampering
    const escrowAmountNaira = Number(escrow.amount)
    const serviceFee = escrowAmountNaira * 0.015
    const totalAmount = escrowAmountNaira + serviceFee

    const reference = generateReference('ESCROW')

    const { data: payment, error: paymentError } = await supabase
      .from('Payment')
      .insert({
        escrowId,
        userId: tokenPayload.userId,
        amount: escrow.amount,
        reference,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
    }

    const monnifyResponse = await monnifyClient.initializePayment({
      amount: totalAmount,
      customerName: `${buyer.firstName} ${buyer.lastName}`,
      customerEmail: buyer.email,
      paymentReference: reference,
      paymentDescription: `PeeplX Escrow: ${escrow.title}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback?ref=${reference}&escrowId=${escrowId}`,
      metadata: {
        escrowId,
        paymentId: payment.id,
        buyerId: tokenPayload.userId,
      },
    })

    if (!monnifyResponse.requestSuccessful) {
      await supabase.from('Payment').delete().eq('id', payment.id)
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
      },
    })
  } catch (error: any) {
    console.error('Initialize payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
