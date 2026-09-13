import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CartIcon from '@/components/shop/CartIcon'
import CartBanner from '@/components/shop/CartBanner'

export const metadata: Metadata = {
  title: 'Shop — Art prints from Riaz',
  description: 'Original digital art prints — stickers, posters and more.',
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--ff-body)' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '0 24px',
        height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/hub" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <Link href="/shop" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/shop-logo.png" alt="Art prints from Riaz" style={{ height: '44px', width: 'auto', display: 'block' }} />
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/shop/orders" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            My Orders
          </Link>
          <CartIcon />
        </div>
      </nav>
      <CartBanner />
      {children}
    </div>
  )
}
