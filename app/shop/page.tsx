'use client'
import { useEffect, useState } from 'react'

function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border-card)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{ aspectRatio: '1', background: 'var(--surface-alt)', position: 'relative', overflow: 'hidden' }}>
        <div className="shop-shimmer" />
      </div>
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <div style={{ height: '13px', width: '70%', borderRadius: '6px', background: 'var(--surface-raised)', overflow: 'hidden', position: 'relative' }}>
          <div className="shop-shimmer" />
        </div>
        <div style={{ height: '18px', width: '36px', borderRadius: '999px', background: 'var(--surface-raised)', overflow: 'hidden', position: 'relative' }}>
          <div className="shop-shimmer" />
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          {[28, 22].map((w, i) => (
            <div key={i} style={{ height: '16px', width: w, borderRadius: '5px', background: 'var(--surface-raised)', overflow: 'hidden', position: 'relative' }}>
              <div className="shop-shimmer" />
            </div>
          ))}
        </div>
        <div style={{ height: '13px', width: '44px', borderRadius: '6px', background: 'var(--surface-raised)', overflow: 'hidden', position: 'relative' }}>
          <div className="shop-shimmer" />
        </div>
      </div>
    </div>
  )
}
import { useShopSession } from '@/hooks/useShopSession'
import ProductCard from '@/components/shop/ProductCard'
import ShopSections from '@/components/shop/ShopSections'
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
    <>
      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 600px) {
          .shop-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        }
        .shop-main { padding: 20px 16px 40px; }
        @media (min-width: 600px) {
          .shop-main { padding: 40px 24px; }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        .shop-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: shimmer 1.4s infinite;
        }
      `}</style>
      <main className="shop-main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lavender)', marginBottom: '10px' }}>
            ◈ Limited drops
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,6vw,56px)', letterSpacing: '-0.01em', textTransform: 'uppercase', margin: 0, lineHeight: 1, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Pixels › Prints ›{' '}
            <span style={{ WebkitTextStroke: '1.5px var(--lavender)', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              Yours.
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '14px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em' }}>
            Original art prints · Shipped to your door
          </p>
        </div>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                style={{
                  padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
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
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[{ id: 'all', slug: 'all', name: 'All tags' }, ...tags].map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id === 'all' ? 'all' : (tag as ShopTag).slug)}
                style={{
                  padding: '3px 10px', borderRadius: '999px', fontSize: '10px', letterSpacing: '0.08em',
                  textTransform: 'uppercase', fontFamily: 'var(--ff-mono)',
                  border: '1px solid',
                  borderColor: activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime)' : 'var(--border)',
                  background:  activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime-dim)' : 'transparent',
                  color:       activeTag === (tag.id === 'all' ? 'all' : (tag as ShopTag).slug) ? 'var(--lime)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="shop-grid">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="rgba(107,69,212,0.12)" />
                <rect x="22" y="20" width="36" height="44" rx="4" stroke="#6b45d4" strokeWidth="2"/>
                <path d="M30 32h20M30 40h20M30 48h12" stroke="rgba(107,69,212,0.5)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="56" cy="26" r="8" fill="#e8ff00"/>
                <path d="M53 26h6M56 23v6" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8ff00', marginBottom: '10px' }}>nothing here</div>
            <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text-primary)' }}>No prints found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: '0 auto', maxWidth: '300px' }}>Try a different category or tag.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <ShopSections />
    </>
  )
}
