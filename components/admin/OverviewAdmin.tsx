'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  pending_payment:   'var(--text-dim)',
  payment_submitted: 'var(--lavender)',
  confirmed:         'var(--lime)',
  shipped:           'var(--lime)',
  delivered:         'var(--lime)',
  cancelled:         'var(--red)',
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment:   'Pending',
  payment_submitted: 'Submitted',
  confirmed:         'Confirmed',
  shipped:           'Shipped',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
}

type Overview = {
  totalOrders:         number
  pendingVerification: number
  moviesLogged:        number
  blogPosts:           number
  totalRevenue:        number
  recentOrders: {
    id: string
    total: string | number
    status: string
    payment_status: string
    created_at: string
    shipping_address: { name?: string }
  }[]
}

function StatCard({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${warn ? 'rgba(255,200,0,0.25)' : 'var(--border-card)'}`, borderRadius: '14px', padding: '18px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--ff-display)', color: warn ? '#e8b800' : 'var(--text-primary)', letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--ff-mono)' }}>{sub}</div>}
    </div>
  )
}

export default function OverviewAdmin() {
  const [data,    setData]    = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/overview').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px' }}>
        {[0,1,2,3].map(i => <div key={i} className="sk" style={{ height: '100px', borderRadius: '14px' }} />)}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div className="sk" style={{ width: '120px', height: '13px' }} />
              <div className="sk" style={{ width: '80px', height: '11px' }} />
            </div>
            <div className="sk" style={{ width: '70px', height: '22px', borderRadius: '100px' }} />
            <div className="sk" style={{ width: '40px', height: '13px' }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px' }}>
        <StatCard label="Total orders"   value={data.totalOrders}         sub="all time" />
        <StatCard label="Needs review"   value={data.pendingVerification} sub="payment submitted" warn={data.pendingVerification > 0} />
        <StatCard label="Revenue"        value={`₹${data.totalRevenue.toLocaleString('en-IN')}`} sub="verified payments" />
        <StatCard label="Movies logged"  value={data.moviesLogged}        sub="all time" />
        <StatCard label="Blog posts"     value={data.blogPosts}           sub="published" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent orders</span>
          <Link href="/admin?tab=shop" style={{ fontSize: '12px', color: 'var(--lavender)', textDecoration: 'none', fontFamily: 'var(--ff-mono)' }}>View all →</Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>No orders yet</div>
        ) : data.recentOrders.map((order, i) => (
          <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px', borderBottom: i < data.recentOrders.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{order.shipping_address?.name ?? '—'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>#{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}</div>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[order.status] ?? 'var(--text-dim)', padding: '3px 10px', border: `1px solid ${STATUS_COLORS[order.status] ?? 'var(--border)'}`, borderRadius: '100px', whiteSpace: 'nowrap' }}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <span style={{ fontSize: '13px', fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>₹{Number(order.total).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
