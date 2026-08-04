import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const tag      = searchParams.get('tag')
  const admin    = await isAdmin()

  let query = supabase
    .from('shop_products')
    .select(`
      *,
      category:shop_categories(*),
      variants:shop_variants(*),
      tags:shop_product_tags(tag:shop_tags(*))
    `)
    .order('sort_order', { ascending: true })

  if (!admin) query = query.eq('is_active', true)
  if (category) query = query.eq('category_id', category)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Flatten tags: [{ tag: {...} }] → [{...}]
  const products = (data ?? []).map((p: any) => ({
    ...p,
    tags: (p.tags ?? []).map((t: any) => t.tag).filter(Boolean),
  }))

  // Filter by tag slug if provided
  const filtered = tag
    ? products.filter((p: any) => p.tags.some((t: any) => t.slug === tag))
    : products

  return Response.json(filtered)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_products')
    .insert({
      category_id: body.category_id ?? null,
      name:        body.name,
      description: body.description ?? null,
      images:      body.images ?? [],
      is_active:   body.is_active ?? true,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
