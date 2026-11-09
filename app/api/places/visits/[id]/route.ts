import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { placesDb } from '@/lib/places.server'
import { sanitizeVisit } from '@/lib/places-core'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const input = sanitizeVisit(await req.json().catch(() => null), false)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })
  if (Object.keys(input.value).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })
  const { data, error } = await placesDb.from('place_visits').update(input.value).eq('id', id).select().single()
  if (error) return dbError(error)
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await placesDb.from('place_visits').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
