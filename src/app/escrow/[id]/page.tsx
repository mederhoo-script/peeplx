'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Shield, ArrowLeft, Clock, CheckCircle2, AlertTriangle, XCircle,
  User, Copy, ExternalLink, Loader2, CreditCard
} from 'lucide-react'

interface EscrowDetails {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: string
  transactionType: string
  deliveryDays: number
  terms: string
  sellerInitiated: boolean
  buyerLinkToken: string | null
  buyer: { id: string; firstName: string; lastName: string; email: string } | null
  seller: { id: string; firstName: string; lastName: string; email: string }
  payments: Array<{ id: string; amount: number; status: string; channel: string; createdAt: string }>
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  FUNDED: { label: 'Funded', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-peeplx-accent', bg: 'bg-peeplx-accent/10 border-peeplx-accent/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  DISPUTED: { label: 'Disputed', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  REFUNDED: { label: 'Refunded', icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
}

export default function EscrowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [escrow, setEscrow] = useState<EscrowDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEscrow(params.id as string)
    }
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user?.id) setCurrentUserId(d.user.id) })
      .catch(() => {})
  }, [params.id])

  const fetchEscrow = async (id: string) => {
    try {
      const response = await fetch(`/api/escrow/${id}`)
      if (response.status === 401) {
        router.push(`/auth/login?redirect=/escrow/${id}`)
        return
      }
      if (!response.ok) {
        throw new Error('Escrow not found')
      }
      const data = await response.json()
      setEscrow(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!escrow) return
    setActionLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/escrow/${escrow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Action failed')

      setEscrow(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!escrow) return
    setPaymentLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escrowId: escrow.id }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Payment initialization failed')

      // Redirect to Monnify checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPaymentLoading(false)
    }
  }

  const copyId = () => {
    if (escrow) {
      navigator.clipboard.writeText(escrow.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buyerLink = escrow?.buyerLinkToken
    ? `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/product/${escrow.buyerLinkToken}`
    : null

  const copyBuyerLink = () => {
    if (buyerLink) {
      navigator.clipboard.writeText(buyerLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const isSeller = !!(currentUserId && escrow && escrow.seller?.id === currentUserId)

  const formatAmount = (amount: number) => {
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <Loader2 className="w-8 h-8 text-peeplx-accent animate-spin" />
      </div>
    )
  }

  if (error && !escrow) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center px-6">
        <div className="grain-overlay" />
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-peeplx-text mb-2">Not Found</h2>
          <p className="text-peeplx-text-secondary mb-6">{error}</p>
          <Link href="/dashboard" className="btn-accent">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  if (!escrow) return null

  const statusInfo = statusConfig[escrow.status] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-peeplx-bg">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-peeplx-bg/90 backdrop-blur-md">
        <div className="px-6 lg:px-[6vw] h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-peeplx-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-peeplx-bg" />
            </div>
            <span className="font-display font-bold text-xl text-peeplx-text">PeeplX</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-4xl mx-auto">

          {/* Title + Status */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow mb-2">Escrow Transaction</p>
              <h1 className="font-display font-bold text-3xl text-peeplx-text mb-1">{escrow.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs text-peeplx-text-secondary">#{escrow.id.slice(0, 8)}</span>
                <button onClick={copyId} className="text-peeplx-text-secondary hover:text-peeplx-accent transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-peeplx-accent" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Amount Card */}
              <div className="card-dark card-glow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-peeplx-text-secondary">Transaction Amount</span>
                  <span className="text-xs font-mono text-peeplx-text-secondary">{escrow.currency}</span>
                </div>
                <p className="font-display font-bold text-5xl text-peeplx-accent mb-4">
                  {formatAmount(escrow.amount)}
                </p>
                <div className="flex items-center gap-2 text-xs text-peeplx-text-secondary">
                  <span>Service fee (1.5%): {formatAmount(Math.round(escrow.amount * 0.015))}</span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {escrow.status === 'PENDING' && !isSeller && (
                    <button
                      onClick={handlePayment}
                      disabled={paymentLoading}
                      className="btn-accent flex items-center gap-2"
                    >
                      {paymentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      Fund Escrow
                    </button>
                  )}
                  {escrow.status === 'PENDING' && isSeller && !escrow.buyer && (
                    <p className="text-sm text-peeplx-text-secondary">
                      Only the buyer can fund this escrow
                    </p>
                  )}
                  {escrow.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleAction('confirm_delivery')}
                        disabled={actionLoading}
                        className="btn-accent flex items-center gap-2"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Delivery
                      </button>
                      <button
                        onClick={() => handleAction('dispute')}
                        disabled={actionLoading}
                        className="btn-outline flex items-center gap-2 text-orange-400 border-orange-400/20"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Raise Dispute
                      </button>
                    </>
                  )}
                  {(escrow.status === 'PENDING' || escrow.status === 'FUNDED') && (
                    <button
                      onClick={() => handleAction('cancel')}
                      disabled={actionLoading}
                      className="btn-outline text-red-400 border-red-400/20"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {escrow.description && (
                <div className="card-dark p-6">
                  <h3 className="font-display font-bold text-lg text-peeplx-text mb-3">Description</h3>
                  <p className="text-peeplx-text-secondary text-sm leading-relaxed">{escrow.description}</p>
                </div>
              )}

              {/* Terms */}
              {escrow.terms && (
                <div className="card-dark p-6">
                  <h3 className="font-display font-bold text-lg text-peeplx-text mb-3">Terms & Conditions</h3>
                  <p className="text-peeplx-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{escrow.terms}</p>
                </div>
              )}

              {/* Payment History */}
              {escrow.payments && escrow.payments.length > 0 && (
                <div className="card-dark p-6">
                  <h3 className="font-display font-bold text-lg text-peeplx-text mb-4">Payment History</h3>
                  <div className="space-y-3">
                    {escrow.payments.map(payment => (
                      <div key={payment.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-peeplx-text font-medium">{payment.channel}</p>
                          <p className="text-xs text-peeplx-text-secondary">{formatDate(payment.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-peeplx-accent">{formatAmount(payment.amount)}</p>
                          <span className={`text-xs font-medium ${payment.status === 'COMPLETED' ? 'text-green-400' : payment.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Share with Buyer (seller-initiated, no buyer yet) */}
              {escrow.sellerInitiated && !escrow.buyer && buyerLink && (
                <div className="card-dark p-6">
                  <h3 className="font-display font-bold text-lg text-peeplx-text mb-1">Share with Buyer</h3>
                  <p className="text-xs text-peeplx-text-secondary mb-4">
                    Send this link to your buyer. They&apos;ll review the listing and pay securely through PeeplX.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                    <span className="flex-1 text-xs text-peeplx-text font-mono truncate">{buyerLink}</span>
                    <button
                      onClick={copyBuyerLink}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-peeplx-text-secondary hover:text-peeplx-accent"
                      title="Copy link"
                    >
                      {linkCopied ? <CheckCircle2 className="w-4 h-4 text-peeplx-accent" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={buyerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-peeplx-text-secondary hover:text-peeplx-accent"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <button onClick={copyBuyerLink} className="btn-accent w-full flex items-center justify-center gap-2 text-sm">
                    {linkCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {linkCopied ? 'Copied!' : 'Copy Buyer Link'}
                  </button>
                </div>
              )}

              {/* Parties */}
              <div className="card-dark p-6">
                <h3 className="font-display font-bold text-lg text-peeplx-text mb-4">Parties</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-peeplx-text-secondary font-mono uppercase tracking-wider mb-2">Buyer</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-peeplx-accent/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-peeplx-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-peeplx-text">
                          {escrow.buyer ? `${escrow.buyer.firstName} ${escrow.buyer.lastName}` : 'Awaiting buyer'}
                        </p>
                        <p className="text-xs text-peeplx-text-secondary">{escrow.buyer?.email || 'Not yet assigned'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <p className="text-xs text-peeplx-text-secondary font-mono uppercase tracking-wider mb-2">Seller</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-peeplx-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-peeplx-text">
                          {escrow.seller ? `${escrow.seller.firstName} ${escrow.seller.lastName}` : 'Pending'}
                        </p>
                        <p className="text-xs text-peeplx-text-secondary">
                          {escrow.seller?.email || 'Invitation sent'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="card-dark p-6">
                <h3 className="font-display font-bold text-lg text-peeplx-text mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Type</span>
                    <span className="text-xs text-peeplx-text">{escrow.transactionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Delivery</span>
                    <span className="text-xs text-peeplx-text">{escrow.deliveryDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Created</span>
                    <span className="text-xs text-peeplx-text">{formatDate(escrow.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Updated</span>
                    <span className="text-xs text-peeplx-text">{formatDate(escrow.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Escrow Protection Notice */}
              <div className="p-4 rounded-xl bg-peeplx-accent/5 border border-peeplx-accent/15">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-peeplx-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-peeplx-text mb-1">Protected</p>
                    <p className="text-xs text-peeplx-text-secondary leading-relaxed">
                      Funds are securely held in escrow until both parties confirm the transaction is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
