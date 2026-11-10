import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Series tracker — Riaz Ahmed',
  description: 'The series I am watching, and where I am in each.',
  alternates: { canonical: '/movies/tracker' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
