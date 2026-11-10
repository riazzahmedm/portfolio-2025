import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { releaseOrderReservation } from '@/lib/shop-stock'

const STATUSES         = ['pending_payment', 'payment_submitted', 'confirmed', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['unpaid', 'submitted', 'verified']

/** Admin: change an order's status, payment status, reference or notes. Nothing else on the order can be edited here. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') return Response.json({ error: 'Invalid request' }, { status: 400 })

  const patch: Record<string, string | null> = {}
  if ('status' in body) {
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status)) return Response.json({ error: 'Unknown status' }, { status: 400 })
    patch.status = body.status
  }
  if ('payment_status' in body) {
    if (typeof body.payment_status !== 'string' || !PAYMENT_STATUSES.includes(body.payment_status)) return Response.json({ error: 'Unknown payment status' }, { status: 400 })
    patch.payment_status = body.payment_status
  }
  for (const key of ['utr_reference', 'notes'] as const) {
    if (key in body) patch[key] = typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, 500) || null : null
  }
  if (Object.keys(patch).length === 0) return Response.json({ error: 'Nothing to update' }, { status: 400 })

  const { data: current } = await supabase.from('shop_orders').select('status, coupon_code').eq('id', id).maybeSingle()
  if (!current) return Response.json({ error: 'Not found' }, { status: 404 })
  // Cancelling gives the stock back; reopening would have to take it again, so a cancelled order stays cancelled
  if (current.status === 'cancelled' && patch.status && patch.status !== 'cancelled') {
    return Response.json({ error: 'A cancelled order cannot be reopened. Ask the customer to place a new order.' }, { status: 409 })
  }

  const { data, error } = await supabase.from('shop_orders').update(patch).eq('id', id).select().single()
  if (error) return dbError(error)

  if (patch.status === 'cancelled' && current.status !== 'cancelled') await releaseOrderReservation({ id, coupon_code: current.coupon_code })
  return Response.json(data)
}
