import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [escrows, total] = await Promise.all([
      prisma.escrowTransaction.findMany({
        where: {
          OR: [
            { buyerId: tokenPayload.userId },
            { sellerId: tokenPayload.userId },
          ],
        },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.escrowTransaction.count({
        where: {
          OR: [
            { buyerId: tokenPayload.userId },
            { sellerId: tokenPayload.userId },
          ],
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: escrows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
    const { title, description, sellerEmail, sellerId: sellerIdDirect, amount, currency, transactionType, deliveryDays, terms } = body

    if (!title || !amount || !transactionType) {
      return NextResponse.json({ error: 'Missing required fields: title, amount, transactionType' }, { status: 400 })
    }

    // Resolve seller: either by email or direct ID
    let sellerId: string | null = sellerIdDirect || null

    if (!sellerId && sellerEmail) {
      const sellerUser = await prisma.user.findUnique({
        where: { email: sellerEmail },
        select: { id: true },
      })
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

    const escrow = await prisma.escrowTransaction.create({
      data: {
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
      },
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
      data: escrow,
    })
  } catch (error) {
    console.error('Create escrow error:', error)
    return NextResponse.json({ error: 'Failed to create escrow' }, { status: 500 })
  }
}
