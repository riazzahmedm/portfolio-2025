import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollNav from '@/components/ui/ScrollNav'
import ShopNavLogo from '@/components/shop/ShopNavLogo'
import CartIcon from '@/components/shop/CartIcon'
import CartBanner from '@/components/shop/CartBanner'
import NavBack from '@/components/ui/NavBack'

export const metadata: Metadata = {
  title: 'Shop — Art prints from Riaz',
  description: 'Original digital art prints — stickers, posters and more.',
  alternates: { canonical: '/shop' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--ff-body)' }}>
      <ScrollNav as="nav" style={{ padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NavBack />
          <ShopNavLogo />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/shop/orders" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            My Orders
          </Link>
          <CartIcon />
        </div>
      </ScrollNav>
      <CartBanner />
      {children}
    </div>
  )
}
