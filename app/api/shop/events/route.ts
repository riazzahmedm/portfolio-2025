import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import type { ShopEventType } from '@/lib/shop.types'

export async function POST(req: Request) {
  const body: { type: ShopEventType; session_id: string; metadata?: Record<string, unknown> } = await req.json()

  if (!body.type || !body.session_id) {
    return Response.json({ error: 'type and session_id required' }, { status: 400 })
  }

  const customer = await getCustomer()

  const { error } = await supabase.from('shop_events').insert({
    type:       body.type,
    session_id: body.session_id,
    user_id:    customer?.id ?? null,
    metadata:   body.metadata ?? {},
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
