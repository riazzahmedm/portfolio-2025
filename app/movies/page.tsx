'use client'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Plus, Film, Tv, X, Search, ChevronDown, Bookmark, Sparkles, LayoutGrid, CalendarDays, List, Radio } from 'lucide-react'
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
          fontSize:    '10px', fontFamily: 'var(--ff-mono)',
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

// ── Calendar Heatmap ──────────────────────────────────────────────────────────
const INTENSITY_COLORS = ['transparent', 'rgba(130,255,31,0.18)', 'rgba(130,255,31,0.38)', 'rgba(130,255,31,0.62)', 'rgba(130,255,31,0.88)']

function CalendarHeatmap({ logs }: { logs: MovieLog[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null)

  const dateMap = useMemo(() => {
    const m: Record<string, number> = {}
    logs.forEach(l => { m[l.watched_on] = (m[l.watched_on] ?? 0) + 1 })
    return m
  }, [logs])

  const maxCount = useMemo(() => Math.max(1, ...Object.values(dateMap)), [dateMap])

  // Build 53-week grid ending today
  const today   = new Date(); today.setHours(12, 0, 0, 0)
  const endDate = new Date(today)
  const startDate = new Date(today); startDate.setDate(startDate.getDate() - 52 * 7)
  // Align start to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const weeks: { date: Date; iso: string }[][] = []
  let current = new Date(startDate)
  while (current <= endDate) {
    const week: { date: Date; iso: string }[] = []
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(current), iso: current.toISOString().slice(0, 10) })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const totalThisYear = Object.entries(dateMap).filter(([k]) => k.startsWith(String(new Date().getFullYear()))).reduce((a, [, v]) => a + v, 0)

  function intensityFor(count: number) {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 2)  return 2
    if (count <= 4)  return 3
    return 4
  }

  return (
    <div>
      {/* Legend + count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
          {totalThisYear} watches in {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginRight: '4px' }}>Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', background: i === 0 ? 'rgba(255,255,255,0.06)' : c, border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginLeft: '4px' }}>More</span>
        </div>
      </div>

      {/* Grid wrapper — horizontal scroll on small screens */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '3px', minWidth: 'max-content' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '18px' }}>
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div key={i} style={{ height: '11px', fontSize: '9px', fontFamily: 'var(--ff-mono)', color: 'rgba(255,255,255,0.2)', lineHeight: '11px', width: '22px', textAlign: 'right', paddingRight: '4px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Month labels — only show for the week that contains the 1st of each month */}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', height: '14px' }}>
              {weeks.map((week, wi) => {
                const firstOfMonth = week.find(c => c.date.getDate() === 1)
                const label = firstOfMonth ? MONTH_LABELS[firstOfMonth.date.getMonth()] : ''
                return (
                  <div key={wi} style={{ width: '11px', fontSize: '9px', fontFamily: 'var(--ff-mono)', color: 'rgba(255,255,255,0.3)', lineHeight: '14px', overflow: 'visible', whiteSpace: 'nowrap' }}>
                    {label}
                  </div>
                )
              })}
            </div>
            {/* Day cells — render column by column */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.map(({ date, iso }) => {
                    const count = dateMap[iso] ?? 0
                    const isFuture = date > today
                    const intensity = isFuture ? 0 : intensityFor(count)
                    return (
                      <div
                        key={iso}
                        onMouseEnter={e => {
                          if (!isFuture) {
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                            setTooltip({ date: iso, count, x: rect.left + rect.width / 2, y: rect.top - 8 })
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: '11px', height: '11px', borderRadius: '2px',
                          background: intensity === 0 ? 'rgba(255,255,255,0.05)' : INTENSITY_COLORS[intensity],
                          border: `1px solid ${count > 0 ? 'rgba(130,255,31,0.15)' : 'rgba(255,255,255,0.05)'}`,
                          cursor: count > 0 ? 'pointer' : 'default',
                          transition: 'transform 0.1s',
                          opacity: isFuture ? 0.2 : 1,
                        }}
                        onMouseOver={e => { if (count > 0) (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.3)' }}
                        onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', zIndex: 999,
          left: tooltip.x, top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', padding: '6px 10px',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: '#fff', whiteSpace: 'nowrap' }}>
            {tooltip.count > 0
              ? <><span style={{ color: '#82ff1f' }}>{tooltip.count}</span> watch{tooltip.count !== 1 ? 'es' : ''}</>
              : <span style={{ color: 'rgba(255,255,255,0.4)' }}>No watches</span>
            }
          </div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
            {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      )}
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
  const [search,          setSearch]          = useState('')
  const [vibeFilter,      setVibeFilter]      = useState('')
  const [yearFilter,      setYearFilter]      = useState('')
  const [genreFilter,     setGenreFilter]     = useState('')
  const [logDisplayMode,  setLogDisplayMode]  = useState<'grid' | 'calendar'>('grid')

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

  // ── Unique series count (deduped by tmdb_id — one show = one count) ──
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
    .filter(l => !search         || l.title.toLowerCase().includes(search.toLowerCase()))
    .filter(l => !vibeFilter     || l.vibe === vibeFilter)
    .filter(l => !yearFilter     || l.year === Number(yearFilter))
    .filter(l => !genreFilter    || (l.genres ?? []).includes(genreFilter))
  const hasFilters = !!(search || vibeFilter || yearFilter || genreFilter)

  function clearFilters() {
    setSearch(''); setVibeFilter(''); setYearFilter(''); setGenreFilter('')
  }

  function handleDeleted(id: string) { setLogs(prev => prev.filter(l => l.id !== id)) }
  function handleEditSaved(updated?: MovieLog) {
    setEditingLog(null)
    if (updated) {
      // Patch just the one item in-place — no refetch, no scroll reset
      setLogs(prev => prev.map(l => l.id === updated.id ? updated : l))
    } else {
      fetchLogs()
    }
  }
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
        .wl-header-inner { padding: 14px 24px; }
        @media (max-width: 640px) {
          .wl-header-inner    { padding: 12px 16px; }
          .wl-hero            { padding: 20px 16px 0 !important; }
          .wl-main            { padding: 14px 16px 60px !important; }
          .wl-vibe-pill       { padding: 5px 10px !important; font-size: 11px !important; }
          .wl-filter-row      { flex-wrap: nowrap !important; gap: 6px !important; margin-bottom: 10px !important; }
          .wl-filter-row .wl-spacer { display: none !important; }
          .wl-toggle-label    { display: none !important; }
          .wl-search          { margin-bottom: 8px !important; }
          .wl-vibe-row        { margin-bottom: 8px !important; }
          .wl-tabs-row        { margin-bottom: 14px !important; }
        }
      `}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(18px)' }}>
        <div className="wl-header-inner" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

          {/* Left — back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em', flexShrink: 0 }}>
              <ArrowLeft size={13} />
            </Link>
          </div>

          {/* Right — actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link href="/movies/lists" title="Lists" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              textDecoration: 'none', transition: 'all 0.18s',
            }}>
              <List size={12} />
            </Link>
            <Link href="/movies/tracker" title="Series Tracker" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              textDecoration: 'none', transition: 'all 0.18s',
            }}>
              <Radio size={12} />
            </Link>
            <Link href="/movies/wrapped" title="Wrapped" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
              border: '1px solid rgba(130,255,31,0.2)',
              background: 'rgba(130,255,31,0.06)',
              color: 'rgba(130,255,31,0.7)',
              fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
              textDecoration: 'none', transition: 'all 0.18s',
            }}>
              <Sparkles size={12} />
            </Link>
            <button
              title={view === 'later' ? 'Back to log' : 'Watch Later'}
              onClick={() => { setView(v => v === 'later' ? 'log' : 'later'); clearFilters(); setFilter('all'); setLogDisplayMode('grid') }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '100px', cursor: 'pointer',
                border: `1px solid ${view === 'later' ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
                background: view === 'later' ? 'rgba(184,160,255,0.12)' : 'transparent',
                color: view === 'later' ? '#b8a0ff' : 'rgba(255,255,255,0.45)',
                fontSize: '12px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.1em',
                transition: 'all 0.18s',
              }}
            >
              <Bookmark size={13} />
              {watchlist.length > 0 && (
                <span style={{ fontSize: '10px', background: 'rgba(184,160,255,0.2)', borderRadius: '100px', padding: '1px 6px', lineHeight: 1.6 }}>
                  {watchlist.length}
                </span>
              )}
            </button>
            {isAdmin && (
              <Link href="/movies/admin" title="Log a film" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', border: '1px solid rgba(184,160,255,0.28)', background: 'rgba(184,160,255,0.08)', color: '#b8a0ff', textDecoration: 'none', fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'var(--ff-mono)' }}>
                <Plus size={13} />
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ── Hero heading ── */}
      <div className="wl-hero" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px',
        }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#b8a0ff' }}>Personal Archive</span>
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
          Watchlog
        </h1>

        {/* Tagline */}
        <p className="wl-tagline" style={{
          margin: '10px 0 0',
          fontFamily: 'var(--ff-mono)', fontSize: '10px',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.2)', display: 'inline-block', flexShrink: 0 }} />
          Films watched. Feelings logged.
        </p>
      </div>

      {/* ── Filters + Grid ── */}
      <main className="wl-main" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 60px' }}>

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
            <div className="wl-search" style={{ position: 'relative', marginBottom: '12px' }}>
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
            <div className="wl-vibe-row" style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '10px', paddingBottom: '2px' } as React.CSSProperties}>
              {VIBES.map(v => {
                const on = vibeFilter === v.key
                return (
                  <button key={v.key} type="button"
                    className="wl-vibe-pill"
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

            {/* Filter dropdowns + view toggle row */}
            <div className="wl-filter-row" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
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
              {/* Spacer */}
              <div className="wl-spacer" style={{ flex: 1 }} />
              {/* Grid / Calendar toggle */}
              <div style={{ display: 'flex', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                {([
                  { mode: 'grid'     as const, icon: <LayoutGrid  size={12} />, label: 'Grid'     },
                  { mode: 'calendar' as const, icon: <CalendarDays size={12} />, label: 'Calendar' },
                ] as const).map(({ mode, icon, label }) => {
                  const on = logDisplayMode === mode
                  return (
                    <button key={mode} type="button" onClick={() => setLogDisplayMode(mode)}
                      title={label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 13px', cursor: 'pointer',
                        background: on ? 'rgba(184,160,255,0.12)' : 'transparent',
                        border: 'none', borderRight: mode === 'grid' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        color: on ? '#b8a0ff' : 'rgba(255,255,255,0.35)',
                        fontSize: '11px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.08em',
                        transition: 'all 0.18s',
                      }}>
                      {icon}
                      <span className="wl-toggle-label">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Type tabs + entry count */}
            <div className="wl-tabs-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', marginTop: '4rem' }}>
              <FilterTabs active={filter} counts={counts} onChange={setFilter} />
              {/* {!loading && (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', flexShrink: 0 }}>
                  {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                </span>
              )} */}
            </div>

            {loading ? (
              <Skeleton />
            ) : logDisplayMode === 'calendar' ? (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border-card)',
                borderRadius: '16px', padding: '24px',
              }}>
                <CalendarHeatmap logs={filtered} />
              </div>
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
