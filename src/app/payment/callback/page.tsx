'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')
  const [escrowId, setEscrowId] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get('ref')
    const eid = searchParams.get('escrowId')

    if (eid) setEscrowId(eid)

    if (!ref) {
      setStatus('failed')
      setMessage('Invalid payment reference')
      return
    }

    verifyPayment(ref, eid)
  }, [searchParams])

  const verifyPayment = async (reference: string, eid: string | null) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setStatus('failed')
        setMessage(data.error || 'Payment verification failed')
        return
      }

      setStatus('success')
      setMessage('Payment verified successfully! Your escrow is now funded.')

      // Redirect to escrow page after 3 seconds
      if (eid) {
        setTimeout(() => router.push(`/escrow/${eid}`), 3000)
      }
    } catch (err: any) {
      setStatus('failed')
      setMessage(err.message || 'Failed to verify payment')
    }
  }

  return (
    <div className="min-h-screen bg-peeplx-bg flex items-center justify-center px-6">
      <div className="grain-overlay" />

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-lg bg-peeplx-accent flex items-center justify-center">
            <Shield className="w-6 h-6 text-peeplx-bg" />
          </div>
          <span className="font-display font-bold text-2xl text-peeplx-text">PeeplX</span>
        </Link>

        <div className="card-dark card-glow p-10">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-peeplx-accent animate-spin mx-auto mb-6" />
              <h2 className="font-display font-bold text-2xl text-peeplx-text mb-3">
                Verifying Payment
              </h2>
              <p className="text-peeplx-text-secondary">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="font-display font-bold text-2xl text-peeplx-text mb-3">
                Payment Successful!
              </h2>
              <p className="text-peeplx-text-secondary mb-8">{message}</p>
              {escrowId && (
                <p className="text-sm text-peeplx-text-secondary mb-6">
                  Redirecting to your escrow in 3 seconds...
                </p>
              )}
              <div className="flex flex-col gap-3">
                {escrowId && (
                  <Link href={`/escrow/${escrowId}`} className="btn-accent w-full text-center">
                    View Escrow
                  </Link>
                )}
                <Link href="/dashboard" className="btn-outline w-full text-center">
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="font-display font-bold text-2xl text-peeplx-text mb-3">
                Payment Failed
              </h2>
              <p className="text-peeplx-text-secondary mb-8">{message}</p>
              <div className="flex flex-col gap-3">
                {escrowId && (
                  <Link href={`/escrow/${escrowId}`} className="btn-accent w-full text-center">
                    Try Again
                  </Link>
                )}
                <Link href="/dashboard" className="btn-outline w-full text-center">
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-peeplx-bg flex items-center justify-center">
        <div className="grain-overlay" />
        <Loader2 className="w-8 h-8 text-peeplx-accent animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
