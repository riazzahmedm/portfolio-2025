import type { Metadata } from 'next'
import Link from 'next/link'
import CartIcon from '@/components/shop/CartIcon'

export const metadata: Metadata = {
  title: 'Shop — Riaz Ahmed Art',
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
        <Link href="/shop" style={{
          fontFamily: 'var(--ff-display)', fontSize: '18px', letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--text-primary)', textDecoration: 'none',
        }}>
          Riaz Ahmed Art
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/shop/orders" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            My Orders
          </Link>
          <CartIcon />
        </div>
      </nav>
      {children}
    </div>
  )
}
