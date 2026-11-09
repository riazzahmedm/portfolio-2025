'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, X, Check, ExternalLink } from 'lucide-react'
import ScrollNav from '@/components/ui/ScrollNav'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { navIcon } from '@/components/ui/nav-icon'
import { PLACE_KINDS, TIMINGS, THEATRE_KIND, type TimelineEntry } from '@/lib/places-core'
import type { Place } from '@/lib/places'
import Timeline from './Timeline'
import PlaceForm from './PlaceForm'
import TheatreVisitForm from './TheatreVisitForm'
import { Thumb, kindLabel } from './shared'
import { chip } from './form-styles'

type Groups = { month: string; label: string; entries: TimelineEntry[] }[]
const KIND_CHIPS = [{ key: '', label: 'All' }, ...PLACE_KINDS, { key: THEATRE_KIND, label: 'Theatre' }]

const smallChip = (on: boolean, dashed = false): React.CSSProperties => ({ ...chip(on), padding: '5px 12px', fontSize: '12px', borderStyle: dashed && !on ? 'dashed' : 'solid', flex: 'none' })

export default function PlacesBrowser() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab,     setTab]     = useState<'visited' | 'wishlist'>('visited')
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
    if (cursor) qs.set('cursor', cursor)
    if (size) qs.set('limit', String(size))
    try {
      const res = await fetch(`/api/places/timeline?${qs}`)
      if (!res.ok) throw new Error()
      const d = await res.json() as { groups: Groups; next: string | null; total: number }
      setFailed(false); setNext(d.next); setTotal(d.total)
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
  }, [kind, timing])
  useEffect(() => { load(null) }, [load])   // eslint-disable-line react-hooks/set-state-in-effect -- loads data from the API; state is only set after the fetch

  // After an edit or delete, reload everything that was on screen (up to the API's page cap) so "Load more" pages are not lost
  const reload = () => { setLoading(true); load(null, Math.min(100, Math.max(40, groups.reduce((n, g) => n + g.entries.length, 0)))) }
  const changeFilter = (apply: () => void) => { apply(); setLoading(true) }

  async function confirmDelete() {
    const e = deleting; setDeleting(null)
    if (!e) return
    const res = await fetch(`/api/places/visits/${e.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Visit deleted', { description: e.place.name }); reload() } else toast.error('Could not delete — try again')
  }

  const filtered = Boolean(kind || timing)
  const empty = !loading && !failed && groups.length === 0

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <ScrollNav>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
          {isAdmin && <Link href="/admin?tab=places" title="Log a place" aria-label="Log a place" style={{ ...navIcon, color: '#b8a0ff' }}><Plus size={22} /></Link>}
        </div>
      </ScrollNav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '8px 20px 80px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--ff-display)', fontSize: '34px', letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 600 }}>Been there</h1>
        <p style={{ margin: '0 0 18px', fontFamily: 'var(--ff-body)', fontSize: '14px', color: 'var(--text-dim)' }}>Cafes, food and outings, in the order they happened.</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button type="button" style={chip(tab === 'visited')} onClick={() => setTab('visited')}>Visited{!filtered && total ? ` · ${total}` : ''}</button>
          <button type="button" style={chip(tab === 'wishlist')} onClick={() => setTab('wishlist')}>Wishlist{wish.length ? ` · ${wish.length}` : ''}</button>
        </div>

        {tab === 'visited' ? (
          <>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
              {KIND_CHIPS.map(k => <button key={k.key || 'all'} type="button" style={smallChip(kind === k.key)} onClick={() => changeFilter(() => setKind(k.key))}>{k.label}</button>)}
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {TIMINGS.map(t => <button key={t.key} type="button" style={smallChip(timing === t.key, true)} onClick={() => changeFilter(() => setTiming(timing === t.key ? '' : t.key))}>{t.label}</button>)}
            </div>

            <Timeline groups={groups} isAdmin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />

            {loading && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Loading…</p>}
            {failed && <p style={{ textAlign: 'center', color: '#ff8585', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Could not load. <button type="button" onClick={() => { setLoading(true); load(next) }} style={{ ...smallChip(false), marginLeft: '8px' }}>Retry</button></p>}
            {empty && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', fontSize: '14px', padding: '36px 0' }}>{kind === THEATRE_KIND && timing ? 'Only theatre visits with a time of day match a timing filter.' : filtered ? 'Nothing matches those filters.' : 'Nothing logged yet.'}</p>}
            {next && !loading && <div style={{ textAlign: 'center', paddingTop: '18px' }}><button type="button" style={chip(false)} onClick={() => { setLoading(true); load(next) }}>Load more</button></div>}
          </>
        ) : (
          <ul style={{ margin: 0, padding: 0 }}>
            {wish.length === 0 && <li style={{ listStyle: 'none', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', fontSize: '14px', padding: '36px 0' }}>Nothing on the wishlist yet.</li>}
            {wish.map(p => (
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

/** An edit form in a bottom sheet: Escape closes it, focus moves in and stays inside until it closes. */
function EditSheet({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const sheet = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })   // always the latest, without re-running the focus setup below

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    sheet.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeRef.current(); return }
      if (e.key !== 'Tab' || !sheet.current) return
      const items = [...sheet.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (items.length === 0) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); before?.focus() }
  }, [])

  return (
    <div role="dialog" aria-modal="true" aria-label={label} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div ref={sheet} tabIndex={-1} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '92dvh', overflowY: 'auto', background: '#0d0d0d', border: '1px solid var(--border-card)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', position: 'relative', outline: 'none' }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><X size={18} /></button>
        {children}
      </div>
    </div>
  )
}
