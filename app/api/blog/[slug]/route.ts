import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { isHexColor } from '@/lib/cover-accent'
import { omitFields } from '@/lib/pick'

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
  if (error) return dbError(error, 404)
  return Response.json(data)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const body = omitFields(await req.json().catch(() => null), ['id', 'created_at'])  // identity columns are never editable
  const now  = new Date().toISOString()
  if (body.published && !body.published_at) body.published_at = now
  body.updated_at = now
  if ('accent' in body && body.accent !== null && !isHexColor(body.accent)) {
    return Response.json({ error: 'The accent colour must be a hex colour like #8a97a8' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('blog_posts').update(body).eq('slug', slug).select().single()
  if (error && /accent/i.test(error.message)) return Response.json({ error: 'Run the blog accent SQL line in supabase/migrations.sql first' }, { status: 503 })
  if (error) return dbError(error)
  return Response.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const { error } = await supabase.from('blog_posts').delete().eq('slug', slug)
  if (error) return dbError(error)
  return Response.json({ ok: true })
}
