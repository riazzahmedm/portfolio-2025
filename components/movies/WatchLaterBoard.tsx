'use client'
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { WatchlistItem, WatchProvidersLite } from '@/lib/movies.types'
import WatchlistCard from '@/components/movies/WatchlistCard'

type TypeFilter = 'all' | 'movie' | 'series'
type SortKey    = 'added' | 'rating' | 'year-new' | 'year-old' | 'title'
type Availability = 'streaming' | 'rentbuy' | 'none'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'added',    label: 'Recently added' },
  { key: 'rating',   label: 'Highest rated' },
  { key: 'year-new', label: 'Newest release' },
  { key: 'year-old', label: 'Oldest release' },
  { key: 'title',    label: 'Title A–Z' },
]

const SECTIONS: { key: Availability; label: string }[] = [
  { key: 'streaming', label: 'Streaming now' },
  { key: 'rentbuy',   label: 'Rent or buy' },
  { key: 'none',      label: 'Not available' },
]

const providerKey = (i: WatchlistItem) => `${i.type === 'series' ? 'tv' : 'movie'}:${i.tmdb_id}`

function sorter(sort: SortKey) {
  const nums = (a: number | null, b: number | null, dir: 1 | -1) =>
    a == null && b == null ? 0 : a == null ? 1 : b == null ? -1 : (a - b) * dir
  return (a: WatchlistItem, b: WatchlistItem) => {
    switch (sort) {
      case 'rating':   return nums(a.tmdb_rating, b.tmdb_rating, -1)
      case 'year-new': return nums(a.year, b.year, -1)
      case 'year-old': return nums(a.year, b.year, 1)
      case 'title':    return a.title.localeCompare(b.title)
      default:         return 0   // keep the order the API returned (newest added first)
    }
  }
}

const chip = (on: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '7px', flex: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
  padding: '7px 14px', borderRadius: '100px',
  border: `1px solid ${on ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
  background: on ? 'rgba(184,160,255,0.12)' : 'rgba(255,255,255,0.03)',
  color: on ? '#cdbcff' : 'rgba(255,255,255,0.55)',
  fontSize: '12px', fontFamily: 'var(--ff-body)', transition: 'all 0.18s',
})

const selectStyle: React.CSSProperties = {
  padding: '7px 30px 7px 14px', borderRadius: '100px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)',
  fontSize: '12px', fontFamily: 'var(--ff-body)',
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M1 1l4 4 4-4' fill='none' stroke='%23ffffff99' stroke-width='1.5'/></svg>\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
}

/** The Watch Later list: filter by type, platform and genre, sort it, and group it by where it can be watched. */
export default function WatchLaterBoard({
  items, providers, isAdmin, onRemoved, onLog,
}: {
  items:     WatchlistItem[]
  providers: Record<string, WatchProvidersLite | null>
  isAdmin:   boolean
  onRemoved: (id: string) => void
  onLog:     (item: WatchlistItem) => void
}) {
  const [type,     setType]     = useState<TypeFilter>('all')
  const [platform, setPlatform] = useState('')
  const [genre,    setGenre]    = useState('')
  const [sort,     setSort]     = useState<SortKey>('added')
  const [group,    setGroup]    = useState(true)

  // Availability is only known once the providers lookup has answered
  const providersLoaded = Object.keys(providers).length > 0

  const infoFor = (i: WatchlistItem) => (i.tmdb_id ? providers[providerKey(i)] : undefined)
  const availability = (i: WatchlistItem): Availability => {
    const info = infoFor(i)
    if (info?.streaming.length) return 'streaming'
    if (info?.rentBuy) return 'rentbuy'
    return 'none'
  }

  const genres = useMemo(() => [...new Set(items.flatMap(i => i.genres))].filter(Boolean).sort(), [items])

  // Platform chips count within the current type + genre, so the numbers match what you would see
  const byTypeGenre = useMemo(
    () => items.filter(i => (type === 'all' || i.type === type) && (!genre || i.genres.includes(genre))),
    [items, type, genre],
  )
  const platforms = useMemo(() => {
    const counts = new Map<string, { n: number; logo: string | null }>()
    for (const i of byTypeGenre) {
      for (const s of (i.tmdb_id ? providers[providerKey(i)]?.streaming : undefined) ?? []) {
        const c = counts.get(s.name) ?? { n: 0, logo: s.logo }
        c.n += 1
        counts.set(s.name, c)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6)
  }, [byTypeGenre, providers])

  const visible = useMemo(() => {
    const filtered = byTypeGenre.filter(i => !platform || (i.tmdb_id ? providers[providerKey(i)]?.streaming : undefined)?.some(s => s.name === platform))
    return [...filtered].sort(sorter(sort))
  }, [byTypeGenre, platform, providers, sort])

  const typeCount = (t: TypeFilter) => items.filter(i => t === 'all' || i.type === t).length
  const filtersActive = type !== 'all' || !!platform || !!genre

  function clearAll() { setType('all'); setPlatform(''); setGenre('') }

  const card = (item: WatchlistItem) => (
    <WatchlistCard
      key={item.id}
      item={item}
      isAdmin={isAdmin}
      onRemoved={onRemoved}
      onLog={onLog}
      providers={infoFor(item)}
    />
  )

  const grouped = group && providersLoaded

  return (
    <div>
      <style>{`
        .wlb-chip:hover { border-color: rgba(184,160,255,0.35) !important; color: #fff !important; }
        .wlb-chip:focus-visible, .wlb-select:focus-visible { outline: 2px solid #b8a0ff; outline-offset: 2px; }
        .wlb-row { display: flex; gap: 8px; align-items: center; }
        .wlb-scroll { overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .wlb-scroll::-webkit-scrollbar { display: none; }
        .wlb-head { display: flex; align-items: baseline; gap: 10px; margin: 28px 0 14px; }
        .wlb-head h3 { margin: 0; font: 600 15px var(--ff-body); color: #fff; }
        .wlb-head span { font: 11px var(--ff-mono); color: rgba(255,255,255,0.45); }
        .wlb-head i { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
      `}</style>

      {/* Row 1: type, genre, sort */}
      <div className="wlb-row" style={{ flexWrap: 'wrap', marginBottom: '12px' }}>
        {(['all', 'movie', 'series'] as const).map(t => (
          <button key={t} type="button" className="wlb-chip" style={chip(type === t)} onClick={() => setType(t)} aria-pressed={type === t}>
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'Series'}
            <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', opacity: 0.6 }}>{typeCount(t)}</span>
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {genres.length > 0 && (
          <select className="wlb-select" aria-label="Genre" value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
            <option value="">All genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
        <select className="wlb-select" aria-label="Sort by" value={sort} onChange={e => setSort(e.target.value as SortKey)} style={selectStyle}>
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Row 2: platforms (once availability is known) */}
      {platforms.length > 0 && (
        <div className="wlb-row wlb-scroll wl-scroll-fade" style={{ marginBottom: '12px' }}>
          <button type="button" className="wlb-chip" style={chip(!platform)} onClick={() => setPlatform('')} aria-pressed={!platform}>Any service</button>
          {platforms.map(([name, info]) => (
            <button key={name} type="button" className="wlb-chip" style={chip(platform === name)} onClick={() => setPlatform(platform === name ? '' : name)} aria-pressed={platform === name}>
              {info.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={info.logo} alt="" onError={e => { e.currentTarget.style.display = 'none' }} style={{ width: '16px', height: '16px', borderRadius: '5px', objectFit: 'cover' }} />
              )}
              {name}
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', opacity: 0.6 }}>{info.n}</span>
            </button>
          ))}
        </div>
      )}

      {/* Row 3: summary, grouping, clear */}
      <div className="wlb-row" style={{ flexWrap: 'wrap', marginBottom: '4px' }}>
        <span style={{ font: '11px var(--ff-mono)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}>
          {filtersActive ? `${visible.length} of ${items.length}` : `${items.length} saved`}
        </span>
        {filtersActive && (
          <button type="button" className="wlb-chip" onClick={clearAll}
            style={{ ...chip(false), padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(224,80,80,0.3)', color: '#e06060' }}>
            <X size={11} /> Clear filters
          </button>
        )}
        <span style={{ flex: 1 }} />
        {providersLoaded && (
          <button type="button" className="wlb-chip" style={{ ...chip(group), padding: '4px 12px', fontSize: '11px' }} onClick={() => setGroup(g => !g)} aria-pressed={group}>
            Group by availability
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '13px' }}>
          Nothing matches these filters.
        </div>
      ) : grouped ? (
        SECTIONS.map(sec => {
          const list = visible.filter(i => availability(i) === sec.key)
          if (list.length === 0) return null
          return (
            <section key={sec.key} aria-label={sec.label}>
              <div className="wlb-head"><h3>{sec.label}</h3><span>{list.length}</span><i /></div>
              <div className="wl-grid">{list.map(card)}</div>
            </section>
          )
        })
      ) : (
        <div className="wl-grid" style={{ marginTop: '16px' }}>{visible.map(card)}</div>
      )}
    </div>
  )
}
