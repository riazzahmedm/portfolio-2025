import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status         = searchParams.get('status')
  const payment_status = searchParams.get('payment_status')

  let query = supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .order('created_at', { ascending: false })

  if (status)         query = query.eq('status', status)
  if (payment_status) query = query.eq('payment_status', payment_status)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
