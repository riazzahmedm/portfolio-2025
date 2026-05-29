'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, PauseCircle, XCircle, Tv, ChevronUp, ChevronDown, Plus, Search, X, Loader2 } from 'lucide-react'
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

interface TMDBResult {
  id:           number
  name:         string
  poster_path:  string | null
  first_air_date?: string
  overview?:    string
  number_of_seasons?: number
  number_of_episodes?: number
}

const STATUS_CONFIG = {
  watching:  { color: '#82ff1f',  icon: <Tv size={13} />,          label: 'Watching'   },
  on_hold:   { color: '#fbbf24',  icon: <PauseCircle size={13} />, label: 'On Hold'    },
  dropped:   { color: '#e02020',  icon: <XCircle size={13} />,     label: 'Dropped'    },
  completed: { color: '#b8a0ff',  icon: <CheckCircle size={13} />, label: 'Completed'  },
}

function AddSeriesModal({ onClose, onAdded }: { onClose: () => void; onAdded: (item: SeriesProgress) => void }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<TMDBResult[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<TMDBResult | null>(null)
  const [status,   setStatus]   = useState<'watching' | 'on_hold' | 'dropped' | 'completed'>('watching')
  const [saving,   setSaving]   = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!query.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=tv`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } finally { setLoading(false) }
    }, 320)
  }, [query])

  async function handleAdd() {
    if (!selected) return
    setSaving(true)
    const poster_url = selected.poster_path
      ? `https://image.tmdb.org/t/p/w185${selected.poster_path}`
      : null
    const res = await fetch('/api/series-progress', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        tmdb_id:        selected.id,
        title:          selected.name,
        poster_url,
        status,
        total_seasons:  selected.number_of_seasons  ?? null,
        total_episodes: selected.number_of_episodes ?? null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const item = await res.json()
      onAdded(item)
      toast.success(`"${selected.name}" added to tracker`)
      onClose()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Failed to add')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: '100%', maxWidth: '520px',
        background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#82ff1f' }}>Add Series</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              placeholder="Search TV shows…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 12px 10px 34px',
                color: '#fff', fontFamily: 'var(--ff-body)', fontSize: '14px', outline: 'none',
              }}
            />
            {loading && <Loader2 size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', animation: 'spin 0.8s linear infinite' }} />}
          </div>

          {/* Results */}
          {results.length > 0 && !selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '260px', overflowY: 'auto', marginBottom: '16px' }}>
              {results.map(r => (
                <button key={r.id} onClick={() => setSelected(r)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(130,255,31,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ width: '32px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a' }}>
                    {r.poster_path
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tv size={12} color="rgba(255,255,255,0.2)" /></div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    {r.first_air_date && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{r.first_air_date.slice(0, 4)}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected show */}
          {selected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(130,255,31,0.05)', border: '1px solid rgba(130,255,31,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a' }}>
                {selected.poster_path
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`https://image.tmdb.org/t/p/w92${selected.poster_path}`} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tv size={12} color="rgba(255,255,255,0.2)" /></div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#82ff1f', fontFamily: 'var(--ff-body)' }}>{selected.name}</div>
                {selected.number_of_seasons && (
                  <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                    {selected.number_of_seasons} seasons · {selected.number_of_episodes ?? '?'} episodes
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}><X size={14} /></button>
            </div>
          )}

          {/* Status picker */}
          {selected && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>STATUS</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(Object.entries(STATUS_CONFIG) as [keyof typeof STATUS_CONFIG, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setStatus(k)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                    fontFamily: 'var(--ff-mono)', fontSize: '11px',
                    background: status === k ? `${v.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${status === k ? v.color : 'rgba(255,255,255,0.08)'}`,
                    color: status === k ? v.color : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s',
                  }}>
                    {v.icon} {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add button */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: '10px', cursor: 'pointer',
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', fontSize: '13px',
            }}>Cancel</button>
            <button onClick={handleAdd} disabled={!selected || saving} style={{
              flex: 2, padding: '11px', borderRadius: '10px', cursor: selected && !saving ? 'pointer' : 'not-allowed',
              background: selected && !saving ? '#82ff1f' : 'rgba(255,255,255,0.08)',
              border: 'none', color: selected && !saving ? '#000' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--ff-body)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.15s',
            }}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Adding…</> : 'Add to Tracker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrackerPage() {
  const [items,      setItems]      = useState<SeriesProgress[]>([])
  const [loading,    setLoading]    = useState(true)
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [showAdd,    setShowAdd]    = useState(false)

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

  async function deleteItem(id: string, title: string) {
    if (!confirm(`Remove "${title}" from tracker?`)) return
    const res = await fetch(`/api/series-progress/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Removed from tracker')
    } else {
      toast.error('Failed to remove')
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
      {showAdd && isAdmin && (
        <AddSeriesModal
          onClose={() => setShowAdd(false)}
          onAdded={item => setItems(prev => {
            const exists = prev.find(i => i.id === item.id)
            return exists ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev]
          })}
        />
      )}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Watchlog
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>SERIES TRACKER</div>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(130,255,31,0.1)', border: '1px solid rgba(130,255,31,0.25)',
              color: '#82ff1f', fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.1em',
            }}>
              <Plus size={12} /> Add Series
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '72px', borderRadius: '14px', background: 'var(--surface)', animation: 'pulse 1.6s ease infinite' }} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: '16px' }}><Tv size={40} color="rgba(255,255,255,0.1)" /></div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>No series being tracked yet.</div>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(130,255,31,0.1)', border: '1px solid rgba(130,255,31,0.25)',
                color: '#82ff1f', fontFamily: 'var(--ff-mono)', fontSize: '12px',
              }}>
                <Plus size={13} /> Track your first series
              </button>
            )}
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
                        const progress = item.total_seasons && item.total_seasons > 0
                          ? Math.round(((item.current_season - 1) / item.total_seasons) * 100)
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
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tv size={14} color="rgba(255,255,255,0.2)" /></div>
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
                              <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
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
                                {/* Delete */}
                                <button onClick={() => deleteItem(item.id, item.title)} style={{
                                  background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '6px', padding: '5px 7px', cursor: 'pointer',
                                  color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center',
                                  transition: 'color 0.15s, border-color 0.15s',
                                }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e02020'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(224,32,32,0.3)' }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                                >
                                  <XCircle size={13} />
                                </button>
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

      <style>{`
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  )
}
