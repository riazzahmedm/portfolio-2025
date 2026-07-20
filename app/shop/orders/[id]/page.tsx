'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { ShopOrder } from '@/lib/shop.types'

const STATUS_STEPS = ['confirmed', 'shipped', 'delivered'] as const
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_payment:   <Clock size={20} />,
  payment_submitted: <Clock size={20} color="var(--lavender)" />,
  confirmed:         <Package size={20} color="var(--lime)" />,
  shipped:           <Truck size={20} color="var(--lime)" />,
  delivered:         <CheckCircle size={20} color="var(--lime)" />,
  cancelled:         <XCircle size={20} color="var(--red)" />,
}

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [order,   setOrder]   = useState<ShopOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/shop/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.replace('/shop/orders'); return }
        setOrder(data); setLoading(false)
      })
  }, [id, router])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading...</div>
  )
  if (!order) return null

  const addr = order.shipping_address

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <div style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)', marginBottom: '6px' }}>
          Order #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {STATUS_ICONS[order.status]}
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
            {order.status.replace(/_/g, ' ')}
          </h1>
        </div>
      </div>

      {!['cancelled', 'pending_payment', 'payment_submitted'].includes(order.status) && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {STATUS_STEPS.map(step => {
            const idx        = STATUS_STEPS.indexOf(step)
            const currentIdx = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number])
            const active     = idx <= currentIdx
            return (
              <div key={step} style={{ flex: 1, height: '4px', borderRadius: '2px', background: active ? 'var(--lime)' : 'var(--surface-raised)' }} />
            )
          })}
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Items</div>
        {order.items?.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} — {item.size} × {item.quantity}</span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', paddingTop: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>₹{Number(order.total).toFixed(0)}</span>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Shipping to</div>
        <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{addr.name}</strong><br />
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
          {addr.city}, {addr.state} — {addr.pincode}<br />
          {addr.phone}
        </div>
      </div>
    </main>
  )
}
