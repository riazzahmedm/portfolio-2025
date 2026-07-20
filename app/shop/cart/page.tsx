'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useCart, applyBundleDeal } from '@/hooks/useCart'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShopBundleDeal } from '@/lib/shop.types'

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart()
  const { track } = useShopSession()
  const router = useRouter()
  const [deals,          setDeals]          = useState<ShopBundleDeal[]>([])
  const [couponCode,     setCouponCode]     = useState('')
  const [couponError,    setCouponError]    = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied,  setCouponApplied]  = useState('')
  const [validating,     setValidating]     = useState(false)

  useEffect(() => {
    fetch('/api/admin/shop/discounts/bundles').then(r => r.json()).then(setDeals)
  }, [])

  const { subtotal, discount: bundleDiscount, total: bundleTotal, appliedDeal } = applyBundleDeal(items, deals)
  const finalTotal = Math.max(0, bundleTotal - couponDiscount)

  async function validateCoupon() {
    if (!couponCode.trim()) return
    setValidating(true); setCouponError('')
    const res = await fetch('/api/shop/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.trim(), subtotal: bundleTotal }),
    })
    const data = await res.json()
    if (!res.ok) { setCouponError(data.error); setValidating(false); return }
    setCouponDiscount(data.discount)
    setCouponApplied(couponCode.trim().toUpperCase())
    toast.success(`Coupon applied — ₹${data.discount} off`)
    setValidating(false)
  }

  function goToCheckout() {
    track('checkout_started', { item_count: items.reduce((s, i) => s + i.qty, 0), total: finalTotal })
    router.push('/shop/checkout')
  }

  if (items.length === 0) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
      <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>Browse the shop to add some goodies.</p>
      <Link href="/shop" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--lavender)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
        Browse shop
      </Link>
    </main>
  )

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 32px' }}>
        Cart
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {items.map(item => (
          <div key={item.variantId} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '14px 16px' }}>
            {item.image && (
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>{item.size}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-raised)', borderRadius: '8px', padding: '4px 10px' }}>
                <button onClick={() => updateQty(item.variantId, item.qty - 1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}>−</button>
                <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.variantId, item.qty + 1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}>+</button>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', minWidth: '56px', textAlign: 'right' }}>
                ₹{(item.price * item.qty).toFixed(0)}
              </div>
              <button onClick={() => removeItem(item.variantId)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {appliedDeal && (
        <div style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime)', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
          Bundle deal: {appliedDeal.name} — ₹{bundleDiscount.toFixed(0)} saved
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
          style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-mono)', outline: 'none' }}
        />
        <button
          onClick={validateCoupon}
          disabled={validating || !couponCode.trim() || !!couponApplied}
          style={{ padding: '10px 20px', borderRadius: '10px', background: couponApplied ? 'var(--lime-dim)' : 'var(--lavender)', color: couponApplied ? 'var(--lime)' : '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
        >
          {couponApplied ? 'Applied' : validating ? '...' : 'Apply'}
        </button>
      </div>
      {couponError && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px', fontFamily: 'var(--ff-mono)' }}>{couponError}</div>}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <Row label="Subtotal" value={`₹${subtotal.toFixed(0)}`} />
        {bundleDiscount > 0 && <Row label="Bundle deal" value={`−₹${bundleDiscount.toFixed(0)}`} highlight="lime" />}
        {couponDiscount > 0 && <Row label={`Coupon (${couponApplied})`} value={`−₹${couponDiscount.toFixed(0)}`} highlight="lime" />}
        <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
        <Row label="Total" value={`₹${finalTotal.toFixed(0)}`} bold />
      </div>

      <button
        onClick={goToCheckout}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'var(--ff-body)' }}
      >
        Proceed to checkout <ArrowRight size={18} />
      </button>
    </main>
  )
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: 'lime' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: bold ? '16px' : '14px', fontWeight: bold ? 700 : 400 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: highlight === 'lime' ? 'var(--lime)' : 'var(--text-primary)', fontFamily: 'var(--ff-mono)' }}>{value}</span>
    </div>
  )
}
