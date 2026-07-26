'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'

const PENDING_KEY = 'shop-pending-checkout'

function VerifyForm() {
  const router        = useRouter()
  const params        = useSearchParams()
  const email         = params.get('email') ?? ''
  const { clearCart } = useCart()
  const [code,      setCode]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 8) { toast.error('Enter the 8-digit code'); return }
    setLoading(true)

    const verifyRes = await fetch('/api/shop/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code }),
    })

    if (!verifyRes.ok) {
      const err = await verifyRes.json()
      toast.error(err.error ?? 'Invalid code')
      setLoading(false)
      return
    }

    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null')
    if (!pending) { toast.error('Session expired, start checkout again'); router.replace('/shop/cart'); return }

    const orderRes = await fetch('/api/shop/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json()
      toast.error(err.error ?? 'Failed to create order')
      setLoading(false)
      return
    }

    const { id: orderId } = await orderRes.json()
    sessionStorage.removeItem(PENDING_KEY)
    clearCart()
    router.replace(`/shop/checkout/payment?order=${orderId}`)
  }

  async function resend() {
    setResending(true)
    await fetch('/api/shop/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    toast.success('New code sent')
    setCode('')
    inputRef.current?.focus()
    setResending(false)
  }

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="rgba(107,69,212,0.12)" />
              <rect x="18" y="27" width="44" height="30" rx="4" stroke="#6b45d4" strokeWidth="2"/>
              <path d="M18 33l22 14 22-14" stroke="#6b45d4" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="57" cy="25" r="7" fill="#e8ff00"/>
              <path d="M57 22v4l2.5 1.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8ff00', marginBottom: '10px' }}>verify email</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text-primary)' }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            We sent an 8-digit code to<br /><span style={{ color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>{email}</span>
          </p>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder="00000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
            style={{
              padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '24px',
              background: 'var(--surface)', border: '1px solid var(--border-input)',
              borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none',
            }}
          />
          <button
            type="submit" disabled={loading || code.length !== 8}
            style={{ padding: '14px', borderRadius: '12px', background: '#6b45d4', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
          >
            {loading ? 'Verifying...' : 'Verify & Place order'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button onClick={resend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>
            {resending ? 'Sending...' : "Didn't receive it? Resend"}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
