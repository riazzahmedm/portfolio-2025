import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wrapped — Riaz Ahmed',
  description: 'My watching year in numbers.',
  alternates: { canonical: '/movies/wrapped' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
