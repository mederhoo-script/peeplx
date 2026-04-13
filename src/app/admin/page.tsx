'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Users, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, LogOut, BarChart3, Loader2
} from 'lucide-react'

interface AdminStats {
  users: { total: number; active: number }
  escrows: { total: number; completed: number; disputed: number; pending: number }
  totalVolume: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401 || res.status === 403) {
        router.push('/dashboard')
        return
      }
      if (!res.ok) throw new Error('Failed to load stats')
      const data = await res.json()
      setStats(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const formatAmount = (n: number) =>
    `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

  if (loading) {
    return (
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <Loader2 className="w-8 h-8 text-peeplx-accent animate-spin" />
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
            <span className="ml-2 text-xs font-mono text-peeplx-accent bg-peeplx-accent/10 px-2 py-0.5 rounded-full">ADMIN</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="eyebrow mb-2">Platform Admin</p>
            <h1 className="font-display font-bold text-4xl text-peeplx-text mb-1">Dashboard</h1>
            <p className="text-peeplx-text-secondary">Platform overview and management.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {stats && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="card-dark p-6">
                  <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-peeplx-accent" />
                  </div>
                  <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{stats.users.total}</p>
                  <p className="text-xs text-peeplx-text-secondary">Total Users</p>
                  <p className="text-xs text-peeplx-accent mt-1">{stats.users.active} active</p>
                </div>

                <div className="card-dark p-6">
                  <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center mb-4">
                    <BarChart3 className="w-5 h-5 text-peeplx-accent" />
                  </div>
                  <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{stats.escrows.total}</p>
                  <p className="text-xs text-peeplx-text-secondary">Total Escrows</p>
                </div>

                <div className="card-dark p-6">
                  <div className="w-10 h-10 rounded-lg bg-peeplx-accent/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-peeplx-accent" />
                  </div>
                  <p className="font-display font-bold text-xl text-peeplx-text mb-1 truncate">{formatAmount(stats.totalVolume)}</p>
                  <p className="text-xs text-peeplx-text-secondary">Total Volume</p>
                </div>

                <div className="card-dark p-6">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="font-display font-bold text-3xl text-peeplx-text mb-1">{stats.escrows.disputed}</p>
                  <p className="text-xs text-peeplx-text-secondary">Disputed</p>
                </div>
              </div>

              {/* Escrow breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
                <div className="card-dark p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-peeplx-text">{stats.escrows.pending}</p>
                    <p className="text-xs text-peeplx-text-secondary">Pending</p>
                  </div>
                </div>
                <div className="card-dark p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-peeplx-text">{stats.escrows.completed}</p>
                    <p className="text-xs text-peeplx-text-secondary">Completed</p>
                  </div>
                </div>
                <div className="card-dark p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-peeplx-text">{stats.escrows.disputed}</p>
                    <p className="text-xs text-peeplx-text-secondary">Disputed</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/users"
              className="card-dark p-6 hover:border-peeplx-accent/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-peeplx-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-peeplx-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-peeplx-text">User Management</p>
                  <p className="text-sm text-peeplx-text-secondary">View, suspend, and manage users</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/escrows"
              className="card-dark p-6 hover:border-peeplx-accent/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-peeplx-accent/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-peeplx-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-peeplx-text">Escrow Management</p>
                  <p className="text-sm text-peeplx-text-secondary">Monitor all transactions and disputes</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
