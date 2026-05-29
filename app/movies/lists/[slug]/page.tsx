'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, X, Loader2, Trash2, Film, Tv } from 'lucide-react'
import { toast } from 'sonner'

interface ListItem {
  id: string; title: string; poster_url: string | null; type: string | null
  year: number | null; note: string | null; rank: number; log_id: string | null
  tmdb_id?: number | null
}
interface MovieList {
  id: string; title: string; description: string | null; created_at: string
  movie_list_items: ListItem[]
}
interface TMDBResult {
  id:            number
  title?:        string
  name?:         string
  poster_path:   string | null
  release_date?: string
  first_air_date?: string
  media_type?:   string
}

function AddItemModal({ slug, onClose, onAdded }: { slug: string; onClose: () => void; onAdded: (item: ListItem) => void }) {
  const [query,    setQuery]    = useState('')
  const [mediaTab, setMediaTab] = useState<'movie' | 'tv'>('movie')
  const [results,  setResults]  = useState<TMDBResult[]>([])
  const [loading,  setLoading]  = useState(false)
  const [selected, setSelected] = useState<TMDBResult | null>(null)
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (!query.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${mediaTab}`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } finally { setLoading(false) }
    }, 320)
  }, [query, mediaTab])

  // Reset results when switching tab
  useEffect(() => { setResults([]); setSelected(null) }, [mediaTab])

  async function handleAdd() {
    if (!selected) return
    setSaving(true)
    const title      = selected.title ?? selected.name ?? ''
    const year       = parseInt((selected.release_date ?? selected.first_air_date ?? '').slice(0, 4)) || null
    const poster_url = selected.poster_path
      ? `https://image.tmdb.org/t/p/w185${selected.poster_path}`
      : null
    const type = mediaTab === 'tv' ? 'series' : 'movie'

    const res = await fetch(`/api/movies/lists/${slug}/items`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ tmdb_id: selected.id, title, poster_url, type, year, note: note.trim() || null, rank: 0 }),
    })
    setSaving(false)
    if (res.ok) {
      const item = await res.json()
      onAdded(item)
      toast.success(`"${title}" added to list`)
      onClose()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Failed to add item')
    }
  }

  const displayName = (r: TMDBResult) => r.title ?? r.name ?? ''
  const displayYear = (r: TMDBResult) => (r.release_date ?? r.first_air_date ?? '').slice(0, 4)

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
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b8a0ff' }}>Add Item</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Media type tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {(['movie', 'tv'] as const).map(t => (
              <button key={t} onClick={() => setMediaTab(t)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.08em',
                background: mediaTab === t ? 'rgba(184,160,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${mediaTab === t ? 'rgba(184,160,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: mediaTab === t ? '#b8a0ff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.15s',
              }}>
                {t === 'movie' ? <Film size={11} /> : <Tv size={11} />}
                {t === 'movie' ? 'Movie' : 'TV Series'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              placeholder={`Search ${mediaTab === 'movie' ? 'movies' : 'TV shows'}…`}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto', marginBottom: '14px' }}>
              {results.map(r => (
                <button key={r.id} onClick={() => setSelected(r)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(184,160,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <div style={{ width: '30px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a' }}>
                    {r.poster_path
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={displayName(r)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {mediaTab === 'movie' ? <Film size={11} color="rgba(255,255,255,0.2)" /> : <Tv size={11} color="rgba(255,255,255,0.2)" />}
                        </div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(r)}</div>
                    {displayYear(r) && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{displayYear(r)}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected */}
          {selected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(184,160,255,0.05)', border: '1px solid rgba(184,160,255,0.2)', borderRadius: '12px', marginBottom: '14px' }}>
              <div style={{ width: '32px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '4px', overflow: 'hidden', background: '#0a0a0a' }}>
                {selected.poster_path
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`https://image.tmdb.org/t/p/w92${selected.poster_path}`} alt={displayName(selected)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Film size={11} color="rgba(255,255,255,0.2)" /></div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#b8a0ff', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName(selected)}</div>
                {displayYear(selected) && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{displayYear(selected)}</div>}
              </div>
              <button onClick={() => { setSelected(null); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex' }}><X size={14} /></button>
            </div>
          )}

          {/* Note */}
          {selected && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>NOTE (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Why this is on the list…"
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'vertical',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 14px',
                  color: '#fff', fontFamily: 'var(--ff-body)', fontSize: '13px', outline: 'none', lineHeight: 1.5,
                }}
              />
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: '10px', cursor: 'pointer',
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', fontSize: '13px',
            }}>Cancel</button>
            <button onClick={handleAdd} disabled={!selected || saving} style={{
              flex: 2, padding: '11px', borderRadius: '10px', cursor: selected && !saving ? 'pointer' : 'not-allowed',
              background: selected && !saving ? '#b8a0ff' : 'rgba(255,255,255,0.08)',
              border: 'none', color: selected && !saving ? '#000' : 'rgba(255,255,255,0.3)',
              fontFamily: 'var(--ff-body)', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.15s',
            }}>
              {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Adding…</> : 'Add to List'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ListDetailPage() {
  const params = useParams()
  const slug   = params?.slug as string
  const [list,    setList]    = useState<MovieList | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/movies/lists/${slug}`)
      .then(r => r.json())
      .then(d => { setList(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/auth/movies').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [slug])

  async function deleteItem(itemId: string, title: string) {
    if (!confirm(`Remove "${title}" from list?`)) return
    const res = await fetch(`/api/movies/lists/${slug}/items/${itemId}`, { method: 'DELETE' })
    if (res.ok) {
      setList(prev => prev ? { ...prev, movie_list_items: prev.movie_list_items.filter(i => i.id !== itemId) } : prev)
      toast.success('Item removed')
    } else {
      toast.error('Failed to remove')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>LOADING…</div>
    </div>
  )

  if (!list) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>List not found</div>
      <Link href="/movies/lists" style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: '#b8a0ff', textDecoration: 'none' }}>← All lists</Link>
    </div>
  )

  const items = (list.movie_list_items ?? []).sort((a, b) => a.rank - b.rank)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>
      {showAdd && isAdmin && (
        <AddItemModal
          slug={slug}
          onClose={() => setShowAdd(false)}
          onAdded={item => setList(prev => prev ? { ...prev, movie_list_items: [...prev.movie_list_items, item] } : prev)}
        />
      )}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', padding: '14px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/movies/lists" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em' }}>
            <ArrowLeft size={13} /> Lists
          </Link>
          <div style={{ flex: 1 }} />
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.25)',
              color: '#b8a0ff', fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.1em',
            }}>
              <Plus size={12} /> Add Item
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--ff-display)', fontWeight: 400, fontSize: 'clamp(2rem, 8vw, 4rem)', letterSpacing: '0.04em', color: '#fff', lineHeight: 1 }}>
            {list.title}
          </h1>
          {list.description && (
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--ff-body)', lineHeight: 1.65 }}>
              {list.description}
            </p>
          )}
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>
            {items.length} {items.length === 1 ? 'title' : 'titles'}
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px', marginBottom: '20px' }}>Nothing on this list yet.</div>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(184,160,255,0.1)', border: '1px solid rgba(184,160,255,0.25)',
                color: '#b8a0ff', fontFamily: 'var(--ff-mono)', fontSize: '12px',
              }}>
                <Plus size={13} /> Add the first item
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '16px 20px',
                background: i % 2 === 0 ? 'var(--surface)' : 'rgba(255,255,255,0.01)',
              }}>
                {/* Rank */}
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.2)', width: '22px', textAlign: 'right', flexShrink: 0, marginTop: '2px' }}>
                  {i + 1}
                </div>
                {/* Poster */}
                <div style={{ width: '42px', flexShrink: 0, aspectRatio: '2/3', borderRadius: '6px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {item.poster_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.poster_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎬</div>
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', fontFamily: 'var(--ff-body)' }}>
                      {item.log_id
                        ? <Link href={`/movies/${item.log_id}`} style={{ color: '#fff', textDecoration: 'none' }}>{item.title}</Link>
                        : item.title
                      }
                    </div>
                    {item.year && <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{item.year}</span>}
                    {item.type && (
                      <span style={{
                        padding: '2px 8px', borderRadius: '100px', fontSize: '9px', letterSpacing: '0.14em',
                        border: `1px solid ${item.type === 'movie' ? 'rgba(130,255,31,0.3)' : 'rgba(184,160,255,0.3)'}`,
                        color: item.type === 'movie' ? '#82ff1f' : '#b8a0ff',
                        fontFamily: 'var(--ff-mono)', textTransform: 'uppercase',
                      }}>
                        {item.type}
                      </span>
                    )}
                  </div>
                  {item.note && (
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ff-body)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      {item.note}
                    </p>
                  )}
                </div>
                {/* Delete — admin only */}
                {isAdmin && (
                  <button onClick={() => deleteItem(item.id, item.title)} style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '5px 7px', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', flexShrink: 0,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e02020'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(224,32,32,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
