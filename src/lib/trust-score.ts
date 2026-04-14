import { createServerClient } from '@/lib/supabase'
import { calculateTrustScore } from '@/lib/utils'

/**
 * Recalculate a user's trust score from their TrustScore row and persist both
 * the TrustScore.score and the denormalised User.trustScore.
 */
export async function recalculateUserTrustScore(userId: string): Promise<number> {
  const supabase = createServerClient()

  const { data: ts } = await supabase
    .from('TrustScore')
    .select('*')
    .eq('userId', userId)
    .maybeSingle()

  if (!ts) return 0

  const newScore = calculateTrustScore({
    totalTransactions: ts.totalTransactions ?? 0,
    completedTransactions: ts.completedTransactions ?? 0,
    disputeCount: ts.disputeCount ?? 0,
    cancelledCount: ts.cancelledCount ?? 0,
    emailVerified: ts.emailVerified ?? false,
    phoneVerified: ts.phoneVerified ?? false,
    idVerified: ts.idVerified ?? false,
    bvnVerified: ts.bvnVerified ?? false,
    ninVerified: ts.ninVerified ?? false,
    faceVerified: ts.faceVerified ?? false,
    addressVerified: ts.addressVerified ?? false,
  })

  await Promise.all([
    supabase
      .from('TrustScore')
      .update({ score: newScore, lastCalculatedAt: new Date().toISOString() })
      .eq('userId', userId),
    supabase
      .from('User')
      .update({ trustScore: newScore })
      .eq('id', userId),
  ])

  return newScore
}

/**
 * Increment transaction counters and optionally mark an outcome, then
 * recalculate the trust score for both parties of an escrow.
 */
export async function updateTrustScoreForTransaction(
  userId: string,
  outcome: 'completed' | 'disputed' | 'cancelled'
) {
  const supabase = createServerClient()

  const { data: ts } = await supabase
    .from('TrustScore')
    .select('id, totalTransactions, completedTransactions, disputeCount, cancelledCount')
    .eq('userId', userId)
    .maybeSingle()

  if (!ts) return

  const updates: Record<string, number> = {
    totalTransactions: (ts.totalTransactions ?? 0) + 1,
  }

  if (outcome === 'completed') {
    updates.completedTransactions = (ts.completedTransactions ?? 0) + 1
  } else if (outcome === 'disputed') {
    updates.disputeCount = (ts.disputeCount ?? 0) + 1
  } else if (outcome === 'cancelled') {
    updates.cancelledCount = (ts.cancelledCount ?? 0) + 1
  }

  await supabase.from('TrustScore').update(updates).eq('userId', userId)
  await recalculateUserTrustScore(userId)
}
