import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase.from('shop_products').select('name, description, images, is_active').eq('id', id).maybeSingle()
  if (!data || !data.is_active) return { title: 'Shop — Art prints from Riaz', robots: { index: false } }
  const image = Array.isArray(data.images) ? data.images[0] : undefined
  return {
    title: `${data.name} — Shop`,
    description: data.description ? String(data.description).slice(0, 160) : `${data.name}, an art print by Riaz.`,
    alternates: { canonical: `/shop/${id}` },
    ...(image ? { openGraph: { images: [image] } } : {}),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
