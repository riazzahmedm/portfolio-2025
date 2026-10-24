import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import { applyBundleDeal, couponDiscount, couponIneligibilityReason } from '@/lib/shop-pricing'
import type { CartItem, ShippingAddress } from '@/lib/shop.types'

export async function GET() {
  const customer = await getCustomer()
  if (!customer) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
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

  if (!body.items?.length) return Response.json({ error: 'No items' }, { status: 400 })

  // 1. Re-fetch variant prices and stock from DB — never trust client prices
  const variantIds = body.items.map(i => i.variantId)
  const { data: variants, error: varErr } = await supabase
    .from('shop_variants')
    .select('id, price, stock_qty')
    .in('id', variantIds)

  if (varErr || !variants) return Response.json({ error: 'Failed to verify items' }, { status: 500 })

  const variantMap = new Map(variants.map(v => [v.id, v]))

  // 2. Validate stock availability
  for (const item of body.items) {
    const variant = variantMap.get(item.variantId)
    if (!variant) return Response.json({ error: `Item not found: ${item.name}` }, { status: 400 })
    if (variant.stock_qty < item.qty) {
      return Response.json({ error: `Not enough stock for ${item.name} (${item.size})` }, { status: 400 })
    }
  }

  // 3. Compute server-side subtotal from DB prices — never trust client prices
  const pricedItems: CartItem[] = body.items.map(item => ({
    ...item,
    price: variantMap.get(item.variantId)!.price,
  }))

  // 4. Re-apply bundle deals server-side with the same rules the cart used
  const { data: bundles } = await supabase
    .from('shop_bundle_deals')
    .select('id, name, min_qty, price, category_id, is_active')
    .eq('is_active', true)

  const bundleResult      = applyBundleDeal(pricedItems, bundles ?? [])
  const serverSubtotal    = bundleResult.subtotal

  let serverDiscountAmount = bundleResult.discount
  let appliedCouponCode: string | null = null

  // 5. Re-apply coupon server-side
  if (body.coupon_code) {
    const code = body.coupon_code.toUpperCase().trim()
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
  }

  const serverTotal = Math.max(0, serverSubtotal - serverDiscountAmount)

  // 6. Reject if client total doesn't match server total (₹1 rounding tolerance)
  if (Math.abs(serverTotal - body.total) > 1) {
    return Response.json({ error: 'Order total mismatch — please refresh and try again' }, { status: 400 })
  }

  // 7. Insert order with server-calculated values
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

  if (orderError) return Response.json({ error: orderError.message }, { status: 500 })

  const orderItems = body.items.map(item => ({
    order_id:     order.id,
    variant_id:   item.variantId,
    product_name: item.name,
    size:         item.size,
    price:        variantMap.get(item.variantId)!.price,
    quantity:     item.qty,
  }))

  const { error: itemsError } = await supabase.from('shop_order_items').insert(orderItems)
  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 })

  // 8. Decrement stock
  await Promise.all(body.items.map(item => {
    const current = variantMap.get(item.variantId)!.stock_qty
    return supabase
      .from('shop_variants')
      .update({ stock_qty: current - item.qty })
      .eq('id', item.variantId)
      .gte('stock_qty', item.qty) // guard against race condition
  }))

  if (appliedCouponCode) {
    try {
      await supabase.rpc('increment_coupon_uses', { coupon_code: appliedCouponCode })
    } catch {/* non-critical */}
  }

  return Response.json({ id: order.id }, { status: 201 })
}
