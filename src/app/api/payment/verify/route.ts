import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { monnifyClient } from '@/lib/monnify'
import { prisma } from '@/lib/prisma'

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

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        escrow: true,
      },
    })

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
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(monnifyPayment.paidOn),
            channel: monnifyPayment.paymentMethod as any,
          },
        })

        // Update escrow
        await tx.escrowTransaction.update({
          where: { id: payment.escrowId },
          data: {
            status: 'FUNDED',
            fundedAt: new Date(),
          },
        })

        // Update buyer wallet
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
      })

      return NextResponse.json({
        success: true,
        data: {
          payment: {
            ...payment,
            status: 'COMPLETED',
          },
          message: 'Payment verified successfully',
        },
      })
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      })

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
