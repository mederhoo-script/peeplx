import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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
        updatedAt: true,
        wallet: true,
        trustScoreData: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUser()

    if (!tokenPayload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, username, phone } = body

    const updateData: any = {}

    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (username) updateData.username = username
    if (phone !== undefined) updateData.phone = phone || null

    const user = await prisma.user.update({
      where: { id: tokenPayload.userId },
      data: updateData,
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
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { user },
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or phone already taken' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
