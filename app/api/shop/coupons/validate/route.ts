import { supabase } from '@/lib/supabase'
import { couponDiscount, couponIneligibilityReason } from '@/lib/shop-pricing'

export async function POST(req: Request) {
  const { code, subtotal }: { code: string; subtotal: number } = await req.json()
  if (!code) return Response.json({ error: 'Code required' }, { status: 400 })

  const { data: coupon, error } = await supabase
    .from('shop_coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return Response.json({ error: 'Invalid coupon code' }, { status: 404 })

  const reason = couponIneligibilityReason(coupon, subtotal)
  if (reason) return Response.json({ error: reason }, { status: 400 })

  return Response.json({ valid: true, discount: couponDiscount(coupon, subtotal), coupon })
}
