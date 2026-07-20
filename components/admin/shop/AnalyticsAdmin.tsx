'use client'
import { useEffect, useState } from 'react'

interface Analytics {
  funnel: {
    page_views: number
    add_to_cart: number
    checkout_started: number
    payment_submitted: number
    order_completed: number
  }
  topProducts: { id: string; name: string; count: number }[]
  abandonedCartUserCount: number
  totalOrders: number
  totalRevenue: number
  days: number
}

export default function AnalyticsAdmin() {
  const [data,    setData]    = useState<Analytics | null>(null)
  const [days,    setDays]    = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/shop/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [days])

  if (loading) return <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading analytics...</div>
  if (!data)   return null

  const funnelSteps = [
    { label: 'Page views',        value: data.funnel.page_views },
    { label: 'Add to cart',       value: data.funnel.add_to_cart },
    { label: 'Checkout started',  value: data.funnel.checkout_started },
    { label: 'Payment submitted', value: data.funnel.payment_submitted },
    { label: 'Orders completed',  value: data.funnel.order_completed },
  ]

  const maxFunnel = Math.max(...funnelSteps.map(s => s.value), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '680px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Analytics</h2>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))}
          style={{ marginLeft: 'auto', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '12px' }}>
        {[
          { label: 'Total orders',       value: data.totalOrders },
          { label: 'Revenue (verified)', value: `₹${data.totalRevenue.toFixed(0)}` },
          { label: 'Abandoned carts',    value: data.abandonedCartUserCount },
        ].map(tile => (
          <div key={tile.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>{tile.value}</div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '6px' }}>{tile.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '16px' }}>Conversion funnel</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {funnelSteps.map(step => (
            <div key={step.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{step.label}</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>{step.value}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(step.value / maxFunnel) * 100}%`, background: 'var(--lavender)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.topProducts.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Top products (add to cart)</div>
          {data.topProducts.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{i + 1}. {p.name}</span>
              <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>{p.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
