# Shop — Plan B: Customer Storefront

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** Plan A (Foundation) must be complete — all API routes must exist before building pages.

**Goal:** Build all customer-facing `/shop/*` pages: product grid, product detail, cart, checkout with email OTP, UPI payment screen, and order tracking.

**Architecture:** All pages are `'use client'` components that fetch from the API routes built in Plan A. Cart state lives in `localStorage`. Session tracking uses a `session_id` UUID stored in `localStorage`, sent with every event to `/api/shop/events`. Inline styles with CSS variables follow the existing codebase pattern throughout.

**Tech Stack:** Next.js 16 App Router (client components), React 19, TypeScript, inline styles + CSS variables, `sonner` for toasts, `lucide-react` for icons.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `hooks/useCart.ts` | Create | Cart state + localStorage sync |
| `hooks/useShopSession.ts` | Create | session_id management + event tracking |
| `app/shop/layout.tsx` | Create | Shop layout (minimal nav with cart icon) |
| `app/shop/page.tsx` | Create | Product grid with category + tag filters |
| `app/shop/[id]/page.tsx` | Create | Product detail with size selector |
| `app/shop/cart/page.tsx` | Create | Cart page with bundle deals + coupon |
| `app/shop/checkout/page.tsx` | Create | Shipping form + OTP trigger |
| `app/shop/checkout/verify/page.tsx` | Create | OTP entry screen |
| `app/shop/checkout/payment/page.tsx` | Create | UPI/QR payment screen |
| `app/shop/orders/page.tsx` | Create | Customer order list (login gate) |
| `app/shop/orders/[id]/page.tsx` | Create | Single order status detail |
| `components/shop/ProductCard.tsx` | Create | Product grid card |
| `components/shop/SizeSelector.tsx` | Create | Size/variant picker |
| `components/shop/CartIcon.tsx` | Create | Cart count badge for nav |

---

## Task 1: Cart Hook

**Files:**
- Create: `hooks/useCart.ts`

- [ ] **Step 1: Create `hooks/useCart.ts`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import type { CartItem, ShopBundleDeal } from '@/lib/shop.types'

const CART_KEY = 'shop-cart'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') } catch { return [] }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function applyBundleDeal(items: CartItem[], deals: ShopBundleDeal[]): {
  subtotal: number
  discount: number
  total: number
  appliedDeal: ShopBundleDeal | null
} {
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  const activeDeals = deals
    .filter(d => d.is_active && totalQty >= d.min_qty)
    .sort((a, b) => b.min_qty - a.min_qty)

  const deal = activeDeals[0] ?? null
  if (deal) {
    return { subtotal, discount: Math.max(0, subtotal - deal.price), total: deal.price, appliedDeal: deal }
  }
  return { subtotal, discount: 0, total: subtotal, appliedDeal: null }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(readCart()) }, [])

  const sync = useCallback((next: CartItem[]) => {
    setItems(next)
    writeCart(next)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    const current = readCart()
    const existing = current.findIndex(i => i.variantId === item.variantId)
    if (existing >= 0) {
      current[existing].qty += item.qty
    } else {
      current.push(item)
    }
    sync(current)
  }, [sync])

  const updateQty = useCallback((variantId: string, qty: number) => {
    const current = readCart()
    if (qty <= 0) {
      sync(current.filter(i => i.variantId !== variantId))
    } else {
      sync(current.map(i => i.variantId === variantId ? { ...i, qty } : i))
    }
  }, [sync])

  const removeItem = useCallback((variantId: string) => {
    sync(readCart().filter(i => i.variantId !== variantId))
  }, [sync])

  const clearCart = useCallback(() => sync([]), [sync])

  const count = items.reduce((s, i) => s + i.qty, 0)

  return { items, count, addItem, updateQty, removeItem, clearCart }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 2: Session & Event Tracking Hook

**Files:**
- Create: `hooks/useShopSession.ts`

- [ ] **Step 1: Create `hooks/useShopSession.ts`**

```typescript
'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { ShopEventType } from '@/lib/shop.types'

const SESSION_KEY = 'shop-session-id'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function useShopSession() {
  const sessionId = useRef<string>('')

  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  const track = useCallback((type: ShopEventType, metadata: Record<string, unknown> = {}) => {
    if (!sessionId.current) return
    fetch('/api/shop/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, session_id: sessionId.current, metadata }),
    }).catch(() => {/* fire and forget */})
  }, [])

  return { track, sessionId: sessionId.current }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Shop Layout & CartIcon

**Files:**
- Create: `components/shop/CartIcon.tsx`
- Create: `app/shop/layout.tsx`

- [ ] **Step 1: Create `components/shop/CartIcon.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CartIcon() {
  const { count } = useCart()
  return (
    <Link href="/shop/cart" style={{ position: 'relative', display: 'inline-flex', color: 'var(--text-primary)' }}>
      <ShoppingBag size={22} />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-8px',
          background: 'var(--lavender)', color: '#fff',
          borderRadius: '999px', fontSize: '10px', fontWeight: 700,
          minWidth: '16px', height: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 3px', fontFamily: 'var(--ff-mono)',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Create `app/shop/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import CartIcon from '@/components/shop/CartIcon'

export const metadata: Metadata = {
  title: 'Shop — Riaz Ahmed Art',
  description: 'Original digital art prints — stickers, posters and more.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--ff-body)' }}>
      {/* Shop nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '0 24px',
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/shop" style={{
          fontFamily: 'var(--ff-display)', fontSize: '18px', letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--text-primary)', textDecoration: 'none',
        }}>
          Riaz Ahmed Art
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/shop/orders" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            My Orders
          </Link>
          <CartIcon />
        </div>
      </nav>
      {children}
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

## Task 4: ProductCard Component

**Files:**
- Create: `components/shop/ProductCard.tsx`

- [ ] **Step 1: Create `components/shop/ProductCard.tsx`**

```typescript
'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { ShopProduct } from '@/lib/shop.types'

export default function ProductCard({ product }: { product: ShopProduct }) {
  const image       = product.images[0]
  const minPrice    = product.variants?.length
    ? Math.min(...product.variants.map(v => Number(v.price)))
    : null
  const inStock     = product.variants?.some(v => v.stock_qty > 0) ?? false

  return (
    <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-card)',
        borderRadius: '16px', overflow: 'hidden',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--lavender-dim)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--surface-alt)' }}>
          {image ? (
            <Image src={image} alt={product.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No image
            </div>
          )}
          {!inStock && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ff-mono)' }}>
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {product.name}
          </div>
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {product.tags.map(tag => (
                <span key={tag.id} style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: '999px',
                  background: 'var(--lavender-dim)', color: 'var(--lavender)',
                  fontFamily: 'var(--ff-mono)',
                }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {minPrice !== null && (
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
              From ₹{minPrice}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 5: Shop Listing Page

**Files:**
- Create: `app/shop/page.tsx`

- [ ] **Step 1: Create `app/shop/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useShopSession } from '@/hooks/useShopSession'
import ProductCard from '@/components/shop/ProductCard'
import type { ShopProduct, ShopCategory, ShopTag } from '@/lib/shop.types'

export default function ShopPage() {
  const { track } = useShopSession()
  const [products,   setProducts]   = useState<ShopProduct[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [tags,       setTags]       = useState<ShopTag[]>([])
  const [activeCat,  setActiveCat]  = useState<string>('all')
  const [activeTag,  setActiveTag]  = useState<string>('all')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    track('page_view', { path: '/shop' })
    Promise.all([
      fetch('/api/shop/categories').then(r => r.json()),
      fetch('/api/shop/tags').then(r => r.json()),
    ]).then(([cats, tgs]) => {
      setCategories(cats)
      setTags(tgs)
    })
  }, [track])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCat !== 'all') params.set('category', activeCat)
    if (activeTag !== 'all') params.set('tag', activeTag)
    fetch(`/api/shop/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
  }, [activeCat, activeTag])

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,5vw,48px)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0, color: 'var(--text-primary)' }}>
          Merch
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', fontFamily: 'var(--ff-mono)' }}>
          Original art prints. Shipped to your door.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              style={{
                padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                border: '1px solid',
                borderColor: activeCat === cat.id ? 'var(--lavender)' : 'var(--border-card)',
                background:  activeCat === cat.id ? 'var(--lavender-dim)' : 'transparent',
                color:       activeCat === cat.id ? 'var(--lavender)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--ff-body)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Tag filter */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[{ id: 'all', slug: 'all', name: 'All tags' }, ...tags].map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id === 'all' ? 'all' : (tag as ShopTag).slug)}
              style={{
                padding: '4px 12px', borderRadius: '999px', fontSize: '11px', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontFamily: 'var(--ff-mono)',
                border: '1px solid',
                borderColor: activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime)' : 'var(--border)',
                background:  activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime-dim)' : 'transparent',
                color:       activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime)' : 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
          Loading...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '60px 0', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
          No products found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 6: SizeSelector Component & Product Detail Page

**Files:**
- Create: `components/shop/SizeSelector.tsx`
- Create: `app/shop/[id]/page.tsx`

- [ ] **Step 1: Create `components/shop/SizeSelector.tsx`**

```typescript
'use client'
import type { ShopVariant } from '@/lib/shop.types'

interface Props {
  variants: ShopVariant[]
  selected: string | null
  onSelect: (variantId: string) => void
}

export default function SizeSelector({ variants, selected, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {variants.map(v => {
        const outOfStock = v.stock_qty === 0
        const isSelected = selected === v.id
        return (
          <button
            key={v.id}
            disabled={outOfStock}
            onClick={() => onSelect(v.id)}
            style={{
              padding: '8px 18px', borderRadius: '10px', cursor: outOfStock ? 'not-allowed' : 'pointer',
              border: '1px solid',
              borderColor: isSelected ? 'var(--lavender)' : 'var(--border-card)',
              background:  isSelected ? 'var(--lavender-dim)' : 'var(--surface)',
              color:       outOfStock ? 'var(--text-dim)' : isSelected ? 'var(--lavender)' : 'var(--text-primary)',
              opacity:     outOfStock ? 0.5 : 1,
              fontFamily:  'var(--ff-mono)', fontSize: '13px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{v.size}</span>
            <span style={{ fontSize: '12px', color: isSelected ? 'var(--lavender)' : 'var(--text-secondary)' }}>
              ₹{Number(v.price).toFixed(0)}
            </span>
            {outOfStock && <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Out of stock</span>}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/shop/[id]/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import SizeSelector from '@/components/shop/SizeSelector'
import { useCart } from '@/hooks/useCart'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShopProduct, ShopVariant } from '@/lib/shop.types'

export default function ProductPage() {
  const { id }             = useParams<{ id: string }>()
  const router             = useRouter()
  const { addItem }        = useCart()
  const { track }          = useShopSession()
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetch(`/api/shop/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
        track('page_view', { path: `/shop/${id}`, product_id: id, name: data.name })
      })
  }, [id, track])

  const selectedVariant: ShopVariant | undefined = product?.variants?.find(v => v.id === selected)

  function handleAddToCart() {
    if (!product || !selectedVariant) {
      toast.error('Please select a size')
      return
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name:      product.name,
      size:      selectedVariant.size,
      price:     Number(selectedVariant.price),
      qty,
      image:     product.images[0] ?? '',
    })
    track('add_to_cart', {
      product_id: product.id,
      variant_id: selectedVariant.id,
      name:       product.name,
      size:       selectedVariant.size,
      price:      selectedVariant.price,
      qty,
    })
    toast.success('Added to cart')
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
      Loading...
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
      Product not found.
    </div>
  )

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', padding: 0, marginBottom: '28px', fontFamily: 'var(--ff-body)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface-alt)', marginBottom: '12px' }}>
            {product.images[activeImg] ? (
              <Image src={product.images[activeImg]} alt={product.name} fill style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '2px solid',
                  borderColor: activeImg === i ? 'var(--lavender)' : 'var(--border-card)',
                  background: 'none', cursor: 'pointer', padding: 0, position: 'relative',
                }}>
                  <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px', color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {product.tags.map(tag => (
                  <span key={tag.id} style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'var(--lavender-dim)', color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {product.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {product.description}
              </p>
            )}
          </div>

          {/* Size selector */}
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>
              Select size
            </div>
            <SizeSelector
              variants={product.variants ?? []}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          {/* Price */}
          {selectedVariant && (
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--lavender)', fontFamily: 'var(--ff-mono)' }}>
              ₹{Number(selectedVariant.price).toFixed(0)}
            </div>
          )}

          {/* Qty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Qty</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '4px 12px' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>−</button>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>+</button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
              background: selected ? 'var(--lavender)' : 'var(--surface-raised)',
              color: selected ? '#fff' : 'var(--text-dim)',
              border: 'none', cursor: selected ? 'pointer' : 'default',
              transition: 'background 0.2s ease', fontFamily: 'var(--ff-body)',
            }}
          >
            <ShoppingBag size={18} />
            Add to cart
          </button>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 7: Cart Page

**Files:**
- Create: `app/shop/cart/page.tsx`

- [ ] **Step 1: Create `app/shop/cart/page.tsx`**

```typescript
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
  const [deals,        setDeals]        = useState<ShopBundleDeal[]>([])
  const [couponCode,   setCouponCode]   = useState('')
  const [couponError,  setCouponError]  = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied,  setCouponApplied]  = useState('')
  const [validating, setValidating] = useState(false)

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

      {/* Items */}
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

      {/* Bundle deal notice */}
      {appliedDeal && (
        <div style={{ background: 'var(--lime-dim)', border: '1px solid var(--lime)', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--lime)', fontFamily: 'var(--ff-mono)' }}>
          Bundle deal: {appliedDeal.name} — ₹{bundleDiscount.toFixed(0)} saved
        </div>
      )}

      {/* Coupon */}
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

      {/* Totals */}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 8: Checkout Page

**Files:**
- Create: `app/shop/checkout/page.tsx`

Store the pending order data in `sessionStorage` between checkout steps (shipping address, cart snapshot, totals) to survive navigation without exposing it in the URL.

- [ ] **Step 1: Create `app/shop/checkout/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart, applyBundleDeal } from '@/hooks/useCart'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShipingAddress, ShopBundleDeal } from '@/lib/shop.types'
import type { ShippingAddress } from '@/lib/shop.types'

const PENDING_KEY = 'shop-pending-checkout'

export default function CheckoutPage() {
  const router       = useRouter()
  const { items }    = useCart()
  const { track }    = useShopSession()
  const [deals, setDeals] = useState<ShopBundleDeal[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ShippingAddress>({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '',
  })

  useEffect(() => {
    if (items.length === 0) router.replace('/shop/cart')
    fetch('/api/admin/shop/discounts/bundles').then(r => r.json()).then(setDeals)
  }, [items.length, router])

  const { total: bundleTotal } = applyBundleDeal(items, deals)

  // Read coupon discount saved from cart page
  const couponDiscount = 0 // Cart page stores this if needed; simplified for now
  const finalTotal = Math.max(0, bundleTotal - couponDiscount)

  function update(field: keyof ShippingAddress, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)

    // Step 1: Send OTP
    const otpRes = await fetch('/api/shop/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    if (!otpRes.ok) {
      const err = await otpRes.json()
      toast.error(err.error ?? 'Failed to send OTP')
      setLoading(false)
      return
    }

    // Save pending checkout to sessionStorage
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({
      items,
      shipping_address: form,
      subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
      discount_amount: couponDiscount + (bundleTotal < items.reduce((s, i) => s + i.price * i.qty, 0) ? items.reduce((s, i) => s + i.price * i.qty, 0) - bundleTotal : 0),
      total: finalTotal,
    }))

    setLoading(false)
    router.push(`/shop/checkout/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <main style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 32px' }}>
        Checkout
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field label="Full name *"  value={form.name}    onChange={v => update('name', v)}    placeholder="Riaz Ahmed" />
        <Field label="Email *"      value={form.email}   onChange={v => update('email', v)}   placeholder="you@example.com" type="email" />
        <Field label="Phone *"      value={form.phone}   onChange={v => update('phone', v)}   placeholder="+91 98765 43210" type="tel" />
        <Field label="Address *"    value={form.line1}   onChange={v => update('line1', v)}   placeholder="House / Flat, Street" />
        <Field label="Address 2"    value={form.line2 ?? ''} onChange={v => update('line2', v)} placeholder="Landmark, Area (optional)" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="City *"     value={form.city}    onChange={v => update('city', v)}    placeholder="Chennai" />
          <Field label="State *"    value={form.state}   onChange={v => update('state', v)}   placeholder="Tamil Nadu" />
        </div>
        <Field label="Pincode *"    value={form.pincode} onChange={v => update('pincode', v)} placeholder="600001" />

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '16px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total</span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>₹{finalTotal.toFixed(0)}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--ff-mono)' }}>
            We'll send an OTP to verify your email before payment
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '14px', borderRadius: '12px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)', marginTop: '8px' }}
        >
          {loading ? 'Sending OTP...' : 'Continue — Verify email'}
        </button>
      </form>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }}
      />
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

## Task 9: OTP Verify Page

**Files:**
- Create: `app/shop/checkout/verify/page.tsx`

- [ ] **Step 1: Create `app/shop/checkout/verify/page.tsx`**

```typescript
'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/hooks/useCart'

const PENDING_KEY = 'shop-pending-checkout'

function VerifyForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const email    = params.get('email') ?? ''
  const { clearCart } = useCart()
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)

    const verifyRes = await fetch('/api/shop/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code }),
    })

    if (!verifyRes.ok) {
      const err = await verifyRes.json()
      toast.error(err.error ?? 'Invalid code')
      setLoading(false)
      return
    }

    const { userId } = await verifyRes.json()

    // Create the order
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null')
    if (!pending) { toast.error('Session expired, start checkout again'); router.replace('/shop/cart'); return }

    const orderRes = await fetch('/api/shop/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json()
      toast.error(err.error ?? 'Failed to create order')
      setLoading(false)
      return
    }

    const { id: orderId } = await orderRes.json()
    sessionStorage.removeItem(PENDING_KEY)
    clearCart()
    router.replace(`/shop/checkout/payment?order=${orderId}`)
  }

  async function resend() {
    setResending(true)
    await fetch('/api/shop/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    toast.success('New code sent')
    setCode('')
    inputRef.current?.focus()
    setResending(false)
  }

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>
            We sent a 6-digit code to<br /><strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '24px',
              background: 'var(--surface)', border: '1px solid var(--border-input)',
              borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none',
            }}
          />
          <button
            type="submit" disabled={loading || code.length !== 6}
            style={{ padding: '14px', borderRadius: '12px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}
          >
            {loading ? 'Verifying...' : 'Verify & Place order'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button onClick={resend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>
            {resending ? 'Sending...' : "Didn't receive it? Resend"}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 10: Payment Page

**Files:**
- Create: `app/shop/checkout/payment/page.tsx`

- [ ] **Step 1: Create `app/shop/checkout/payment/page.tsx`**

```typescript
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { useShopSession } from '@/hooks/useShopSession'
import type { ShopOrder, ShopSettings } from '@/lib/shop.types'

function PaymentForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const orderId  = params.get('order') ?? ''
  const { track } = useShopSession()
  const [order,    setOrder]    = useState<ShopOrder | null>(null)
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [utr,      setUtr]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    if (!orderId) { router.replace('/shop'); return }
    Promise.all([
      fetch(`/api/shop/orders/${orderId}`).then(r => r.json()),
      fetch('/api/shop/settings').then(r => r.json()),
    ]).then(([ord, set]) => {
      setOrder(ord)
      setSettings(set)
    })
  }, [orderId, router])

  async function markPaid() {
    setSubmitting(true)
    const res = await fetch(`/api/shop/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utr_reference: utr.trim() || null }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error ?? 'Failed to submit')
      setSubmitting(false)
      return
    }
    track('payment_submitted', { order_id: orderId })
    setDone(true)
    setSubmitting(false)
  }

  if (!order || !settings) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading...</div>
  )

  if (done) return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <CheckCircle size={56} color="var(--lime)" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Payment submitted!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
          We'll verify your payment and confirm your order shortly. Track your order status below.
        </p>
        <a href={`/shop/orders/${orderId}`} style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--lavender)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          View order status
        </a>
      </div>
    </main>
  )

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Complete payment
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Order summary */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '12px' }}>Order summary</div>
        {order.items?.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} × {item.quantity} ({item.size})</span>
            <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--text-primary)' }}>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Total</span>
          <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--lavender)' }}>₹{Number(order.total).toFixed(0)}</span>
        </div>
      </div>

      {/* UPI payment */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginBottom: '16px' }}>
          Pay via UPI
        </div>
        {settings.qr_code_url && (
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 16px', background: '#fff', borderRadius: '12px', padding: '8px' }}>
            <Image src={settings.qr_code_url} alt="UPI QR Code" fill style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {settings.upi_id}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Scan QR or pay to UPI ID above</div>
      </div>

      {/* UTR + confirm */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
          UTR / transaction reference (optional)
        </div>
        <input
          type="text"
          placeholder="e.g. 423456789012"
          value={utr}
          onChange={e => setUtr(e.target.value)}
          style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-mono)', outline: 'none' }}
        />
        <button
          onClick={markPaid}
          disabled={submitting}
          style={{ padding: '14px', borderRadius: '12px', background: 'var(--lime)', color: '#0a0a0a', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--ff-body)' }}
        >
          {submitting ? 'Submitting...' : "I've paid ₹" + Number(order.total).toFixed(0)}
        </button>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 11: Orders Pages

**Files:**
- Create: `app/shop/orders/page.tsx`
- Create: `app/shop/orders/[id]/page.tsx`

- [ ] **Step 1: Create `app/shop/orders/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ShopOrder } from '@/lib/shop.types'

const STATUS_LABELS: Record<string, string> = {
  pending_payment:   'Pending payment',
  payment_submitted: 'Payment submitted',
  confirmed:         'Confirmed',
  shipped:           'Shipped',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment:   'var(--text-dim)',
  payment_submitted: 'var(--lavender)',
  confirmed:         'var(--lime)',
  shipped:           'var(--lime)',
  delivered:         'var(--lime)',
  cancelled:         'var(--red)',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders,  setOrders]  = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [authed,  setAuthed]  = useState(false)
  const [email,   setEmail]   = useState('')
  const [code,    setCode]    = useState('')
  const [step,    setStep]    = useState<'check'|'otp'|'list'>('check')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/shop/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setAuthed(true); setStep('list')
          fetch('/api/shop/orders').then(r => r.json()).then(data => { setOrders(data); setLoading(false) })
        } else {
          setLoading(false)
        }
      })
  }, [])

  async function sendOtp() {
    setSending(true); setError('')
    const res = await fetch('/api/shop/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) { setError('Failed to send code'); setSending(false); return }
    setStep('otp'); setSending(false)
  }

  async function verifyOtp() {
    setSending(true); setError('')
    const res = await fetch('/api/shop/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: code }),
    })
    if (!res.ok) { setError('Invalid or expired code'); setSending(false); return }
    setAuthed(true)
    const data = await fetch('/api/shop/orders').then(r => r.json())
    setOrders(data); setStep('list'); setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>Loading...</div>
  )

  if (step === 'check') return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>My orders</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>Enter your email to view your orders</p>
        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={sendOtp} disabled={sending || !email}
          style={{ padding: '12px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {sending ? 'Sending...' : 'Send code'}
        </button>
      </div>
    </main>
  )

  if (step === 'otp') return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>Enter code</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontFamily: 'var(--ff-mono)' }}>6-digit code sent to {email}</p>
        <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={{ padding: '14px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '22px', background: 'var(--surface)', border: '1px solid var(--border-input)', borderRadius: '12px', color: 'var(--text-primary)', fontFamily: 'var(--ff-mono)', outline: 'none' }} />
        {error && <div style={{ color: 'var(--red)', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
        <button onClick={verifyOtp} disabled={sending || code.length !== 6}
          style={{ padding: '12px', borderRadius: '10px', background: 'var(--lavender)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>
          {sending ? 'Verifying...' : 'View my orders'}
        </button>
      </div>
    </main>
  )

  if (orders.length === 0) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No orders yet.</p>
      <Link href="/shop" style={{ color: 'var(--lavender)' }}>Browse shop →</Link>
    </main>
  )

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '28px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 32px' }}>My orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {orders.map(order => (
          <Link key={order.id} href={`/shop/orders/${order.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--ff-mono)', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{Number(order.total).toFixed(0)}
                </div>
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: STATUS_COLORS[order.status] ?? 'var(--text-dim)' }}>
                {STATUS_LABELS[order.status] ?? order.status}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create `app/shop/orders/[id]/page.tsx`**

```typescript
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
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<ShopOrder | null>(null)
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

      {/* Progress bar */}
      {!['cancelled', 'pending_payment', 'payment_submitted'].includes(order.status) && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {STATUS_STEPS.map(step => {
            const idx = STATUS_STEPS.indexOf(step)
            const currentIdx = STATUS_STEPS.indexOf(order.status as any)
            const active = idx <= currentIdx
            return (
              <div key={step} style={{ flex: 1, height: '4px', borderRadius: '2px', background: active ? 'var(--lime)' : 'var(--surface-raised)' }} />
            )
          })}
        </div>
      )}

      {/* Items */}
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

      {/* Shipping address */}
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 12: Final Storefront Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Start dev server and test golden path**

```bash
npm run dev
```

Test this flow in the browser:
1. Go to `http://localhost:3000/shop` — should load (empty grid if no products yet)
2. Add a test product via `POST /api/shop/products` and test product card appears
3. Click product → size selector shows
4. Add to cart → cart icon badge updates
5. Go to `/shop/cart` — item shows, total calculated
6. Click checkout → shipping form loads
7. Fill form with your real email → OTP sent → verify → payment page shows QR

Plan B complete. Proceed to Plan C (Admin Panel).
