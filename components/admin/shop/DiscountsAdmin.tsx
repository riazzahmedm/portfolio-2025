'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { ShopBundleDeal, ShopCoupon } from '@/lib/shop.types'

const inputStyle = { padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none', width: '100%', boxSizing: 'border-box' as const }
const labelStyle = { fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '6px', display: 'block' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  )
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Bundle deals</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--ff-mono)', margin: 0 }}>Auto-applied when cart quantity reaches the minimum</p>
      </div>

      {/* Existing bundles */}
      {bundles.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden' }}>
          {bundles.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < bundles.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{b.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Min {b.min_qty} items → ₹{Number(b.price).toFixed(0)}</div>
              </div>
              <button onClick={() => toggle(b)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', border: '1px solid', borderColor: b.is_active ? 'var(--lime)' : 'var(--border-card)', background: b.is_active ? 'var(--lime-dim)' : 'transparent', color: b.is_active ? 'var(--lime)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--ff-mono)' }}>
                {b.is_active ? 'On' : 'Off'}
              </button>
              <button onClick={() => del(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>New bundle deal</div>
        <Field label="Deal name">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Buy 3 save" style={inputStyle} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Minimum qty">
            <input value={form.min_qty} onChange={e => setForm(f => ({ ...f, min_qty: e.target.value }))} placeholder="3" type="number" style={inputStyle} />
          </Field>
          <Field label="Bundle price (₹)">
            <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="199" type="number" style={inputStyle} />
          </Field>
        </div>
        <button onClick={add} disabled={saving} style={{ padding: '9px 20px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)', fontWeight: 600, width: 'fit-content' }}>
          {saving ? 'Adding...' : '+ Add deal'}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Coupon codes</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--ff-mono)', margin: 0 }}>Manually applied by customers at checkout</p>
      </div>

      {/* Existing coupons */}
      {coupons.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden' }}>
          {coupons.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < coupons.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '2px' }}>{c.code}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
                  {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                  {c.min_order_amount > 0 ? ` · min ₹${c.min_order_amount}` : ''}
                  {c.max_uses ? ` · ${c.uses_count}/${c.max_uses} used` : ` · ${c.uses_count} used`}
                </div>
              </div>
              <button onClick={() => toggle(c)} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', border: '1px solid', borderColor: c.is_active ? 'var(--lime)' : 'var(--border-card)', background: c.is_active ? 'var(--lime-dim)' : 'transparent', color: c.is_active ? 'var(--lime)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--ff-mono)' }}>
                {c.is_active ? 'On' : 'Off'}
              </button>
              <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>New coupon</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Coupon code">
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" style={inputStyle} />
          </Field>
          <Field label="Discount type">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="flat">Flat ₹ off</option>
              <option value="percentage">Percentage % off</option>
            </select>
          </Field>
          <Field label={form.type === 'percentage' ? 'Discount %' : 'Discount ₹'}>
            <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '10' : '50'} type="number" style={inputStyle} />
          </Field>
          <Field label="Min order (₹)">
            <input value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))} placeholder="0 (no minimum)" type="number" style={inputStyle} />
          </Field>
          <Field label="Max uses">
            <input value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" type="number" style={inputStyle} />
          </Field>
          <Field label="Expires on">
            <input value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} type="date" style={inputStyle} />
          </Field>
        </div>
        <button onClick={add} disabled={saving} style={{ padding: '9px 20px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)', fontWeight: 600, width: 'fit-content' }}>
          {saving ? 'Creating...' : '+ Create coupon'}
        </button>
      </div>
    </div>
  )
}
