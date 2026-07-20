'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShopOrder, ShopSettings } from '@/lib/shop.types'

function PaymentForm() {
  const router     = useRouter()
  const params     = useSearchParams()
  const orderId    = params.get('order') ?? ''
  const { track }  = useShopSession()
  const [order,    setOrder]    = useState<ShopOrder | null>(null)
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [utr,      setUtr]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    if (!orderId) { router.replace('/shop'); return }
    Promise.all([
      fetch(`/api/shop/orders/${orderId}`).then(r => r.json()),
      fetch('/api/shop/settings').then(r => r.json()),
    ]).then(([ord, set]) => {
      setOrder(ord)
      setSettings(set)
    })
  }, [orderId, router])

  async function markPaid() {
    setSubmitting(true)
    const res = await fetch(`/api/shop/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utr_reference: utr.trim() || null }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error ?? 'Failed to submit')
      setSubmitting(false)
      return
    }
    track('payment_submitted', { order_id: orderId })
    setDone(true)
    setSubmitting(false)
  }

  if (!order || !settings) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading...</div>
  )

  if (done) return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <CheckCircle size={56} color="var(--lime)" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Payment submitted!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          We'll verify your payment and confirm your order shortly. Track your order status below.
        </p>
        <a href={`/shop/orders/${orderId}`} style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--lavender)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          View order status
        </a>
      </div>
    </main>
  )

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Complete payment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Order summary</div>
        {order.items?.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} × {item.quantity} ({item.size})</span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>₹{Number(order.total).toFixed(0)}</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '16px' }}>
          Pay via UPI
        </div>
        {settings.qr_code_url && (
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 16px', background: '#fff', borderRadius: '12px', padding: '8px' }}>
            <Image src={settings.qr_code_url} alt="UPI QR Code" fill style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {settings.upi_id}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Scan QR or pay to UPI ID above</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
          UTR / transaction reference (optional)
        </div>
        <input
          type="text"
          placeholder="e.g. 423456789012"
          value={utr}
          onChange={e => setUtr(e.target.value)}
          style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-mono)', outline: 'none' }}
        />
        <button
          onClick={markPaid}
          disabled={submitting}
          style={{ padding: '14px', borderRadius: '12px', background: 'var(--lime)', color: '#0a0a0a', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--ff-body)' }}
        >
          {submitting ? 'Submitting...' : "I've paid ₹" + Number(order.total).toFixed(0)}
        </button>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentForm />
    </Suspense>
  )
}
