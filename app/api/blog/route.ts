import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET() {
  const admin = await isAdmin()
  let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (!admin) query = query.eq('published', true)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const now  = new Date().toISOString()
  if (body.published && !body.published_at) body.published_at = now
  body.updated_at = now

  const { data, error } = await supabase.from('blog_posts').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
