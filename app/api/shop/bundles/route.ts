import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('shop_bundle_deals')
    .select('*, category:shop_categories(id, name)')
    .eq('is_active', true)
    .order('min_qty', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  const deals = (data ?? []).map((d: any) => ({
    ...d,
    category_name: d.category?.name ?? null,
    category: undefined,
  }))
  return Response.json(deals)
}
