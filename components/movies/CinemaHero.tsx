'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { MovieLog } from '@/lib/movies.types'

const SLIDE_MS   = 7000
const MAX_SLIDES = 6

type Slide = { id: string; title: string; year: number | null; backdrop: string }

function pickSlides(logs: MovieLog[]): Slide[] {
  const seen = new Set<string>()
  const out: Slide[] = []
  for (const l of logs) {
    if (!l.backdrop_url) continue
    const key = String(l.tmdb_id ?? l.title)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ id: l.id, title: l.title, year: l.year ?? null, backdrop: l.backdrop_url })
    if (out.length === MAX_SLIDES) break
  }
  return out
}

/**
 * Widescreen opening frame for the watchlog: backdrops from the most recent films drift and cross-fade,
 * the tagline is set like burned-in subtitles, and the letterbox strip names the film on screen.
 */
export default function CinemaHero({ logs }: { logs: MovieLog[] }) {
  // Pick once, so changing tabs or filters below never swaps the film on screen
  const [slides, setSlides] = useState<Slide[]>([])
  const picked = useRef(false)
  useEffect(() => {
    if (picked.current) return
    const next = pickSlides(logs)
    if (next.length) { picked.current = true; setSlides(next) }
  }, [logs])

  const [active, setActive] = useState(0)
  useEffect(() => {
    if (slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setActive(a => (a + 1) % slides.length)
    }, SLIDE_MS)
    return () => clearInterval(t)
  }, [slides.length])

  const current = slides[active]

  return (
    <header className="ch" aria-label="Watchlog">
      <style>{`
        .ch { background: #000; }
        .ch-frame { position: relative; height: clamp(340px, 52vw, 600px); overflow: hidden; background: radial-gradient(120% 90% at 20% 20%, #1b1530 0%, #07060b 70%); isolation: isolate; }

        .ch-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease; }
        .ch-slide.is-active { opacity: 1; }
        .ch-slide img { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.06); }
        .ch-slide.is-active img { animation: ch-drift 14s ease-out forwards; }
        .ch-slide:nth-child(even).is-active img { animation-name: ch-drift-alt; }

        .ch-vignette { position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background:
            radial-gradient(130% 100% at 50% 40%, transparent 45%, rgba(0,0,0,0.7) 100%),
            linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, transparent 28%, transparent 48%, rgba(5,5,5,0.88) 100%); }
        .ch-grain { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0.16; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }

        .ch-inner { position: relative; z-index: 3; height: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .ch-title { position: absolute; left: 24px; bottom: 22%; margin: 0;
          font-family: var(--ff-display); font-weight: 500; font-size: clamp(3.4rem, 12.5vw, 10.5rem); line-height: 0.9;
          letter-spacing: 0.1em; text-transform: uppercase; color: #f4f1ff; text-shadow: 0 4px 48px rgba(0,0,0,0.55); }
        .ch-sub { position: absolute; left: 50%; bottom: 7%; transform: translateX(-50%); width: max-content; max-width: calc(100% - 32px); text-align: center; }
        .ch-sub span { display: inline; padding: 4px 12px; background: rgba(0,0,0,0.62); color: #fff;
          font-family: var(--ff-body); font-weight: 500; font-size: clamp(0.95rem, 1.7vw, 1.3rem); line-height: 1.75;
          -webkit-box-decoration-break: clone; box-decoration-break: clone; border-radius: 2px; }

        .ch-strip { background: #000; }
        .ch-strip-in { max-width: 1280px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 52px; }
        .ch-now { min-width: 0; font-family: var(--ff-body); font-size: 13px; color: rgba(255,255,255,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ch-now a { color: #f4f1ff; text-decoration: none; font-weight: 500; }
        .ch-now a:hover { color: #b8a0ff; }
        .ch-now a:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 3px; border-radius: 2px; }
        .ch-ticks { display: flex; gap: 6px; flex-shrink: 0; }
        .ch-ticks button { width: 22px; height: 18px; padding: 0; border: 0; background: none; cursor: pointer; display: flex; align-items: center; }
        .ch-ticks button::before { content: ''; display: block; width: 100%; height: 2px; border-radius: 1px; background: rgba(255,255,255,0.22); transition: background 0.3s; }
        .ch-ticks button[aria-current='true']::before { background: #f4f1ff; }
        .ch-ticks button:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }

        @keyframes ch-drift     { from { transform: scale(1.06) translate3d(-1.2%, 0.4%, 0); }  to { transform: scale(1.17) translate3d(1.2%, -0.8%, 0); } }
        @keyframes ch-drift-alt { from { transform: scale(1.17) translate3d(1%, -0.6%, 0); }    to { transform: scale(1.06) translate3d(-1.2%, 0.5%, 0); } }
        @media (prefers-reduced-motion: reduce) {
          .ch-slide { transition: none; }
          .ch-slide.is-active img { animation: none; transform: scale(1.06); }
        }
        @media (max-width: 640px) {
          .ch-inner { padding: 0 16px; } .ch-title { left: 16px; bottom: 26%; letter-spacing: 0.06em; font-size: 19vw; }
          .ch-strip-in { padding: 12px 16px; }
          .ch-ticks { gap: 4px; } .ch-ticks button { width: 14px; }
          .ch-now-label { display: none; }
        }
      `}</style>

      <div className="ch-frame">
        {slides.map((s, i) => (
          <div key={s.id} className={`ch-slide${i === active ? ' is-active' : ''}`} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.backdrop} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'low'} />
          </div>
        ))}
        <div className="ch-vignette" />
        <div className="ch-grain" />

        <div className="ch-inner">
          <h1 className="ch-title">Watchlog</h1>
          <p className="ch-sub"><span>Films watched. Feelings logged.</span></p>
        </div>
      </div>

      <div className="ch-strip">
        <div className="ch-strip-in">
          <div className="ch-now" aria-live="off">
            {current ? (
              <><span className="ch-now-label">Recently watched: </span><Link href={`/movies/${current.id}`}>{current.title}{current.year ? ` (${current.year})` : ''}</Link></>
            ) : (
              <>Everything I watch ends up here.</>
            )}
          </div>
          {slides.length > 1 && (
            <div className="ch-ticks" role="group" aria-label="Choose a film">
              {slides.map((s, i) => (
                <button key={s.id} type="button" aria-label={s.title} aria-current={i === active} onClick={() => setActive(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
