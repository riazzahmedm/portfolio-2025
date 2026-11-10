import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lists — Riaz Ahmed',
  description: 'Film and series lists I have put together.',
  alternates: { canonical: '/movies/lists' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
