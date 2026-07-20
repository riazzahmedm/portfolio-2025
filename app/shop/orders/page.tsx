'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ShopOrder } from '@/lib/shop.types'

const STATUS_LABELS: Record<string, string> = {
  pending_payment:   'Pending payment',
  payment_submitted: 'Payment submitted',
  confirmed:         'Confirmed',
  shipped:           'Shipped',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment:   'var(--text-dim)',
  payment_submitted: 'var(--lavender)',
  confirmed:         'var(--lime)',
  shipped:           'var(--lime)',
  delivered:         'var(--lime)',
  cancelled:         'var(--red)',
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [step,    setStep]    = useState<'check'|'otp'|'list'>('check')
  const [email,   setEmail]   = useState('')
  const [code,    setCode]    = useState('')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/shop/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setStep('list')
          fetch('/api/shop/orders').then(r => r.json()).then(data => { setOrders(data); setLoading(false) })
        } else {
          setLoading(false)
        }
      })
  }, [])

  async function sendOtp() {
    setSending(true); setError('')
    const res = await fetch('/api/shop/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) { setError('Failed to send code'); setSending(false); return }
    setStep('otp'); setSending(false)
  }

  async function verifyOtp() {
    setSending(true); setError('')
    const res = await fetch('/api/shop/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code }),
    })
    if (!res.ok) { setError('Invalid or expired code'); setSending(false); return }
    const data = await fetch('/api/shop/orders').then(r => r.json())
    setOrders(data); setStep('list'); setLoading(false); setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading...</div>
  )

  if (step === 'check') return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>My orders</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>Enter your email to view your orders</p>
        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={sendOtp} disabled={sending || !email}
          style={{ padding: '12px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {sending ? 'Sending...' : 'Send code'}
        </button>
      </div>
    </main>
  )

  if (step === 'otp') return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Enter code</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>6-digit code sent to {email}</p>
        <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={{ padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '22px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={verifyOtp} disabled={sending || code.length !== 6}
          style={{ padding: '12px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {sending ? 'Verifying...' : 'View my orders'}
        </button>
      </div>
    </main>
  )

  if (orders.length === 0) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No orders yet.</p>
      <Link href="/shop" style={{ color: 'var(--lavender)' }}>Browse shop →</Link>
    </main>
  )

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 32px' }}>My orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {orders.map(order => (
          <Link key={order.id} href={`/shop/orders/${order.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{Number(order.total).toFixed(0)}
                </div>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[order.status] ?? 'var(--text-dim)' }}>
                {STATUS_LABELS[order.status] ?? order.status}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
