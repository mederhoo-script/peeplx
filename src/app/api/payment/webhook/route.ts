import { NextRequest, NextResponse } from 'next/server'
import { monnifyClient } from '@/lib/monnify'
import { createServerClient } from '@/lib/supabase'
import type { PaymentStatus, PaymentChannel } from '@/types'

interface PaymentRecord {
  id: string
  escrowId: string
  userId: string
  amount: number | string
  reference: string
  monnifyReference: string | null
  status: PaymentStatus
  channel: PaymentChannel | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('monnify-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = await monnifyClient.verifyWebhookSignature(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const webhook = JSON.parse(body)
    const { eventType, eventData } = webhook

    if (eventType === 'SUCCESSFUL_TRANSACTION') {
      const {
        transactionReference,
        paymentReference,
        amountPaid,
        paidOn,
        paymentMethod,
      } = eventData

      const supabase = createServerClient()

      // Look up by paymentReference first, then fall back to transactionReference
      let payment: PaymentRecord | null = null

      const { data: byRef } = await supabase
        .from('Payment')
        .select('*')
        .eq('reference', paymentReference)
        .maybeSingle()

      if (byRef) {
        payment = byRef as PaymentRecord
      } else {
        const { data: byMonnify } = await supabase
          .from('Payment')
          .select('*')
          .eq('monnifyReference', transactionReference)
          .maybeSingle()
        payment = byMonnify as PaymentRecord | null
      }

      if (!payment) {
        console.error('Payment not found for webhook:', paymentReference)
        return NextResponse.json({ success: true })
      }

      if (payment.status === 'COMPLETED') {
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      // Sequential updates — for full atomicity these should be a PostgreSQL function
      await supabase
        .from('Payment')
        .update({
          status: 'COMPLETED',
          paidAt: new Date(paidOn).toISOString(),
          channel: paymentMethod,
        })
        .eq('id', payment.id)

      await supabase
        .from('EscrowTransaction')
        .update({
          status: 'FUNDED',
          fundedAt: new Date().toISOString(),
        })
        .eq('id', payment.escrowId)

      const { data: buyerWallet } = await supabase
        .from('Wallet')
        .select('id, escrowLockedBalance')
        .eq('userId', payment.userId)
        .maybeSingle()

      if (buyerWallet) {
        await supabase
          .from('Wallet')
          .update({
            escrowLockedBalance: Number(buyerWallet.escrowLockedBalance) + Number(payment.amount),
          })
          .eq('userId', payment.userId)
      }

      await supabase.from('Notification').insert({
        userId: payment.userId,
        type: 'PAYMENT_UPDATE',
        title: 'Payment Successful',
        message: `Your payment of ₦${Number(amountPaid).toLocaleString('en-NG')} has been confirmed and the escrow is now funded.`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
