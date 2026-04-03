import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        idVerificationStatus: true,
        trustScore: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            availableBalance: true,
            escrowLockedBalance: true,
            pendingBalance: true,
            currency: true,
          },
        },
        trustScoreData: {
          select: {
            score: true,
            totalTransactions: true,
            completedTransactions: true,
            disputeCount: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
