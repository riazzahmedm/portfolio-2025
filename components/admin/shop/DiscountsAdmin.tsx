'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import type { ShopBundleDeal, ShopCoupon } from '@/lib/shop.types'

export default function DiscountsAdmin() {
  const [bundles, setBundles] = useState<ShopBundleDeal[]>([])
  const [coupons, setCoupons] = useState<ShopCoupon[]>([])

  function refresh() {
    fetch('/api/admin/shop/discounts/bundles').then(r => r.json()).then(setBundles)
    fetch('/api/admin/shop/discounts/coupons').then(r => r.json()).then(setCoupons)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '640px' }}>
      <BundlesSection bundles={bundles} onChanged={refresh} />
      <CouponsSection coupons={coupons} onChanged={refresh} />
    </div>
  )
}

function BundlesSection({ bundles, onChanged }: { bundles: ShopBundleDeal[]; onChanged: () => void }) {
  const [form,   setForm]   = useState({ name: '', min_qty: '', price: '' })
  const [saving, setSaving] = useState(false)

  async function add() {
    if (!form.name || !form.min_qty || !form.price) { toast.error('All fields required'); return }
    setSaving(true)
    const res = await fetch('/api/admin/shop/discounts/bundles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, min_qty: parseInt(form.min_qty), price: parseFloat(form.price) }),
    })
    if (res.ok) { toast.success('Bundle deal added'); setForm({ name: '', min_qty: '', price: '' }); onChanged() }
    else { const e = await res.json(); toast.error(e.error) }
    setSaving(false)
  }

  async function toggle(b: ShopBundleDeal) {
    await fetch(`/api/admin/shop/discounts/bundles/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !b.is_active }) })
    onChanged()
  }

  async function del(id: string) {
    await fetch(`/api/admin/shop/discounts/bundles/${id}`, { method: 'DELETE' }); toast.success('Deleted'); onChanged()
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px' }}>Bundle deals</h3>
      <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--ff-mono)', marginBottom: '16px' }}>Auto-applied when cart qty reaches minimum</p>
      {bundles.map(b => (
        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{b.name}</span>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>min {b.min_qty} items → ₹{Number(b.price).toFixed(0)}</span>
          <button onClick={() => toggle(b)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', border: '1px solid', borderColor: b.is_active ? 'var(--lime)' : 'var(--border-card)', background: b.is_active ? 'var(--lime-dim)' : 'transparent', color: b.is_active ? 'var(--lime)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--ff-mono)' }}>
            {b.is_active ? 'On' : 'Off'}
          </button>
          <button onClick={() => del(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Deal name"
          style={{ flex: 1, minWidth: '120px', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-body)', outline: 'none' }} />
        <input value={form.min_qty} onChange={e => setForm(f => ({ ...f, min_qty: e.target.value }))} placeholder="Min qty" type="number"
          style={{ width: '80px', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹ price" type="number"
          style={{ width: '80px', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <button onClick={add} disabled={saving} style={{ padding: '8px 16px', background: 'var(--lavender)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)' }}>
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}

function CouponsSection({ coupons, onChanged }: { coupons: ShopCoupon[]; onChanged: () => void }) {
  const [form,   setForm]   = useState({ code: '', type: 'flat', value: '', min_order_amount: '', max_uses: '', expires_at: '' })
  const [saving, setSaving] = useState(false)

  async function add() {
    if (!form.code || !form.value) { toast.error('Code and value required'); return }
    setSaving(true)
    const res = await fetch('/api/admin/shop/discounts/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code, type: form.type, value: parseFloat(form.value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        max_uses:   form.max_uses   ? parseInt(form.max_uses)  : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      }),
    })
    if (res.ok) { toast.success('Coupon created'); setForm({ code: '', type: 'flat', value: '', min_order_amount: '', max_uses: '', expires_at: '' }); onChanged() }
    else { const e = await res.json(); toast.error(e.error) }
    setSaving(false)
  }

  async function toggle(c: ShopCoupon) {
    await fetch(`/api/admin/shop/discounts/coupons/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !c.is_active }) })
    onChanged()
  }

  async function del(id: string) {
    await fetch(`/api/admin/shop/discounts/coupons/${id}`, { method: 'DELETE' }); toast.success('Deleted'); onChanged()
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px' }}>Coupon codes</h3>
      {coupons.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, minWidth: '100px' }}>{c.code}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--ff-mono)' }}>
            {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
            {c.min_order_amount > 0 ? ` (min ₹${c.min_order_amount})` : ''}
            {c.max_uses ? ` · ${c.uses_count}/${c.max_uses} used` : ` · ${c.uses_count} used`}
          </span>
          <button onClick={() => toggle(c)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', border: '1px solid', borderColor: c.is_active ? 'var(--lime)' : 'var(--border-card)', background: c.is_active ? 'var(--lime-dim)' : 'transparent', color: c.is_active ? 'var(--lime)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--ff-mono)', marginLeft: 'auto' }}>
            {c.is_active ? 'On' : 'Off'}
          </button>
          <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '8px', marginTop: '16px' }}>
        <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="CODE"
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }}>
          <option value="flat">Flat ₹</option>
          <option value="percentage">Percent %</option>
        </select>
        <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="Value" type="number"
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <input value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))} placeholder="Min order ₹" type="number"
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <input value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Max uses" type="number"
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <input value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} type="date"
          style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        <button onClick={add} disabled={saving}
          style={{ padding: '8px 16px', background: 'var(--lavender)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)', gridColumn: 'span 2' }}>
          Create coupon
        </button>
      </div>
    </div>
  )
}
