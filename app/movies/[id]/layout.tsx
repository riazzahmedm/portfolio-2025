import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase.from('logs').select('title, year, overview').eq('id', id).maybeSingle()
  if (!data) return { title: 'Watched — Riaz Ahmed' }
  return {
    title: `${data.title}${data.year ? ` (${data.year})` : ''} — Watched`,
    description: data.overview ? String(data.overview).slice(0, 160) : `${data.title}, logged in my watchlog.`,
    alternates: { canonical: `/movies/${id}` },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
