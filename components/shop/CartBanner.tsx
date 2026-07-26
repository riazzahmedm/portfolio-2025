'use client'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

export default function CartBanner() {
  const { count, items } = useCart()
  const pathname = usePathname()
  if (count === 0 || pathname === '/shop/cart' || pathname.startsWith('/shop/checkout')) return null

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div style={{
      position: 'sticky', top: '56px', zIndex: 40,
      background: '#6b45d4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff', fontFamily: 'var(--ff-body)' }}>
        <ShoppingBag size={15} />
        <span>
          {count} {count === 1 ? 'item' : 'items'} in cart
          <span style={{ opacity: 0.7, marginLeft: '8px', fontFamily: 'var(--ff-mono)' }}>·  ₹{total.toFixed(0)}</span>
        </span>
      </div>
      <Link href="/shop/cart" style={{
        fontSize: '12px', fontWeight: 700, color: '#e8ff00',
        textDecoration: 'none', letterSpacing: '0.06em', fontFamily: 'var(--ff-mono)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>Go to cart <ChevronRight size={13} /></span>
      </Link>
    </div>
  )
}
