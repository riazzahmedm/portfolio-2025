import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesDb } from '@/lib/places.server'
import { THEATRE_KIND, sanitizeVisit, visitsNotReady } from '@/lib/places-core'

/** Admin: log a visit. The place leaves the wishlist the moment its first visit is saved. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const input = sanitizeVisit(await req.json().catch(() => null), true)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })

  // Theatres are logged with a movie, never here
  const { data: place } = await placesDb.from('places').select('kind').eq('id', input.value.place_id as string).maybeSingle()
  if (!place) return Response.json({ error: 'That place no longer exists' }, { status: 404 })
  if (place.kind === THEATRE_KIND) return Response.json({ error: 'Theatre visits are logged with a movie' }, { status: 400 })

  const { data, error } = await placesDb.from('place_visits').insert(input.value).select().single()
  if (error) {
    if (visitsNotReady(error)) return Response.json({ error: 'Run the Been there SQL block in supabase/migrations.sql first' }, { status: 503 })
    return dbError(error)
  }
  await placesDb.from('places').update({ wishlisted_at: null }).eq('id', data.place_id)
  return Response.json(data, { status: 201 })
}
