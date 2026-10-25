'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { VIBES } from '@/lib/movies.types'

interface Row {
  id:         string
  tmdb_id:    number | null
  title:      string
  poster_url: string | null
  year:       number | null
  type:       'movie' | 'series' | 'episode'
  vibe:       string | null
  watched_on: string
}

interface Entry { id: string; title: string; poster: string | null; yearsAgo: number; vibe: string | null; episodes: number }

/** One entry per title per year, so a binge of episodes shows once. Most recent year first. */
function toEntries(rows: Row[], thisYear: number): Entry[] {
  const seen = new Map<string, Entry>()
  for (const r of rows) {
    const yearsAgo = thisYear - Number(r.watched_on.slice(0, 4))
    if (yearsAgo < 1) continue
    const key = `${yearsAgo}:${r.tmdb_id ?? r.title}`
    const hit = seen.get(key)
    if (hit) { hit.episodes += 1; continue }
    seen.set(key, { id: r.id, title: r.title, poster: r.poster_url, yearsAgo, vibe: r.vibe, episodes: r.type === 'movie' ? 0 : 1 })
  }
  return [...seen.values()].sort((a, b) => a.yearsAgo - b.yearsAgo)
}

const ago = (n: number) => (n === 1 ? '1 year ago' : `${n} years ago`)

/** A quiet strip of what was watched on today's date in earlier years. Renders nothing when there is nothing. */
export default function OnThisDay() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [label, setLabel]     = useState('')

  useEffect(() => {
    const now = new Date()
    const md  = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setLabel(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))
    fetch(`/api/movies?otd=${md}`)
      .then(r => (r.ok ? r.json() : []))
      .then((rows: Row[]) => setEntries(Array.isArray(rows) ? toEntries(rows, now.getFullYear()) : []))
      .catch(() => {})
  }, [])

  if (entries.length === 0) return null

  return (
    <section className="otd" aria-label={`On this day, ${label}`}>
      <style>{`
        .otd { max-width: 1280px; margin: 0 auto; padding: 26px 24px 0; }
        .otd-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font: 600 14px var(--ff-body); color: rgba(255,255,255,0.88); }
        .otd-head svg { color: #b8a0ff; }
        .otd-head span { font: 12px var(--ff-body); color: rgba(255,255,255,0.45); }
        .otd-row { display: flex; gap: 12px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: none; scroll-snap-type: x proximity; }
        .otd-row::-webkit-scrollbar { display: none; }
        .otd-item { flex: none; width: 250px; display: flex; gap: 12px; align-items: center; padding: 8px 14px 8px 8px; border-radius: 16px; text-decoration: none; color: inherit; scroll-snap-align: start;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: background 0.2s, border-color 0.2s; }
        .otd-item:hover { background: rgba(255,255,255,0.07); border-color: rgba(184,160,255,0.35); }
        .otd-item:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }
        .otd-item img, .otd-ph { width: 46px; height: 69px; border-radius: 8px; object-fit: cover; flex: none; background: rgba(255,255,255,0.06); }
        .otd-title { font: 600 13px/1.3 var(--ff-body); color: #fff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .otd-meta { margin-top: 4px; font: 11px var(--ff-body); color: rgba(255,255,255,0.55); }
        .otd-meta b { font-weight: 600; color: #cdbcff; }
        @media (max-width: 640px) {
          .otd { padding: 22px 16px 0; }
          .otd-row { padding-right: 28px; -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); }
        }
      `}</style>

      <div className="otd-head"><CalendarDays size={15} aria-hidden="true" /> On this day <span>{label}</span></div>

      <div className="otd-row">
        {entries.map(e => {
          const vibe = VIBES.find(v => v.key === e.vibe)
          return (
            <Link key={`${e.yearsAgo}-${e.id}`} href={`/movies/${e.id}`} className="otd-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.poster ? <img src={e.poster} alt="" loading="lazy" /> : <div className="otd-ph" />}
              <div style={{ minWidth: 0 }}>
                <div className="otd-title">{e.title}</div>
                <div className="otd-meta">
                  <b>{ago(e.yearsAgo)}</b>
                  {e.episodes > 1 ? ` · ${e.episodes} episodes` : ''}
                  {vibe ? ` · ${vibe.emoji}` : ''}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
