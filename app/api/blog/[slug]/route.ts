import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const admin = await isAdmin()
  const { data, error } = await (admin
    ? supabase.from('blog_posts').select('*').eq('slug', slug).single()
    : supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single()
  )
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const body = await req.json()
  const now  = new Date().toISOString()
  if (body.published && !body.published_at) body.published_at = now
  body.updated_at = now

  const { data, error } = await supabase
    .from('blog_posts').update(body).eq('slug', slug).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const { error } = await supabase.from('blog_posts').delete().eq('slug', slug)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
