'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Shield, Clock, CheckCircle2, XCircle, User,
  Loader2, CreditCard, Package, Star, Lock
} from 'lucide-react'

interface ProductDetails {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: string
  transactionType: string
  deliveryDays: number
  terms: string
  createdAt: string
  seller: {
    id: string
    firstName: string
    lastName: string
    trustScore: number
  }
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState(false)

  const token = params.token as string

  useEffect(() => {
    if (token) fetchProduct()
  }, [token])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/product/${token}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Product not found')
      }
      const data = await response.json()
      setProduct(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!product) return
    setBuyLoading(true)
    setError('')
    setAuthError(false)

    try {
      const response = await fetch(`/api/escrow/${product.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.status === 401) {
        setAuthError(true)
        return
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Purchase failed')

      // Redirect to Monnify checkout
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBuyLoading(false)
    }
  }

  const formatAmount = (amount: number) =>
    `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <Loader2 className="w-8 h-8 text-peeplx-accent animate-spin" />
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center px-6">
        <div className="grain-overlay" />
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-peeplx-text mb-2">Not Found</h2>
          <p className="text-peeplx-text-secondary mb-6">{error}</p>
          <Link href="/" className="btn-accent">Back to Home</Link>
        </div>
      </div>
    )
  }

  if (!product) return null

  const isClaimed = product.status !== 'PENDING'

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
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors">
              Log in
            </Link>
            <Link href="/auth/register" className="btn-accent text-sm py-2 px-4">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-4">Secure Purchase</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm flex items-start gap-3">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">You need to be logged in to purchase</p>
                <p className="text-xs">
                  <Link href={`/auth/login?redirect=/product/${token}`} className="underline hover:text-yellow-300">
                    Log in
                  </Link>
                  {' '}or{' '}
                  <Link href={`/auth/register?redirect=/product/${token}`} className="underline hover:text-yellow-300">
                    create a free account
                  </Link>
                  {' '}to buy securely.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Card */}
              <div className="card-dark card-glow p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-peeplx-accent/10 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-peeplx-accent" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-2xl text-peeplx-text mb-1">{product.title}</h1>
                    <span className="text-xs font-mono text-peeplx-text-secondary bg-white/5 px-2 py-1 rounded">
                      {product.transactionType}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <div className="mb-6">
                    <p className="text-sm text-peeplx-text-secondary leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-xs text-peeplx-text-secondary mb-1">Price</p>
                  <p className="font-display font-bold text-5xl text-peeplx-accent">{formatAmount(product.amount)}</p>
                  <p className="text-xs text-peeplx-text-secondary mt-1">
                    + 1.5% service fee = {formatAmount(product.amount * 1.015)} total
                  </p>
                </div>

                {isClaimed ? (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    This listing is no longer available (status: {product.status}).
                  </div>
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={buyLoading}
                    className="btn-accent w-full flex items-center justify-center gap-2 text-base py-4"
                  >
                    {buyLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard className="w-5 h-5" /> Buy Now — {formatAmount(product.amount * 1.015)}</>
                    )}
                  </button>
                )}
              </div>

              {/* Terms */}
              {product.terms && (
                <div className="card-dark p-6">
                  <h3 className="font-display font-bold text-lg text-peeplx-text mb-3">Seller Terms</h3>
                  <p className="text-peeplx-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{product.terms}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Seller */}
              <div className="card-dark p-6">
                <h3 className="font-display font-bold text-lg text-peeplx-text mb-4">Seller</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-peeplx-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-peeplx-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-peeplx-text">
                      {product.seller.firstName} {product.seller.lastName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-peeplx-accent fill-peeplx-accent" />
                      <span className="text-xs text-peeplx-text-secondary">
                        Trust score: {product.seller.trustScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="card-dark p-6">
                <h3 className="font-display font-bold text-lg text-peeplx-text mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Delivery</span>
                    <span className="text-xs text-peeplx-text">{product.deliveryDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-peeplx-text-secondary">Listed</span>
                    <span className="text-xs text-peeplx-text">
                      {new Date(product.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow Protection */}
              <div className="p-4 rounded-xl bg-peeplx-accent/5 border border-peeplx-accent/15">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-peeplx-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-peeplx-text mb-1">PeeplX Escrow</p>
                    <p className="text-xs text-peeplx-text-secondary leading-relaxed">
                      Your payment is held securely until you confirm receipt. If there's an issue, you can raise a dispute.
                    </p>
                    <div className="mt-3 space-y-1.5">
                      {[
                        'Funds held securely',
                        'Release only on your approval',
                        'Dispute protection',
                      ].map((point) => (
                        <div key={point} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-peeplx-accent shrink-0" />
                          <span className="text-xs text-peeplx-text-secondary">{point}</span>
                        </div>
                      ))}
                    </div>
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
