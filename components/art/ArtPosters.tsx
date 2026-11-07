'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { gyroRef, initGyro, tiltProps } from '@/lib/tilt'
import { inkFor, sampleColor } from '@/lib/art-color'
import { hasTitle, type PublicArtPiece } from '@/lib/art.types'

// Fallback colors, used until a piece's own color has been read from its image (or if that fails)
const FALLBACKS = ['#ffb703', '#2ec4b6', '#9b5de5', '#ff5d8f', '#4cc9f0', '#80ed99', '#fb8500', '#f15bb5']

/** Big-type posters: each piece on a color block, its title in huge type that slides sideways as you scroll. */
export default function ArtPosters({ pieces, onOpen }: { pieces: PublicArtPiece[]; onOpen: (id: string) => void }) {
  const blocks = useRef<(HTMLElement | null)[]>([])
  const [colors, setColors] = useState<Record<string, string>>({})

  useEffect(() => { initGyro() }, [])

  // Phones tilt with the gyro. A mouse over a narrow window gets no hover or tilt effects, so the phone layout behaves the same everywhere
  const mouseTilt = { onPointerMove: (e: React.PointerEvent<HTMLElement>) => { if (window.innerWidth > 640) tiltProps.onPointerMove(e) }, onPointerLeave: tiltProps.onPointerLeave }

  // Slide the type: one scroll listener, only touching blocks near the screen
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const near = new Set<HTMLElement>()
    const io = new IntersectionObserver(entries => {
      for (const e of entries) e.isIntersecting ? near.add(e.target as HTMLElement) : near.delete(e.target as HTMLElement)
      tick()
    }, { rootMargin: '200px 0px' })
    blocks.current.forEach(b => b && io.observe(b))

    let raf = 0
    const paint = () => {
      raf = 0
      const vh = window.innerHeight
      near.forEach(el => {
        const r = el.getBoundingClientRect()
        const p = Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh))
        el.style.setProperty('--p', p.toFixed(3))
      })
    }
    const tick = () => { if (!raf) raf = requestAnimationFrame(paint) }
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    return () => { io.disconnect(); window.removeEventListener('scroll', tick); window.removeEventListener('resize', tick); cancelAnimationFrame(raf) }
  }, [pieces])

  // Read each piece's color shortly before it scrolls into view
  useEffect(() => {
    let cancelled = false
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        const id = (e.target as HTMLElement).dataset.id!
        const piece = pieces.find(p => p.id === id)
        if (!piece) continue
        sampleColor(piece.image_url).then(c => { if (c && !cancelled) setColors(prev => (prev[id] === c ? prev : { ...prev, [id]: c })) })
      }
    }, { rootMargin: '600px 0px' })
    blocks.current.forEach(b => b && io.observe(b))
    return () => { cancelled = true; io.disconnect() }
  }, [pieces])

  return (
    <div className="art-posters">
      <style>{`
        .art-posters { display: flex; flex-direction: column; gap: 14px; }
        .poster { position: relative; height: clamp(300px, 46vh, 400px); overflow: hidden; border-radius: 18px; isolation: isolate;
          background: var(--bg-c); color: var(--ink); transition: background-color 0.8s ease; }
        .poster-type { position: absolute; left: 0; top: 50%; margin: 0; white-space: nowrap; pointer-events: none; z-index: 0;
          font: 600 clamp(110px, 24vw, 210px)/1 var(--ff-display); letter-spacing: -0.02em; text-transform: uppercase;
          transform: translate3d(calc(var(--p, 0) * var(--dir) * -24vw - 5vw), -50%, 0); will-change: transform; opacity: 0.94; }
        .poster-r .poster-art { right: 7%; } .poster-l .poster-art { left: 7%; }
        .poster-r .poster-meta { left: 18px; align-items: flex-start; text-align: left; } .poster-l .poster-meta { right: 18px; align-items: flex-end; text-align: right; }
        .poster-art { --ty: -50%; --rot: var(--tilt); --sc: 1;
          position: absolute; top: 50%; z-index: 1; width: clamp(130px, 24vw, 210px); margin: 0; padding: 0; border: 0; cursor: zoom-in;
          border-radius: 14px; overflow: hidden; background: rgba(0,0,0,0.2);
          box-shadow: 0 24px 44px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.08);
          transform: translateY(var(--ty)) perspective(800px) rotateX(calc(var(--my, 0) * -18deg)) rotateY(calc(var(--mx, 0) * 18deg)) rotate(var(--rot)) scale(var(--sc));
          transition: transform 0.4s cubic-bezier(.2,.7,.2,1); }
        .poster-art.is-tilting { transition: transform 0.1s linear; }
        .poster-art img { display: block; width: 100%; height: auto; }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) { .poster-art:hover { --ty: -52%; --rot: 0deg; --sc: 1.05; } }
        .poster-art:active { --rot: 0deg; --sc: 0.98; }
        .poster-art:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
        .poster-meta { position: absolute; bottom: 14px; z-index: 2; max-width: min(62%, 320px); display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
        .poster-title { font: 600 18px/1.15 var(--ff-display); letter-spacing: 0.04em; text-transform: uppercase; }
        .poster-meta p { margin: 0; font-family: var(--ff-serif); font-style: italic; font-weight: 400; font-size: 15px; line-height: 1.5; text-shadow: none; }
        .poster-buy { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 100px; text-decoration: none; font: 600 12px var(--ff-body);
          color: var(--bg-c); background: var(--ink); }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) { .poster-buy:hover { filter: brightness(1.1); } }
        .poster-buy:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
        /* Phones: the artwork leads. It goes big and sits in the flow, with the type behind it and the words underneath */
        @media (max-width: 640px) {
          .poster { height: auto; display: flex; flex-direction: column; padding: 30px 0 20px; }
          .poster-type { top: 38%; font-size: clamp(120px, 38vw, 190px); }
          .poster-art { --ty: 0px; position: relative; top: auto; width: 72%; max-width: 340px; flex: none; }
          .poster-r .poster-art { right: auto; align-self: flex-end; margin-right: 6%; }
          .poster-l .poster-art { left: auto; align-self: flex-start; margin-left: 6%; }
          .poster-meta { position: relative; bottom: auto; left: auto; right: auto; max-width: none; margin: 22px 20px 0; }
          .poster-r .poster-meta, .poster-l .poster-meta { left: auto; right: auto; }
          .poster-title { font-size: 22px; }
          .poster-meta p { font-size: 16px; }
        }
        @media (prefers-reduced-motion: reduce) { .poster-type { transform: translate3d(-5vw, -50%, 0); } .poster, .poster-art { transition: none; transform: translateY(var(--ty)) rotate(var(--tilt)); } }
      `}</style>

      {pieces.map((p, i) => {
        const color = colors[p.id] ?? FALLBACKS[i % FALLBACKS.length]
        const right = i % 2 === 0
        const ratio = p.width && p.height ? p.width / p.height : 0.72
        return (
          <section key={p.id} className={`poster ${right ? 'poster-r' : 'poster-l'}`} data-id={p.id} ref={el => { blocks.current[i] = el }} aria-label={hasTitle(p.title) ? p.title : 'Artwork'}
            style={{ '--bg-c': color, '--ink': inkFor(color), '--dir': right ? 1 : -1 } as React.CSSProperties}>
            {hasTitle(p.title) && <h2 className="poster-type" aria-hidden="true">{p.title} {p.title}</h2>}

            <button type="button" className="poster-art" ref={gyroRef} {...mouseTilt} onClick={() => onOpen(p.id)} aria-label={hasTitle(p.title) ? `View ${p.title}` : 'View artwork'}
              style={{ '--tilt': `${right ? 4 : -4}deg`, aspectRatio: `${ratio}` } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt={hasTitle(p.title) ? p.title : 'Artwork'} width={p.width ?? undefined} height={p.height ?? undefined}
                loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
            </button>

            <div className="poster-meta">
              {hasTitle(p.title) && <b className="poster-title">{p.title}</b>}
              {p.caption && <p>{p.caption}</p>}
              {p.shop_id && <Link href={`/shop/${p.shop_id}`} className="poster-buy"><ShoppingBag size={13} /> Buy a print</Link>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
