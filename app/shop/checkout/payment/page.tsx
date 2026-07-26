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
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="sk" style={{ width: '180px', height: '26px', borderRadius: '8px' }} />
        <div className="sk" style={{ width: '120px', height: '12px' }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="sk" style={{ width: '90px', height: '11px' }} />
        {[1, 2].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <div className="sk" style={{ width: '50%', height: '13px' }} />
            <div className="sk" style={{ width: '40px', height: '13px' }} />
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="sk" style={{ width: '40px', height: '16px' }} />
          <div className="sk" style={{ width: '60px', height: '16px' }} />
        </div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div className="sk" style={{ width: '70px', height: '11px' }} />
        <div className="sk" style={{ width: '180px', height: '180px', borderRadius: '12px' }} />
        <div className="sk" style={{ width: '160px', height: '16px' }} />
        <div className="sk" style={{ width: '120px', height: '12px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="sk" style={{ width: '200px', height: '11px' }} />
        <div className="sk" style={{ width: '100%', height: '42px', borderRadius: '10px' }} />
        <div className="sk" style={{ width: '100%', height: '50px', borderRadius: '12px' }} />
      </div>
    </main>
  )

  if (done) return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="rgba(107,69,212,0.12)" />
            <circle cx="40" cy="40" r="20" stroke="#6b45d4" strokeWidth="2" />
            <path d="M31 40l6 6 12-12" stroke="#6b45d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="58" cy="24" r="8" fill="#e8ff00" />
            <path d="M55 24h6M58 21v6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8ff00', marginBottom: '10px' }}>payment submitted</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text-primary)' }}>
          You&apos;re all set!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: '300px' }}>
          We&apos;ll verify your payment and confirm your order shortly.
        </p>
        <a href={`/shop/orders/${orderId}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 32px', background: '#6b45d4', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', fontFamily: 'var(--ff-body)' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Delivery</span>
          <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lime)' }}>Free</span>
        </div>
        {order.discount_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
            </span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lime)' }}>−₹{Number(order.discount_amount).toFixed(0)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0 4px' }} />
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
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 16px', background: 'var(--surface-alt)', borderRadius: '12px', padding: '8px' }}>
            <Image src={settings.qr_code_url} alt="UPI QR Code" fill style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {settings.upi_id.split('@').map((part, i, arr) => (
            <span key={i}>{part}{i < arr.length - 1 && <span style={{ color: '#6b45d4' }}>@</span>}</span>
          ))}
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
