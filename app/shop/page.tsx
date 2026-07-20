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
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(28px,5vw,48px)', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0, color: 'var(--text-primary)' }}>
          Merch
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px', fontFamily: 'var(--ff-mono)' }}>
          Original art prints. Shipped to your door.
        </p>
      </div>

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
