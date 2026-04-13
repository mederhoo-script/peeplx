'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, ArrowLeft, Search, Loader2, User,
  CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  username?: string
  role: string
  status: string
  isEmailVerified: boolean
  idVerificationStatus: string
  trustScore: number
  createdAt: string
}

const statusColors: Record<string, string> = {
  ACTIVE: 'text-green-400',
  SUSPENDED: 'text-yellow-400',
  BANNED: 'text-red-400',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [page, statusFilter])

  const fetchUsers = async (searchVal?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(searchVal !== undefined ? { search: searchVal } : search ? { search } : {}),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.status === 403) { router.push('/dashboard'); return }
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data.data || [])
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers(search)
  }

  const updateUserStatus = async (userId: string, status: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

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
            <h1 className="font-display font-bold text-3xl text-peeplx-text mb-1">User Management</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Filters */}
          <div className="card-dark p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-peeplx-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-white/5 text-peeplx-text placeholder:text-peeplx-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50 text-sm"
                />
              </div>
              <button type="submit" className="btn-accent text-sm py-2 px-4">Search</button>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-peeplx-text text-sm focus:outline-none focus:ring-2 focus:ring-peeplx-accent/50"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>

          {/* Table */}
          <div className="card-dark overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-peeplx-accent animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-peeplx-text-secondary text-sm">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden lg:table-cell">Trust</th>
                      <th className="text-left px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider hidden lg:table-cell">Verified</th>
                      <th className="text-right px-6 py-4 text-xs font-mono text-peeplx-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-peeplx-text">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-peeplx-text-secondary">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`text-xs font-mono px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-peeplx-accent/10 text-peeplx-accent' : 'bg-white/5 text-peeplx-text-secondary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium ${statusColors[user.status] || 'text-peeplx-text-secondary'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-sm font-mono text-peeplx-accent">{user.trustScore}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {user.isEmailVerified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white/20" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 text-peeplx-accent animate-spin" />
                            ) : (
                              <>
                                {user.status !== 'ACTIVE' && (
                                  <button
                                    onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                                    className="text-xs text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded hover:bg-green-400/10"
                                  >
                                    Activate
                                  </button>
                                )}
                                {user.status !== 'SUSPENDED' && (
                                  <button
                                    onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                                    className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors px-2 py-1 rounded hover:bg-yellow-400/10"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {user.status !== 'BANNED' && (
                                  <button
                                    onClick={() => updateUserStatus(user.id, 'BANNED')}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
                                  >
                                    Ban
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-white/10 text-peeplx-text-secondary hover:text-peeplx-text disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-peeplx-text-secondary">
                Page {page} of {totalPages}
              </span>
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
