import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function isAdmin() {
  const jar = await cookies()
  return jar.get('movies-admin')?.value === 'true'
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { data, error } = await supabase
    .from('movie_lists')
    .select('*, movie_list_items(*)')
    .eq('slug', slug)
    .order('rank', { referencedTable: 'movie_list_items', ascending: true })
    .single()
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
  const { data, error } = await supabase
    .from('movie_lists').update(body).eq('slug', slug).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params
  const { error } = await supabase.from('movie_lists').delete().eq('slug', slug)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
