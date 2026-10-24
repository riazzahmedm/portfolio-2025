import type { CartItem, ShopBundleDeal, ShopCoupon } from './shop.types'

/** Minimal shape needed from a bundle deal — full ShopBundleDeal is assignable. */
export type BundleDealLike = Pick<
  ShopBundleDeal,
  'id' | 'name' | 'min_qty' | 'price' | 'category_id' | 'is_active'
>

export interface BundleResult {
  subtotal: number
  discount: number
  total: number
  appliedDeals: BundleDealLike[]
}

/**
 * Applies the best qualifying bundle deal per category (null = uncategorised).
 * The discount covers exactly `min_qty` items; any extra quantity stays at full price.
 *
 * Shared by the cart, checkout and the order API so all three agree on the total.
 */
export function applyBundleDeal(items: CartItem[], deals: BundleDealLike[]): BundleResult {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)

  const byCategory = new Map<string | null, CartItem[]>()
  for (const item of items) {
    const key = item.category_id ?? null
    if (!byCategory.has(key)) byCategory.set(key, [])
    byCategory.get(key)!.push(item)
  }

  let totalDiscount = 0
  const appliedDeals: BundleDealLike[] = []

  for (const [catId, catItems] of byCategory) {
    const catQty = catItems.reduce((s, i) => s + i.qty, 0)
    // Deals for this category (global deals use a null category_id)
    const candidates = deals
      .filter(d => d.is_active && (d.category_id ?? null) === catId && catQty >= d.min_qty)
      .sort((a, b) => b.min_qty - a.min_qty)
    const deal = candidates[0]
    if (!deal) continue

    const catSubtotal = catItems.reduce((s, i) => s + i.price * i.qty, 0)
    const applicableSubtotal = catSubtotal * (deal.min_qty / catQty)
    totalDiscount += Math.max(0, applicableSubtotal - deal.price)
    appliedDeals.push(deal)
  }

  return {
    subtotal,
    discount: totalDiscount,
    total: subtotal - totalDiscount,
    appliedDeals,
  }
}

export type CouponLike = Pick<ShopCoupon, 'type' | 'value'>

/** Discount a coupon grants on `base`, rounded to paise and never above the base. */
export function couponDiscount(coupon: CouponLike, base: number): number {
  const raw = coupon.type === 'percentage'
    ? (base * coupon.value) / 100
    : coupon.value
  return Math.max(0, Math.min(Math.round(raw * 100) / 100, base))
}

export type CouponEligibilityLike = Pick<
  ShopCoupon,
  'min_order_amount' | 'max_uses' | 'uses_count' | 'expires_at'
>

/** Returns a human-readable reason the coupon can't be used on `base`, or null if it can. */
export function couponIneligibilityReason(
  coupon: CouponEligibilityLike,
  base: number,
): string | null {
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return 'Coupon has expired'
  }
  if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.uses_count >= coupon.max_uses) {
    return 'Coupon usage limit reached'
  }
  if (base < coupon.min_order_amount) {
    return `Minimum order ₹${coupon.min_order_amount} required for this coupon`
  }
  return null
}
