import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'
import { dbError } from '@/lib/api-error'
import { isHexColor } from '@/lib/cover-accent'
import { fetchAll } from '@/lib/fetch-all'

export async function GET() {
  const admin = await isAdmin()
  const { data, error } = await fetchAll((from, to) => {
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).order('id').range(from, to)
    if (!admin) query = query.eq('published', true)
    return query
  })
  if (error) return dbError(error as { message: string; code?: string })
  return Response.json(data)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const now  = new Date().toISOString()
  if (body.published && !body.published_at) body.published_at = now
  body.updated_at = now
  if ('accent' in body) {
    if (body.accent !== null && !isHexColor(body.accent)) return Response.json({ error: 'The accent colour must be a hex colour like #8a97a8' }, { status: 400 })
    if (body.accent === null) delete body.accent   // nothing to store, so a database without the column still works
  }

  const { data, error } = await supabase.from('blog_posts').insert(body).select().single()
  if (error && /accent/i.test(error.message)) return Response.json({ error: 'Run the blog accent SQL line in supabase/migrations.sql first' }, { status: 503 })
  if (error) return dbError(error)
  return Response.json(data, { status: 201 })
}
