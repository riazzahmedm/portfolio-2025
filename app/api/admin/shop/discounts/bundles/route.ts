import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .select('*, category:shop_categories(id, name)')
    .order('min_qty', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  const deals = (data ?? []).map((d: any) => ({
    ...d,
    category_name: d.category?.name ?? null,
    category: undefined,
  }))
  return Response.json(deals)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .insert({
      name: body.name,
      min_qty: body.min_qty,
      price: body.price,
      is_active: body.is_active ?? true,
      category_id: body.category_id ?? null,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
