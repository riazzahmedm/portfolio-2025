import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
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

  // 3. Compute server-side subtotal from DB prices
  const serverSubtotal = body.items.reduce((sum, item) => {
    return sum + variantMap.get(item.variantId)!.price * item.qty
  }, 0)

  const totalQty = body.items.reduce((s, i) => s + i.qty, 0)

  // 4. Re-apply bundle deals server-side
  let serverBundleDiscount = 0
  const { data: bundles } = await supabase
    .from('shop_bundle_deals')
    .select('min_qty, price, category_id')
    .eq('is_active', true)
    .order('min_qty', { ascending: false })

  for (const deal of (bundles ?? [])) {
    if (deal.category_id) {
      const catItems = body.items.filter(i => i.category_id === deal.category_id)
      const catQty = catItems.reduce((s, i) => s + i.qty, 0)
      if (catQty >= deal.min_qty) {
        const catSubtotal = catItems.reduce((sum, i) => sum + variantMap.get(i.variantId)!.price * i.qty, 0)
        serverBundleDiscount = Math.max(serverBundleDiscount, catSubtotal - deal.price * catQty)
      }
    } else {
      if (totalQty >= deal.min_qty) {
        serverBundleDiscount = Math.max(serverBundleDiscount, serverSubtotal - deal.price * totalQty)
      }
    }
  }

  let serverDiscountAmount = serverBundleDiscount

  // 5. Re-apply coupon server-side
  if (body.coupon_code) {
    const { data: coupon } = await supabase
      .from('shop_coupons')
      .select('*')
      .eq('code', body.coupon_code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (coupon) {
      const afterBundle = serverSubtotal - serverBundleDiscount
      const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date()
      const hasUses    = !coupon.max_uses || coupon.uses_count < coupon.max_uses
      if (afterBundle >= coupon.min_order_amount && notExpired && hasUses) {
        const couponDiscount = coupon.type === 'percentage'
          ? afterBundle * (coupon.value / 100)
          : coupon.value
        serverDiscountAmount += couponDiscount
      }
    }
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
      coupon_code:      body.coupon_code ?? null,
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

  if (body.coupon_code) {
    try {
      await supabase.rpc('increment_coupon_uses', { coupon_code: body.coupon_code })
    } catch {/* non-critical */}
  }

  return Response.json({ id: order.id }, { status: 201 })
}
