import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json().catch(() => null)
  const tagIds: unknown = body?.tagIds
  if (!Array.isArray(tagIds) || tagIds.some(t => typeof t !== 'string')) {
    return Response.json({ error: 'tagIds must be a list of tag ids' }, { status: 400 })
  }
  const wanted = [...new Set(tagIds as string[])]

  // Keep the old rows until the new ones are in, so a failed insert can put things back instead of leaving the product untagged
  const { data: previous } = await supabase.from('shop_product_tags').select('product_id, tag_id').eq('product_id', id)
  const { error: deleteError } = await supabase.from('shop_product_tags').delete().eq('product_id', id)
  if (deleteError) return dbError(deleteError)

  if (wanted.length > 0) {
    const { error } = await supabase.from('shop_product_tags').insert(wanted.map(tag_id => ({ product_id: id, tag_id })))
    if (error) {
      if (previous && previous.length > 0) await supabase.from('shop_product_tags').insert(previous)
      return dbError(error)
    }
  }
  return Response.json({ ok: true })
}
