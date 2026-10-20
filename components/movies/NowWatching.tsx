'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tv } from 'lucide-react'

interface Series {
  id:              string
  title:           string
  poster_url:      string | null
  current_season:  number
  current_episode: number
  status:          string
  total_episodes:  number | null
  last_updated:    string
}

export default function NowWatching() {
  const [items, setItems] = useState<Series[]>([])

  useEffect(() => {
    fetch('/api/series-progress')
      .then(r => r.ok ? r.json() : [])
      .then((d: Series[]) => setItems(Array.isArray(d) ? d.filter(s => s.status === 'watching') : []))
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#82ff1f', boxShadow: '0 0 8px #82ff1f' }} />
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#82ff1f' }}>Now watching</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(130,255,31,0.3), transparent)' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {items.map(s => {
          const pct = s.total_episodes ? Math.min(100, Math.round((s.current_episode / s.total_episodes) * 100)) : null
          return (
            <Link key={s.id} href="/movies/tracker" style={{
              display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0, minWidth: '240px',
              padding: '10px 14px 10px 10px', borderRadius: '14px', textDecoration: 'none', color: 'inherit',
              border: '1px solid rgba(130,255,31,0.18)', background: 'rgba(130,255,31,0.04)',
            }}>
              {s.poster_url
                ? <img src={s.poster_url} alt="" style={{ width: '40px', height: '58px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                : <div style={{ width: '40px', height: '58px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Tv size={16} /></div>}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>
                  S{s.current_season} · E{s.current_episode}
                </div>
                {pct !== null && (
                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '7px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#82ff1f' }} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
