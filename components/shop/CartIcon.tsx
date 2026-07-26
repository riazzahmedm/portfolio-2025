'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CartIcon() {
  const { count } = useCart()
  return (
    <Link href="/shop/cart" style={{ position: 'relative', display: 'inline-flex', color: 'var(--text-primary)' }}>
      <ShoppingBag size={22} />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: '-6px', right: '-8px',
          background: '#e8ff00', color: '#0a0a0a',
          borderRadius: '999px', fontSize: '10px', fontWeight: 700,
          minWidth: '16px', height: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 3px', fontFamily: 'var(--ff-mono)',
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
