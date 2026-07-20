import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { tagIds }: { tagIds: string[] } = await req.json()

  await supabase.from('shop_product_tags').delete().eq('product_id', id)

  if (tagIds.length > 0) {
    const rows = tagIds.map(tag_id => ({ product_id: id, tag_id }))
    const { error } = await supabase.from('shop_product_tags').insert(rows)
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
