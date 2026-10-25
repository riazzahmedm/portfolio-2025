import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .select('*, category:shop_categories(id, name)')
    .order('min_qty', { ascending: true })
  if (error) return dbError(error)
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
  if (error) return dbError(error)
  return Response.json(data, { status: 201 })
}
