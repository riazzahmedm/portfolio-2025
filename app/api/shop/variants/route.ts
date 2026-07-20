import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_variants')
    .insert({
      product_id: body.product_id,
      size:       body.size,
      price:      body.price,
      stock_qty:  body.stock_qty ?? 0,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
