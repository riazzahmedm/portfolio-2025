'use client'
import PlaceRow from './PlaceRow'
import type { TimelineEntry } from '@/lib/places-core'

/** Month headings, and under each a vertical rail with one row per visit. */
export default function Timeline({ groups, isAdmin, onEdit, onDelete }: {
  groups: { month: string; label: string; entries: TimelineEntry[] }[]
  isAdmin: boolean; onEdit?: (e: TimelineEntry) => void; onDelete?: (e: TimelineEntry) => void
}) {
  return (
    <div>
      {groups.map(g => (
        <section key={g.month} aria-label={g.label}>
          <h2 style={{ margin: '22px 0 6px', fontFamily: 'var(--ff-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b8a0ff', fontWeight: 400 }}>{g.label}</h2>
          <ul style={{ margin: '0 0 0 64px', padding: '0 0 0 20px', borderLeft: '1px solid var(--border-card)' }}>
            {g.entries.map(e => <PlaceRow key={`${e.source}:${e.id}`} entry={e} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />)}
          </ul>
        </section>
      ))}
    </div>
  )
}
