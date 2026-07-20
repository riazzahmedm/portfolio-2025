import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  if (body.payment_status === 'verified') {
    const { data: items } = await supabase
      .from('shop_order_items')
      .select('variant_id, quantity')
      .eq('order_id', id)

    for (const item of items ?? []) {
      if (!item.variant_id) continue
      await supabase.rpc('decrement_stock', {
        variant_id: item.variant_id,
        qty:        item.quantity,
      })
    }
  }

  const { data, error } = await supabase
    .from('shop_orders')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
