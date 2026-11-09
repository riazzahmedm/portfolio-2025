import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesNotReady } from '@/lib/movies-select'
import { placesDb, sanitizePlace } from '@/lib/places.server'

/** Public read: ?kind=theatre&city=Hyderabad&q=pras — used by the pickers, newest-used first is up to the caller. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const kind = searchParams.get('kind')?.trim().toLowerCase()
  const city = searchParams.get('city')?.trim()
  const q    = searchParams.get('q')?.trim()

  let query = supabase.from('places').select('*').order('name', { ascending: true }).limit(60)
  if (kind) query = query.eq('kind', kind)
  if (city) query = query.ilike('city', city)
  if (q)    query = query.ilike('name', `%${q.replace(/[%_]/g, '')}%`)
  const { data, error } = await query
  if (error) return placesNotReady(error) ? Response.json([]) : dbError(error)
  return Response.json(data ?? [])
}

/** Admin: add a place. If the same place (kind, name, city) is already saved, that one comes back instead of a duplicate. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const input = sanitizePlace(await req.json(), true)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })
  const place = input.value as { kind: string; name: string; city?: string | null }

  let existing = placesDb.from('places').select('*').eq('kind', place.kind).ilike('name', place.name)
  existing = place.city ? existing.ilike('city', place.city) : existing.is('city', null)
  const { data: found } = await existing.limit(1).maybeSingle()
  if (found) return Response.json(found)

  const { data, error } = await placesDb.from('places').insert(input.value).select().single()
  if (error) return dbError(error)
  return Response.json(data, { status: 201 })
}
