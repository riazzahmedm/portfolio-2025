import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { artDb } from '@/lib/art.server'
import { sanitizeArt } from '@/lib/art-input'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await artDb
    .from('art_pieces')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) return dbError(error)
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const input = sanitizeArt(await req.json(), true)
  if ('error' in input) return Response.json({ error: input.error }, { status: 400 })

  // New pieces go to the top of the gallery
  const { data: first } = await artDb.from('art_pieces').select('sort_order').order('sort_order', { ascending: true }).limit(1).maybeSingle()
  const { data, error } = await artDb
    .from('art_pieces')
    .insert({ ...input.value, sort_order: (first?.sort_order ?? 0) - 1 })
    .select()
    .single()
  if (error) return dbError(error)
  return Response.json(data, { status: 201 })
}
