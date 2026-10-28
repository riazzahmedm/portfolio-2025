'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PublicArtPiece } from '@/lib/art.types'

const ACCENT = '#f59e0b'
const SPACING = 340            // distance between frame pairs along the hall
const HEIGHT  = 620            // wall height
const FLOOR_Y = 260

/** A 3D gallery corridor: pieces hang on both walls and you walk down the hall by scrolling, dragging or sliding. */
export default function ArtHall({ pieces, onOpen }: { pieces: PublicArtPiece[]; onOpen: (id: string) => void }) {
  const stage = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const frames = useRef<(HTMLButtonElement | null)[]>([])
  const [near, setNear] = useState(0)
  // Phones get a narrower hall so the frames stay on screen instead of past the edges
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setCompact(mq.matches)
    apply(); mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  const HALF_W  = compact ? 165 : 300
  const FRAME_H = compact ? 230 : 280
  const [progress, setProgress] = useState(0)

  const pairs  = Math.ceil(pieces.length / 2)
  const length = SPACING * (pairs + 1.5)
  const max    = Math.max(1, length - SPACING * 1.4)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const s = useRef({ cam: 0, target: 0, yaw: 0, ty: 0, raf: 0, dragging: false, moved: 0, lastX: 0, visible: true, near: 0 })

  const paint = useCallback(() => {
    const st = s.current
    const k = reduce ? 1 : 0.1
    st.cam += (st.target - st.cam) * k
    st.yaw += (st.ty - st.yaw) * (reduce ? 1 : 0.08)
    if (world.current) world.current.style.transform = `translateZ(${st.cam + 60}px) rotateY(${st.yaw}deg)`

    let best = 0, bestD = Infinity
    frames.current.forEach((el, i) => {
      if (!el) return
      const zc = SPACING * (Math.floor(i / 2) + 1)
      const d = Math.abs(zc - st.cam - 120)
      el.style.filter = `brightness(${Math.max(0.3, 1.15 - d / 760).toFixed(2)})`
      if (d < bestD) { bestD = d; best = i }
    })
    if (best !== st.near) { st.near = best; setNear(best) }
    setProgress(st.cam / max)

    const settled = Math.abs(st.target - st.cam) < 0.4 && Math.abs(st.ty - st.yaw) < 0.05
    st.raf = settled || !st.visible ? 0 : requestAnimationFrame(paint)
  }, [max, reduce])

  const kick = useCallback(() => { if (!s.current.raf) s.current.raf = requestAnimationFrame(paint) }, [paint])
  const clamp = useCallback((v: number) => Math.max(0, Math.min(max, v)), [max])
  const goTo = useCallback((v: number) => { s.current.target = clamp(v); kick() }, [clamp, kick])

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const st = s.current
    const io = new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (st.visible) kick() }, { threshold: 0 })
    io.observe(el)

    // Native listener: React's wheel handler is passive and can't hold the page back
    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY
      // At either end let the page scroll on, so the hall never traps the reader
      if ((st.target <= 0 && dy < 0) || (st.target >= max && dy > 0) || Math.abs(dy) < Math.abs(e.deltaX)) return
      e.preventDefault()
      goTo(st.target + dy * 0.9)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    paint()
    return () => { io.disconnect(); el.removeEventListener('wheel', onWheel); cancelAnimationFrame(st.raf); st.raf = 0 }
  }, [kick, goTo, max, paint])

  const onDown = (e: React.PointerEvent) => { const st = s.current; st.dragging = true; st.moved = 0; st.lastX = e.clientX }
  const onMove = (e: React.PointerEvent) => {
    const st = s.current, r = stage.current!.getBoundingClientRect()
    if (e.pointerType === 'mouse') { st.ty = ((e.clientX - r.left) / r.width - 0.5) * 16; kick() }
    if (st.dragging) {
      const dx = e.clientX - st.lastX
      st.lastX = e.clientX; st.moved += Math.abs(dx)
      if (st.moved > 4) goTo(st.target - dx * 2.2)
    }
  }
  const onUp = () => { s.current.dragging = false }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(s.current.target + SPACING) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(s.current.target - SPACING) }
  }

  const wallPlane: React.CSSProperties = { position: 'absolute', left: 0, top: 0, transformOrigin: '0 0' }

  return (
    <section aria-label="Gallery hall" style={{ marginBottom: '56px' }}>
      <style>{`
        .hall { position: relative; height: clamp(400px, 64vh, 560px); border-radius: 14px; overflow: hidden; background: #0b0907; perspective: 700px;
          touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; outline-offset: 3px; }
        .hall:active { cursor: grabbing; }
        .hall:focus-visible { outline: 2px solid ${ACCENT}; }
        .hall-fr { position: absolute; left: 0; top: 0; transform-origin: 0 0; background: #d9c9a3; padding: 9px; border: 0; cursor: pointer;
          box-shadow: 0 0 0 2px #3b2a14, 0 18px 40px rgba(0,0,0,0.6); }
        .hall-fr img { display: block; width: 100%; height: 100%; object-fit: cover; background: #222; pointer-events: none; }
        .hall-fr i { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0, rgba(255,236,190,0.35), transparent 70%); }
        .hall-fr b { position: absolute; left: 50%; bottom: -34px; transform: translateX(-50%); white-space: nowrap; background: #b08d4a; color: #2a1d08;
          font: 500 11px var(--ff-body); padding: 3px 10px; border-radius: 2px; }
        .hall-fr:focus-visible { outline: 3px solid ${ACCENT}; outline-offset: 4px; }
        .hall-range { flex: 1; accent-color: ${ACCENT}; }
      `}</style>

      <div ref={stage} className="hall" tabIndex={0} role="group" aria-roledescription="3D gallery hall" aria-label="Gallery hall. Use arrow keys to walk, Tab to a frame and press Enter to open it."
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}>
        <div ref={world} style={{ position: 'absolute', left: '50%', top: '48%', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
          {/* left wall, right wall, floor, ceiling */}
          <div style={{ ...wallPlane, width: length, height: HEIGHT, background: 'linear-gradient(90deg,#1c1713,#2a221b)', transform: `translate3d(-${HALF_W}px,-${HEIGHT / 2}px,0) rotateY(90deg)` }} />
          <div style={{ ...wallPlane, width: length, height: HEIGHT, background: 'linear-gradient(90deg,#2a221b,#1c1713)', transform: `translate3d(${HALF_W}px,-${HEIGHT / 2}px,-${length}px) rotateY(-90deg)` }} />
          <div style={{ ...wallPlane, width: HALF_W * 2, height: length, background: 'repeating-linear-gradient(90deg,#3a2a1a 0 54px,#33251a 54px 108px)', transform: `translate3d(-${HALF_W}px,${FLOOR_Y}px,0) rotateX(-90deg)` }} />
          <div style={{ ...wallPlane, width: HALF_W * 2, height: length, background: '#0e0b09', transform: `translate3d(-${HALF_W}px,-${HEIGHT / 2}px,0) rotateX(-90deg)` }} />

          {pieces.map((p, i) => {
            const left = i % 2 === 0
            const zc   = SPACING * (Math.floor(i / 2) + 1)
            const ratio = p.width && p.height ? p.width / p.height : 0.75
            const w = Math.round(Math.min(compact ? 170 : 260, Math.max(compact ? 120 : 150, FRAME_H * ratio)))
            const transform = left
              ? `translate3d(-${HALF_W - 3}px,-${FRAME_H / 2}px,${-zc + w / 2}px) rotateY(90deg)`
              : `translate3d(${HALF_W - 3}px,-${FRAME_H / 2}px,${-zc - w / 2}px) rotateY(-90deg)`
            return (
              <button key={p.id} type="button" className="hall-fr" ref={el => { frames.current[i] = el }}
                style={{ width: w, height: FRAME_H, transform }}
                aria-label={`Open ${p.title}`}
                onClick={() => { if (s.current.moved <= 4) onOpen(p.id) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.title} draggable={false} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
                <i />
                <b>{p.title}</b>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
        <input type="range" className="hall-range" min={0} max={1000} value={Math.round(progress * 1000)} aria-label="Walk through the gallery"
          aria-valuetext={pieces[near]?.title} onChange={e => goTo((Number(e.target.value) / 1000) * max)} />
        <span aria-hidden="true" style={{ minWidth: '120px', textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>{pieces[near]?.title}</span>
      </div>
    </section>
  )
}
