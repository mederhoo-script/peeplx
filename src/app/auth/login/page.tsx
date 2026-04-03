'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-peeplx-bg flex items-center justify-center px-6">
      <div className="grain-overlay" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-peeplx-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-peeplx-bg" />
          </div>
          <span className="font-display font-bold text-2xl text-peeplx-text">
            PeeplX
          </span>
        </Link>

        {/* Card */}
        <div className="card-dark card-glow p-8">
          <h1 className="font-display font-bold text-3xl text-peeplx-text mb-2">
            Welcome back
          </h1>
          <p className="text-peeplx-text-secondary mb-8">
            Log in to your account to continue
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-peeplx-text mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-peeplx-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-peeplx-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-peeplx-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-peeplx-text-secondary">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-peeplx-accent hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-peeplx-text-secondary text-sm mt-8">
          <Link href="/" className="hover:text-peeplx-accent transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
