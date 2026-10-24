import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Blog — Riaz Ahmed',
  description: 'Thoughts, essays, and notes by Riaz Ahmed.',
  alternates:  { canonical: '/blog' },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
