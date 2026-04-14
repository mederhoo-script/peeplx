'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, ArrowLeft, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react'

interface AdminEscrow {
  id: string
  title: string
  amount: number
  currency: string
  status: string
  transactionType: string
  sellerInitiated: boolean
  createdAt: string
  buyer: { id: string; firstName: string; lastName: string; email: string } | null
  seller: { id: string; firstName: string; lastName: string; email: string }
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

export default function AdminEscrowsPage() {
  const router = useRouter()
  const [escrows, setEscrows] = useState<AdminEscrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEscrows()
  }, [page, statusFilter])

  const fetchEscrows = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/admin/escrows?${params}`)
      if (res.status === 403) { router.push('/dashboard'); return }
      if (!res.ok) throw new Error('Failed to load escrows')
      const data = await res.json()
      setEscrows(data.data || [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (n: number) =>
    `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

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
            <span className="ml-2 text-xs font-mono text-peeplx-accent bg-peeplx-accent/10 px-2 py-0.5 rounded-full">ADMIN</span>
          </Link>
          <Link href="/admin" className="flex items-center gap-2 text-sm text-peeplx-text-secondary hover:text-peeplx-text transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-[6vw] py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="eyebrow mb-2">Admin</p>
            <h1 className="font-display font-bold text-3xl text-peeplx-text mb-1">Escrow Management</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Filter */}
          <div className="card-dark p-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text text-sm focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50"
            >
              <option value="">All statuses</option>
              {Object.keys(statusConfig).map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div className="card-dark overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-peeplx-accent animate-spin" />
              </div>
            ) : escrows.length === 0 ? (
              <div className="text-center py-16">
                <Shield className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-peeplx-text-secondary text-sm">No escrows found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">Title</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden md:table-cell">Seller</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden md:table-cell">Buyer</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden lg:table-cell">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escrows.map((e) => {
                      const st = statusConfig[e.status] || { label: e.status, color: 'text-peeplx-text-secondary' }
                      return (
                        <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-peeplx-text truncate max-w-[180px]">{e.title}</p>
                              <p className="text-xs text-peeplx-text-secondary font-mono mt-0.5">#{e.id.slice(0, 8)}</p>
                              {e.sellerInitiated && (
                                <span className="text-xs text-peeplx-accent bg-peeplx-accent/10 px-1.5 py-0.5 rounded mt-1 inline-block">listing</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-sm text-peeplx-text">{e.seller.firstName} {e.seller.lastName}</p>
                            <p className="text-xs text-peeplx-text-secondary">{e.seller.email}</p>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            {e.buyer ? (
                              <>
                                <p className="text-sm text-peeplx-text">{e.buyer.firstName} {e.buyer.lastName}</p>
                                <p className="text-xs text-peeplx-text-secondary">{e.buyer.email}</p>
                              </>
                            ) : (
                              <span className="text-xs text-peeplx-text-secondary">Awaiting buyer</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-peeplx-accent">{formatAmount(e.amount)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <span className="text-xs text-peeplx-text-secondary">
                              {new Date(e.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-white/10 text-peeplx-text-secondary hover:text-peeplx-text disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-peeplx-text-secondary">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-white/10 text-peeplx-text-secondary hover:text-peeplx-text disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
