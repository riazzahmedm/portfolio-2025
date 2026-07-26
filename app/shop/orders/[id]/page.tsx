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
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="sk" style={{ width: '180px', height: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sk" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
          <div className="sk" style={{ width: '140px', height: '24px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0,1,2].map(i => <div key={i} className="sk" style={{ flex: 1, height: '4px', borderRadius: '2px' }} />)}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="sk" style={{ width: '60px', height: '11px' }} />
        {[1,2].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="sk" style={{ width: '55%', height: '14px' }} />
            <div className="sk" style={{ width: '40px', height: '14px' }} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
          <div className="sk" style={{ width: '40px', height: '15px' }} />
          <div className="sk" style={{ width: '50px', height: '15px' }} />
        </div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="sk" style={{ width: '80px', height: '11px' }} />
        <div className="sk" style={{ width: '120px', height: '14px' }} />
        <div className="sk" style={{ width: '200px', height: '14px' }} />
        <div className="sk" style={{ width: '160px', height: '14px' }} />
        <div className="sk" style={{ width: '100px', height: '14px' }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="sk" style={{ width: '160px', height: '13px' }} />
          <div className="sk" style={{ width: '120px', height: '12px' }} />
        </div>
        <div className="sk" style={{ width: '140px', height: '38px', borderRadius: '10px' }} />
      </div>
    </main>
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
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
          {order.status === 'delivered' ? 'Shipped to' : 'Shipping to'}
        </div>
        <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{addr.name}</strong><br />
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
          {addr.city}, {addr.state} — {addr.pincode}<br />
          {addr.phone}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Need help with your order?</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Chat with us on WhatsApp</div>
        </div>
        <a
          href={`https://wa.me/918072852495?text=${encodeURIComponent(`Hi, I have a query about my order #${order.id.slice(0, 8).toUpperCase()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#25d366', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '13px', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat on WhatsApp
        </a>
      </div>
    </main>
  )
}
