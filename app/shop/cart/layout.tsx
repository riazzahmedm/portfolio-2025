import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart — Shop',
  description: 'Your cart.',
  alternates: { canonical: '/shop/cart' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
