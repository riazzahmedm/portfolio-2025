import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My orders — Shop',
  description: 'Your orders.',
  alternates: { canonical: '/shop/orders' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
