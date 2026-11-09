'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import TheatreFields, { theatreFromLog, type TheatreState } from '@/components/movies/TheatreFields'
import type { PlaceLite } from '@/lib/places'
import type { TimelineEntry } from '@/lib/places-core'
import { chip } from './form-styles'

/**
 * Edits the theatre details of a movie seen in a theatre: which theatre, the screen format and the theatre vibe.
 * It changes the movie's log, not a place visit, so the movie itself (title, rating, review) is edited on the Movies page.
 */
export default function TheatreVisitForm({ entry, onSaved }: { entry: TimelineEntry; onSaved: () => void }) {
  const movie = entry.movie!
  const [theatre, setTheatre] = useState<TheatreState>(() => theatreFromLog({ place: entry.place as PlaceLite, screen_format: movie.format, theatre_vibe: entry.vibe }))
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      // A new theatre is saved first so the movie can point at it (the server returns an existing match instead of a duplicate)
      let placeId = theatre.place?.id ?? null
      const name = theatre.query.trim()
      if (!placeId && name) {
        const res = await fetch('/api/places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'theatre', name, city: theatre.city, area: theatre.area }) })
        const d = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(d.error ?? 'Could not save the theatre')
        placeId = d.id
      }
      if (!placeId) throw new Error('Choose a theatre')
      const res = await fetch(`/api/movies/${entry.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ place_id: placeId, screen_format: theatre.format || null, theatre_vibe: theatre.vibe || null }) })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Could not save')
      toast.success('Theatre details updated', { description: movie.title })
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg); toast.error('Not saved', { description: msg })
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontFamily: 'var(--ff-body)', fontWeight: 600, fontSize: '16px' }}>{movie.title}</div>
        <Link href={`/movies/${movie.id}`} style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: '#b8a0ff', textDecoration: 'none' }}>Open the movie to change its rating or review</Link>
      </div>
      <TheatreFields value={theatre} onChange={setTheatre} />
      {error && <div role="alert" style={{ color: '#ff8585', fontSize: '13px', fontFamily: 'var(--ff-mono)' }}>{error}</div>}
      <button type="submit" disabled={busy} style={{ ...chip(true), justifyContent: 'center', padding: '12px 18px', fontSize: '14px', opacity: busy ? 0.6 : 1 }}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}
