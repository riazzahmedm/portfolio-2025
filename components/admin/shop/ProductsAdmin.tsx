'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { ShopProduct, ShopCategory, ShopTag, ShopVariant } from '@/lib/shop.types'

export default function ProductsAdmin() {
  const [products,   setProducts]   = useState<ShopProduct[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [tags,       setTags]       = useState<ShopTag[]>([])
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [loading,    setLoading]    = useState(true)

  function refresh() {
    fetch('/api/shop/products').then(r => r.json()).then(data => { setProducts(data); setLoading(false) })
  }

  useEffect(() => {
    refresh()
    fetch('/api/shop/categories').then(r => r.json()).then(setCategories)
    fetch('/api/shop/tags').then(r => r.json()).then(setTags)
  }, [])

  async function deleteProduct(id: string) {
    if (!confirm('Delete product?')) return
    await fetch(`/api/shop/products/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    refresh()
  }

  async function toggleActive(product: ShopProduct) {
    await fetch(`/api/shop/products/${product.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !product.is_active }),
    })
    refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Products</h2>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '8px 18px', borderRadius: '10px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {showForm ? 'Cancel' : '+ New product'}
        </button>
      </div>

      {showForm && <ProductForm categories={categories} tags={tags} onSaved={() => { setShowForm(false); refresh() }} />}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <style>{`.sk{background:var(--surface-raised);border-radius:6px;animation:pulse 1.6s ease-in-out infinite}`}</style>
          {[0,1,2].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="sk" style={{ width: '52px', height: '52px', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="sk" style={{ width: '160px', height: '14px' }} />
                <div className="sk" style={{ width: '110px', height: '11px' }} />
              </div>
              <div className="sk" style={{ width: '60px', height: '26px', borderRadius: '999px' }} />
              <div className="sk" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && !showForm && (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>No products yet.</p>
      )}

      {products.map(product => (
        <div key={product.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
            {product.images[0] && (
              <div style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>
                {product.category?.name ?? 'No category'} · {product.variants?.length ?? 0} variants
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => toggleActive(product)}
                style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', border: '1px solid', borderColor: product.is_active ? 'var(--lime)' : 'var(--border-card)', background: product.is_active ? 'var(--lime-dim)' : 'transparent', color: product.is_active ? 'var(--lime)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'var(--ff-mono)' }}
              >
                {product.is_active ? 'Active' : 'Hidden'}
              </button>
              <button onClick={() => setExpanded(e => e === product.id ? null : product.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                {expanded === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button onClick={() => deleteProduct(product.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {expanded === product.id && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px' }}>
              <VariantsEditor productId={product.id} variants={product.variants ?? []} onChanged={refresh} />
              <TagsEditor productId={product.id} allTags={tags} selectedTags={product.tags ?? []} onChanged={refresh} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ProductForm({ categories, tags, onSaved }: { categories: ShopCategory[]; tags: ShopTag[]; onSaved: () => void }) {
  const [form,      setForm]      = useState({ name: '', description: '', category_id: '', is_active: true })
  const [images,    setImages]    = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/shop/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setImages(imgs => [...imgs, data.url])
    else toast.error(data.error ?? 'Upload failed')
    setUploading(false)
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    const res = await fetch('/api/shop/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, images, category_id: form.category_id || null }),
    })
    if (res.ok) { toast.success('Product created'); onSaved() }
    else { const e = await res.json(); toast.error(e.error) }
    setSaving(false)
  }

  return (
    <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>New product</h3>
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name"
        style={{ padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }} />
      <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={3}
        style={{ padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', resize: 'vertical' }} />
      <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
        style={{ padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: form.category_id ? 'var(--text-primary)' : 'var(--text-dim)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}>
        <option value="">No category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: '64px', height: '64px' }}>
            <Image src={url} alt="" fill style={{ objectFit: 'cover', borderRadius: '8px' }} />
            <button onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', border: 'none', borderRadius: '999px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <X size={10} color="#fff" />
            </button>
          </div>
        ))}
        <label style={{ width: '64px', height: '64px', border: '2px dashed var(--border-card)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}>
          {uploading ? '...' : <Plus size={20} />}
          <input type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
        </label>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: '10px 22px', borderRadius: '10px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
        {saving ? 'Creating...' : 'Create product'}
      </button>
    </div>
  )
}

function VariantsEditor({ productId, variants, onChanged }: { productId: string; variants: ShopVariant[]; onChanged: () => void }) {
  const [adding, setAdding] = useState(false)
  const [form,   setForm]   = useState({ size: '', price: '', stock_qty: '0' })

  async function add() {
    if (!form.size || !form.price) { toast.error('Size and price required'); return }
    const res = await fetch('/api/shop/variants', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, size: form.size, price: parseFloat(form.price), stock_qty: parseInt(form.stock_qty) }),
    })
    if (res.ok) { toast.success('Variant added'); setForm({ size: '', price: '', stock_qty: '0' }); setAdding(false); onChanged() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  async function updateStock(id: string, qty: number) {
    await fetch(`/api/shop/variants/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_qty: qty }),
    })
    onChanged()
  }

  async function deleteVariant(id: string) {
    await fetch(`/api/shop/variants/${id}`, { method: 'DELETE' })
    onChanged()
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>Variants</div>
      {variants.map(v => (
        <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', minWidth: '60px', fontFamily: 'var(--ff-mono)' }}>{v.size}</span>
          <span style={{ fontSize: '13px', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)', minWidth: '56px' }}>₹{Number(v.price).toFixed(0)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => updateStock(v.id, Math.max(0, v.stock_qty - 1))} style={{ background: 'var(--surface-raised)', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>−</button>
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', minWidth: '24px', textAlign: 'center' }}>{v.stock_qty}</span>
            <button onClick={() => updateStock(v.id, v.stock_qty + 1)} style={{ background: 'var(--surface-raised)', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>+</button>
          </div>
          <button onClick={() => deleteVariant(v.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: 'auto', padding: '2px' }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ marginTop: '10px', fontSize: '12px', color: 'var(--lavender)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontFamily: 'var(--ff-mono)' }}>
          <Plus size={13} /> Add variant
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="Size (e.g. A4)"
            style={{ width: '80px', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" type="number"
            style={{ width: '80px', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
          <input value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} placeholder="Stock" type="number"
            style={{ width: '72px', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
          <button onClick={add} style={{ padding: '7px 14px', background: 'rgba(184,160,255,0.1)', color: 'var(--lavender)', border: '1px solid rgba(184,160,255,0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)' }}>Add</button>
          <button onClick={() => setAdding(false)} style={{ padding: '7px 10px', background: 'var(--surface-raised)', color: 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
        </div>
      )}
    </div>
  )
}

function TagsEditor({ productId, allTags, selectedTags, onChanged }: { productId: string; allTags: ShopTag[]; selectedTags: ShopTag[]; onChanged: () => void }) {
  const selectedIds = new Set(selectedTags.map(t => t.id))

  async function toggle(tagId: string) {
    const next = selectedIds.has(tagId)
      ? [...selectedIds].filter(id => id !== tagId)
      : [...selectedIds, tagId]
    await fetch(`/api/shop/products/${productId}/tags`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagIds: next }),
    })
    onChanged()
  }

  return (
    <div>
      <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '10px' }}>Tags</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {allTags.map(tag => (
          <button key={tag.id} onClick={() => toggle(tag.id)}
            style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', border: '1px solid', borderColor: selectedIds.has(tag.id) ? 'var(--lavender)' : 'var(--border-card)', background: selectedIds.has(tag.id) ? 'var(--lavender-dim)' : 'transparent', color: selectedIds.has(tag.id) ? 'var(--lavender)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--ff-mono)' }}>
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
}
