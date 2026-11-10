import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { pickFields, EMPTY_PATCH } from '@/lib/pick'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const patch = pickFields(await req.json().catch(() => null), ["name", "slug", "position"])
  if (Object.keys(patch).length === 0) return EMPTY_PATCH()
  const { data, error } = await supabase
    .from('shop_categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) return dbError(error)
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabase.from('shop_categories').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
