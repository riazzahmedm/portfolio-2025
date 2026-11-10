import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { releaseOrderReservation } from '@/lib/shop-stock'

/**
 * Admin: cancels orders that were never paid and are older than `hours` (default 48, at least 1), giving their stock and
 * coupon uses back. Abandoned checkouts reserve stock when the order is created, so without this a pile of them can make
 * a print look sold out.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const hours = Math.max(1, Math.min(24 * 90, Number(body?.hours) || 48))
  const before = new Date(Date.now() - hours * 3600_000).toISOString()

  const { data: stale, error } = await supabase
    .from('shop_orders').select('id, coupon_code')
    .eq('payment_status', 'unpaid').eq('status', 'pending_payment').lt('created_at', before)
  if (error) return dbError(error)

  let cancelled = 0
  for (const order of stale ?? []) {
    // Only the call that actually flips the status gives the stock back, so a double click can't release it twice
    const { data: done } = await supabase.from('shop_orders').update({ status: 'cancelled' }).eq('id', order.id).eq('status', 'pending_payment').select('id')
    if (done && done.length > 0) { await releaseOrderReservation(order); cancelled++ }
  }
  return Response.json({ cancelled, olderThanHours: hours })
}
