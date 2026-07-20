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
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return }
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
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>
            We sent a 6-digit code to<br /><strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '24px',
              background: 'var(--surface)', border: '1px solid var(--border-input)',
              borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none',
            }}
          />
          <button
            type="submit" disabled={loading || code.length !== 6}
            style={{ padding: '14px', borderRadius: '12px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
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
