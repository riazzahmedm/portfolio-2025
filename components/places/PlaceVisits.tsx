'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Sun, Sunrise, Sunset, Moon } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useTapReveal } from '@/components/movies/useTapReveal'
import { PLACE_VIBES, TIMINGS, type TimelineEntry } from '@/lib/places-core'
import { screenFormatLabel } from '@/lib/places'
import { Thumb } from './shared'
import PlaceForm from './PlaceForm'
import TheatreVisitForm from './TheatreVisitForm'
import EditSheet from './EditSheet'

const TIMING_ICON = { morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon } as const
const mono: React.CSSProperties = { fontFamily: 'var(--ff-mono)', fontSize: '10.5px', color: 'var(--text-dim)' }

/** The visits to one place, newest first. The admin can edit any visit here and delete the ones logged on this page (a theatre visit is a movie log, deleted from Movies). */
export default function PlaceVisits({ entries, isAdmin }: { entries: TimelineEntry[]; isAdmin: boolean }) {
  const router = useRouter()
  const [editing,  setEditing]  = useState<TimelineEntry | null>(null)
  const [deleting, setDeleting] = useState<TimelineEntry | null>(null)

  async function confirmDelete() {
    const e = deleting; setDeleting(null)
    if (!e) return
    const res = await fetch(`/api/places/visits/${e.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Visit deleted', { description: e.place.name }); router.refresh() } else toast.error('Could not delete — try again')
  }

  return (
    <>
      <ul style={{ margin: '0 0 0 54px', padding: '0 0 0 18px', borderLeft: '1px solid var(--border-card)' }}>
        {entries.map(e => <VisitItem key={`${e.source}:${e.id}`} entry={e} isAdmin={isAdmin} onEdit={setEditing} onDelete={setDeleting} />)}
      </ul>
      {editing && (
        <EditSheet label={editing.source === 'theatre' ? 'Edit theatre details' : 'Edit visit'} onClose={() => setEditing(null)}>
          {editing.source === 'theatre'
            ? <TheatreVisitForm entry={editing} onSaved={() => { setEditing(null); router.refresh() }} />
            : <PlaceForm initial={{ entry: editing }} onSaved={() => { setEditing(null); router.refresh() }} />}
        </EditSheet>
      )}
      {deleting && <ConfirmModal title="Delete visit?" description={`Your visit on ${new Date(`${deleting.date}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} will be removed.`} confirmLabel="Delete" onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </>
  )
}

function VisitItem({ entry, isAdmin, onEdit, onDelete }: { entry: TimelineEntry; isAdmin: boolean; onEdit: (e: TimelineEntry) => void; onDelete: (e: TimelineEntry) => void }) {
  const { setBox, showing, bind } = useTapReveal()
  const d = new Date(`${entry.date}T12:00:00`)
  const vibe = PLACE_VIBES.find(v => v.key === entry.vibe)
  const timing = TIMINGS.find(t => t.key === entry.timing)
  const TimingIcon = entry.timing ? TIMING_ICON[entry.timing] : null
  const movie = entry.movie
  return (
    <li ref={setBox} {...(bind as object)} style={{ position: 'relative', listStyle: 'none', padding: '9px 0' }}>
      <span aria-hidden style={{ position: 'absolute', left: '-23px', top: '16px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid #b8a0ff' }} />
      <time dateTime={entry.date} style={{ position: 'absolute', left: '-72px', top: '8px', width: '40px', textAlign: 'right', lineHeight: 1.15, ...mono, fontSize: '9px', textTransform: 'uppercase' }}>
        <b style={{ display: 'block', fontFamily: 'var(--ff-body)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.getDate()}</b>
        {d.toLocaleDateString('en-US', { month: 'short' })}
      </time>
      {isAdmin && (
        <div style={{ position: 'absolute', right: 0, top: '6px', display: 'flex', gap: '6px', opacity: showing ? 1 : 0, pointerEvents: showing ? 'auto' : 'none', transition: 'opacity 0.18s' }}>
          <button type="button" className="gc-btn" title="Edit" aria-label="Edit visit" onClick={() => onEdit(entry)} style={{ color: '#d6c8ff' }}><Pencil size={13} /></button>
          {!movie && <button type="button" className="gc-btn" title="Delete" aria-label="Delete visit" onClick={() => onDelete(entry)} style={{ color: '#ff8585' }}><Trash2 size={13} /></button>}
        </div>
      )}
      {movie ? (
        <Link href={`/movies/${movie.id}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Thumb src={movie.posterUrl} name={movie.title} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'var(--ff-body)' }}>{movie.title}</div>
            <div style={mono}>{[screenFormatLabel(movie.format), vibe ? `${vibe.emoji} ${vibe.label}` : null].filter(Boolean).join(' · ') || 'Theatre visit'}</div>
          </div>
        </Link>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
            {vibe && <span style={{ color: vibe.color }}>{vibe.emoji} {vibe.label}</span>}
            {entry.spend !== null && <span>₹{entry.spend}</span>}
            {timing && TimingIcon && <span style={{ color: '#f3c34d', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><TimingIcon size={11} /> {timing.label}</span>}
          </div>
          {entry.note && <p style={{ margin: '4px 0 0', fontFamily: 'var(--ff-body)', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{entry.note}</p>}
          {entry.photos.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {entry.photos.map(u => <Thumb key={u} src={u} name="" size={52} />)}
            </div>
          )}
        </div>
      )}
    </li>
  )
}
