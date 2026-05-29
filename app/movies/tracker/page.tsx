'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, PauseCircle, XCircle, Tv, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface SeriesProgress {
  id:               string
  tmdb_id:          number
  title:            string
  poster_url:       string | null
  current_season:   number
  current_episode:  number
  status:           'watching' | 'on_hold' | 'dropped' | 'completed'
  total_seasons:    number | null
  total_episodes:   number | null
  notes:            string | null
  last_updated:     string
}

const STATUS_CONFIG = {
  watching:  { color: '#82ff1f',  icon: <Tv size={13} />,          label: 'Watching'   },
  on_hold:   { color: '#fbbf24',  icon: <PauseCircle size={13} />, label: 'On Hold'    },
  dropped:   { color: '#e02020',  icon: <XCircle size={13} />,     label: 'Dropped'    },
  completed: { color: '#b8a0ff',  icon: <CheckCircle size={13} />, label: 'Completed'  },
}

export default function TrackerPage() {
  const [items,   setItems]   = useState<SeriesProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/series-progress').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/auth/movies').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [])

  async function updateProgress(id: string, field: 'current_season' | 'current_episode' | 'status', value: number | string) {
    const res = await fetch(`/api/series-progress/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === id ? updated : i))
    } else {
      toast.error('Failed to update')
    }
  }

  const grouped = {
    watching:  items.filter(i => i.status === 'watching'),
    on_hold:   items.filter(i => i.status === 'on_hold'),
    completed: items.filter(i => i.status === 'completed'),
    dropped:   items.filter(i => i.status === 'dropped'),
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Watchlog
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>SERIES TRACKER</div>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '72px', borderRadius: '14px', background: 'var(--surface)', animation: 'pulse 1.6s ease infinite' }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📺</div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>No series being tracked yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {(Object.entries(grouped) as [keyof typeof grouped, SeriesProgress[]][])
              .filter(([, list]) => list.length > 0)
              .map(([status, list]) => {
                const cfg = STATUS_CONFIG[status]
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>({list.length})</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {list.map(item => {
                        const totalSeasons = item.total_seasons ?? '?'
                        const progress = item.total_episodes && item.total_episodes > 0
                          ? Math.round(((item.current_season - 1) / (item.total_seasons ?? 1)) * 100)
                          : null
                        return (
                          <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '14px 16px', borderRadius: '14px',
                            background: 'var(--surface)', border: '1px solid var(--border-card)',
                          }}>
                            {/* Poster */}
                            <div style={{ width: '40px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '6px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {item.poster_url
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={item.poster_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📺</div>
                              }
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </div>
                              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                                S{String(item.current_season).padStart(2,'0')} E{String(item.current_episode).padStart(2,'0')}
                                {item.total_seasons && <span style={{ color: 'rgba(255,255,255,0.2)' }}> / {totalSeasons} seasons</span>}
                              </div>
                              {progress !== null && (
                                <div style={{ marginTop: '6px', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${progress}%`, background: cfg.color, borderRadius: '1px' }} />
                                </div>
                              )}
                            </div>

                            {/* Season/Episode controls — admin only */}
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                {/* Season stepper */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <button onClick={() => updateProgress(item.id, 'current_season', item.current_season + 1)}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                                    <ChevronUp size={11} />
                                  </button>
                                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>S</span>
                                  <button onClick={() => updateProgress(item.id, 'current_season', Math.max(1, item.current_season - 1))}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                                    <ChevronDown size={11} />
                                  </button>
                                </div>
                                {/* Episode stepper */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <button onClick={() => updateProgress(item.id, 'current_episode', item.current_episode + 1)}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                                    <ChevronUp size={11} />
                                  </button>
                                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>E</span>
                                  <button onClick={() => updateProgress(item.id, 'current_episode', Math.max(0, item.current_episode - 1))}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                                    <ChevronDown size={11} />
                                  </button>
                                </div>
                                {/* Status cycle */}
                                <select
                                  value={item.status}
                                  onChange={e => updateProgress(item.id, 'status', e.target.value)}
                                  style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', padding: '4px 8px', cursor: 'pointer',
                                    color: cfg.color, fontSize: '11px', fontFamily: 'var(--ff-mono)',
                                  }}>
                                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k} style={{ background: '#141414', color: v.color }}>{v.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
