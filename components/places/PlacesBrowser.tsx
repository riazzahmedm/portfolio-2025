'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Check, ExternalLink, Search, X, SlidersHorizontal, Bookmark } from 'lucide-react'
import ScrollNav from '@/components/ui/ScrollNav'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { navIcon, navBadge } from '@/components/ui/nav-icon'
import { PLACE_KINDS, PLACE_VIBES, TIMINGS, THEATRE_KIND, type TimelineEntry, type PlaceRank } from '@/lib/places-core'
import type { Place } from '@/lib/places'
import Timeline from './Timeline'
import PlaceForm from './PlaceForm'
import TheatreVisitForm from './TheatreVisitForm'
import EditSheet from './EditSheet'
import OnThisDay from './OnThisDay'
import { Thumb, kindLabel } from './shared'
import { chip } from './form-styles'
import NavBack from '@/components/ui/NavBack'
import PageHeader from '@/components/ui/PageHeader'

type Groups = { month: string; label: string; entries: TimelineEntry[] }[]
const KIND_CHIPS = [...PLACE_KINDS, { key: THEATRE_KIND, label: 'Theatre' }]

const smallChip = (on: boolean): React.CSSProperties => ({ ...chip(on), padding: '5px 12px', fontSize: '12px', flex: 'none' })

export default function PlacesBrowser() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab,     setTab]     = useState<'visited' | 'wishlist'>('visited')
  const [search,  setSearch]  = useState('')
  const [q,       setQ]       = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [vibe,    setVibe]    = useState('')
  const [city,    setCity]    = useState('')
  const [view,    setView]    = useState<'timeline' | 'places'>('timeline')
  const [cities,  setCities]  = useState<string[]>([])
  const [ranks,   setRanks]   = useState<PlaceRank[]>([])
  const [kind,    setKind]    = useState('')
  const [timing,  setTiming]  = useState('')
  const [groups,  setGroups]  = useState<Groups>([])
  const [next,    setNext]    = useState<string | null>(null)
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [failed,  setFailed]  = useState(false)
  const [wish,    setWish]    = useState<Place[]>([])
  const [editing, setEditing] = useState<TimelineEntry | null>(null)
  const [deleting, setDeleting] = useState<TimelineEntry | null>(null)

  useEffect(() => { fetch('/api/auth/admin').then(r => r.json()).then(d => setIsAdmin(!!d.authed)).catch(() => {}) }, [])
  const loadWish = useCallback(() => { fetch('/api/places/wishlist').then(r => (r.ok ? r.json() : [])).then(d => setWish(Array.isArray(d) ? d : [])).catch(() => {}) }, [])
  useEffect(loadWish, [loadWish])

  // The first page for the current filters ("size" lets an edit or delete reload as many rows as were showing);
  // "Load more" appends the next page. Callers set `loading` first, so this never sets state before its first await.
  const load = useCallback(async (cursor: string | null, size?: number) => {
    const qs = new URLSearchParams()
    if (kind) qs.set('kind', kind)
    if (timing) qs.set('timing', timing)
    if (vibe) qs.set('vibe', vibe)
    if (city) qs.set('city', city)
    if (q) qs.set('q', q)
    try {
      if (view === 'places') {
        const res = await fetch(`/api/places/ranking?${qs}`)
        if (!res.ok) throw new Error()
        const d = await res.json() as { places: PlaceRank[]; total: number; cities: string[] }
        setFailed(false); setRanks(d.places); setTotal(d.total); setCities(d.cities); setNext(null)
        return
      }
      if (cursor) qs.set('cursor', cursor)
      if (size) qs.set('limit', String(size))
      const res = await fetch(`/api/places/timeline?${qs}`)
      if (!res.ok) throw new Error()
      const d = await res.json() as { groups: Groups; next: string | null; total: number; cities: string[] }
      setFailed(false); setNext(d.next); setTotal(d.total); setCities(d.cities)
      setGroups(prev => {
        if (!cursor) return d.groups
        // a month can continue across pages: merge into the last group instead of repeating its heading, and
        // never show a row twice (a page restarts from the top if its cursor row was deleted in between)
        const seen = new Set(prev.flatMap(g => g.entries.map(e => `${e.source}:${e.id}`)))
        const merged = [...prev]
        for (const g of d.groups) {
          const fresh = g.entries.filter(e => !seen.has(`${e.source}:${e.id}`))
          if (fresh.length === 0) continue
          const last = merged[merged.length - 1]
          if (last && last.month === g.month) merged[merged.length - 1] = { ...last, entries: [...last.entries, ...fresh] }
          else merged.push({ ...g, entries: fresh })
        }
        return merged
      })
    } catch { setFailed(true) } finally { setLoading(false) }
  }, [kind, timing, vibe, city, q, view])
  useEffect(() => { load(null) }, [load])   // eslint-disable-line react-hooks/set-state-in-effect -- loads data from the API; state is only set after the fetch

  // After an edit or delete, reload everything that was on screen (up to the API's page cap) so "Load more" pages are not lost
  const reload = () => { setLoading(true); load(null, Math.min(100, Math.max(40, groups.reduce((n, g) => n + g.entries.length, 0)))) }
  const changeFilter = (apply: () => void) => { apply(); setLoading(true) }
  // Search as you type, a moment after you stop
  useEffect(() => {
    const t = setTimeout(() => { const next = search.trim(); if (next !== q) { setLoading(true); setQ(next) } }, 250)
    return () => clearTimeout(t)
  }, [search, q])
  const needle = search.trim().toLowerCase()
  const shownWish = wish.filter(p => (!kind || p.kind === kind) && (!needle || [p.name, p.area, p.city, kindLabel(p.kind)].filter(Boolean).join(' ').toLowerCase().includes(needle)))
  const activeFilterCount = (kind ? 1 : 0) + (tab === 'visited' ? (timing ? 1 : 0) + (vibe ? 1 : 0) + (city ? 1 : 0) : 0)

  async function confirmDelete() {
    const e = deleting; setDeleting(null)
    if (!e) return
    const res = await fetch(`/api/places/visits/${e.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Visit deleted', { description: e.place.name }); reload() } else toast.error('Could not delete — try again')
  }

  const filtered = Boolean(kind || timing || vibe || city || q)
  const empty = !loading && !failed && (view === 'places' ? ranks.length === 0 : groups.length === 0)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <ScrollNav>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <NavBack />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <button type="button" title={tab === 'wishlist' ? 'Back to visits' : 'Wishlist'} aria-label={tab === 'wishlist' ? 'Back to visits' : 'Wishlist'} aria-pressed={tab === 'wishlist'}
              onClick={() => setTab(t => t === 'wishlist' ? 'visited' : 'wishlist')}
              style={{ ...navIcon, color: tab === 'wishlist' ? '#b8a0ff' : 'var(--text-primary)' }}>
              <Bookmark size={22} fill={tab === 'wishlist' ? 'currentColor' : 'none'} />
              {wish.length > 0 && <span style={navBadge}>{wish.length > 99 ? '99+' : wish.length}</span>}
            </button>
            {isAdmin && <Link href="/admin?tab=places" title="Log a place" aria-label="Log a place" style={{ ...navIcon, color: '#b8a0ff' }}><Plus size={22} /></Link>}
          </div>
        </div>
      </ScrollNav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '8px 20px 80px' }}>
        <PageHeader title="Been there" tagline="Cafes, food and outings, in the order they happened." />
        <div style={{ height: '18px' }} />

        {/* Search + filter button, as on the Watchlog */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', marginBottom: filtersOpen ? '12px' : '20px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === 'wishlist' ? 'Search the wishlist…' : 'Search places, dishes, films…'} aria-label="Search" style={{
              width: '100%', padding: '10px 38px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${search ? 'rgba(184,160,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px', color: '#fff', fontSize: '14px', fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }} />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', display: 'flex' }}><X size={13} /></button>
            )}
          </div>
          <button type="button" aria-label="Filters" aria-expanded={filtersOpen} aria-controls="places-filter-panel" title="Filters" onClick={() => setFiltersOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 16px', borderRadius: '12px', cursor: 'pointer', flexShrink: 0,
            border: `1px solid ${filtersOpen || activeFilterCount ? 'rgba(184,160,255,0.45)' : 'rgba(255,255,255,0.1)'}`,
            background: filtersOpen || activeFilterCount ? 'rgba(184,160,255,0.12)' : 'rgba(255,255,255,0.04)',
            color: filtersOpen || activeFilterCount ? '#b8a0ff' : 'rgba(255,255,255,0.5)', transition: 'all 0.18s',
          }}>
            <SlidersHorizontal size={15} />
            {activeFilterCount > 0 && <span style={{ fontSize: '10px', fontFamily: 'var(--ff-mono)', background: 'rgba(184,160,255,0.25)', borderRadius: '100px', padding: '1px 7px', lineHeight: 1.6 }}>{activeFilterCount}</span>}
          </button>
        </div>

        {filtersOpen && (
          <div id="places-filter-panel" className="pl-filter-panel" style={{ marginBottom: '20px', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.025)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <style>{`.pl-filter-panel { animation: pl-panel-in 0.2s ease-out; } @keyframes pl-panel-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } } @media (prefers-reduced-motion: reduce) { .pl-filter-panel { animation: none; } } @media (max-width: 640px) { .pl-filter-panel { padding: 14px !important; } }`}</style>
            <FilterGroup label="Kind">
              {KIND_CHIPS.map(k => <button key={k.key} type="button" aria-pressed={kind === k.key} style={smallChip(kind === k.key)} onClick={() => changeFilter(() => setKind(kind === k.key ? '' : k.key))}>{k.label}</button>)}
            </FilterGroup>
            {tab === 'visited' && (
              <>
                <FilterGroup label="When">
                  {TIMINGS.map(t => <button key={t.key} type="button" aria-pressed={timing === t.key} style={smallChip(timing === t.key)} onClick={() => changeFilter(() => setTiming(timing === t.key ? '' : t.key))}>{t.label}</button>)}
                </FilterGroup>
                <FilterGroup label="How was it">
                  {PLACE_VIBES.map(v => <button key={v.key} type="button" aria-pressed={vibe === v.key} style={smallChip(vibe === v.key)} onClick={() => changeFilter(() => setVibe(vibe === v.key ? '' : v.key))}><span aria-hidden>{v.emoji}</span> {v.label}</button>)}
                </FilterGroup>
                {cities.length > 1 && (
                  <FilterGroup label="City">
                    {cities.map(c => <button key={c} type="button" aria-pressed={city === c} style={smallChip(city === c)} onClick={() => changeFilter(() => setCity(city === c ? '' : c))}>{c}</button>)}
                  </FilterGroup>
                )}
                <FilterGroup label="View">
                  <div style={{ display: 'flex', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', alignSelf: 'flex-start' }}>
                    {([{ key: 'timeline' as const, label: 'Timeline' }, { key: 'places' as const, label: 'By place' }]).map(v => (
                      <button key={v.key} type="button" aria-pressed={view === v.key} onClick={() => changeFilter(() => setView(v.key))}
                        style={{ padding: '8px 16px', cursor: 'pointer', border: 'none', background: view === v.key ? 'rgba(184,160,255,0.12)' : 'transparent', color: view === v.key ? '#b8a0ff' : 'rgba(255,255,255,0.45)', fontSize: '12px', fontFamily: 'var(--ff-body)', transition: 'all 0.18s' }}>{v.label}</button>
                    ))}
                  </div>
                </FilterGroup>
              </>
            )}
          </div>
        )}

        {tab === 'visited' ? (
          <>
            {!filtered && view === 'timeline' && <OnThisDay />}
            {!loading && !failed && total > 0 && <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{view === 'places' ? `${total} ${total === 1 ? 'place' : 'places'}` : `${total} ${total === 1 ? 'visit' : 'visits'}`}{filtered ? ' found' : ''}</div>}
            {view === 'places'
              ? <PlaceRanking ranks={ranks} />
              : <Timeline groups={groups} isAdmin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />}

            {loading && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Loading…</p>}
            {failed && <p style={{ textAlign: 'center', color: '#ff8585', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Could not load. <button type="button" onClick={() => { setLoading(true); load(next) }} style={{ ...smallChip(false), marginLeft: '8px' }}>Retry</button></p>}
            {empty && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', fontSize: '14px', padding: '36px 0' }}>{kind === THEATRE_KIND && timing ? 'Only theatre visits with a time of day match a timing filter.' : filtered ? 'Nothing matches that search.' : 'Nothing logged yet.'}</p>}
            {next && !loading && <div style={{ textAlign: 'center', paddingTop: '18px' }}><button type="button" style={chip(false)} onClick={() => { setLoading(true); load(next) }}>Load more</button></div>}
          </>
        ) : (
          <ul style={{ margin: 0, padding: 0 }}>
            {shownWish.length > 0 && <li style={{ listStyle: 'none', fontFamily: 'var(--ff-mono)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{shownWish.length} {shownWish.length === 1 ? 'place' : 'places'} saved</li>}
            {shownWish.length === 0 && <li style={{ listStyle: 'none', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', fontSize: '14px', padding: '36px 0' }}>{wish.length === 0 ? 'Nothing on the wishlist yet.' : 'Nothing on the wishlist matches.'}</li>}
            {shownWish.map(p => (
              <li key={p.id} style={{ listStyle: 'none', display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-card)' }}>
                <Link href={`/places/${p.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, flex: 1, textDecoration: 'none', color: 'inherit' }}>
                  <Thumb name={p.name} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'var(--ff-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px' }}>{[kindLabel(p.kind), p.area, p.city].filter(Boolean).join(' · ')}</div>
                  </div>
                </Link>
                {p.maps_url && <a href={p.maps_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.name} in Maps`} style={{ ...navIcon, color: 'var(--text-dim)' }}><ExternalLink size={16} /></a>}
                {isAdmin && <Link href={`/admin?tab=places&place=${p.id}`} style={{ ...smallChip(true), textDecoration: 'none' }}><Check size={13} /> Visited</Link>}
              </li>
            ))}
          </ul>
        )}
      </main>

      {editing && (
        <EditSheet label={editing.source === 'theatre' ? 'Edit theatre details' : 'Edit visit'} onClose={() => setEditing(null)}>
          {editing.source === 'theatre'
            ? <TheatreVisitForm entry={editing} onSaved={() => { setEditing(null); reload() }} />
            : <PlaceForm initial={{ entry: editing }} onSaved={() => { setEditing(null); reload() }} />}
        </EditSheet>
      )}
      {deleting && <ConfirmModal title="Delete visit?" description={`Your visit to "${deleting.place.name}" will be removed.`} confirmLabel="Delete" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  )
}

/** A labelled group of chips inside the filter panel (same look as the Watchlog's). */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
      <div style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--ff-mono)' }}>{label}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

/** One row per place, most visited first. */
function PlaceRanking({ ranks }: { ranks: PlaceRank[] }) {
  return (
    <ul style={{ margin: 0, padding: 0 }}>
      {ranks.map((r, i) => {
        const vibe = PLACE_VIBES.find(v => v.key === r.usualVibe)
        return (
          <li key={r.place.id} style={{ listStyle: 'none', borderBottom: '1px solid var(--border-card)' }}>
            <Link href={`/places/${r.place.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', textDecoration: 'none', color: 'inherit' }}>
              <span aria-hidden style={{ width: '22px', flex: 'none', textAlign: 'right', fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{i + 1}</span>
              <Thumb src={r.photo} name={r.place.name} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: 'var(--ff-body)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.place.name}</div>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px', overflowWrap: 'anywhere' }}>{[kindLabel(r.place.kind), r.place.area].filter(Boolean).join(' · ')}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontFamily: 'var(--ff-mono)', fontSize: '10.5px', marginTop: '3px' }}>
                  <span style={{ color: '#cdbcff' }}>{r.visits} {r.visits === 1 ? 'visit' : 'visits'}</span>
                  {r.avgSpend !== null && <span style={{ color: 'var(--text-primary)' }}>₹{r.avgSpend} avg</span>}
                  {vibe && <span style={{ color: vibe.color }}>{vibe.emoji} {vibe.label}</span>}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
