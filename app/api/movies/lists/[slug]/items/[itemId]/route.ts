import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('movie_list_items').update(body).eq('id', itemId).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params
  const { error } = await supabase.from('movie_list_items').delete().eq('id', itemId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
