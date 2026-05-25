import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watched — Riaz Ahmed',
  description: "Movies, series, and episodes I've logged.",
}

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return children
}
