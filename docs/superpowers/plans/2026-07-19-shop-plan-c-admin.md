# Shop — Plan C: Unified Admin Panel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Plan A (Foundation) must be complete. Plan B (Storefront) is not required.

**Goal:** Replace the existing scattered admin pages (blog at `/blog/admin`, movies embedded in `/movies`) with a single unified admin panel at `/admin` with three tabs: Blog, Movies, and Shop. The Shop tab has sub-sections for Products, Categories & Tags, Orders, Discounts, Analytics, and Settings.

**Architecture:** Single `'use client'` page at `/app/admin/page.tsx` with tab-based navigation. Blog and Movies admin content is extracted from their current locations and ported into reusable components. All admin actions use the unified `admin` cookie via `/api/auth/admin`. Inline styles + CSS vars throughout, matching existing codebase style.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, inline styles + CSS vars, `sonner` toasts, `lucide-react` icons.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/admin/page.tsx` | Create | Unified admin shell with tab switching |
| `components/admin/PasswordGate.tsx` | Create | Shared password gate (extracted from blog/admin) |
| `components/admin/blog/BlogAdmin.tsx` | Create | Blog management tab content |
| `components/admin/movies/MoviesAdmin.tsx` | Create | Movies management tab content |
| `components/admin/shop/ShopAdmin.tsx` | Create | Shop tab shell with sub-tabs |
| `components/admin/shop/ProductsAdmin.tsx` | Create | Product CRUD with image upload |
| `components/admin/shop/CategoriesAdmin.tsx` | Create | Categories + Tags management |
| `components/admin/shop/OrdersAdmin.tsx` | Create | Order management + status updates |
| `components/admin/shop/DiscountsAdmin.tsx` | Create | Bundle deals + coupon codes |
| `components/admin/shop/AnalyticsAdmin.tsx` | Create | Funnel + top products + abandoned carts |
| `components/admin/shop/SettingsAdmin.tsx` | Create | UPI ID, QR code, store settings |
| `app/blog/admin/page.tsx` | Modify | Redirect to `/admin?tab=blog` |

---

## Task 1: Shared PasswordGate Component

**Files:**
- Create: `components/admin/PasswordGate.tsx`

- [ ] **Step 1: Create `components/admin/PasswordGate.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface Props {
  endpoint: string // e.g. '/api/auth/admin'
  onAuthed: () => void
  label?: string
}

export default function PasswordGate({ endpoint, onAuthed, label = 'Admin access' }: Props) {
  const [pw,      setPw]      = useState('')
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { onAuthed() }
    else { setError('Wrong password'); setPw('') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'var(--ff-body)' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(130,255,31,0.08)', border: '1px solid rgba(130,255,31,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} color="#82ff1f" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{label}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '6px 0 0', fontFamily: 'var(--ff-mono)' }}>
              riazahmed.com
            </p>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              style={{ width: '100%', padding: '12px 44px 12px 14px', background: 'var(--surface)', border: `1px solid ${error ? 'var(--red)' : 'var(--border-input)'}`, borderRadius: '12px', color: 'var(--text-primary)', fontSize: '15px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box' }}
            />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <div style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
          <button type="submit" disabled={loading || !pw} style={{ padding: '13px', borderRadius: '12px', background: '#82ff1f', color: '#0a0a0a', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--ff-body)' }}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 2: Blog Admin Component

**Files:**
- Create: `components/admin/blog/BlogAdmin.tsx`

Port the blog admin page content from `app/blog/admin/page.tsx` into this component, removing the password gate (handled by the parent). Keep all functionality identical.

- [ ] **Step 1: Read `app/blog/admin/page.tsx` fully**

Read the file to understand what's rendered after auth.

- [ ] **Step 2: Create `components/admin/blog/BlogAdmin.tsx`**

Extract the post-auth content from `app/blog/admin/page.tsx` into a component. The component receives no props — it manages its own data fetching. The password gate and `useEffect` auth check are removed (parent handles auth).

```typescript
'use client'
// Copy everything from app/blog/admin/page.tsx EXCEPT:
// 1. The PasswordGate component definition (now in components/admin/PasswordGate.tsx)
// 2. The password-gate render branch — this component only renders the admin content
// 3. The initial auth check useEffect
//
// The component's root renders what the blog admin shows after login:
// post list + AdminForm for creating/editing posts.
//
// Rename the default export to BlogAdmin.
```

**Concrete steps:**
- Open `app/blog/admin/page.tsx`
- Copy the component body that renders after `authed === true`
- Place it as the return value of `BlogAdmin`
- Keep all `useState`, `useEffect` for data fetching (posts, selected post, etc.)
- Keep `AdminForm` import from `@/components/blog/AdminForm`
- Export as `export default function BlogAdmin()`

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Movies Admin Component

**Files:**
- Create: `components/admin/movies/MoviesAdmin.tsx`

- [ ] **Step 1: Read `app/movies/page.tsx` to locate the admin form section**

The movies page has an admin form (AdminForm component) that's gated behind a password. Extract the admin UI into `MoviesAdmin`.

- [ ] **Step 2: Create `components/admin/movies/MoviesAdmin.tsx`**

```typescript
'use client'
import { useState } from 'react'
import AdminForm from '@/components/movies/AdminForm'
import { toast } from 'sonner'

export default function MoviesAdmin() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Movies</h2>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ padding: '8px 18px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
        >
          {showForm ? 'Close' : '+ Add entry'}
        </button>
      </div>
      {showForm && (
        <AdminForm
          onSaved={() => { setShowForm(false); toast.success('Saved') }}
        />
      )}
      {!showForm && (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>
          Entries are managed from the <a href="/movies" style={{ color: 'var(--lavender)' }}>movies page</a>.
          Use this panel to add new entries.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Shop Settings Admin

**Files:**
- Create: `components/admin/shop/SettingsAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/SettingsAdmin.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { ShopSettings } from '@/lib/shop.types'

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<ShopSettings>({ upi_id: '', qr_code_url: '', store_name: '', store_tagline: '' })
  const [saving,   setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/shop/settings').then(r => r.json()).then(setSettings)
  }, [])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/shop/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) toast.success('Settings saved')
    else toast.error('Failed to save')
    setSaving(false)
  }

  async function uploadQR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res  = await fetch('/api/shop/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) {
      setSettings(s => ({ ...s, qr_code_url: data.url }))
      toast.success('QR uploaded')
    } else {
      toast.error(data.error ?? 'Upload failed')
    }
    setUploading(false)
  }

  const field = (label: string, key: keyof ShopSettings, placeholder?: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{label}</label>
      <input
        value={settings[key]}
        onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Settings</h2>
      {field('Store name',    'store_name',    'Riaz Ahmed Art')}
      {field('Store tagline', 'store_tagline', 'Original digital art')}
      {field('UPI ID',        'upi_id',        'yourname@upi')}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>QR Code image</label>
        {settings.qr_code_url && (
          <img src={settings.qr_code_url} alt="QR" style={{ width: '120px', height: '120px', objectFit: 'contain', background: '#fff', borderRadius: '10px', padding: '6px' }} />
        )}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
          {uploading ? 'Uploading...' : 'Upload QR image'}
          <input type="file" accept="image/*" onChange={uploadQR} style={{ display: 'none' }} />
        </label>
      </div>

      <button onClick={save} disabled={saving}
        style={{ padding: '12px 28px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
        {saving ? 'Saving...' : 'Save settings'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 5: Categories & Tags Admin

**Files:**
- Create: `components/admin/shop/CategoriesAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/CategoriesAdmin.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import type { ShopCategory, ShopTag } from '@/lib/shop.types'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [tags,       setTags]       = useState<ShopTag[]>([])
  const [newCat,     setNewCat]     = useState('')
  const [newTag,     setNewTag]     = useState('')

  function refresh() {
    fetch('/api/shop/categories').then(r => r.json()).then(setCategories)
    fetch('/api/shop/tags').then(r => r.json()).then(setTags)
  }

  useEffect(() => { refresh() }, [])

  function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

  async function addCategory() {
    if (!newCat.trim()) return
    const res = await fetch('/api/shop/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.trim(), slug: toSlug(newCat), position: categories.length }),
    })
    if (res.ok) { toast.success('Category added'); setNewCat(''); refresh() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  async function deleteCategory(id: string) {
    await fetch(`/api/shop/categories/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); refresh()
  }

  async function addTag() {
    if (!newTag.trim()) return
    const res = await fetch('/api/shop/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim(), slug: toSlug(newTag) }),
    })
    if (res.ok) { toast.success('Tag added'); setNewTag(''); refresh() }
    else { const e = await res.json(); toast.error(e.error) }
  }

  async function deleteTag(id: string) {
    await fetch(`/api/shop/tags/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '600px' }}>
      <Section title="Categories" items={categories} newValue={newCat} onNewChange={setNewCat} onAdd={addCategory} onDelete={deleteCategory} placeholder="e.g. Stickers" />
      <Section title="Tags" items={tags} newValue={newTag} onNewChange={setNewTag} onAdd={addTag} onDelete={deleteTag} placeholder="e.g. Marvel" />
    </div>
  )
}

function Section({ title, items, newValue, onNewChange, onAdd, onDelete, placeholder }: {
  title: string
  items: { id: string; name: string }[]
  newValue: string
  onNewChange: (v: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={newValue} onChange={e => onNewChange(e.target.value)} placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && onAdd()}
          style={{ flex: 1, padding: '9px 13px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
        />
        <button onClick={onAdd} style={{ padding: '9px 14px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <Plus size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '999px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
            <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0 0 0 2px', display: 'flex' }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>None yet</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 6: Products Admin

**Files:**
- Create: `components/admin/shop/ProductsAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/ProductsAdmin.tsx`**

```typescript
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

  function refresh() {
    fetch('/api/shop/products').then(r => r.json()).then(setProducts)
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
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '8px 18px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {showForm ? 'Cancel' : '+ New product'}
        </button>
      </div>

      {showForm && <ProductForm categories={categories} tags={tags} onSaved={() => { setShowForm(false); refresh() }} />}

      {products.length === 0 && !showForm && (
        <p style={{ color: 'var(--text-dim)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>No products yet.</p>
      )}

      {products.map(product => (
        <div key={product.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Product row */}
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

          {/* Expanded: variants + edit */}
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
  const [form,     setForm]     = useState({ name: '', description: '', category_id: '', is_active: true })
  const [images,   setImages]   = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving,   setSaving]   = useState(false)

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

      {/* Images */}
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
        style={{ padding: '10px 22px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', width: 'fit-content' }}>
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
          <button onClick={add} style={{ padding: '7px 14px', background: 'var(--lavender)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)' }}>Add</button>
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 7: Orders Admin

**Files:**
- Create: `components/admin/shop/OrdersAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/OrdersAdmin.tsx`**

```typescript
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
  })[s] ?? 'var(--text-dim)'

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
              {/* Items */}
              <div>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} — {item.size} × {item.quantity}</span>
                    <span style={{ fontFamily: 'var(--ff-mono)' }}>₹{(Number(item.price)*item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              {/* Shipping */}
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--surface-alt)', borderRadius: '10px', padding: '12px' }}>
                {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                {order.utr_reference && <div style={{ marginTop: '4px' }}>UTR: <strong style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>{order.utr_reference}</strong></div>}
              </div>
              {/* Controls */}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 8: Discounts Admin

**Files:**
- Create: `components/admin/shop/DiscountsAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/DiscountsAdmin.tsx`**

```typescript
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
        <input value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Max uses"  type="number"
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 9: Analytics Admin

**Files:**
- Create: `components/admin/shop/AnalyticsAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/AnalyticsAdmin.tsx`**

```typescript
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
  const [data,  setData]  = useState<Analytics | null>(null)
  const [days,  setDays]  = useState(30)
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
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Analytics</h2>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))}
          style={{ marginLeft: 'auto', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--ff-mono)', outline: 'none' }}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '12px' }}>
        {[
          { label: 'Total orders', value: data.totalOrders },
          { label: 'Revenue (verified)', value: `₹${data.totalRevenue.toFixed(0)}` },
          { label: 'Abandoned carts', value: data.abandonedCartUserCount },
        ].map(tile => (
          <div key={tile.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>{tile.value}</div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '6px' }}>{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
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

      {/* Top products */}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 10: ShopAdmin Shell

**Files:**
- Create: `components/admin/shop/ShopAdmin.tsx`

- [ ] **Step 1: Create `components/admin/shop/ShopAdmin.tsx`**

```typescript
'use client'
import { useState } from 'react'
import ProductsAdmin  from './ProductsAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import OrdersAdmin    from './OrdersAdmin'
import DiscountsAdmin from './DiscountsAdmin'
import AnalyticsAdmin from './AnalyticsAdmin'
import SettingsAdmin  from './SettingsAdmin'

type ShopTab = 'products' | 'categories' | 'orders' | 'discounts' | 'analytics' | 'settings'

const SHOP_TABS: { key: ShopTab; label: string }[] = [
  { key: 'products',   label: 'Products' },
  { key: 'categories', label: 'Categories & Tags' },
  { key: 'orders',     label: 'Orders' },
  { key: 'discounts',  label: 'Discounts' },
  { key: 'analytics',  label: 'Analytics' },
  { key: 'settings',   label: 'Settings' },
]

export default function ShopAdmin() {
  const [tab, setTab] = useState<ShopTab>('products')

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '32px', overflowX: 'auto', paddingBottom: '0' }}>
        {SHOP_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em',
            color: tab === t.key ? 'var(--lavender)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--lavender)' : 'transparent'}`,
            marginBottom: '-1px', whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products'   && <ProductsAdmin />}
      {tab === 'categories' && <CategoriesAdmin />}
      {tab === 'orders'     && <OrdersAdmin />}
      {tab === 'discounts'  && <DiscountsAdmin />}
      {tab === 'analytics'  && <AnalyticsAdmin />}
      {tab === 'settings'   && <SettingsAdmin />}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 11: Unified Admin Page

**Files:**
- Create: `app/admin/page.tsx`
- Modify: `app/blog/admin/page.tsx`

- [ ] **Step 1: Create `app/admin/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import PasswordGate  from '@/components/admin/PasswordGate'
import BlogAdmin     from '@/components/admin/blog/BlogAdmin'
import MoviesAdmin   from '@/components/admin/movies/MoviesAdmin'
import ShopAdmin     from '@/components/admin/shop/ShopAdmin'

type Tab = 'blog' | 'movies' | 'shop'

const TABS: { key: Tab; label: string }[] = [
  { key: 'blog',   label: 'Blog' },
  { key: 'movies', label: 'Movies' },
  { key: 'shop',   label: 'Shop' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [tab,    setTab]    = useState<Tab>('shop')

  useEffect(() => {
    fetch('/api/auth/admin').then(r => r.json()).then(d => {
      if (d.authed) setAuthed(true)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    setAuthed(false)
    toast.success('Logged out')
  }

  if (!authed) return <PasswordGate endpoint="/api/auth/admin" onAuthed={() => setAuthed(true)} label="Admin portal" />

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--ff-body)' }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: '0',
        height: '56px',
      }}>
        <span style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)', marginRight: '24px' }}>
          Admin
        </span>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0 18px', height: '56px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'var(--ff-body)', fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--lavender)' : 'transparent'}`,
          }}>
            {t.label}
          </button>
        ))}
        <button onClick={logout} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', fontFamily: 'var(--ff-body)' }}>
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
        {tab === 'blog'   && <BlogAdmin />}
        {tab === 'movies' && <MoviesAdmin />}
        {tab === 'shop'   && <ShopAdmin />}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `app/blog/admin/page.tsx` to redirect to unified admin**

Replace `app/blog/admin/page.tsx` with:

```typescript
import { redirect } from 'next/navigation'

export default function BlogAdminRedirect() {
  redirect('/admin?tab=blog')
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 12: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Start dev server and test the admin panel**

```bash
npm run dev
```

Test this flow:
1. Go to `http://localhost:3000/admin`
2. Password gate appears → enter your `ADMIN_PASSWORD`
3. Three tabs show: Blog, Movies, Shop
4. Click Shop → six sub-tabs appear
5. Shop → Settings → enter UPI ID and upload QR image
6. Shop → Categories → add "Stickers" category
7. Shop → Tags → add "Marvel" tag
8. Shop → Products → create a product, upload image, add a size variant
9. Product should appear in `/shop` customer page
10. Go to `/blog/admin` — should redirect to `/admin`

Plan C complete. All three plans are done.
