import { supabase } from '@/lib/supabase'
import { dbError } from '@/lib/api-error'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .select('*, category:shop_categories(id, name)')
    .eq('is_active', true)
    .order('min_qty', { ascending: true })
  if (error) return dbError(error)
  const deals = (data ?? []).map((d: any) => ({
    ...d,
    category_name: d.category?.name ?? null,
    category: undefined,
  }))
  return Response.json(deals)
}
