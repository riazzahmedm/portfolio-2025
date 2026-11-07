'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Pause, Play, ShoppingBag, X } from 'lucide-react'
import { hasTitle, type PublicArtPiece } from '@/lib/art.types'

const ACCENT   = '#f59e0b'
const INTERVAL = 3000

/** Full-page viewer: the piece fills the screen, slides on its own, and a thumbnail strip along the bottom jumps anywhere. */
export default function ArtViewer({ pieces, openId, onChange }: { pieces: PublicArtPiece[]; openId: string | null; onChange: (id: string | null) => void }) {
  const index   = openId ? pieces.findIndex(p => p.id === openId) : -1
  const current = index >= 0 ? pieces[index] : null
  const [playing, setPlaying] = useState(true)
  const strip  = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  const open   = current != null

  const go   = useCallback((i: number) => onChange(pieces[(i + pieces.length) % pieces.length].id), [pieces, onChange])
  const step = useCallback((d: number) => { if (index >= 0) go(index + d) }, [go, index])

  // Start playing each time the viewer opens, unless the visitor prefers reduced motion
  useEffect(() => {
    if (open) setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [open])

  // Auto slide: the timer restarts after every change, so manual taps never get cut short
  useEffect(() => {
    if (!open || !playing || pieces.length < 2) return
    const t = setTimeout(() => step(1), INTERVAL)
    return () => clearTimeout(t)
  }, [open, playing, step, pieces.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, step, onChange])

  // Keep the active thumbnail centred in the strip
  useEffect(() => {
    const s = strip.current, el = s?.children[index] as HTMLElement | undefined
    if (!s || !el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    s.scrollTo({ left: el.offsetLeft - s.clientWidth / 2 + el.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [index, open])

  // Warm the next and previous pieces so the slide never waits
  useEffect(() => {
    if (index < 0) return
    for (const d of [1, -1]) {
      const n = pieces[(index + d + pieces.length) % pieces.length]
      if (n) new Image().src = n.image_url
    }
  }, [index, pieces])

  if (!current) return null

  return (
    <div className="av" role="dialog" aria-modal="true" aria-label={hasTitle(current.title) ? current.title : 'Artwork'}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
      }}>
      <style>{`
        .av { position: fixed; inset: 0; z-index: 200; display: flex; flex-direction: column; color: #fff; background: #060606; animation: av-in 0.25s ease-out; }
        @keyframes av-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes av-slide { from { opacity: 0; transform: scale(1.025) } to { opacity: 1; transform: none } }
        @keyframes av-bar { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .av-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 3; background: ${ACCENT}; transform-origin: 0 50%; animation: av-bar ${INTERVAL}ms linear forwards; }
        .av-top { position: absolute; top: 0; left: 0; right: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between;
          padding: max(12px, env(safe-area-inset-top)) 14px 12px 18px; pointer-events: none; }
        .av-top > * { pointer-events: auto; }
        .av-count { font: 12px var(--ff-mono); letter-spacing: 0.1em; color: rgba(255,255,255,0.7); }
        .av-btns { display: flex; gap: 8px; }
        .av-btn { width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18); cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: rgba(20,20,24,0.55); color: #fff; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) { .av-btn:hover { background: rgba(255,255,255,0.16); } .av-th:hover { opacity: 0.85; } .av-buy:hover { filter: brightness(1.08); } }
        .av-btn:focus-visible, .av-th:focus-visible, .av-buy:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        .av-stage { position: relative; flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 64px 16px 10px; }
        .av-nav { position: absolute; top: 50%; transform: translateY(-50%); }
        .av-fig { position: relative; margin: 0; max-width: 100%; line-height: 0; border-radius: 6px; overflow: hidden; box-shadow: 0 30px 80px -20px rgba(0,0,0,0.85); animation: av-slide 0.55s cubic-bezier(.2,.7,.2,1); }
        .av-img { display: block; max-width: 100%; max-height: calc(100dvh - 176px); width: auto; height: auto; object-fit: contain; }
        .av-over { position: absolute; left: 0; right: 0; bottom: 0; padding: 70px 16px 18px; display: flex; justify-content: center; pointer-events: none;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); }
        .av-buy { pointer-events: auto; display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 100px; text-decoration: none; font: 600 14px/1 var(--ff-body); color: #0a0a0a; background: ${ACCENT};
          box-shadow: 0 10px 26px -8px rgba(0,0,0,0.7); }
        .av-strip { display: flex; gap: 8px; overflow-x: auto; padding: 8px 16px calc(14px + env(safe-area-inset-bottom)); scrollbar-width: none; border-top: 1px solid rgba(255,255,255,0.08); }
        .av-strip::-webkit-scrollbar { display: none; }
        .av-th { flex: none; width: 46px; height: 62px; padding: 0; border: 2px solid transparent; border-radius: 6px; overflow: hidden; cursor: pointer; opacity: 0.5; background: #1a1a1a;
          transition: opacity 0.25s, border-color 0.25s, transform 0.25s; }
        .av-th img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .av-th[aria-current='true'] { opacity: 1; border-color: ${ACCENT}; transform: translateY(-3px); }
        @media (min-width: 720px) { .av-th { width: 54px; height: 72px; } .av-strip { justify-content: safe center; } }
        @media (max-width: 640px) { .av-nav { display: none; } .av-stage { padding-inline: 8px; } .av-img { max-height: calc(100dvh - 150px); } }
        @media (prefers-reduced-motion: reduce) { .av, .av-fig { animation: none; } .av-bar { display: none; } .av-th { transition: none; } }
      `}</style>

      {playing && pieces.length > 1 && <div key={current.id} className="av-bar" aria-hidden="true" />}

      <div className="av-top">
        <span className="av-count" aria-live="polite">{index + 1} / {pieces.length}</span>
        <div className="av-btns">
          {pieces.length > 1 && (
            <button type="button" className="av-btn" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}>
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
          )}
          <button type="button" className="av-btn" onClick={() => onChange(null)} aria-label="Close"><X size={19} /></button>
        </div>
      </div>

      <div className="av-stage" onClick={e => { if (e.target === e.currentTarget) onChange(null) }}>
        {pieces.length > 1 && <>
          <button type="button" className="av-btn av-nav" style={{ left: 16 }} onClick={() => step(-1)} aria-label="Previous piece"><ChevronLeft size={22} /></button>
          <button type="button" className="av-btn av-nav" style={{ right: 16 }} onClick={() => step(1)} aria-label="Next piece"><ChevronRight size={22} /></button>
        </>}
        <figure key={current.id} className="av-fig">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="av-img" src={current.image_url} alt={hasTitle(current.title) ? current.title : 'Artwork'} draggable={false} />
          {current.shop_id && (
            <div className="av-over">
              <Link href={`/shop/${current.shop_id}`} className="av-buy"><ShoppingBag size={16} /> Buy a print</Link>
            </div>
          )}
        </figure>
      </div>

      <div className="av-strip" ref={strip} role="tablist" aria-label="All pieces">
        {pieces.map((p, i) => (
          <button key={p.id} type="button" className="av-th" role="tab" aria-selected={i === index} aria-current={i === index} aria-label={hasTitle(p.title) ? p.title : `Artwork ${i + 1}`} onClick={() => onChange(p.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" loading="lazy" decoding="async" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  )
}
