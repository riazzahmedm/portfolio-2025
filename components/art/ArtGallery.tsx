'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, X } from 'lucide-react'
import type { PublicArtPiece } from '@/lib/art.types'
import ArtHall from '@/components/art/ArtHall'

// The first pieces in the gallery order walk the hall; everything is in the grid below
const HALL_SIZE = 12

const ACCENT = '#f59e0b'

export default function ArtGallery({ pieces }: { pieces: PublicArtPiece[] }) {
  const [tag, setTag]       = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const touchX              = useRef<number | null>(null)

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of pieces) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [pieces])

  const visible = useMemo(() => (tag ? pieces.filter(p => p.tags.includes(tag)) : pieces), [pieces, tag])
  // The hall can open a piece the active filter hides, so fall back to the full list for the viewer
  const list    = openId && !visible.some(p => p.id === openId) ? pieces : visible
  const index   = openId ? list.findIndex(p => p.id === openId) : -1
  const current = index >= 0 ? list[index] : null

  const step = useCallback((dir: 1 | -1) => {
    if (!list.length || index < 0) return
    setOpenId(list[(index + dir + list.length) % list.length].id)
  }, [list, index])

  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [current, step])

  // Warm the neighbours so the arrows feel instant
  useEffect(() => {
    if (index < 0) return
    for (const d of [1, -1]) {
      const n = list[(index + d + list.length) % list.length]
      if (n) new Image().src = n.image_url
    }
  }, [index, list])

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <style>{`
        .art-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 20px 80px; }
        .art-grid { columns: 2; column-gap: 12px; }
        @media (min-width: 720px)  { .art-grid { columns: 3; column-gap: 16px; } }
        @media (min-width: 1100px) { .art-grid { columns: 4; column-gap: 18px; } }
        .art-tile { display: block; width: 100%; margin: 0 0 12px; padding: 0; border: 0; cursor: zoom-in; break-inside: avoid; position: relative;
          border-radius: 10px; overflow: hidden; background: var(--surface); }
        @media (min-width: 720px) { .art-tile { margin-bottom: 16px; } }
        .art-tile img { display: block; width: 100%; height: auto; transition: transform 0.5s cubic-bezier(.2,.7,.2,1); }
        .art-tile-cap { position: absolute; inset: auto 0 0 0; padding: 36px 12px 10px; text-align: left; color: #fff; font: 500 13px var(--ff-body);
          background: linear-gradient(to top, rgba(0,0,0,0.78), transparent); opacity: 0; transform: translateY(6px); transition: opacity 0.25s, transform 0.25s; }
        @media (hover: hover) {
          .art-tile:hover img { transform: scale(1.035); }
          .art-tile:hover .art-tile-cap { opacity: 1; transform: none; }
        }
        .art-tile:focus-visible, .art-chip:focus-visible, .art-lb button:focus-visible, .art-lb a:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .art-chip { padding: 7px 14px; border-radius: 100px; cursor: pointer; font: 12px var(--ff-body); transition: all 0.18s;
          border: 1px solid var(--border); background: transparent; color: var(--text-secondary); text-transform: capitalize; }
        .art-chip[aria-pressed='true'] { border-color: ${ACCENT}88; background: ${ACCENT}1f; color: ${ACCENT}; }
        .art-lb { position: fixed; inset: 0; z-index: 200; background: rgba(5,5,5,0.94); display: flex; flex-direction: column; color: #fff;
          -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); animation: art-in 0.2s ease-out; }
        @keyframes art-in { from { opacity: 0 } to { opacity: 1 } }
        .art-lb-stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 56px 16px 8px; position: relative; }
        .art-lb-stage img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8); }
        .art-lb-btn { position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18); cursor: pointer;
          background: rgba(20,20,24,0.6); color: #fff; display: flex; align-items: center; justify-content: center; }
        .art-lb-btn:hover { background: rgba(255,255,255,0.14); }
        .art-lb-info { padding: 10px 20px calc(18px + env(safe-area-inset-bottom)); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .art-buy { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; padding: 8px 16px; border-radius: 100px; text-decoration: none;
          font: 600 12.5px var(--ff-body); color: #0a0a0a; background: ${ACCENT}; }
        .art-buy:hover { filter: brightness(1.08); }
        @media (max-width: 640px) { .art-lb-prev, .art-lb-next { display: none; } }
        @media (prefers-reduced-motion: reduce) { .art-lb { animation: none; } .art-tile img { transition: none; } }
      `}</style>

      <div className="art-wrap">
        <Link href="/hub" aria-label="Back to hub" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          <ArrowLeft size={18} />
        </Link>

        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--ff-display)', fontSize: 'clamp(40px, 8vw, 72px)', lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase', color: ACCENT }}>Art</h1>
          <p style={{ margin: '10px 0 0', maxWidth: '46ch', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            Digital illustration, mostly portraits. Walk the hall, then tap any piece to see it large. Prints of some are in the shop.
          </p>
        </header>

        {pieces.length > 0 && <ArtHall pieces={pieces.slice(0, HALL_SIZE)} onOpen={setOpenId} />}

        {pieces.length > HALL_SIZE && (
          <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>All work</h2>
        )}

        {tags.length > 0 && (
          <div role="group" aria-label="Filter by theme" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            <button type="button" className="art-chip" aria-pressed={!tag} onClick={() => setTag('')}>All {pieces.length}</button>
            {tags.map(t => (
              <button key={t} type="button" className="art-chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p style={{ padding: '70px 0', textAlign: 'center', fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            {pieces.length === 0 ? 'The gallery is empty for now. New work lands here soon.' : 'Nothing under this theme yet.'}
          </p>
        ) : (
          <div className="art-grid">
            {visible.map((p, i) => (
              <button key={p.id} type="button" className="art-tile" onClick={() => setOpenId(p.id)} aria-label={`View ${p.title}`}
                style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.title} width={p.width ?? undefined} height={p.height ?? undefined}
                  loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
                <span className="art-tile-cap">{p.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div className="art-lb" role="dialog" aria-modal="true" aria-label={current.title}
          onClick={e => { if (e.target === e.currentTarget) setOpenId(null) }}
          onTouchStart={e => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchX.current == null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
          }}>
          <div className="art-lb-stage" onClick={e => { if (e.target === e.currentTarget) setOpenId(null) }}>
            <button type="button" className="art-lb-btn" style={{ top: 'max(12px, env(safe-area-inset-top))', right: '12px' }} onClick={() => setOpenId(null)} aria-label="Close"><X size={20} /></button>
            {list.length > 1 && <>
              <button type="button" className="art-lb-btn art-lb-prev" style={{ left: '16px' }} onClick={() => step(-1)} aria-label="Previous piece"><ChevronLeft size={22} /></button>
              <button type="button" className="art-lb-btn art-lb-next" style={{ right: '16px' }} onClick={() => step(1)} aria-label="Next piece"><ChevronRight size={22} /></button>
            </>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.id} src={current.image_url} alt={current.title} />
          </div>
          <div className="art-lb-info">
            <p style={{ margin: 0, fontFamily: 'var(--ff-display)', fontSize: '22px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{current.title}</p>
            {current.caption && <p style={{ margin: 0, maxWidth: '60ch', fontSize: '13.5px', lineHeight: 1.55, color: 'rgba(255,255,255,0.7)' }}>{current.caption}</p>}
            {current.shop_id && (
              <Link href={`/shop/${current.shop_id}`} className="art-buy"><ShoppingBag size={14} /> Buy a print</Link>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
