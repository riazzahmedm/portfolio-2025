import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const [ordersRes, pendingRes, moviesRes, blogRes, revenueRes, recentRes] = await Promise.all([
    supabase.from('shop_orders').select('*', { count: 'exact', head: true }),
    supabase.from('shop_orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'submitted'),
    supabase.from('logs').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('shop_orders').select('total').eq('payment_status', 'verified'),
    supabase
      .from('shop_orders')
      .select('id, total, status, payment_status, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + Number(o.total), 0)

  return Response.json({
    totalOrders:        ordersRes.count ?? 0,
    pendingVerification: pendingRes.count ?? 0,
    moviesLogged:       moviesRes.count ?? 0,
    blogPosts:          blogRes.count ?? 0,
    totalRevenue,
    recentOrders:       recentRes.data ?? [],
  })
}
