import { supabase } from '@/lib/supabase'

// Stock and coupon counters for shop orders. Shared by checkout (which takes them) and the admin order routes (which give them back).

/**
 * Claims one use of a coupon. With a usage cap the increment is compare-and-swap on
 * uses_count, so two simultaneous checkouts can't both take the last use.
 * Returns false when the cap is reached.
 */
export async function claimCouponUse(code: string, maxUses: number | null): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: row } = await supabase
      .from('shop_coupons').select('uses_count').eq('code', code).single()
    if (!row) return false
    if (maxUses !== null && row.uses_count >= maxUses) return false
    const { data: updated } = await supabase
      .from('shop_coupons')
      .update({ uses_count: row.uses_count + 1 })
      .eq('code', code)
      .eq('uses_count', row.uses_count)
      .select('code')
    if (updated && updated.length > 0) return true
  }
  return false
}

export async function releaseCouponUse(code: string) {
  const { data: row } = await supabase
    .from('shop_coupons').select('uses_count').eq('code', code).single()
  if (row && row.uses_count > 0) {
    await supabase.from('shop_coupons')
      .update({ uses_count: row.uses_count - 1 }).eq('code', code).eq('uses_count', row.uses_count)
  }
}

/**
 * Compare-and-swap stock change: only writes if stock_qty is still the value we read,
 * retrying on contention. A negative delta fails (returns false) rather than going below 0.
 */
export async function adjustStock(variantId: string, delta: number): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: row } = await supabase
      .from('shop_variants').select('stock_qty').eq('id', variantId).single()
    if (!row) return false
    const next = row.stock_qty + delta
    if (next < 0) return false
    const { data: updated } = await supabase
      .from('shop_variants')
      .update({ stock_qty: next })
      .eq('id', variantId)
      .eq('stock_qty', row.stock_qty)
      .select('id')
    if (updated && updated.length > 0) return true
  }
  return false
}

/**
 * Gives an order's reserved stock and coupon use back (used when an order is cancelled).
 * Call it once per order: the caller must have just moved the order into the cancelled state.
 */
export async function releaseOrderReservation(order: { id: string; coupon_code: string | null }) {
  const { data: items } = await supabase.from('shop_order_items').select('variant_id, quantity').eq('order_id', order.id)
  for (const item of items ?? []) {
    if (item.variant_id) await adjustStock(item.variant_id, item.quantity)
  }
  if (order.coupon_code) await releaseCouponUse(order.coupon_code)
}
