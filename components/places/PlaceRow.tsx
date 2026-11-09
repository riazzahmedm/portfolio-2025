'use client'
import Link from 'next/link'
import { Pencil, Trash2, Sun, Sunrise, Sunset, Moon } from 'lucide-react'
import { useTapReveal } from '@/components/movies/useTapReveal'
import { PLACE_VIBES, TIMINGS, type TimelineEntry } from '@/lib/places-core'
import { screenFormatLabel } from '@/lib/places'
import { Thumb, kindLabel } from './shared'

const TIMING_ICON = { morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon } as const
/** One row of the timeline: date on the rail, a dot, a thumbnail, and what you need to remember the visit. */
export default function PlaceRow({ entry, isAdmin, onEdit, onDelete }: {
  entry: TimelineEntry; isAdmin: boolean; onEdit?: (e: TimelineEntry) => void; onDelete?: (e: TimelineEntry) => void
}) {
  const { box, showing, bind } = useTapReveal()
  const isTheatre = entry.source === 'theatre'
  const href  = isTheatre ? `/movies/${entry.movie!.id}` : `/places/${entry.place.id}`
  const title = isTheatre ? entry.movie!.title : entry.place.name
  const where = [kindLabel(entry.place.kind), isTheatre ? entry.place.name : null, entry.place.area, isTheatre ? screenFormatLabel(entry.movie!.format) : null].filter(Boolean).join(' · ')
  const vibe  = PLACE_VIBES.find(v => v.key === entry.vibe)
  const timing = TIMINGS.find(t => t.key === entry.timing)
  const TimingIcon = entry.timing ? TIMING_ICON[entry.timing] : null
  const d = new Date(`${entry.date}T12:00:00`)
  const canEdit = isAdmin && !isTheatre

  return (
    <li ref={el => { (box as React.MutableRefObject<HTMLElement | null>).current = el }} {...(bind as object)} style={{ position: 'relative', listStyle: 'none', padding: '10px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span aria-hidden style={{ position: 'absolute', left: '-25px', top: '50%', marginTop: '-5px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid #b8a0ff' }} />
      <time dateTime={entry.date} style={{ position: 'absolute', left: '-62px', top: '50%', transform: 'translateY(-50%)', width: '34px', textAlign: 'right', lineHeight: 1.15, fontFamily: 'var(--ff-mono)', fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        <b style={{ display: 'block', fontFamily: 'var(--ff-body)', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.getDate()}</b>
        {d.toLocaleDateString('en-US', { weekday: 'short' })}
      </time>

      <Link href={href} style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, flex: 1, textDecoration: 'none', color: 'inherit' }}>
        <Thumb src={isTheatre ? entry.movie!.posterUrl : entry.photos[0]} name={title} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ff-body)', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10.5px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{where}</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontFamily: 'var(--ff-mono)', fontSize: '10.5px', marginTop: '3px', flexWrap: 'wrap' }}>
            {vibe && <span style={{ color: vibe.color }}>{vibe.emoji} {vibe.label}</span>}
            {entry.spend !== null && <span style={{ color: 'var(--text-primary)' }}>₹{entry.spend}</span>}
            {timing && TimingIcon && <span style={{ color: '#f3c34d', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><TimingIcon size={11} /> {timing.label}</span>}
          </div>
        </div>
      </Link>

      {canEdit && (
        <div style={{ display: 'flex', gap: '6px', flex: 'none', opacity: showing ? 1 : 0, pointerEvents: showing ? 'auto' : 'none', transition: 'opacity 0.18s' }}>
          <button type="button" className="gc-btn" title="Edit" aria-label="Edit visit" onClick={() => onEdit?.(entry)} style={{ color: '#d6c8ff' }}><Pencil size={13} /></button>
          <button type="button" className="gc-btn" title="Delete" aria-label="Delete visit" onClick={() => onDelete?.(entry)} style={{ color: '#ff8585' }}><Trash2 size={13} /></button>
        </div>
      )}
    </li>
  )
}
