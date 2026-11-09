'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { MapPin, Plus, X, Check, ExternalLink } from 'lucide-react'
import ScrollNav from '@/components/ui/ScrollNav'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { navIcon } from '@/components/ui/nav-icon'
import { PLACE_KINDS, TIMINGS, THEATRE_KIND, type TimelineEntry } from '@/lib/places-core'
import type { Place } from '@/lib/places'
import Timeline from './Timeline'
import PlaceForm from './PlaceForm'
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

  // The first page for the current filters; "Load more" appends the next one
  const load = useCallback(async (cursor: string | null) => {
    setLoading(true); setFailed(false)
    const qs = new URLSearchParams()
    if (kind) qs.set('kind', kind)
    if (timing) qs.set('timing', timing)
    if (cursor) qs.set('cursor', cursor)
    try {
      const res = await fetch(`/api/places/timeline?${qs}`)
      if (!res.ok) throw new Error()
      const d = await res.json() as { groups: Groups; next: string | null; total: number }
      setNext(d.next); setTotal(d.total)
      setGroups(prev => {
        if (!cursor) return d.groups
        // a month can continue across pages: merge into the last group instead of repeating its heading
        const merged = [...prev]
        for (const g of d.groups) {
          const last = merged[merged.length - 1]
          if (last && last.month === g.month) merged[merged.length - 1] = { ...last, entries: [...last.entries, ...g.entries] }
          else merged.push(g)
        }
        return merged
      })
    } catch { setFailed(true) } finally { setLoading(false) }
  }, [kind, timing])
  useEffect(() => { load(null) }, [load])

  async function confirmDelete() {
    const e = deleting; setDeleting(null)
    if (!e) return
    const res = await fetch(`/api/places/visits/${e.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Visit deleted', { description: e.place.name }); load(null) } else toast.error('Could not delete — try again')
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
              {KIND_CHIPS.map(k => <button key={k.key || 'all'} type="button" style={smallChip(kind === k.key)} onClick={() => setKind(k.key)}>{k.label}</button>)}
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {TIMINGS.map(t => <button key={t.key} type="button" style={smallChip(timing === t.key, true)} onClick={() => setTiming(timing === t.key ? '' : t.key)}>{t.label}</button>)}
            </div>

            <Timeline groups={groups} isAdmin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />

            {loading && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Loading…</p>}
            {failed && <p style={{ textAlign: 'center', color: '#ff8585', fontFamily: 'var(--ff-mono)', fontSize: '12px', padding: '28px 0' }}>Could not load. <button type="button" onClick={() => load(next)} style={{ ...smallChip(false), marginLeft: '8px' }}>Retry</button></p>}
            {empty && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--ff-body)', fontSize: '14px', padding: '36px 0' }}>{filtered ? 'Nothing matches those filters.' : 'Nothing logged yet.'}</p>}
            {next && !loading && <div style={{ textAlign: 'center', paddingTop: '18px' }}><button type="button" style={chip(false)} onClick={() => load(next)}>Load more</button></div>}
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
        <div role="dialog" aria-label="Edit visit" onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', maxHeight: '92dvh', overflowY: 'auto', background: '#0d0d0d', border: '1px solid var(--border-card)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', position: 'relative' }}>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close" style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><X size={18} /></button>
            <PlaceForm initial={{ entry: editing }} onSaved={() => { setEditing(null); load(null) }} />
          </div>
        </div>
      )}
      {deleting && <ConfirmModal title="Delete visit?" description={`Your visit to "${deleting.place.name}" will be removed.`} confirmLabel="Delete" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  )
}
