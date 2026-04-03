import { NextRequest, NextResponse } from 'next/server'
import { monnifyClient } from '@/lib/monnify'
import { prisma } from '@/lib/prisma'

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

      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { reference: paymentReference },
            { monnifyReference: transactionReference },
          ],
        },
        include: {
          escrow: true,
        },
      })

      if (!payment) {
        console.error('Payment not found for webhook:', paymentReference)
        return NextResponse.json({ success: true })
      }

      if (payment.status === 'COMPLETED') {
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(paidOn),
            channel: paymentMethod as any,
          },
        })

        await tx.escrowTransaction.update({
          where: { id: payment.escrowId },
          data: {
            status: 'FUNDED',
            fundedAt: new Date(),
          },
        })

        const buyerWallet = await tx.wallet.findUnique({
          where: { userId: payment.userId },
        })

        if (buyerWallet) {
          await tx.wallet.update({
            where: { userId: payment.userId },
            data: {
              escrowLockedBalance: {
                increment: payment.amount,
              },
            },
          })
        }

        await tx.notification.create({
          data: {
            userId: payment.userId,
            type: 'PAYMENT_UPDATE',
            title: 'Payment Successful',
            message: `Your payment of ₦${Number(amountPaid).toLocaleString('en-NG')} has been confirmed and the escrow is now funded.`,
          },
        })
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
