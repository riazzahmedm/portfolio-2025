import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — Shop',
  description: 'Checkout.',
  alternates: { canonical: '/shop/checkout' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
