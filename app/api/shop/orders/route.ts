import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import { applyBundleDeal, couponDiscount, couponIneligibilityReason } from '@/lib/shop-pricing'
import type { CartItem, ShippingAddress } from '@/lib/shop.types'
import { dbError } from '@/lib/api-error'

const MAX_QTY_PER_LINE = 20

/**
 * Claims one use of a coupon. With a usage cap the increment is compare-and-swap on
 * uses_count, so two simultaneous checkouts can't both take the last use.
 * Returns false when the cap is reached.
 */
async function claimCouponUse(code: string, maxUses: number | null): Promise<boolean> {
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

async function releaseCouponUse(code: string) {
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
async function adjustStock(variantId: string, delta: number): Promise<boolean> {
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

export async function GET() {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) return dbError(error)
  return Response.json(data)
}

export async function POST(req: Request) {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body: {
    items: CartItem[]
    shipping_address: ShippingAddress
    subtotal: number
    discount_amount: number
    total: number
    coupon_code?: string
  } = await req.json()

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return Response.json({ error: 'No items' }, { status: 400 })
  }

  // 1. Validate and merge lines: positive whole quantities, one line per variant
  const requested = new Map<string, number>()
  for (const item of body.items) {
    if (typeof item?.variantId !== 'string' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > MAX_QTY_PER_LINE) {
      return Response.json({ error: 'Invalid item quantity' }, { status: 400 })
    }
    requested.set(item.variantId, (requested.get(item.variantId) ?? 0) + item.qty)
  }

  // 2. Re-fetch everything that affects price from the DB — never trust the client cart
  const { data: variants, error: varErr } = await supabase
    .from('shop_variants')
    .select('id, size, price, stock_qty, product:shop_products(id, name, category_id, is_active)')
    .in('id', [...requested.keys()])

  if (varErr || !variants) return Response.json({ error: 'Failed to verify items' }, { status: 500 })

  type DbVariant = {
    id: string; size: string; price: number; stock_qty: number
    product: { id: string; name: string; category_id: string | null; is_active: boolean } | null
  }
  const variantMap = new Map(
    (variants as unknown as (Omit<DbVariant, 'product'> & { product: DbVariant['product'] | DbVariant['product'][] })[])
      .map(v => [v.id, { ...v, product: Array.isArray(v.product) ? v.product[0] ?? null : v.product } as DbVariant]),
  )

  // 3. Check availability, then price lines using only DB values (price, name, category)
  const pricedItems: CartItem[] = []
  for (const [variantId, qty] of requested) {
    const v = variantMap.get(variantId)
    if (!v || !v.product || !v.product.is_active) {
      return Response.json({ error: 'An item in your cart is no longer available' }, { status: 400 })
    }
    if (v.stock_qty < qty) {
      return Response.json({ error: `Not enough stock for ${v.product.name} (${v.size})` }, { status: 400 })
    }
    pricedItems.push({
      variantId, productId: v.product.id, name: v.product.name, size: v.size,
      price: Number(v.price), qty, stock_qty: v.stock_qty, image: '',
      category_id: v.product.category_id,
    })
  }

  // 4. Re-apply bundle deals server-side with the same rules the cart used
  const { data: bundles } = await supabase
    .from('shop_bundle_deals')
    .select('id, name, min_qty, price, category_id, is_active')
    .eq('is_active', true)

  const bundleResult      = applyBundleDeal(pricedItems, bundles ?? [])
  const serverSubtotal    = bundleResult.subtotal

  let serverDiscountAmount = bundleResult.discount
  let appliedCouponCode: string | null = null
  let couponMaxUses: number | null = null

  // 5. Re-apply coupon server-side
  if (body.coupon_code) {
    const code = String(body.coupon_code).toUpperCase().trim()
    const { data: coupon } = await supabase
      .from('shop_coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (!coupon) {
      return Response.json({ error: `Coupon ${code} is no longer available — remove it and try again` }, { status: 400 })
    }

    const afterBundle = bundleResult.total
    const reason = couponIneligibilityReason(coupon, afterBundle)
    if (reason) return Response.json({ error: reason }, { status: 400 })

    serverDiscountAmount += couponDiscount(coupon, afterBundle)
    appliedCouponCode      = code
    couponMaxUses          = coupon.max_uses ?? null
  }

  const serverTotal = Math.max(0, serverSubtotal - serverDiscountAmount)

  // 6. Reject if client total doesn't match server total (₹1 rounding tolerance)
  if (Math.abs(serverTotal - body.total) > 1) {
    return Response.json({ error: 'Order total mismatch — please refresh and try again' }, { status: 400 })
  }

  // 7. Reserve stock atomically before creating the order; undo everything on failure
  const reserved: { variantId: string; qty: number }[] = []
  const releaseReserved = () => Promise.all(reserved.map(r => adjustStock(r.variantId, r.qty)))

  for (const line of pricedItems) {
    if (!(await adjustStock(line.variantId, -line.qty))) {
      await releaseReserved()
      return Response.json({ error: `Not enough stock for ${line.name} (${line.size})` }, { status: 409 })
    }
    reserved.push({ variantId: line.variantId, qty: line.qty })
  }

  if (appliedCouponCode && !(await claimCouponUse(appliedCouponCode, couponMaxUses))) {
    await releaseReserved()
    return Response.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  }
  const releaseAll = async () => {
    await releaseReserved()
    if (appliedCouponCode) await releaseCouponUse(appliedCouponCode)
  }

  // 8. Insert order with server-calculated values
  const { data: order, error: orderError } = await supabase
    .from('shop_orders')
    .insert({
      customer_id:      customer.id,
      shipping_address: body.shipping_address,
      subtotal:         serverSubtotal,
      discount_amount:  serverDiscountAmount,
      total:            serverTotal,
      coupon_code:      appliedCouponCode,
    })
    .select()
    .single()

  if (orderError || !order) {
    await releaseAll()
    return orderError ? dbError(orderError) : Response.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const { error: itemsError } = await supabase.from('shop_order_items').insert(
    pricedItems.map(item => ({
      order_id:     order.id,
      variant_id:   item.variantId,
      product_name: item.name,
      size:         item.size,
      price:        item.price,
      quantity:     item.qty,
    })),
  )
  if (itemsError) {
    await supabase.from('shop_orders').delete().eq('id', order.id)
    await releaseAll()
    return dbError(itemsError)
  }

  return Response.json({ id: order.id }, { status: 201 })
}
