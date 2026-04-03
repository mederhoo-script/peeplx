'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-peeplx-bg flex items-center justify-center px-6 py-12">
      <div className="grain-overlay" />
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-peeplx-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-peeplx-bg" />
          </div>
          <span className="font-display font-bold text-2xl text-peeplx-text">
            PeeplX
          </span>
        </Link>

        <div className="card-dark card-glow p-8">
          <h1 className="font-display font-bold text-3xl text-peeplx-text mb-2">
            Create account
          </h1>
          <p className="text-peeplx-text-secondary mb-8">
            Start trading safely in minutes
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  First name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-peeplx-text mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-peeplx-text mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-peeplx-text-secondary" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-peeplx-text mb-2">
                Phone number (optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-peeplx-text-secondary" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="+234 800 000 0000"
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
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-peeplx-bg-secondary border border-white/10 rounded-lg text-peeplx-text placeholder:text-peeplx-text-secondary focus:outline-none focus:border-peeplx-accent transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-peeplx-text-secondary mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-peeplx-text-secondary">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-peeplx-accent hover:underline">
                Log in
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
