import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('id', id)
    .eq('customer_id', customer.id)
    .single()

  if (error) return Response.json({ error: 'Order not found' }, { status: 404 })
  return Response.json(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { utr_reference } = await req.json()

  const { data, error } = await supabase
    .from('shop_orders')
    .update({
      payment_status: 'submitted',
      status:         'payment_submitted',
      utr_reference:  utr_reference ?? null,
    })
    .eq('id', id)
    .eq('customer_id', customer.id)
    .eq('payment_status', 'unpaid')
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
