import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import { dbError } from '@/lib/api-error'

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
  const body = await req.json().catch(() => null)
  // The reference is optional, but if it is sent it must be plain text of a sensible length
  const raw = body?.utr_reference
  if (raw != null && typeof raw !== 'string') return Response.json({ error: 'Invalid transaction reference' }, { status: 400 })
  const utr_reference = typeof raw === 'string' ? raw.trim().slice(0, 200) || null : null
  if (utr_reference && utr_reference.length > 64) return Response.json({ error: 'The transaction reference is too long' }, { status: 400 })

  const { data, error } = await supabase
    .from('shop_orders')
    .update({
      payment_status: 'submitted',
      status:         'payment_submitted',
      utr_reference,
    })
    .eq('id', id)
    .eq('customer_id', customer.id)
    .eq('payment_status', 'unpaid')
    .select()
    .single()

  if (error) return dbError(error)
  return Response.json(data)
}
