'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, ArrowLeft, CheckCircle2, Clock, Loader2,
  Mail, Phone, CreditCard, User, Camera, MapPin, FileText
} from 'lucide-react'

interface VerificationStatus {
  emailVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
  bvnVerified: boolean
  ninVerified: boolean
  faceVerified: boolean
  addressVerified: boolean
  score: number
}

interface VerificationItem {
  type: string
  label: string
  description: string
  icon: any
  points: number
  field: keyof VerificationStatus
}

const VERIFICATION_ITEMS: VerificationItem[] = [
  { type: 'email', label: 'Email Address', description: 'Verify your email to prove identity', icon: Mail, points: 10, field: 'emailVerified' },
  { type: 'phone', label: 'Phone Number', description: 'Link and verify your phone number', icon: Phone, points: 10, field: 'phoneVerified' },
  { type: 'bvn', label: 'BVN', description: 'Bank Verification Number from your bank', icon: CreditCard, points: 10, field: 'bvnVerified' },
  { type: 'nin', label: 'NIN', description: 'National Identification Number', icon: User, points: 10, field: 'ninVerified' },
  { type: 'id', label: 'Government ID', description: 'Passport, driver\'s licence, or voter\'s card', icon: FileText, points: 10, field: 'idVerified' },
  { type: 'face', label: 'Face Verification', description: 'Selfie liveness check', icon: Camera, points: 5, field: 'faceVerified' },
  { type: 'address', label: 'Address Verification', description: 'Utility bill or bank statement', icon: MapPin, points: 5, field: 'addressVerified' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const [verifyRes, meRes] = await Promise.all([
        fetch('/api/user/verify'),
        fetch('/api/auth/me'),
      ])
      if (verifyRes.status === 401 || meRes.status === 401) {
        router.push('/auth/login')
        return
      }
      if (!verifyRes.ok) throw new Error('Failed to fetch verification status')
      const data = await verifyRes.json()
      setStatus(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (type: string) => {
    setSubmitting(type)
    setError('')
    try {
      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Verification failed')
      }
      const d = await res.json()
      setStatus((prev) => prev ? { ...prev, [VERIFICATION_ITEMS.find((i) => i.type === type)!.field]: true, score: d.data.trustScore } : prev)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(null)
    }
  }

  const maxScore = VERIFICATION_ITEMS.reduce((s, i) => s + i.points, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <Loader2 className="w-8 h-8 text-peeplx-accent animate-spin" />
      </div>
    )
  }

  const currentScore = status?.score ?? 0

  return (
    <div className="min-h-screen bg-peeplx-bg">
      <div className="grain-overlay" />

      <header className="relative z-10 border-b border-white/10 bg-peeplx-bg/90 backdrop-blur-md sticky top-0">
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="eyebrow mb-2">Account</p>
            <h1 className="font-display font-bold text-4xl text-peeplx-text mb-1">Identity & Trust</h1>
            <p className="text-peeplx-text-secondary">
              Verify your identity to increase your trust score and unlock higher transaction limits.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Trust Score Card */}
          <div className="card-dark card-glow p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-peeplx-text">Trust Score</h2>
                <p className="text-peeplx-text-secondary text-sm mt-1">
                  {currentScore >= 80 ? 'Excellent' : currentScore >= 60 ? 'Good' : currentScore >= 40 ? 'Fair' : 'Building'} reputation
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="#B6FF2E"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(currentScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-bold text-xl text-peeplx-accent">{currentScore}</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2 flex justify-between text-xs text-peeplx-text-secondary">
              <span>Verification progress</span>
              <span>{VERIFICATION_ITEMS.filter((i) => status?.[i.field]).length} / {VERIFICATION_ITEMS.length}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-peeplx-accent rounded-full transition-all duration-500"
                style={{ width: `${(VERIFICATION_ITEMS.filter((i) => status?.[i.field]).length / VERIFICATION_ITEMS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Verification Items */}
          <div className="space-y-3">
            <h2 className="font-display font-bold text-xl text-peeplx-text mb-4">Verification Items</h2>
            {VERIFICATION_ITEMS.map((item) => {
              const isVerified = status?.[item.field] ?? false
              const Icon = item.icon
              const isLoading = submitting === item.type
              return (
                <div key={item.type} className={`card-dark p-5 flex items-center gap-4 transition-all ${isVerified ? 'border-peeplx-accent/20' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isVerified ? 'bg-peeplx-accent/20' : 'bg-white/5'}`}>
                    <Icon className={`w-5 h-5 ${isVerified ? 'text-peeplx-accent' : 'text-peeplx-text-secondary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-peeplx-text">{item.label}</p>
                      <span className="text-xs text-peeplx-accent font-mono">+{item.points} pts</span>
                    </div>
                    <p className="text-xs text-peeplx-text-secondary">{item.description}</p>
                  </div>
                  <div className="shrink-0">
                    {isVerified ? (
                      <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerify(item.type)}
                        disabled={isLoading || submitting !== null}
                        className="btn-accent text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Verifying...</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Verify</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Transaction impact note */}
          <div className="mt-8 p-5 rounded-xl bg-peeplx-accent/5 border border-peeplx-accent/15">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-peeplx-accent mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-peeplx-text mb-2">How trust score changes</p>
                <ul className="space-y-1.5 text-xs text-peeplx-text-secondary">
                  <li>✅ Each completed transaction: <span className="text-peeplx-accent">score increases</span></li>
                  <li>⚠️ Each disputed transaction: <span className="text-orange-400">−10 points</span></li>
                  <li>❌ Each cancelled transaction: <span className="text-red-400">−2 points</span></li>
                  <li>🏆 Volume milestones (1, 5, 10, 20+ transactions): <span className="text-peeplx-accent">+5 pts each</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
