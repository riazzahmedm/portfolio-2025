import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('shop_products')
    .select(`
      *,
      category:shop_categories(*),
      variants:shop_variants(*),
      tags:shop_product_tags(tag:shop_tags(*))
    `)
    .eq('id', id)
    .single()
  if (error) return dbError(error, 404)
  return Response.json({
    ...data,
    tags: (data.tags ?? []).map((t: any) => t.tag).filter(Boolean),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  // Whitelist only editable fields — never pass raw body to .update()
  const patch: Record<string, unknown> = {}
  const allowed = ['name', 'description', 'images', 'is_active', 'image_fit', 'image_position', 'sort_order', 'category_id'] as const
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }
  const { data, error } = await supabase
    .from('shop_products')
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
  const { error } = await supabase.from('shop_products').delete().eq('id', id)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
