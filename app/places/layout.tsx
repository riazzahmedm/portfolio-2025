import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Been there — Riaz Ahmed',
  description: 'Cafes, restaurants, street food and outings I have logged.',
  alternates: { canonical: '/places' },
}

export default function PlacesLayout({ children }: { children: React.ReactNode }) {
  return children
}
