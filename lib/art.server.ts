import { createClient } from '@supabase/supabase-js'
import type { PublicArtPiece } from '@/lib/art.types'

// The art table has RLS on with no policies, so it is only reachable with the service role
export const artDb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function getPublishedArt(): Promise<PublicArtPiece[]> {
  const { data, error } = await artDb
    .from('art_pieces')
    .select('id, title, caption, image_url, width, height, tags, product:shop_products(id, is_active)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(({ product, ...rest }) => {
    const p = (Array.isArray(product) ? product[0] : product) as { id: string; is_active: boolean } | null | undefined
    return { ...rest, shop_id: p?.is_active ? p.id : null }
  })
}
