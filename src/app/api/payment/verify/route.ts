import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { monnifyClient } from '@/lib/monnify'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: payment } = await supabase
      .from('Payment')
      .select('*, escrow:escrowId(*)')
      .eq('reference', reference)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.userId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        data: { payment, message: 'Payment already completed' },
      })
    }

    const monnifyResponse = await monnifyClient.verifyPayment(
      payment.monnifyReference || reference
    )

    if (!monnifyResponse.requestSuccessful) {
      throw new Error(monnifyResponse.responseMessage)
    }

    const monnifyPayment = monnifyResponse.responseBody

    if (monnifyPayment.paymentStatus === 'PAID') {
      // Run updates sequentially; ideally these would be in a PostgreSQL function for atomicity
      await supabase
        .from('Payment')
        .update({
          status: 'COMPLETED',
          paidAt: new Date(monnifyPayment.paidOn).toISOString(),
          channel: monnifyPayment.paymentMethod,
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

      return NextResponse.json({
        success: true,
        data: {
          payment: { ...payment, status: 'COMPLETED' },
          message: 'Payment verified successfully',
        },
      })
    } else {
      await supabase
        .from('Payment')
        .update({ status: 'FAILED' })
        .eq('id', payment.id)

      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
