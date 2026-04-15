'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft, ChevronRight, Package, Briefcase, Monitor, MoreHorizontal, Loader2 } from 'lucide-react'

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

export default function NewEscrowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect unauthenticated users to login
  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (res.status === 401) {
        router.push('/auth/login?redirect=/escrow/new')
      }
    })
  }, [router])

  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'NGN',
    transactionType: '',
    sellerEmail: '',
    deliveryDays: '7',
    terms: '',
  })

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!form.title || !form.amount || !form.transactionType || !form.sellerEmail) {
        setError('Please fill in all required fields')
        return
      }
      if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
        setError('Please enter a valid amount')
        return
      }
    }
    setError('')
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          amount: Number(form.amount), // Store as naira (not kobo)
          currency: form.currency,
          transactionType: form.transactionType,
          sellerEmail: form.sellerEmail,
          deliveryDays: Number(form.deliveryDays),
          terms: form.terms,
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        router.push('/auth/login?redirect=/escrow/new')
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create escrow')
      }

      router.push(`/escrow/${data.data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (val: string) => {
    const num = parseFloat(val)
    if (isNaN(num)) return '₦0'
    return `₦${num.toLocaleString('en-NG')}`
  }

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
            <span className="font-display font-bold text-xl text-peeplx-text">
              PeeplX
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="mb-10">
            <p className="eyebrow mb-3">New Transaction</p>
            <h1 className="font-display font-bold text-4xl text-peeplx-text mb-2">
              Create Escrow
            </h1>
            <p className="text-peeplx-text-secondary">
              Protect your transaction with secure escrow. Funds are held until both parties are satisfied.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    step === s.id
                      ? 'bg-peeplx-accent text-peeplx-bg'
                      : step > s.id
                      ? 'bg-peeplx-accent/20 text-peeplx-accent'
                      : 'bg-white/5 text-peeplx-text-secondary'
                  }`}
                >
                  <span className="font-mono text-xs">{s.id}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 ${step > s.id ? 'text-peeplx-accent' : 'text-white/20'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Transaction Details */}
          {step === 1 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">
                Transaction Details
              </h2>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-3">
                  Type <span className="text-peeplx-accent">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {transactionTypes.map(type => {
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
                        <p className={`text-sm font-medium ${form.transactionType === type.id ? 'text-peeplx-accent' : 'text-peeplx-text'}`}>
                          {type.label}
                        </p>
                        <p className="text-xs text-peeplx-text-secondary mt-0.5">{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Title <span className="text-peeplx-accent">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  placeholder="e.g. iPhone 15 Pro purchase"
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Describe what's being bought/sold..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 resize-none transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Amount (NGN) <span className="text-peeplx-accent">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-peeplx-text-secondary font-mono">₦</span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => updateForm('amount', e.target.value)}
                    placeholder="0.00"
                    min="100"
                    step="0.01"
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 transition-all"
                  />
                </div>
                {form.amount && (
                  <p className="mt-1 text-xs text-peeplx-accent font-mono">
                    {formatAmount(form.amount)}
                  </p>
                )}
              </div>

              {/* Seller Email */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Seller's Email <span className="text-peeplx-accent">*</span>
                </label>
                <input
                  type="email"
                  value={form.sellerEmail}
                  onChange={e => updateForm('sellerEmail', e.target.value)}
                  placeholder="seller@example.com"
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 transition-all"
                />
              </div>

              {/* Delivery Days */}
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Expected Delivery (days)
                </label>
                <div className="flex gap-2">
                  {['3', '7', '14', '30'].map(d => (
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

              <button
                onClick={handleNext}
                className="btn-accent w-full flex items-center justify-center gap-2 mt-4"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Terms */}
          {step === 2 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">
                Transaction Terms
              </h2>
              <p className="text-peeplx-text-secondary text-sm">
                Define the conditions for this transaction. Both parties will agree to these terms.
              </p>

              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={form.terms}
                  onChange={e => updateForm('terms', e.target.value)}
                  placeholder="e.g. Item must be as described in the listing. Seller will ship within 24 hours of payment. Buyer must inspect within 3 days of delivery..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 focus:border-peeplx-accent/50 resize-none transition-all"
                />
              </div>

              {/* Escrow Protection Info */}
              <div className="p-4 rounded-xl bg-peeplx-accent/10 border border-peeplx-accent/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-peeplx-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-peeplx-text mb-1">Escrow Protection</p>
                    <p className="text-xs text-peeplx-text-secondary">
                      PeeplX holds the funds securely. The seller will only receive payment after you confirm delivery. 
                      A 1.5% service fee applies to the transaction amount.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="btn-accent flex-1 flex items-center justify-center gap-2"
                >
                  Review
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card-dark p-8 space-y-6">
              <h2 className="font-display font-bold text-2xl text-peeplx-text">
                Review & Create
              </h2>

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Type</span>
                  <span className="text-peeplx-text text-sm font-medium">
                    {transactionTypes.find(t => t.id === form.transactionType)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Title</span>
                  <span className="text-peeplx-text text-sm font-medium">{form.title}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Seller</span>
                  <span className="text-peeplx-text text-sm font-medium">{form.sellerEmail}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Delivery</span>
                  <span className="text-peeplx-text text-sm font-medium">{form.deliveryDays} days</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Amount</span>
                  <span className="text-peeplx-accent font-mono font-bold text-lg">{formatAmount(form.amount)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-peeplx-text-secondary text-sm">Service Fee (1.5%)</span>
                  <span className="text-peeplx-text font-mono text-sm">
                    {formatAmount(String(Number(form.amount) * 0.015))}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-peeplx-text font-semibold">Total to Fund</span>
                  <span className="text-peeplx-accent font-mono font-bold text-xl">
                    {formatAmount(String(Number(form.amount) * 1.015))}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-accent flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Create Escrow
                    </>
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
