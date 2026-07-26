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
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
      <div className="sk" style={{ width: '140px', height: '28px', borderRadius: '8px', marginBottom: '32px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="sk" style={{ width: '140px', height: '12px' }} />
              <div className="sk" style={{ width: '60px', height: '15px' }} />
            </div>
            <div className="sk" style={{ width: '80px', height: '12px' }} />
          </div>
        ))}
      </div>
    </main>
  )

  if (step === 'check') return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="rgba(107,69,212,0.12)" />
            <rect x="18" y="27" width="44" height="30" rx="4" stroke="#6b45d4" strokeWidth="2"/>
            <path d="M18 33l22 14 22-14" stroke="#6b45d4" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="57" cy="25" r="7" fill="#e8ff00"/>
            <path d="M57 22v4l2.5 1.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8ff00', marginBottom: '10px' }}>order history</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text-primary)' }}>My orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px', lineHeight: 1.6 }}>Enter your email and we'll send a code to pull up your orders.</p>
        </div>
        <input type="email" placeholder="peter@dailybugle.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', textAlign: 'left' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={sendOtp} disabled={sending || !email}
          style={{ padding: '13px', borderRadius: '12px', background: '#6b45d4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
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
        <input type="text" inputMode="numeric" maxLength={8} placeholder="00000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          style={{ padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '22px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={verifyOtp} disabled={sending || code.length !== 8}
          style={{ padding: '12px', borderRadius: '10px', background: '#6b45d4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {sending ? 'Verifying...' : 'View my orders'}
        </button>
      </div>
    </main>
  )

  if (orders.length === 0) return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="rgba(107,69,212,0.12)" />
          <path d="M24 28h32v28a4 4 0 01-4 4H28a4 4 0 01-4-4V28z" stroke="#6b45d4" strokeWidth="2"/>
          <path d="M20 28h40" stroke="#6b45d4" strokeWidth="2" strokeLinecap="round"/>
          <path d="M34 24h12" stroke="#6b45d4" strokeWidth="2" strokeLinecap="round"/>
          <path d="M34 40h12M34 48h8" stroke="rgba(107,69,212,0.5)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="56" cy="26" r="8" fill="#e8ff00"/>
          <path d="M56 22v5l3 2" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8ff00', marginBottom: '10px' }}>no orders found</div>
      <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text-primary)' }}>Nothing ordered yet</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: '300px' }}>Your order history is empty. Time to change that.</p>
      <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 32px', background: '#6b45d4', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--ff-body)' }}>
        Browse the shop
      </Link>
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
