'use client'
import { useEffect, useRef, useState } from 'react'
import type { ShopBundleDeal } from '@/lib/shop.types'

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
  const [products,     setProducts]     = useState<ShopProduct[]>([])
  const [allProducts,  setAllProducts]  = useState<ShopProduct[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [tags,       setTags]       = useState<ShopTag[]>([])
  const [activeCat,    setActiveCat]    = useState<string>('all')
  const [activeTag,    setActiveTag]    = useState<string>('all')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [deals,        setDeals]        = useState<ShopBundleDeal[]>([])
  const [dealIdx,      setDealIdx]      = useState(0)
  const [sweeping,     setSweeping]     = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    track('page_view', { path: '/shop' })
    Promise.all([
      fetch('/api/shop/categories').then(r => r.json()),
      fetch('/api/shop/tags').then(r => r.json()),
      fetch('/api/shop/bundles').then(r => r.json()),
      fetch('/api/shop/products').then(r => r.json()),
    ]).then(([cats, tgs, bndls, all]) => {
      setCategories(cats)
      setTags(tgs)
      setDeals(Array.isArray(bndls) ? bndls : [])
      setAllProducts(Array.isArray(all) ? all : [])
    })
  }, [track])

  // Cycle inline deal card with glare sweep
  useEffect(() => {
    if (deals.length < 2) return
    const t = setInterval(() => {
      setSweeping(true)
      // Swap content at midpoint of sweep so shine appears to reveal it
      setTimeout(() => setDealIdx(i => (i + 1) % deals.length), 280)
      setTimeout(() => setSweeping(false), 650)
    }, 3500)
    return () => clearInterval(t)
  }, [deals.length])

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
        .tag-dropdown { right: 0; }
        @media (max-width: 599px) {
          .tag-dropdown { right: 0; left: auto; }
        }
        .cat-pills::-webkit-scrollbar { display: none; }
        .cat-pills { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        .shop-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: shimmer 1.4s infinite;
        }
        .deal-inline-card {
          grid-column: 1 / -1;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .deal-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: clamp(20px, 4vw, 36px);
        }
        .deal-collage {
          flex-shrink: 0;
          position: relative;
          width: 220px;
          height: 140px;
        }
        @media (max-width: 599px) {
          .deal-card-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding-bottom: 0;
          }
          .deal-collage {
            width: 220px;
            height: 90px;
            overflow: visible;
            align-self: center;
          }
        }
        @keyframes shineSwipe {
          from { transform: translateX(-150%) skewX(-18deg); }
          to   { transform: translateX(400%) skewX(-18deg); }
        }
        .deal-shine {
          position: absolute; inset: 0; z-index: 10; pointer-events: none;
          overflow: hidden; border-radius: 16px;
        }
        .deal-shine::after {
          content: '';
          position: absolute; top: 0; bottom: 0; left: 0;
          width: 55%;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255,255,255,0.04) 38%,
            rgba(255,255,255,0.18) 50%,
            rgba(255,255,255,0.04) 62%,
            transparent 80%
          );
          animation: shineSwipe 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <main className="shop-main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--lavender)', marginBottom: '10px' }}>
            ◈ Limited drops
          </div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(22px,6vw,56px)', letterSpacing: '-0.01em', textTransform: 'uppercase', margin: 0, lineHeight: 1, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Pixels › Prints ›{' '}
            <span style={{ color: 'var(--lavender)' }}>
              Yours.
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '14px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em' }}>
            Original art prints. Yours to keep.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '20px' }}>
          <div className="cat-pills" style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto', minWidth: 0 }}>
            {[{ id: 'all', name: 'All' }, ...categories].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCat(cat.id); setVisibleCount(10) }}
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

          {tags.length > 0 && (
          <div ref={filterRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setFilterOpen(o => !o)}
              title={activeTag === 'all' ? 'Filter by tag' : (tags.find(t => t.slug === activeTag)?.name ?? activeTag)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
                border: '1px solid', flexShrink: 0,
                borderColor: activeTag !== 'all' ? 'var(--lime)' : 'var(--border-card)',
                background:  activeTag !== 'all' ? 'var(--lime-dim)' : 'transparent',
                color:       activeTag !== 'all' ? 'var(--lime)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {activeTag !== 'all' && (
                <span
                  onClick={e => { e.stopPropagation(); setActiveTag('all') }}
                  style={{ fontSize: '12px', lineHeight: 1, opacity: 0.7 }}
                >✕</span>
              )}
            </button>

            {filterOpen && (
              <div className="tag-dropdown" style={{
                position: 'absolute', top: 'calc(100% + 6px)', zIndex: 100,
                background: 'var(--surface-raised)', border: '1px solid var(--border-card)',
                borderRadius: '12px', padding: '6px', minWidth: '160px',
                maxWidth: 'min(220px, calc(100vw - 32px))',
                maxHeight: '240px', overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                display: 'flex', flexDirection: 'column', gap: '2px',
              }}>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => { setActiveTag(tag.slug); setFilterOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', borderRadius: '8px', fontSize: '12px',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
                      background: activeTag === tag.slug ? 'rgba(130,255,31,0.1)' : 'transparent',
                      color:      activeTag === tag.slug ? 'var(--lime)' : 'var(--text-secondary)',
                    }}
                  >
                    {tag.name}
                    {activeTag === tag.slug && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
        </div>

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
          <>
          <div className="shop-grid">
            {(() => {
              const nodes: React.ReactNode[] = []
              let dealCardInserted = false
              const displayedProducts = activeCat === 'all' ? products.slice(0, visibleCount) : products
              displayedProducts.forEach((p, i) => {
                nodes.push(<ProductCard key={p.id} product={p} />)
                // Inject deal card once after the 4th product
                if (i === 3 && deals.length > 0 && !dealCardInserted) {
                  dealCardInserted = true
                  const d = deals[dealIdx]
                  // Pick up to 3 product images from the deal's own category
                  const catProducts = allProducts.filter(pr => pr.category_id === d.category_id && pr.images[0])
                  const collageImgs = catProducts.slice(0, 3).map(pr => pr.images[0])
                  // Fallback: any product images
                  while (collageImgs.length < 3) {
                    const fallback = allProducts.find(pr => pr.images[0] && !collageImgs.includes(pr.images[0]))
                    if (!fallback) break
                    collageImgs.push(fallback.images[0])
                  }
                  const rotations = [-10, 3, 14]
                  const offsets   = [{ x: 0, y: 0 }, { x: 18, y: -12 }, { x: 36, y: 4 }]
                  nodes.push(
                    <div
                      key="deal-card"
                      className="deal-inline-card"
                      style={{
                        background: 'linear-gradient(135deg, #0f1a00 0%, #1a2a00 60%, #0a1400 100%)',
                        border: '1px solid rgba(232,255,0,0.2)',
                      }}
                    >
                      {sweeping && <div className="deal-shine" />}
                      <div className="deal-card-inner">
                      {/* Left: deal text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(232,255,0,0.5)', marginBottom: '10px' }}>
                          ◈ Bundle deal{d.category_name ? ` · ${d.category_name}` : ''}
                        </div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(24px, 5vw, 44px)', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1, color: '#e8ff00' }}>
                          {d.name}
                        </div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'rgba(232,255,0,0.5)', marginTop: '10px', letterSpacing: '0.06em' }}>
                          Auto-applied at checkout
                        </div>
                        {deals.length > 1 && (
                          <div style={{ display: 'flex', gap: '5px', marginTop: '16px' }}>
                            {deals.map((_, di) => (
                              <div key={di} style={{
                                width: di === dealIdx ? '18px' : '5px', height: '5px',
                                borderRadius: '999px',
                                background: di === dealIdx ? '#e8ff00' : 'rgba(232,255,0,0.25)',
                                transition: 'width 0.3s ease, background 0.3s ease',
                              }} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: 3-image fanned collage */}
                      {collageImgs.length > 0 && (
                        <div className="deal-collage">
                          {[
                            { top: 16, left: 0,   rotate: -13, z: 1 },
                            { top: 4,  left: 56,  rotate:   2, z: 2 },
                            { top: 20, left: 110, rotate:  12, z: 3 },
                          ].slice(0, collageImgs.length).map((cfg, ci) => (
                            <div key={ci} style={{
                              position: 'absolute',
                              top: cfg.top, left: cfg.left,
                              width: '110px', height: '110px',
                              borderRadius: '10px', overflow: 'hidden',
                              border: '2px solid rgba(232,255,0,0.22)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
                              transform: `rotate(${cfg.rotate}deg)`,
                              zIndex: cfg.z,
                            }}>
                              <img src={collageImgs[ci]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', userSelect: 'none' }} />
                            </div>
                          ))}
                        </div>
                      )}
                      </div>{/* end deal-card-inner */}
                    </div>
                  )
                }
              })
              return nodes
            })()}
          </div>
          {activeCat === 'all' && products.length > visibleCount && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <button
                onClick={() => setVisibleCount(c => c + 10)}
                style={{
                  padding: '10px 28px', borderRadius: '999px', fontSize: '13px',
                  fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: '1px solid var(--border-card)', background: 'transparent',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                Load more
              </button>
            </div>
          )}
          </>
        )}
      </main>
      <ShopSections />
    </>
  )
}
