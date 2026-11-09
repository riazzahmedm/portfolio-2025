import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesDb } from '@/lib/places.server'
import { sanitizeVisit, visitsNotReady } from '@/lib/places-core'

/** Admin: log a visit. The place leaves the wishlist the moment its first visit is saved. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const input = sanitizeVisit(await req.json().catch(() => null), true)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })

  const { data, error } = await placesDb.from('place_visits').insert(input.value).select().single()
  if (error) {
    if (visitsNotReady(error)) return Response.json({ error: 'Run the Been there SQL block in supabase/migrations.sql first' }, { status: 503 })
    return dbError(error)
  }
  await placesDb.from('places').update({ wishlisted_at: null }).eq('id', data.place_id)
  return Response.json(data, { status: 201 })
}
