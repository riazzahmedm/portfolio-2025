'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ShopOrder, OrderStatus } from '@/lib/shop.types'

const STATUS_OPTIONS: OrderStatus[] = ['pending_payment','payment_submitted','confirmed','shipped','delivered','cancelled']
const PAYMENT_OPTIONS = ['unpaid','submitted','verified'] as const

export default function OrdersAdmin() {
  const [orders,   setOrders]   = useState<ShopOrder[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter,   setFilter]   = useState<string>('all')

  function refresh() {
    const params = filter !== 'all' ? `?payment_status=${filter}` : ''
    fetch(`/api/admin/shop/orders${params}`).then(r => r.json()).then(setOrders)
  }

  useEffect(() => { refresh() }, [filter])

  async function updateOrder(id: string, patch: Record<string, string>) {
    const res = await fetch(`/api/admin/shop/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) { toast.success('Order updated'); refresh() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  const statusColor = (s: string) => ({
    pending_payment:   'var(--text-dim)',
    payment_submitted: 'var(--lavender)',
    confirmed:         'var(--lime)',
    shipped:           'var(--lime)',
    delivered:         'var(--lime)',
    cancelled:         'var(--red)',
  } as Record<string, string>)[s] ?? 'var(--text-dim)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Orders</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'submitted', 'unpaid', 'verified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '12px', border: '1px solid', borderColor: filter === f ? 'var(--lavender)' : 'var(--border-card)', background: filter === f ? 'var(--lavender-dim)' : 'transparent', color: filter === f ? 'var(--lavender)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--ff-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>No orders.</p>}

      {orders.map(order => (
        <div key={order.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)' }}>#{order.id.slice(0,8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{order.shipping_address.name} — ₹{Number(order.total).toFixed(0)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>{order.shipping_address.email} · {order.shipping_address.phone}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(order.status) }}>{order.status.replace(/_/g,' ')}</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(order.payment_status) }}>Payment: {order.payment_status}</span>
            </div>
            <button onClick={() => setExpanded(e => e === order.id ? null : order.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
              {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {expanded === order.id && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} — {item.size} × {item.quantity}</span>
                    <span style={{ fontFamily: 'var(--ff-mono)' }}>₹{(Number(item.price)*item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--surface-alt)', borderRadius: '10px', padding: '12px' }}>
                {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                {order.utr_reference && <div style={{ marginTop: '4px' }}>UTR: <strong style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>{order.utr_reference}</strong></div>}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={order.payment_status}
                  onChange={e => updateOrder(order.id, { payment_status: e.target.value })}
                  style={{ padding: '8px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none', cursor: 'pointer' }}
                >
                  {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={order.status}
                  onChange={e => updateOrder(order.id, { status: e.target.value })}
                  style={{ padding: '8px 12px', background: 'var(--surface-raised)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none', cursor: 'pointer' }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
