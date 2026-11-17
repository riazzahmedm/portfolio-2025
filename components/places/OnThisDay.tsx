'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { PLACE_VIBES, type TimelineEntry } from '@/lib/places-core'
import { Thumb } from './shared'

type Hit = TimelineEntry & { yearsAgo: number }
const ago = (n: number) => (n === 1 ? '1 year ago' : `${n} years ago`)

/** A quiet strip of where you were on today's date in earlier years (the same idea as the Watchlog's). Renders nothing when there is nothing. */
export default function OnThisDay() {
  const [hits, setHits]   = useState<Hit[]>([])
  const [label, setLabel] = useState('')

  useEffect(() => {
    const now = new Date()
    const md  = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    fetch(`/api/places/on-this-day?md=${md}&year=${now.getFullYear()}`)
      .then(r => (r.ok ? r.json() : []))
      .then((rows: Hit[]) => { setLabel(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })); setHits(Array.isArray(rows) ? rows : []) })
      .catch(() => {})
  }, [])

  if (hits.length === 0) return null

  return (
    <section className="pl-otd" aria-label={`On this day, ${label}`}>
      <style>{`
        .pl-otd { margin-bottom: 18px; }
        .pl-otd-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font: 600 14px var(--ff-body); color: rgba(255,255,255,0.88); }
        .pl-otd-head svg { color: #b8a0ff; }
        .pl-otd-head span { font: 12px var(--ff-body); color: rgba(255,255,255,0.45); }
        .pl-otd-row { display: flex; gap: 12px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: none; scroll-snap-type: x proximity; }
        .pl-otd-row::-webkit-scrollbar { display: none; }
        .pl-otd-item { flex: none; width: 250px; display: flex; gap: 12px; align-items: center; padding: 8px 14px 8px 8px; border-radius: 16px; text-decoration: none; color: inherit; scroll-snap-align: start;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: background 0.2s, border-color 0.2s; }
        @media (hover: hover) and (pointer: fine) and (min-width: 641px) { .pl-otd-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(184,160,255,0.35); } }
        .pl-otd-item:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }
        .pl-otd-title { font: 600 13px/1.3 var(--ff-body); color: #fff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .pl-otd-meta { margin-top: 4px; font: 11px var(--ff-body); color: rgba(255,255,255,0.55); }
        .pl-otd-meta b { font-weight: 600; color: #cdbcff; }
        @media (max-width: 640px) { .pl-otd-row { padding-right: 28px; -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); } }
      `}</style>

      <div className="pl-otd-head"><CalendarDays size={15} aria-hidden="true" /> On this day <span>{label}</span></div>
      <div className="pl-otd-row">
        {hits.map(h => {
          const vibe = PLACE_VIBES.find(v => v.key === h.vibe)
          return (
            <Link key={`${h.source}:${h.id}`} href={`/places/${h.place.id}`} className="pl-otd-item">
              <Thumb src={h.movie ? h.movie.posterUrl : h.photos[0]} name={h.place.name} size={46} />
              <div style={{ minWidth: 0 }}>
                <div className="pl-otd-title">{h.place.name}</div>
                <div className="pl-otd-meta"><b>{ago(h.yearsAgo)}</b>{h.movie ? ` · ${h.movie.title}` : ''}{vibe ? ` · ${vibe.emoji}` : ''}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
