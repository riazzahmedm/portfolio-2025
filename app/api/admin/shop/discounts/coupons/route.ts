import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabase
    .from('shop_coupons')
    .insert({
      code:             body.code.toUpperCase(),
      type:             body.type,
      value:            body.value,
      min_order_amount: body.min_order_amount ?? 0,
      max_uses:         body.max_uses ?? null,
      expires_at:       body.expires_at ?? null,
      is_active:        body.is_active ?? true,
    })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
