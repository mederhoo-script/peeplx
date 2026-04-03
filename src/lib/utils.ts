import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function calculateTrustScore(data: {
  totalTransactions: number
  completedTransactions: number
  disputeCount: number
  cancelledCount: number
  emailVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
}): number {
  let score = 0

  // Base score from completed transactions (max 40 points)
  if (data.totalTransactions > 0) {
    const completionRate = data.completedTransactions / data.totalTransactions
    score += completionRate * 40
  }

  // Verification bonus (max 30 points)
  if (data.emailVerified) score += 10
  if (data.phoneVerified) score += 10
  if (data.idVerified) score += 10

  // Transaction volume bonus (max 20 points)
  if (data.totalTransactions >= 1) score += 5
  if (data.totalTransactions >= 5) score += 5
  if (data.totalTransactions >= 10) score += 5
  if (data.totalTransactions >= 20) score += 5

  // Penalties
  if (data.disputeCount > 0) {
    score -= data.disputeCount * 5 // -5 points per dispute
  }
  if (data.cancelledCount > 0) {
    score -= data.cancelledCount * 2 // -2 points per cancellation
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-500',
    FUNDED: 'text-blue-500',
    IN_PROGRESS: 'text-purple-500',
    COMPLETED: 'text-green-500',
    DISPUTED: 'text-red-500',
    CANCELLED: 'text-gray-500',
    REFUNDED: 'text-orange-500',
    PROCESSING: 'text-blue-500',
    FAILED: 'text-red-500',
    ACTIVE: 'text-green-500',
    SUSPENDED: 'text-yellow-500',
    BANNED: 'text-red-500',
    VERIFIED: 'text-green-500',
    UNVERIFIED: 'text-gray-500',
    REJECTED: 'text-red-500',
  }

  return statusColors[status] || 'text-gray-500'
}

export function getStatusBadgeColor(status: string): string {
  const badgeColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    FUNDED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    IN_PROGRESS: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
    DISPUTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    REFUNDED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
    ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
    SUSPENDED: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    BANNED: 'bg-red-500/10 text-red-500 border-red-500/20',
    VERIFIED: 'bg-green-500/10 text-green-500 border-green-500/20',
    UNVERIFIED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return badgeColors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
}
