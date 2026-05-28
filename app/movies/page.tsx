'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Plus, Film, Tv, X, Search, ChevronDown, Bookmark, Sparkles } from 'lucide-react'
import type { MovieLog, WatchlistItem } from '@/lib/movies.types'
import { VIBES } from '@/lib/movies.types'
import LogCard from '@/components/movies/LogCard'
import WatchlistCard from '@/components/movies/WatchlistCard'
import FilterTabs, { type LogFilter } from '@/components/movies/FilterTabs'
import AdminForm from '@/components/movies/AdminForm'

// ── Stat tile ────────────────────────────────────────────────────────────────
function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      padding: '14px 12px',
      background: 'var(--surface)', border: '1px solid var(--border-card)',
      borderRadius: '14px',
    }}>
      <div style={{ color: '#b8a0ff' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--ff-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>
        {label}
      </div>
    </div>
  )
}

// ── Custom dropdown for Year / Genre ─────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }: {
  label:    string
  value:    string
  options:  { key: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const active = !!value

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '100px', cursor: 'pointer',
          border:      `1px solid ${active ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
          background:  active ? 'rgba(184,160,255,0.1)' : 'rgba(255,255,255,0.04)',
          color:       active ? '#b8a0ff' : 'rgba(255,255,255,0.45)',
          fontSize:    '12px', fontFamily: 'var(--ff-mono)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          whiteSpace:  'nowrap', transition: 'all 0.18s',
        }}
      >
        {active ? options.find(o => o.key === value)?.label ?? label : label}
        {active
          ? <X size={11} onClick={e => { e.stopPropagation(); onChange(''); setOpen(false) }} style={{ cursor: 'pointer' }} />
          : <ChevronDown size={11} />
        }
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          minWidth: '160px', maxHeight: '260px', overflowY: 'auto',
        }}>
          {options.map(o => {
            const on = value === o.key
            return (
              <button key={o.key} type="button"
                onClick={() => { onChange(on ? '' : o.key); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', background: on ? 'rgba(184,160,255,0.1)' : 'none',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer', textAlign: 'left',
                  color: on ? '#b8a0ff' : 'rgba(255,255,255,0.7)',
                  fontSize: '13px', fontFamily: 'var(--ff-body)',
                }}
                onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
              >
                {o.label}
                {on && <span style={{ fontSize: '10px', color: '#b8a0ff' }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.6s ease infinite' }} />
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '13px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', width: '80%' }} />
            <div style={{ height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MoviesPage() {
  const [logs,          setLogs]          = useState<MovieLog[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState<LogFilter>('all')
  const [isAdmin,       setIsAdmin]       = useState(false)
  const [editingLog,    setEditingLog]    = useState<MovieLog | null>(null)
  const [view,          setView]          = useState<'log' | 'later'>('log')
  const [watchlist,     setWatchlist]     = useState<WatchlistItem[]>([])
  const [watchlistLoad, setWatchlistLoad] = useState(false)
  const [loggingItem,   setLoggingItem]   = useState<WatchlistItem | null>(null)

  // ── Filter state ──
  const [search,      setSearch]      = useState('')
  const [vibeFilter,  setVibeFilter]  = useState('')
  const [yearFilter,  setYearFilter]  = useState('')
  const [genreFilter, setGenreFilter] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      const res  = await fetch('/api/movies')
      const data = await res.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load logs — check your connection')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchWatchlist = useCallback(async () => {
    setWatchlistLoad(true)
    try {
      const res  = await fetch('/api/watchlist')
      const data = await res.json()
      setWatchlist(Array.isArray(data) ? data : [])
    } catch {
      // watchlist is non-critical — fail silently
    } finally {
      setWatchlistLoad(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    fetchWatchlist()
    fetch('/api/auth/movies').then(r => r.json()).then(d => setIsAdmin(d.authed))
  }, [fetchLogs, fetchWatchlist])

  // ── Counts for FilterTabs ──
  const counts: Record<LogFilter, number> = {
    all:    logs.length,
    movie:  logs.filter(l => l.type === 'movie').length,
    series: logs.filter(l => l.type === 'series').length,
  }

  // ── Unique series count for stat tile ──
  const uniqueSeriesCount = new Set(
    logs.filter(l => l.type === 'series').map(l => l.tmdb_id ?? l.title)
  ).size

  // ── Derive filter options from loaded logs ──
  const availableYears = Array.from(
    new Set(logs.map(l => l.year).filter((y): y is number => y != null))
  ).sort((a, b) => b - a).map(y => ({ key: String(y), label: String(y) }))

  const availableGenres = Array.from(
    new Set(logs.flatMap(l => l.genres ?? []))
  ).filter(Boolean).sort().map(g => ({ key: g, label: g }))

  // ── Apply all filters ──
  const filtered = logs
    .filter(l => filter === 'all' || l.type === filter)
    .filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()))
    .filter(l => !vibeFilter  || l.vibe === vibeFilter)
    .filter(l => !yearFilter  || l.year === Number(yearFilter))
    .filter(l => !genreFilter || (l.genres ?? []).includes(genreFilter))

  const hasFilters = !!(search || vibeFilter || yearFilter || genreFilter)

  function clearFilters() {
    setSearch(''); setVibeFilter(''); setYearFilter(''); setGenreFilter('')
  }

  function handleDeleted(id: string) { setLogs(prev => prev.filter(l => l.id !== id)) }
  function handleEditSaved() { setEditingLog(null); fetchLogs() }
  function handleWatchlistRemoved(id: string) { setWatchlist(prev => prev.filter(w => w.id !== id)) }
  function handleLoggedFromWatchlist() {
    setLoggingItem(null)
    fetchLogs()
    fetchWatchlist()
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--ff-body)' }}>

      {/* ── Log-from-watchlist drawer ── */}
      {loggingItem && loggingItem.tmdb_id !== null && (
        <>
          <div onClick={() => setLoggingItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: 'min(520px, 100vw)', background: 'var(--bg)', borderLeft: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>Log it</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>{loggingItem.title}</div>
              </div>
              <button onClick={() => setLoggingItem(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '28px 24px 60px' }}>
              <AdminForm
                preSelectedTmdb={{
                  id:         loggingItem.tmdb_id,
                  title:      loggingItem.title,
                  poster_url: loggingItem.poster_url,
                  type:       loggingItem.type,
                }}
                onSuccess={handleLoggedFromWatchlist}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Edit drawer ── */}
      {editingLog && (
        <>
          <div onClick={() => setEditingLog(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: 'min(520px, 100vw)', background: 'var(--bg)', borderLeft: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--ff-body)' }}>Edit entry</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', marginTop: '2px' }}>{editingLog.title}</div>
              </div>
              <button onClick={() => setEditingLog(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '28px 24px 60px' }}>
              <AdminForm initialLog={editingLog} onSuccess={handleEditSaved} />
            </div>
          </div>
        </>
      )}

      {/* ── Header ── */}
      <style>{`
        .wl-header-inner   { padding: 14px 24px; }
        .wl-back-label     { display: inline; }
        .wl-divider        { display: block; }
        .wl-title          { display: inline; }
        .wl-later-label    { display: inline; }
        .wl-log-label      { display: inline; }
        @media (max-width: 480px) {
          .wl-header-inner { padding: 12px 16px; }
          .wl-back-label   { display: none; }
          .wl-divider      { display: none; }
          .wl-title        { display: none; }
          .wl-later-label  { display: none; }
          .wl-log-label    { display: none; }
        }
      `}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)' }}>
        <div className="wl-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

          {/* Left — back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', flexShrink: 0 }}>
              <ArrowLeft size={13} />
              <span className="wl-back-label">Portfolio</span>
            </Link>
            <div className="wl-divider" style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />
            <span className="wl-title" style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap' }}>Watched</span>
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link href="/movies/wrapped" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
              border: '1px solid rgba(130,255,31,0.2)',
              background: 'rgba(130,255,31,0.06)',
              color: 'rgba(130,255,31,0.7)',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              textDecoration: 'none', transition: 'all 0.18s', whiteSpace: 'nowrap',
            }}>
              <Sparkles size={12} />
              <span className="wl-log-label">Wrapped</span>
            </Link>
            <button
              onClick={() => { setView(v => v === 'later' ? 'log' : 'later'); clearFilters(); setFilter('all') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
                border: `1px solid ${view === 'later' ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
                background: view === 'later' ? 'rgba(184,160,255,0.12)' : 'transparent',
                color: view === 'later' ? '#b8a0ff' : 'rgba(255,255,255,0.45)',
                fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
                transition: 'all 0.18s', whiteSpace: 'nowrap',
              }}
            >
              <Bookmark size={13} />
              <span className="wl-later-label">Later</span>
              {watchlist.length > 0 && (
                <span style={{ fontSize: '10px', background: 'rgba(184,160,255,0.2)', borderRadius: '100px', padding: '1px 6px', lineHeight: 1.6 }}>
                  {watchlist.length}
                </span>
              )}
            </button>
            {isAdmin && (
              <Link href="/movies/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', border: '1px solid rgba(184,160,255,0.28)', background: 'rgba(184,160,255,0.08)', color: '#b8a0ff', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'var(--ff-mono)', whiteSpace: 'nowrap' }}>
                <Plus size={13} />
                <span className="wl-log-label">Log</span>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ── Hero heading ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
        }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b8a0ff' }}>Personal Archive</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(184,160,255,0.35), transparent)' }} />
        </div>

        {/* Main title */}
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--ff-display)',
          fontWeight: 400,
          fontSize: 'clamp(3rem, 10vw, 6rem)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          background: 'linear-gradient(135deg, #ffffff 0%, rgba(184,160,255,0.85) 60%, rgba(130,255,31,0.6) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } as React.CSSProperties}>
          Watch<br />log
        </h1>

        {/* Tagline */}
        <p style={{
          margin: '16px 0 0',
          fontFamily: 'var(--ff-mono)', fontSize: '12px',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
          Films watched. Feelings logged.
        </p>
      </div>

      {/* ── Stats ── */}
      {!loading && logs.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Stat icon={<Film size={16} />} value={counts.movie}      label="Movies" />
            <Stat icon={<Tv size={16} />}   value={uniqueSeriesCount} label="Series" />
          </div>
        </div>
      )}

      {/* ── Filters + Grid ── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px' }}>

        {view === 'later' ? (
          /* ── Watch Later view ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
              </div>
            </div>

            {watchlistLoad ? (
              <Skeleton />
            ) : watchlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px' }}>
                Nothing saved yet. Hit the bookmark icon on any title from Log Entry search.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {watchlist.map(item => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    onRemoved={handleWatchlistRemoved}
                    onLog={setLoggingItem}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Watchlog view ── */
          <>
            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search titles…"
                style={{
                  width: '100%', padding: '10px 38px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${search ? 'rgba(184,160,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px', color: '#fff',
                  fontSize: '14px', fontFamily: 'var(--ff-body)',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Vibe filter pills — horizontal scroll row */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '10px', paddingBottom: '2px' } as React.CSSProperties}>
              {VIBES.map(v => {
                const on = vibeFilter === v.key
                return (
                  <button key={v.key} type="button"
                    onClick={() => setVibeFilter(on ? '' : v.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 13px', borderRadius: '100px', cursor: 'pointer',
                      border:      `1px solid ${on ? v.color + '66' : 'rgba(255,255,255,0.08)'}`,
                      background:  on ? v.color + '18' : 'transparent',
                      color:       on ? v.color : 'rgba(255,255,255,0.4)',
                      fontSize:    '12px', fontFamily: 'var(--ff-body)',
                      flexShrink:  0, whiteSpace: 'nowrap', transition: 'all 0.18s',
                    }}>
                    <span style={{ fontSize: '13px' }}>{v.emoji}</span>
                    {v.label}
                  </button>
                )
              })}
            </div>

            {/* Year / Genre dropdowns — separate row, NO overflow:hidden so popups aren't clipped */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <FilterDropdown label="Year"  value={yearFilter}  options={availableYears}  onChange={setYearFilter}  />
              <FilterDropdown label="Genre" value={genreFilter} options={availableGenres} onChange={setGenreFilter} />
              {hasFilters && (
                <button type="button" onClick={clearFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 13px', borderRadius: '100px', cursor: 'pointer',
                    border: '1px solid rgba(224,80,80,0.3)',
                    background: 'rgba(224,80,80,0.08)',
                    color: '#e06060', fontSize: '12px', fontFamily: 'var(--ff-mono)',
                    letterSpacing: '0.1em', whiteSpace: 'nowrap',
                  }}>
                  <X size={11} /> Clear
                </button>
              )}
            </div>

            {/* Type tabs + entry count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
              <FilterTabs active={filter} counts={counts} onChange={setFilter} />
              {!loading && (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', flexShrink: 0 }}>
                  {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            {loading ? (
              <Skeleton />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '14px' }}>
                {hasFilters ? 'No results. Try different filters.' : 'Nothing logged yet.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                {filtered.map(log => (
                  <LogCard key={log.id} log={log} isAdmin={isAdmin} onDeleted={handleDeleted} onEdit={isAdmin ? setEditingLog : undefined} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
