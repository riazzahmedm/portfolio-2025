import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { code, subtotal }: { code: string; subtotal: number } = await req.json()
  if (!code) return Response.json({ error: 'Code required' }, { status: 400 })

  const { data: coupon, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return Response.json({ error: 'Invalid coupon code' }, { status: 404 })

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return Response.json({ error: 'Coupon has expired' }, { status: 400 })
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return Response.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  }

  if (subtotal < coupon.min_order_amount) {
    return Response.json({
      error: `Minimum order ₹${coupon.min_order_amount} required for this coupon`,
    }, { status: 400 })
  }

  const discount = coupon.type === 'percentage'
    ? Math.round((subtotal * coupon.value) / 100 * 100) / 100
    : Math.min(coupon.value, subtotal)

  return Response.json({ valid: true, discount, coupon })
}
