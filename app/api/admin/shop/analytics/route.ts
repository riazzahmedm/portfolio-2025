import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30')
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [eventsRes, ordersRes] = await Promise.all([
    supabase
      .from('shop_events')
      .select('type, session_id, user_id, metadata, created_at')
      .gte('created_at', since),
    supabase
      .from('shop_orders')
      .select('id, total, status, payment_status, created_at')
      .gte('created_at', since),
  ])

  const events = eventsRes.data ?? []
  const orders = ordersRes.data ?? []

  const count = (type: string) => new Set(events.filter(e => e.type === type).map(e => e.session_id)).size

  const productCounts: Record<string, { name: string; count: number }> = {}
  events
    .filter(e => e.type === 'add_to_cart')
    .forEach(e => {
      const meta = e.metadata as { product_id?: string; name?: string }
      if (meta?.product_id) {
        if (!productCounts[meta.product_id]) {
          productCounts[meta.product_id] = { name: meta.name ?? meta.product_id, count: 0 }
        }
        productCounts[meta.product_id].count++
      }
    })

  const topProducts = Object.entries(productCounts)
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const completedSessions = new Set(events.filter(e => e.type === 'order_completed').map(e => e.session_id))
  const abandonedUserIds = [...new Set(
    events
      .filter(e => e.type === 'add_to_cart' && e.user_id && !completedSessions.has(e.session_id))
      .map(e => e.user_id)
  )]

  return Response.json({
    funnel: {
      page_views:        count('page_view'),
      add_to_cart:       count('add_to_cart'),
      checkout_started:  count('checkout_started'),
      payment_submitted: count('payment_submitted'),
      order_completed:   count('order_completed'),
    },
    topProducts,
    abandonedCartUserCount: abandonedUserIds.length,
    totalOrders:  orders.length,
    totalRevenue: orders
      .filter(o => o.payment_status === 'verified')
      .reduce((sum, o) => sum + Number(o.total), 0),
    days,
  })
}
