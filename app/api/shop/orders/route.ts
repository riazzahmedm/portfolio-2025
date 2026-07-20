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

  const { data: order, error: orderError } = await supabase
    .from('shop_orders')
    .insert({
      customer_id:      customer.id,
      shipping_address: body.shipping_address,
      subtotal:         body.subtotal,
      discount_amount:  body.discount_amount,
      total:            body.total,
      coupon_code:      body.coupon_code ?? null,
    })
    .select()
    .single()

  if (orderError) return Response.json({ error: orderError.message }, { status: 500 })

  const items = body.items.map(item => ({
    order_id:     order.id,
    variant_id:   item.variantId,
    product_name: item.name,
    size:         item.size,
    price:        item.price,
    quantity:     item.qty,
  }))

  const { error: itemsError } = await supabase.from('shop_order_items').insert(items)
  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 })

  if (body.coupon_code) {
    try {
      await supabase.rpc('increment_coupon_uses', { coupon_code: body.coupon_code })
    } catch {/* non-critical */}
  }

  return Response.json({ id: order.id }, { status: 201 })
}
