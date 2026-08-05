'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart, applyBundleDeal } from '@/hooks/useCart'
import type { ShippingAddress, ShopBundleDeal } from '@/lib/shop.types'

const PENDING_KEY = 'shop-pending-checkout'

export default function CheckoutPage() {
  const router       = useRouter()
  const { items }    = useCart()
  const [deals, setDeals] = useState<ShopBundleDeal[]>([])
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [form, setForm] = useState<ShippingAddress>({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '',
  })

  useEffect(() => {
    setReady(true)
    fetch('/api/admin/shop/discounts/bundles').then(r => r.json()).then(setDeals)
  }, [])

  useEffect(() => {
    if (ready && items.length === 0) router.replace('/shop/cart')
  }, [ready, items.length, router])

  const { total: bundleTotal } = applyBundleDeal(items, deals)
  const couponDiscount = 0
  const finalTotal = Math.max(0, bundleTotal - couponDiscount)

  function update(field: keyof ShippingAddress, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)

    const otpRes = await fetch('/api/shop/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    if (!otpRes.ok) {
      const err = await otpRes.json()
      toast.error(err.error ?? 'Failed to send OTP')
      setLoading(false)
      return
    }

    const subtotalRaw = items.reduce((s, i) => s + i.price * i.qty, 0)
    const discountAmount = couponDiscount + Math.max(0, subtotalRaw - bundleTotal)

    sessionStorage.setItem(PENDING_KEY, JSON.stringify({
      items,
      shipping_address: form,
      subtotal: subtotalRaw,
      discount_amount: discountAmount,
      total: finalTotal,
    }))

    setLoading(false)
    router.push(`/shop/checkout/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)', boxSizing: 'border-box', width: '100%' }}>
      <style>{`
        .checkout-city-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 399px) { .checkout-city-grid { grid-template-columns: 1fr; } }
      `}</style>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px, 6vw, 28px)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 28px', color: 'var(--text-primary)' }}>
        Checkout
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Full name *"  value={form.name}        onChange={v => update('name', v)}    placeholder="Peter Parker" />
        <Field label="Email *"      value={form.email}       onChange={v => update('email', v)}   placeholder="peter@dailybugle.com" type="email" />
        <Field label="Phone *"      value={form.phone}       onChange={v => update('phone', v)}   placeholder="+91 98765 43210" type="tel" />
        <Field label="Address *"    value={form.line1}       onChange={v => update('line1', v)}   placeholder="20 Ingram Street" />
        <Field label="Address 2"    value={form.line2 ?? ''} onChange={v => update('line2', v)}   placeholder="Forest Hills, Queens (optional)" />
        <div className="checkout-city-grid">
          <Field label="City *"     value={form.city}        onChange={v => update('city', v)}    placeholder="New York" />
          <Field label="State *"    value={form.state}       onChange={v => update('state', v)}   placeholder="New York" />
        </div>
        <Field label="Pincode *"    value={form.pincode}     onChange={v => update('pincode', v)} placeholder="11375" />

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total</span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>₹{finalTotal.toFixed(0)}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--ff-mono)' }}>
            We'll send an OTP to verify your email before payment
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '14px', borderRadius: '12px', background: '#6b45d4', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)', marginTop: '8px' }}
        >
          {loading ? 'Sending OTP...' : 'Continue — Verify email'}
        </button>
      </form>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
      />
    </div>
  )
}
