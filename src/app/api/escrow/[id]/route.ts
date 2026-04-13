import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { updateTrustScoreForTransaction } from '@/lib/trust-score'
import type { EscrowStatus } from '@/types'

interface EscrowUpdatePayload {
  status?: EscrowStatus
  terms?: string
  completedAt?: string
  disputedAt?: string
  cancelledAt?: string
}

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

    const supabase = createServerClient()

    const { data: escrow } = await supabase
      .from('EscrowTransaction')
      .select('*')
      .eq('id', id)
      .single()

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.buyerId !== tokenPayload.userId && escrow.sellerId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch buyer, seller, and payments in parallel
    const involvedIds = [escrow.sellerId, ...(escrow.buyerId ? [escrow.buyerId] : [])]
    const [{ data: users }, { data: payments }] = await Promise.all([
      supabase
        .from('User')
        .select('id, email, firstName, lastName, username, trustScore')
        .in('id', involvedIds),
      supabase
        .from('Payment')
        .select('*')
        .eq('escrowId', id)
        .order('createdAt', { ascending: false }),
    ])

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))

    return NextResponse.json({
      success: true,
      data: {
        ...escrow,
        buyer: escrow.buyerId ? userMap[escrow.buyerId] : null,
        seller: userMap[escrow.sellerId],
        payments: payments || [],
      },
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

    const supabase = createServerClient()

    const { data: escrow } = await supabase
      .from('EscrowTransaction')
      .select('id, buyerId, sellerId, status')
      .eq('id', id)
      .single()

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (escrow.buyerId !== tokenPayload.userId && escrow.sellerId !== tokenPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { status, terms, action } = body
    const updateData: EscrowUpdatePayload = {}

    let trustOutcome: 'completed' | 'disputed' | 'cancelled' | null = null

    if (action) {
      if (action === 'confirm_delivery') {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date().toISOString()
        trustOutcome = 'completed'
      } else if (action === 'dispute') {
        updateData.status = 'DISPUTED'
        updateData.disputedAt = new Date().toISOString()
        trustOutcome = 'disputed'
      } else if (action === 'cancel') {
        updateData.status = 'CANCELLED'
        updateData.cancelledAt = new Date().toISOString()
        trustOutcome = 'cancelled'
      }
    }

    if (status) {
      updateData.status = status as EscrowStatus
      if (status === 'COMPLETED') { updateData.completedAt = new Date().toISOString(); trustOutcome = 'completed' }
      else if (status === 'DISPUTED') { updateData.disputedAt = new Date().toISOString(); trustOutcome = 'disputed' }
      else if (status === 'CANCELLED') { updateData.cancelledAt = new Date().toISOString(); trustOutcome = 'cancelled' }
    }

    if (terms !== undefined) {
      updateData.terms = terms
    }

    const { data: updatedEscrow } = await supabase
      .from('EscrowTransaction')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    // Update trust scores for both parties on outcome-changing actions
    if (trustOutcome && escrow.status !== updateData.status) {
      const partyIds = [escrow.sellerId, ...(escrow.buyerId ? [escrow.buyerId] : [])]
      await Promise.all(partyIds.map((uid) => updateTrustScoreForTransaction(uid, trustOutcome!)))
    }

    const involvedIds = [escrow.sellerId, ...(escrow.buyerId ? [escrow.buyerId] : [])]
    const { data: users } = await supabase
      .from('User')
      .select('id, email, firstName, lastName')
      .in('id', involvedIds)

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))

    return NextResponse.json({
      success: true,
      data: {
        ...updatedEscrow,
        buyer: escrow.buyerId ? userMap[escrow.buyerId] : null,
        seller: userMap[escrow.sellerId],
      },
    })
  } catch (error) {
    console.error('Update escrow error:', error)
    return NextResponse.json({ error: 'Failed to update escrow' }, { status: 500 })
  }
}
