'use client'
import { useEffect, useRef, useState } from 'react'
import type { MovieLog } from '@/lib/movies.types'

const SLIDE_MS   = 8000
const MAX_SLIDES = 5

function pickBackdrops(logs: MovieLog[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const l of logs) {
    if (!l.backdrop_url) continue
    const key = String(l.tmdb_id ?? l.title)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(l.backdrop_url)
    if (out.length === MAX_SLIDES) break
  }
  return out
}

/**
 * Page heading for the watchlog. Stills from recently watched films glow, blurred, behind the top of the page
 * and cross-fade slowly; the heading itself stays a normal size so the content starts straight away.
 * The page root must be positioned and isolated (position: relative; isolation: isolate) so the glow sits behind it.
 */
export default function AmbientHeader({ logs }: { logs: MovieLog[] }) {
  // Pick once, so switching tabs or filters below never changes the glow
  const [backdrops, setBackdrops] = useState<string[]>([])
  const picked = useRef(false)
  useEffect(() => {
    if (picked.current) return
    const next = pickBackdrops(logs)
    if (next.length) { picked.current = true; setBackdrops(next) }
  }, [logs])

  const [active, setActive] = useState(0)
  useEffect(() => {
    if (backdrops.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setActive(a => (a + 1) % backdrops.length)
    }, SLIDE_MS)
    return () => clearInterval(t)
  }, [backdrops.length])

  return (
    <>
      <style>{`
        .ah-glow { position: absolute; top: 0; left: 0; right: 0; height: min(620px, 85vh); z-index: -1; overflow: hidden; pointer-events: none; }
        .ah-glow::after { content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.5) 50%, var(--bg) 100%); }
        .ah-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 2.4s ease; }
        .ah-slide.is-active { opacity: 1; }
        .ah-slide img { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.2);
          filter: blur(22px) saturate(1.3) brightness(0.95); opacity: 0.6; }

        .ah-title { max-width: 1280px; margin: 0 auto; padding: 30px 24px 4px; }
        .ah-title h1 { margin: 0; font-family: var(--ff-display); font-weight: 500; font-size: clamp(2.8rem, 7vw, 5.6rem); line-height: 1;
          letter-spacing: 0.1em; text-transform: uppercase; color: #f4f1ff; }
        .ah-title p { margin: 10px 0 0; font-family: var(--ff-body); font-size: 15px; color: rgba(255,255,255,0.68); }

        @media (max-width: 640px) { .ah-title { padding: 22px 16px 2px; } .ah-title h1 { letter-spacing: 0.08em; } }
        @media (prefers-reduced-motion: reduce) { .ah-slide { transition: none; } }
      `}</style>

      <div className="ah-glow" aria-hidden="true">
        {backdrops.map((src, i) => (
          <div key={src} className={`ah-slide${i === active ? ' is-active' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" decoding="async" fetchPriority={i === 0 ? 'high' : 'low'} />
          </div>
        ))}
      </div>

      <div className="ah-title">
        <h1>Watchlog</h1>
        <p>Films watched. Feelings logged.</p>
      </div>
    </>
  )
}
