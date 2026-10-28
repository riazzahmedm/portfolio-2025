import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { artDb } from '@/lib/art.server'
import { sanitizeArt } from '@/lib/art-input'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const input = sanitizeArt(await req.json(), false)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })
  const { data, error } = await artDb.from('art_pieces').update(input.value).eq('id', id).select().single()
  if (error) return dbError(error)
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await artDb.from('art_pieces').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
