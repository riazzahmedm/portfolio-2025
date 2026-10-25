import { supabase } from '@/lib/supabase'
import { getCustomer } from '@/lib/customer-auth'
import type { ShopEventType } from '@/lib/shop.types'
import { dbError } from '@/lib/api-error'

const EVENT_TYPES: ReadonlySet<string> = new Set<ShopEventType>([
  'page_view', 'add_to_cart', 'checkout_started', 'payment_submitted', 'order_completed',
])
const MAX_METADATA_CHARS = 2_000

export async function POST(req: Request) {
  const body: { type: ShopEventType; session_id: string; metadata?: Record<string, unknown> } =
    await req.json().catch(() => ({}))

  if (!body.type || !body.session_id) {
    return Response.json({ error: 'type and session_id required' }, { status: 400 })
  }
  // Public endpoint: only accept known event types and bounded payloads
  if (!EVENT_TYPES.has(body.type) || typeof body.session_id !== 'string' || body.session_id.length > 100) {
    return Response.json({ error: 'Invalid event' }, { status: 400 })
  }
  const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
  if (JSON.stringify(metadata).length > MAX_METADATA_CHARS) {
    return Response.json({ error: 'Metadata too large' }, { status: 413 })
  }

  const customer = await getCustomer()

  const { error } = await supabase.from('shop_events').insert({
    type:       body.type,
    session_id: body.session_id,
    user_id:    customer?.id ?? null,
    metadata,
  })

  if (error) return dbError(error)
  return Response.json({ ok: true })
}
