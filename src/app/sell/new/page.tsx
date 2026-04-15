'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield, ArrowLeft, ChevronRight, Package, Briefcase, Monitor,
  MoreHorizontal, Loader2, Copy, CheckCircle2, ExternalLink
} from 'lucide-react'

const transactionTypes = [
  { id: 'GOODS', label: 'Physical Goods', description: 'Products, items, merchandise', icon: Package },
  { id: 'SERVICES', label: 'Services', description: 'Freelance, consulting, work', icon: Briefcase },
  { id: 'DIGITAL', label: 'Digital Items', description: 'Software, designs, files', icon: Monitor },
  { id: 'OTHER', label: 'Other', description: 'Anything else', icon: MoreHorizontal },
]

const steps = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Terms' },
  { id: 3, label: 'Review' },
]

export default function SellNewPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [buyerLink, setBuyerLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Redirect unauthenticated users to login
  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (res.status === 401) {
        router.push('/auth/login?redirect=/sell/new')
      }
    }).catch(() => {
      // Network error — let the submit attempt surface the auth failure
    })
  }, [router])

  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'NGN',
    transactionType: '',
    deliveryDays: '7',
    terms: '',
  })

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!form.title || !form.amount || !form.transactionType) {
        setError('Please fill in all required fields')
        return
      }
      if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
        setError('Please enter a valid amount')
        return
      }
    }
    setError('')
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'seller',
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
          currency: form.currency,
          transactionType: form.transactionType,
          deliveryDays: Number(form.deliveryDays),
          terms: form.terms,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        router.push('/auth/login?redirect=/sell/new')
        return
      }

      if (!response.ok) {
        const errMsg = data.detail
          ? `${data.error}: ${data.detail}${data.hint ? ` — ${data.hint}` : ''}`
          : data.error || 'Failed to create listing'
        throw new Error(errMsg)
      }

      setBuyerLink(data.buyerLink)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(buyerLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAmount = (val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '₦0'
    return `₦${num.toLocaleString('en-NG')}`
  }

  // ── Success state: show buyer link ──────────────────────────────────────────
  if (buyerLink) {
    return (
      <div className="min-h-screen bg-peeplx-bg">
        <div className="grain-overlay" />
        <header className="relative z-10 border-b border-white/10 bg-peeplx-bg/90 backdrop-blur-md">
          <div className="px-6 lg:px-[6vw] h-[72px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-peeplx-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-peeplx-bg" />
              </div>
              <span className="font-display font-bold text-xl text-peeplx-text">PeeplX</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </header>

        <main className="relative z-10 px-6 lg:px-[6vw] py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-peeplx-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-peeplx-accent" />
            </div>
            <h1 className="font-display font-bold text-3xl text-peeplx-text mb-3">Listing Created!</h1>
            <p className="text-peeplx-text-secondary mb-10">
              Share the link below with your buyer. They can view your product and pay securely through PeeplX escrow.
            </p>

            <div className="card-dark p-6 mb-6 text-left">
              <p className="text-xs text-peeplx-text-secondary font-mono uppercase tracking-wider mb-3">Buyer Payment Link</p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="flex-1 text-sm text-peeplx-text font-mono truncate">{buyerLink}</span>
                <button
                  onClick={copyLink}
                  className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors text-peeplx-text-secondary hover:text-peeplx-accent"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-peeplx-accent" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={buyerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors text-peeplx-text-secondary hover:text-peeplx-accent"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={copyLink} className="btn-accent flex items-center gap-2">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <Link href="/dashboard" className="btn-outline">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Creation form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-peeplx-bg">
      <div className="grain-overlay" />

      <header className="relative z-10 border-b border-white/10 bg-peeplx-bg/90 backdrop-blur-md">
        <div className="px-6 lg:px-[6vw] h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-peeplx-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-peeplx-bg" />
            </div>
            <span className="font-display font-bold text-xl text-peeplx-text">PeeplX</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="eyebrow mb-3">Sell</p>
            <h1 className="font-display font-bold text-4xl text-peeplx-text mb-2">Create a Listing</h1>
            <p className="text-peeplx-text-secondary">
              Describe your product or service and set the price. We&apos;ll generate a secure payment link you can share with your buyer.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  step === s.id ? 'bg-peeplx-accent text-peeplx-bg'
                    : step > s.id ? 'bg-peeplx-accent/20 text-peeplx-accent'
                    : 'bg-white/5 text-peeplx-text-secondary'
                }`}>
                  <span className="font-mono text-xs">{s.id}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 ${step > s.id ? 'text-peeplx-accent' : 'text-white/20'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">Product Details</h2>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-3">
                  Type <span className="text-peeplx-accent">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {transactionTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => updateForm('transactionType', type.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                          form.transactionType === type.id
                            ? 'border-peeplx-accent bg-peeplx-accent/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${form.transactionType === type.id ? 'text-peeplx-accent' : 'text-peeplx-text-secondary'}`} />
                        <p className={`text-sm font-medium ${form.transactionType === type.id ? 'text-peeplx-accent' : 'text-peeplx-text'}`}>{type.label}</p>
                        <p className="text-xs text-peeplx-text-secondary mt-0.5">{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Title <span className="text-peeplx-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="e.g. iPhone 15 Pro — 256 GB Space Black"
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe your product or service in detail..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Price (NGN) <span className="text-peeplx-accent">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-peeplx-text-secondary font-mono">₦</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => updateForm('amount', e.target.value)}
                    placeholder="0.00"
                    min="100"
                    step="0.01"
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 transition-all"
                  />
                </div>
                {form.amount && (
                  <p className="mt-1 text-xs text-peeplx-accent font-mono">{formatAmount(form.amount)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">Expected Delivery (days)</label>
                <div className="flex gap-2">
                  {['3', '7', '14', '30'].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateForm('deliveryDays', d)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        form.deliveryDays === d
                          ? 'bg-peeplx-accent text-peeplx-bg'
                          : 'bg-white/5 border border-white/10 text-peeplx-text hover:border-white/20'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleNext} className="btn-accent w-full flex items-center justify-center gap-2 mt-4">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Terms */}
          {step === 2 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">Terms & Conditions</h2>
              <p className="text-peeplx-text-secondary text-sm">
                Define the conditions for this transaction. Buyers will see these before paying.
              </p>
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">Terms</label>
                <textarea
                  value={form.terms}
                  onChange={(e) => updateForm('terms', e.target.value)}
                  placeholder="e.g. Item is brand new and sealed. I will ship within 24 hours of payment confirmation. No returns unless item is defective..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 resize-none transition-all"
                />
              </div>
              <div className="p-4 rounded-xl bg-peeplx-accent/10 border border-peeplx-accent/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-peeplx-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-peeplx-text mb-1">Escrow Protection</p>
                    <p className="text-xs text-peeplx-text-secondary">
                      Funds are held securely by PeeplX. You receive payment after the buyer confirms delivery.
                      A 1.5% service fee is added to the buyer&apos;s total.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="btn-outline flex-1">Back</button>
                <button onClick={handleNext} className="btn-accent flex-1 flex items-center justify-center gap-2">
                  Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">Review & Publish</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Type</span>
                  <span className="text-peeplx-text text-sm font-medium">
                    {transactionTypes.find((t) => t.id === form.transactionType)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Title</span>
                  <span className="text-peeplx-text text-sm font-medium">{form.title}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Delivery</span>
                  <span className="text-peeplx-text text-sm font-medium">{form.deliveryDays} days</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Price</span>
                  <span className="text-peeplx-accent font-mono font-bold text-lg">{formatAmount(form.amount)}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-peeplx-text text-sm font-semibold">Buyer pays (incl. 1.5% fee)</span>
                  <span className="text-peeplx-accent font-mono font-bold text-xl">
                    {formatAmount(String(Number(form.amount) * 1.015))}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} disabled={loading} className="btn-outline flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-accent flex-1 flex items-center justify-center gap-2">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Publish Listing</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
