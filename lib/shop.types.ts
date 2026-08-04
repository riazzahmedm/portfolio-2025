export interface ShopCategory {
  id: string
  name: string
  slug: string
  position: number
  created_at: string
}

export interface ShopTag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface ShopVariant {
  id: string
  product_id: string
  size: string
  price: number
  stock_qty: number
  created_at: string
}

export interface ShopProduct {
  id: string
  category_id: string | null
  name: string
  description: string | null
  images: string[]
  is_active: boolean
  image_fit: 'cover' | 'contain'
  image_position: 'top' | 'center' | 'bottom'
  created_at: string
  category?: ShopCategory
  variants?: ShopVariant[]
  tags?: ShopTag[]
}

export interface ShippingAddress {
  name: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
}

export type OrderStatus = 'pending_payment' | 'payment_submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'submitted' | 'verified'

export interface ShopOrderItem {
  id: string
  order_id: string
  variant_id: string | null
  product_name: string
  size: string
  price: number
  quantity: number
}

export interface ShopOrder {
  id: string
  customer_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  shipping_address: ShippingAddress
  subtotal: number
  discount_amount: number
  total: number
  coupon_code: string | null
  utr_reference: string | null
  notes: string | null
  created_at: string
  items?: ShopOrderItem[]
}

export interface ShopBundleDeal {
  id: string
  name: string
  min_qty: number
  price: number
  is_active: boolean
  created_at: string
}

export interface ShopCoupon {
  id: string
  code: string
  type: 'percentage' | 'flat'
  value: number
  min_order_amount: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface ShopSettings {
  upi_id: string
  qr_code_url: string
  store_name: string
  store_tagline: string
  artist_photo_url: string
}

export interface CartItem {
  variantId: string
  productId: string
  name: string
  size: string
  price: number
  qty: number
  stock_qty: number
  image: string
}

export type ShopEventType = 'page_view' | 'add_to_cart' | 'checkout_started' | 'payment_submitted' | 'order_completed'

export interface ShopEvent {
  id: string
  type: ShopEventType
  session_id: string
  user_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
