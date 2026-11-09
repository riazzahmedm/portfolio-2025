import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesDb, sanitizePlace } from '@/lib/places.server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const input = sanitizePlace(await req.json(), false)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })
  // The wishlist has its own rules (see POST /api/places), so it can't be switched on from a plain edit
  delete input.value.wishlisted_at
  const { data, error } = await placesDb.from('places').update(input.value).eq('id', id).select().single()
  if (error) return dbError(error)
  return Response.json(data)
}

/** Deleting a place never deletes the logs that used it: they just lose the link (on delete set null). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await placesDb.from('places').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
