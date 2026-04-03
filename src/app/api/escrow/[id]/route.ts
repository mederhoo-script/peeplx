import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            trustScore: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            trustScore: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.buyerId !== tokenPayload.userId && escrow.sellerId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: escrow,
    })
  } catch (error) {
    console.error('Get escrow error:', error)
    return NextResponse.json({ error: 'Failed to fetch escrow' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { status, terms, action } = body

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id },
    })

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.buyerId !== tokenPayload.userId && escrow.sellerId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}

    // Handle action-based updates
    if (action) {
      if (action === 'confirm_delivery') {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
      } else if (action === 'dispute') {
        updateData.status = 'DISPUTED'
        updateData.disputedAt = new Date()
      } else if (action === 'cancel') {
        updateData.status = 'CANCELLED'
        updateData.cancelledAt = new Date()
      }
    }

    if (status) {
      updateData.status = status

      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      } else if (status === 'DISPUTED') {
        updateData.disputedAt = new Date()
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
      }
    }

    if (terms !== undefined) {
      updateData.terms = terms
    }

    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedEscrow,
    })
  } catch (error) {
    console.error('Update escrow error:', error)
    return NextResponse.json({ error: 'Failed to update escrow' }, { status: 500 })
  }
}
