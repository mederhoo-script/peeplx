'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Wallet, TrendingUp, Clock, ArrowRight,
  CheckCircle2, AlertTriangle, XCircle, Plus, LogOut, User
} from 'lucide-react'

interface EscrowTransaction {
  id: string
  title: string
  amount: number
  currency: string
  status: string
  transactionType: string
  createdAt: string
  buyer: { firstName: string; lastName: string }
  seller: { firstName: string; lastName: string } | null
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  wallet?: { availableBalance: number; currency: string }
  trustScoreData?: { score: number; totalTransactions: number; completedTransactions: number }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-400' },
  FUNDED: { label: 'Funded', color: 'text-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-peeplx-accent' },
  COMPLETED: { label: 'Completed', color: 'text-green-400' },
  DISPUTED: { label: 'Disputed', color: 'text-orange-400' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400' },
  REFUNDED: { label: 'Refunded', color: 'text-purple-400' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [profileRes, escrowsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/escrow?limit=5'),
      ])

      if (profileRes.status === 401) {
        router.push('/auth/login')
        return
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUser(profileData.data)
      }

      if (escrowsRes.ok) {
        const escrowsData = await escrowsRes.json()
        setEscrows(escrowsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const formatAmount = (amount: number) => {
    return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const activeEscrows = escrows.filter(e => ['PENDING', 'FUNDED', 'IN_PROGRESS'].includes(e.status)).length
  const completedEscrows = escrows.filter(e => e.status === 'COMPLETED').length
  const walletBalance = user?.wallet?.availableBalance || 0
  const trustScore = user?.trustScoreData?.score || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-peeplx-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-peeplx-text-secondary text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-peeplx-bg">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-peeplx-bg/90 backdrop-blur-md sticky top-0">
        <div className="px-6 lg:px-[6vw] h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-peeplx-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-peeplx-bg" />
            </div>
            <span className="font-display font-bold text-xl text-peeplx-text">PeeplX</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-peeplx-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-peeplx-accent" />
              </div>
              <span className="text-sm text-peeplx-text">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-6xl mx-auto">

          {/* Welcome */}
          <div className="mb-10">
            <p className="eyebrow mb-2">Dashboard</p>
            <h1 className="font-display font-bold text-4xl text-peeplx-text mb-1">
              Welcome back{user ? `, ${user.firstName}` : ''}!
            </h1>
            <p className="text-peeplx-text-secondary">Here's your escrow activity overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-peeplx-accent" />
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{activeEscrows}</p>
              <p className="text-xs text-peeplx-text-secondary">Active Escrows</p>
            </div>

            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-peeplx-accent" />
                </div>
              </div>
              <p className="font-display font-bold text-2xl text-peeplx-text mb-1">
                {formatAmount(walletBalance)}
              </p>
              <p className="text-xs text-peeplx-text-secondary">Wallet Balance</p>
            </div>

            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-peeplx-accent" />
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{trustScore}</p>
              <p className="text-xs text-peeplx-text-secondary">Trust Score</p>
            </div>

            <div className="card-dark p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-peeplx-accent" />
                </div>
              </div>
              <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{completedEscrows}</p>
              <p className="text-xs text-peeplx-text-secondary">Completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 card-dark p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-peeplx-text">Recent Transactions</h2>
                <Link
                  href="/escrow/new"
                  className="flex items-center gap-1 text-sm text-peeplx-accent hover:text-peeplx-accent/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New
                </Link>
              </div>

              {escrows.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-peeplx-text-secondary mb-4">No transactions yet</p>
                  <Link href="/escrow/new" className="btn-accent text-sm py-2.5 px-5">
                    Create your first escrow
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {escrows.map(escrow => {
                    const status = statusConfig[escrow.status] || { label: escrow.status, color: 'text-peeplx-text-secondary' }
                    return (
                      <Link
                        key={escrow.id}
                        href={`/escrow/${escrow.id}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/15 hover:bg-white/3 transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-peeplx-accent" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-peeplx-text truncate">{escrow.title}</p>
                            <p className="text-xs text-peeplx-text-secondary">{formatDate(escrow.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-mono text-peeplx-accent">{formatAmount(escrow.amount)}</p>
                            <p className={`text-xs ${status.color}`}>{status.label}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-peeplx-accent transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card-dark p-6">
                <h2 className="font-display font-bold text-lg text-peeplx-text mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/escrow/new"
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:border-peeplx-accent/30 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-peeplx-accent" />
                      <span className="text-sm text-peeplx-text">New Escrow</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-peeplx-accent transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="card-dark p-6">
                <h2 className="font-display font-bold text-lg text-peeplx-text mb-4">Trust Score</h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50" cy="50" r="40"
                        stroke="#B6FF2E"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(trustScore / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display font-bold text-2xl text-peeplx-accent">{trustScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-peeplx-text-secondary">
                  {trustScore >= 80 ? 'Excellent' : trustScore >= 60 ? 'Good' : trustScore >= 40 ? 'Fair' : 'Building'} reputation
                </p>
              </div>

              {/* Profile Info */}
              {user && (
                <div className="card-dark p-6">
                  <h2 className="font-display font-bold text-lg text-peeplx-text mb-4">Profile</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-peeplx-text-secondary mb-1">Name</p>
                      <p className="text-sm text-peeplx-text">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-peeplx-text-secondary mb-1">Email</p>
                      <p className="text-sm text-peeplx-text truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
